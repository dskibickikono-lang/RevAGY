#!/usr/bin/env node
/* Porównanie B dla etapów filmowych (F1–F5): zmienia się tylko jedna podstrona, a w niej tylko ramka filmu
   i dane strukturalne. Porównuje tools/dom-contract.json z kontraktem z gałęzi bazowej.

   node tools/compare-film.cjs [--etapy=tools/etapy] [--kontrakt=tools/dom-contract.json]

   Kontrakt bazowy: plik z REVAGY_BAZA_KONTRAKT albo `git show <ref>:tools/dom-contract.json`
   (ref: REVAGY_BAZA_REF albo origin/$GITHUB_BASE_REF). Brak bazy: komunikat i kod 0.
   Pliki etapów: tools/etapy/film-<nazwa>.json, np.
     { "etap": "film-integracja-systemow", "film": "integracja-systemow", "strona": "integracja-systemow.html",
       "polaStrony": ["videos", "keyedElements", "localRefs", "jsonLd"] }
   Reguła włącza się tylko wtedy, gdy zmiana wprowadza film. Etap filmowy jest czynny, gdy w bieżącym
   kontrakcie publicFiles ma wszystkie trzy pliki assets/video/<film>.{webm,mp4,jpg}, a w kontrakcie bazowym
   nie ma żadnego z nich.
     - zero czynnych etapów: porównanie B nie dotyczy tej zmiany, kod 0 (inne zmiany kontraktu sprawdza walidator),
     - więcej niż jeden czynny etap: błąd (jeden film na PR),
     - film dodany częściowo (jeden albo dwa z trzech plików, których nie było w bazie): błąd,
     - dokładnie jeden czynny etap: różnica kontraktu musi w całości odpowiadać temu etapowi:
     - publicFiles: dochodzą dokładnie assets/video/<film>.webm, .mp4, .jpg, znika assets/video/<film>-kadr.jpg,
       pozostałe wpisy bez zmian,
     - htmlBaseline: zmienia się tylko <strona>,
     - pages: zmienia się tylko <strona>, i tylko w polach z polaStrony,
     - pozostałe pola kontraktu bez zmian.
   Kody: 0 zgodnie albo brak bazy, 1 różnica spoza listy, 2 zły sposób wywołania lub zły plik etapu. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const POLA_DOZWOLONE = new Set(['videos', 'keyedElements', 'localRefs', 'jsonLd']);
const rowne = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function sprawdzEtap(e, plik) {
  const bledy = [];
  if (!e || typeof e !== 'object') return [`${plik}: nie jest obiektem JSON`];
  if (typeof e.film !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.film)) bledy.push(`${plik}: "film" musi być nazwą filmu`);
  if (typeof e.strona !== 'string' || !/^[a-z0-9][a-z0-9-]*\.html$/.test(e.strona)) bledy.push(`${plik}: "strona" musi być nazwą pliku .html`);
  if (!Array.isArray(e.polaStrony) || !e.polaStrony.length || !e.polaStrony.every((p) => POLA_DOZWOLONE.has(p))) {
    bledy.push(`${plik}: "polaStrony" musi być niepustą listą z: ${[...POLA_DOZWOLONE].join(', ')}`);
  }
  return bledy;
}

/** Różnica kontraktów wobec jednego etapu filmowego. Zwraca listę problemów (pusta = zgodnie). */
function porownajKontraktFilmu(baza, teraz, etap) {
  const p = [];
  const { film, strona, polaStrony } = etap;
  const dodane = ['webm', 'mp4', 'jpg'].map((e) => `assets/video/${film}.${e}`);
  const usuniety = `assets/video/${film}-kadr.jpg`;

  const klucze = new Set([...Object.keys(baza), ...Object.keys(teraz)]);
  for (const k of klucze) {
    if (['publicFiles', 'htmlBaseline', 'pages'].includes(k)) continue;
    if (!rowne(baza[k], teraz[k])) p.push(`pole kontraktu „${k}” zmienione (dozwolone tylko publicFiles, htmlBaseline i pages strony ${strona})`);
  }

  const pfB = baza.publicFiles || {};
  const pfT = teraz.publicFiles || {};
  for (const k of new Set([...Object.keys(pfB), ...Object.keys(pfT), ...dodane, usuniety])) {
    const wB = k in pfB;
    const wT = k in pfT;
    if (dodane.includes(k)) {
      if (wB) p.push(`publicFiles: ${k} był już w kontrakcie bazowym`);
      if (!wT) p.push(`publicFiles: brak ${k}`);
    } else if (k === usuniety) {
      if (!wB) p.push(`publicFiles: ${k} nie było w kontrakcie bazowym`);
      if (wT) p.push(`publicFiles: ${k} powinien zniknąć (stan „film”)`);
    } else if (!wB || !wT) {
      p.push(`publicFiles: ${wT ? 'dodany' : 'usunięty'} ${k} spoza etapu filmowego`);
    } else if (!rowne(pfB[k], pfT[k])) {
      p.push(`publicFiles: zmieniony ${k} spoza etapu filmowego`);
    }
  }

  const hbB = baza.htmlBaseline || {};
  const hbT = teraz.htmlBaseline || {};
  for (const k of new Set([...Object.keys(hbB), ...Object.keys(hbT)])) {
    if (k === strona) {
      if (!(k in hbB) || !(k in hbT)) p.push(`htmlBaseline: brak strony ${k} w jednym z kontraktów`);
      continue;
    }
    if (!rowne(hbB[k], hbT[k])) p.push(`htmlBaseline: zmieniona strona ${k} (dozwolona tylko ${strona})`);
  }

  const pgB = baza.pages || {};
  const pgT = teraz.pages || {};
  for (const k of new Set([...Object.keys(pgB), ...Object.keys(pgT)])) {
    if (k !== strona) {
      if (!rowne(pgB[k], pgT[k])) p.push(`pages: zmieniony kontrakt DOM strony ${k} (dozwolona tylko ${strona})`);
      continue;
    }
    const a = pgB[k] || {};
    const b = pgT[k] || {};
    for (const pole of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (polaStrony.includes(pole)) continue;
      if (!rowne(a[pole], b[pole])) p.push(`pages.${k}.${pole}: zmienione (dozwolone: ${polaStrony.join(', ')})`);
    }
    if (!(b.videos || []).length) p.push(`pages.${k}.videos: brak filmu w stanie „film”`);
  }
  return p;
}

const PLIKI_FILMU = (film) => ['webm', 'mp4', 'jpg'].map((e) => `assets/video/${film}.${e}`);

/**
 * Ocena zmiany kontraktu wobec plików etapów filmowych.
 * @returns {{ ok: boolean, etap: object|null, problemy: string[], dotyczy: boolean }}
 */
function ocen(baza, teraz, etapy) {
  const pfB = baza.publicFiles || {};
  const pfT = teraz.publicFiles || {};
  const czynne = [];
  const czesciowe = [];
  for (const e of etapy) {
    const pliki = PLIKI_FILMU(e.film);
    const wBazie = pliki.filter((p) => p in pfB);
    const nowe = pliki.filter((p) => p in pfT && !(p in pfB));
    if (wBazie.length === 0 && nowe.length === pliki.length) czynne.push(e);
    else if (nowe.length > 0 && nowe.length < pliki.length) czesciowe.push({ e, nowe });
  }
  const problemy = czesciowe.map(({ e, nowe }) => `film ${e.film}: niekompletny zestaw plików w kontrakcie (nowe: ${nowe.join(', ')}; potrzebne wszystkie trzy: .webm, .mp4, .jpg)`);
  if (czynne.length > 1) problemy.push(`jeden film na PR: zmiana wprowadza filmy ${czynne.map((e) => e.film).join(', ')}`);
  if (problemy.length) return { ok: false, etap: null, problemy, dotyczy: true };
  if (!czynne.length) return { ok: true, etap: null, problemy: [], dotyczy: false };
  const etap = czynne[0];
  const p = porownajKontraktFilmu(baza, teraz, etap);
  return { ok: !p.length, etap, problemy: p, dotyczy: true };
}

function wczytajBazeKontraktu(repoRoot, env, log) {
  if (env.REVAGY_BAZA_KONTRAKT) {
    const p = path.resolve(repoRoot, env.REVAGY_BAZA_KONTRAKT);
    return { kontrakt: JSON.parse(fs.readFileSync(p, 'utf8')), zrodlo: `plik ${env.REVAGY_BAZA_KONTRAKT} (REVAGY_BAZA_KONTRAKT)` };
  }
  let ref = env.REVAGY_BAZA_REF || '';
  const git = (args) => execFileSync('git', ['-C', repoRoot, ...args], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  if (!ref && env.GITHUB_BASE_REF) {
    ref = `origin/${env.GITHUB_BASE_REF}`;
    try { git(['fetch', '--depth=1', 'origin', `${env.GITHUB_BASE_REF}:refs/remotes/origin/${env.GITHUB_BASE_REF}`]); } catch (e) { log(`git fetch nie powiódł się: ${String(e.stderr || e.message).trim()}`); }
  }
  if (!ref) return null;
  try {
    return { kontrakt: JSON.parse(git(['show', `${ref}:tools/dom-contract.json`]).toString('utf8')), zrodlo: `git ${ref}:tools/dom-contract.json` };
  } catch (e) {
    log(`Brak tools/dom-contract.json w ${ref}: ${String(e.stderr || e.message).trim().split('\n')[0]}`);
    return null;
  }
}

function main(argv = process.argv.slice(2), env = process.env, repoRoot = ROOT) {
  const opt = (n, d) => { const a = argv.find((x) => x.startsWith(`--${n}=`)); return a ? path.resolve(a.slice(n.length + 3)) : d; };
  const katalog = opt('etapy', path.join(repoRoot, 'tools/etapy'));
  const kontraktPlik = opt('kontrakt', path.join(repoRoot, 'tools/dom-contract.json'));
  const pliki = fs.existsSync(katalog) ? fs.readdirSync(katalog).filter((f) => /^film-[a-z0-9-]+\.json$/.test(f)).sort() : [];
  const etapy = [];
  const bledy = [];
  for (const f of pliki) {
    let e;
    try { e = JSON.parse(fs.readFileSync(path.join(katalog, f), 'utf8')); } catch (err) { bledy.push(`${f}: niepoprawny JSON (${err.message})`); continue; }
    const b = sprawdzEtap(e, f);
    if (b.length) bledy.push(...b); else etapy.push(e);
  }
  if (bledy.length) { for (const b of bledy) console.error(`BŁĄD: ${b}`); return 2; }
  if (!etapy.length) { console.log('compare-film: brak plików tools/etapy/film-*.json — nie ma czego sprawdzać.'); return 0; }
  const baza = wczytajBazeKontraktu(repoRoot, env, (m) => console.log(`compare-film: ${m}`));
  if (!baza) { console.log('compare-film: brak kontraktu bazowego (REVAGY_BAZA_KONTRAKT, REVAGY_BAZA_REF, GITHUB_BASE_REF) — pomijam.'); return 0; }
  const teraz = JSON.parse(fs.readFileSync(kontraktPlik, 'utf8'));
  const w = ocen(baza.kontrakt, teraz, etapy);
  if (w.ok) {
    console.log(w.dotyczy
      ? `OK: zmiany kontraktu względem bazy (${baza.zrodlo}) odpowiadają etapowi ${w.etap.etap || w.etap.film}: tylko ${w.etap.strona}, ramka filmu i dane strukturalne.`
      : `OK: ta zmiana nie wprowadza filmu (względem ${baza.zrodlo}), porównanie B nie dotyczy.`);
    return 0;
  }
  console.error(`BŁĄD: zmiany kontraktu względem bazy (${baza.zrodlo}) wychodzą poza etap filmowy${w.etap ? ` ${w.etap.etap || w.etap.film}` : ''}:`);
  for (const p of w.problemy) console.error(`  - ${p}`);
  return 1;
}

if (require.main === module) process.exit(main());

module.exports = { porownajKontraktFilmu, ocen, sprawdzEtap, main };
