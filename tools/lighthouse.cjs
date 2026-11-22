#!/usr/bin/env node
/* Pomiar Lighthouse podstron REVAGY z progami, które zatrzymują zmianę.

   Czym ten pomiar jest: Lighthouse uruchamiany na zbudowanym katalogu dist/ z CI, podawanym
   lokalnie pod nazwą hosta produkcji (pole „host” w konfiguracji, np. https://revagy.pl:<port>/…):
   serwer HTTPS na 127.0.0.1 i wolnym porcie z certyfikatem samopodpisanym tworzonym przez openssl,
   gzip dla treści tekstowych i Cache-Control jak w deploy/nginx. Chrome dostaje mapowanie hosta
   na 127.0.0.1 (--host-resolver-rules) i --ignore-certificate-errors. Dzięki temu adres kanoniczny
   strony ma tę samą domenę co badany adres (audyt SEO „canonical”).
   Tryb domyślny Lighthouse: telefon, symulowane wolne łącze i procesor.
   Każda strona jest mierzona kilka razy, a do progu porównywana jest mediana każdej kategorii.

   Czym ten pomiar nie jest: to nie jest pomiar produkcji. Nie ma tu prawdziwego certyfikatu,
   HTTP/2, Caddy ani prawdziwej sieci, a wynik wydajności zależy od obciążenia maszyny CI.
   Wynik mówi, czy sama strona (HTML, CSS, JS, obrazy, filmy) mieści się w progach.

   Użycie:
     node tools/lighthouse.cjs <katalog dist> [--wyniki=<katalog>] [--konfig=<plik>] [--polecenie=<polecenie>]

   --wyniki     katalog na raporty przebiegów (HTML i JSON), wynik.json i wynik.md
                (domyślnie nowy katalog tymczasowy, ścieżka jest wypisywana)
   --konfig     plik konfiguracji (domyślnie tools/lighthouse.json)
   --polecenie  polecenie Lighthouse zamiast `npx --yes lighthouse@<wersja>`; to samo daje zmienna
                LIGHTHOUSE_POLECENIE. Słowa rozdzielone spacjami albo tablica JSON, np. ["node","atrapa.cjs"].
                Do polecenia są dopisywane: adres strony i opcje Lighthouse.

   Gdy jest zmienna GITHUB_STEP_SUMMARY, tabela wyników jest dopisywana do podsumowania joba.
   Ścieżkę Chrome Lighthouse bierze ze zmiennej CHROME_PATH (w CI: Chromium Playwrighta).
   Wymaga programu openssl (brak = kod 2).

   Kody wyjścia: 0 = wszystkie progi spełnione, 1 = co najmniej jeden próg niespełniony,
                 2 = błąd uruchomienia (zła konfiguracja, brak pliku, brak raportu Lighthouse itd.). */
'use strict';

const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const KATEGORIE = ['performance', 'accessibility', 'seo'];
const NAZWY_KATEGORII = { performance: 'Wydajność', accessibility: 'Dostępność', seo: 'SEO' };
// Kategorie, dla których raport wypisuje niezaliczone audyty (co poprawić).
const KATEGORIE_AUDYTOW = ['accessibility', 'seo'];
const POLA_KONFIGU = ['opis', 'wersja', 'host', 'przebiegi', 'strony'];
// Zwykła nazwa hosta: małe litery, cyfry i myślniki w członach rozdzielonych kropkami, bez portu i schematu.
const WZOR_HOSTA = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
const MAX_PRZEBIEGOW = 9;
const LIMIT_PRZEBIEGU_MS = 5 * 60 * 1000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};
const GZIP = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.svg', '.webmanifest']);

class BladUruchomienia extends Error {}

/* ---------- konfiguracja ---------- */

/** Sprawdza obiekt konfiguracji. Zwraca listę błędów po polsku (pusta = poprawna). */
function sprawdzKonfiguracje(k) {
  const bledy = [];
  if (!k || typeof k !== 'object' || Array.isArray(k)) return ['konfiguracja musi być obiektem JSON'];
  for (const pole of Object.keys(k)) {
    if (!POLA_KONFIGU.includes(pole)) bledy.push(`nieznane pole „${pole}” (dozwolone: ${POLA_KONFIGU.join(', ')})`);
  }
  if (k.opis !== undefined && typeof k.opis !== 'string') bledy.push('„opis” musi być tekstem');
  if (typeof k.wersja !== 'string' || !/^\d+\.\d+\.\d+$/.test(k.wersja)) {
    bledy.push('„wersja” musi być dokładną wersją Lighthouse, np. "13.6.0"');
  }
  if (typeof k.host !== 'string' || !WZOR_HOSTA.test(k.host) || /^[\d.]+$/.test(k.host)) {
    bledy.push('„host” musi być zwykłą nazwą hosta produkcji, np. "revagy.pl" (bez schematu, portu i ścieżki)');
  }
  if (!Number.isInteger(k.przebiegi) || k.przebiegi < 1 || k.przebiegi > MAX_PRZEBIEGOW) {
    bledy.push(`„przebiegi” musi być liczbą całkowitą od 1 do ${MAX_PRZEBIEGOW}`);
  }
  if (!Array.isArray(k.strony) || k.strony.length === 0) {
    bledy.push('„strony” musi być niepustą listą');
    return bledy;
  }
  const widziane = new Set();
  k.strony.forEach((s, i) => {
    const gdzie = `strony[${i}]`;
    if (!s || typeof s !== 'object' || Array.isArray(s)) { bledy.push(`${gdzie} musi być obiektem`); return; }
    for (const pole of Object.keys(s)) {
      if (pole !== 'plik' && pole !== 'progi') bledy.push(`${gdzie}: nieznane pole „${pole}” (dozwolone: plik, progi)`);
    }
    const p = s.plik;
    if (typeof p !== 'string' || !/^[a-z0-9][a-z0-9._/-]*\.html$/i.test(p) || p.split('/').includes('..')) {
      bledy.push(`${gdzie}.plik musi być względną ścieżką do pliku .html w dist, np. "finanse.html"`);
    } else if (widziane.has(p)) {
      bledy.push(`${gdzie}.plik „${p}” jest na liście drugi raz`);
    } else {
      widziane.add(p);
    }
    const progi = s.progi;
    if (!progi || typeof progi !== 'object' || Array.isArray(progi) || Object.keys(progi).length === 0) {
      bledy.push(`${gdzie}.progi musi być niepustym obiektem z kategoriami: ${KATEGORIE.join(', ')}`);
      return;
    }
    for (const [kat, wartosc] of Object.entries(progi)) {
      if (!KATEGORIE.includes(kat)) {
        bledy.push(`${gdzie}.progi: nieznana kategoria „${kat}” (dozwolone: ${KATEGORIE.join(', ')})`);
      } else if (!Number.isInteger(wartosc) || wartosc < 0 || wartosc > 100) {
        bledy.push(`${gdzie}.progi.${kat} musi być liczbą całkowitą od 0 do 100`);
      }
    }
  });
  return bledy;
}

function wczytajKonfiguracje(plik) {
  let tekst;
  try { tekst = fs.readFileSync(plik, 'utf8'); } catch (e) {
    throw new BladUruchomienia(`nie da się przeczytać konfiguracji ${plik}: ${e.message}`);
  }
  let k;
  try { k = JSON.parse(tekst); } catch (e) {
    throw new BladUruchomienia(`konfiguracja ${plik} nie jest poprawnym JSON: ${e.message}`);
  }
  const bledy = sprawdzKonfiguracje(k);
  if (bledy.length) throw new BladUruchomienia(`błędna konfiguracja ${plik}:\n  - ${bledy.join('\n  - ')}`);
  return k;
}

/* ---------- liczenie i ocena ---------- */

/** Mediana listy liczb (dla parzystej liczby elementów: średnia dwóch środkowych). */
function mediana(liczby) {
  if (!Array.isArray(liczby) || liczby.length === 0) throw new Error('mediana pustej listy');
  const s = [...liczby].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Wyniki kategorii z raportu JSON Lighthouse, 0–100 po zaokrągleniu. */
function wynikiKategorii(lhr) {
  if (!lhr || typeof lhr !== 'object' || !lhr.categories) throw new BladUruchomienia('raport bez sekcji categories');
  if (lhr.runtimeError && lhr.runtimeError.code && lhr.runtimeError.code !== 'NO_ERROR') {
    throw new BladUruchomienia(`Lighthouse zgłosił błąd strony: ${lhr.runtimeError.code} ${lhr.runtimeError.message || ''}`.trim());
  }
  const out = {};
  for (const kat of KATEGORIE) {
    const c = lhr.categories[kat];
    if (!c || typeof c.score !== 'number') throw new BladUruchomienia(`raport bez wyniku kategorii ${kat}`);
    out[kat] = Math.round(c.score * 100);
  }
  return out;
}

/** Niezaliczone audyty kategorii (id i tytuł), bez audytów informacyjnych i nie dotyczących strony. */
function niezaliczoneAudyty(lhr, kat) {
  const c = lhr && lhr.categories && lhr.categories[kat];
  if (!c || !Array.isArray(c.auditRefs)) return [];
  const out = [];
  for (const ref of c.auditRefs) {
    const a = lhr.audits && lhr.audits[ref.id];
    if (!a || typeof a.score !== 'number' || a.score >= 1) continue;
    if (['informative', 'notApplicable', 'manual', 'error'].includes(a.scoreDisplayMode)) continue;
    out.push({ id: ref.id, tytul: a.title || ref.id });
  }
  return out;
}

/**
 * Ocena jednej strony.
 * @param {{plik:string, progi:Object<string,number>}} strona
 * @param {Object[]} raporty raporty JSON kolejnych przebiegów
 */
function ocenStrone(strona, raporty) {
  const wyniki = raporty.map(wynikiKategorii);
  const kategorie = {};
  for (const kat of KATEGORIE) {
    const lista = wyniki.map((w) => w[kat]);
    const med = mediana(lista);
    const prog = strona.progi[kat];
    kategorie[kat] = { wyniki: lista, mediana: med, prog: prog === undefined ? null : prog, ok: prog === undefined ? true : med >= prog };
  }
  const audyty = {};
  for (const kat of KATEGORIE_AUDYTOW) {
    const med = kategorie[kat].mediana;
    let i = wyniki.findIndex((w) => w[kat] === med);
    if (i < 0) i = raporty.length - 1;
    audyty[kat] = { przebieg: i + 1, lista: niezaliczoneAudyty(raporty[i], kat) };
  }
  return { plik: strona.plik, kategorie, audyty, ok: KATEGORIE.every((k) => kategorie[k].ok) };
}

/* ---------- serwer ---------- */

function cacheControl(ext) {
  if (ext === '.html') return 'no-cache';
  if (ext === '.css' || ext === '.js' || ext === '.webmanifest') return 'public, max-age=86400';
  return 'public, max-age=2592000';
}

/**
 * Certyfikat samopodpisany dla hosta, tworzony przez openssl w katalogu tymczasowym.
 * Katalog jest usuwany od razu po wczytaniu klucza i certyfikatu do pamięci.
 * @returns {{key:Buffer, cert:Buffer}}
 */
function utworzCertyfikat(host, { env = process.env } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-lighthouse-tls-'));
  const keyPath = path.join(dir, 'key.pem');
  const certPath = path.join(dir, 'cert.pem');
  try {
    execFileSync('openssl', [
      'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
      '-keyout', keyPath, '-out', certPath, '-days', '1',
      '-subj', `/CN=${host}`,
      '-addext', `subjectAltName=DNS:${host}`,
    ], { stdio: ['ignore', 'ignore', 'pipe'], env });
    return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
  } catch (e) {
    if (e.code === 'ENOENT') throw new BladUruchomienia('brak programu openssl: nie da się utworzyć certyfikatu dla lokalnego TLS');
    const stderr = e.stderr ? String(e.stderr).trim() : '';
    throw new BladUruchomienia(`openssl nie utworzył certyfikatu dla ${host}: ${e.message}${stderr ? `\n${stderr}` : ''}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Lokalny serwer dla katalogu dist na 127.0.0.1 i wolnym porcie: HTTP albo, z opcją tls {key, cert}, HTTPS.
 * Typy MIME, gzip dla treści tekstowych, 404 dla braków (treść 404.html, jeśli jest), 403 przy próbie wyjścia poza katalog.
 * Z opcją host adres ma postać https://<host>:<port> (Chrome mapuje host na 127.0.0.1).
 * @returns {Promise<{adres:string, port:number, close:()=>Promise<void>}>}
 */
function startSerwer(katalog, { tls = null, host = null } = {}) {
  const root = fs.realpathSync(path.resolve(katalog));
  const wPliku = (p) => p === root || p.startsWith(root + path.sep);

  const odpowiedz = (req, res, status, naglowki, tresc) => {
    res.writeHead(status, { ...naglowki, 'Content-Length': String(tresc.length) });
    res.end(req.method === 'HEAD' ? undefined : tresc);
  };
  const tekst = (req, res, status, t) => odpowiedz(req, res, status, { 'Content-Type': 'text/plain; charset=utf-8' }, Buffer.from(t));

  const handler = (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return tekst(req, res, 405, 'Method Not Allowed');
    let sciezka;
    try {
      sciezka = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch { return tekst(req, res, 400, 'Bad Request'); }
    if (sciezka.includes('\0')) return tekst(req, res, 400, 'Bad Request');
    if (sciezka.endsWith('/')) sciezka += 'index.html';

    const kandydat = path.resolve(root, '.' + sciezka);
    if (!wPliku(kandydat) || sciezka.split('/').includes('..')) return tekst(req, res, 403, 'Forbidden');

    let plik = null;
    let status = 200;
    try {
      const prawdziwa = fs.realpathSync(kandydat);
      if (!wPliku(prawdziwa)) return tekst(req, res, 403, 'Forbidden');
      if (fs.statSync(prawdziwa).isFile()) plik = prawdziwa;
    } catch { /* brak pliku */ }
    if (!plik) {
      const p404 = path.join(root, '404.html');
      if (!fs.existsSync(p404)) return tekst(req, res, 404, 'Not Found');
      plik = p404;
      status = 404;
    }

    const ext = path.extname(plik).toLowerCase();
    let tresc = fs.readFileSync(plik);
    const naglowki = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': status === 404 ? 'no-cache' : cacheControl(ext),
    };
    if (GZIP.has(ext)) {
      naglowki.Vary = 'Accept-Encoding';
      if (/\bgzip\b/i.test(req.headers['accept-encoding'] || '')) {
        tresc = zlib.gzipSync(tresc, { level: 6 });
        naglowki['Content-Encoding'] = 'gzip';
      }
    }
    odpowiedz(req, res, status, naglowki, tresc);
  };

  const serwer = tls ? https.createServer({ key: tls.key, cert: tls.cert }, handler) : http.createServer(handler);
  const gniazda = new Set();
  serwer.on('connection', (s) => { gniazda.add(s); s.on('close', () => gniazda.delete(s)); });
  return new Promise((resolve, reject) => {
    serwer.once('error', reject);
    serwer.listen(0, '127.0.0.1', () => {
      const { port } = serwer.address();
      resolve({
        adres: `${tls ? 'https' : 'http'}://${host || '127.0.0.1'}:${port}`,
        port,
        close: () => new Promise((done) => {
          serwer.close(() => done());
          for (const s of gniazda) s.destroy();
        }),
      });
    });
  });
}

/* ---------- uruchamianie Lighthouse ---------- */

/** Polecenie Lighthouse jako tablica słów. */
function polecenieLighthouse(wersja, { opcja, env }) {
  const surowe = opcja || env.LIGHTHOUSE_POLECENIE;
  if (!surowe) return ['npx', '--yes', `lighthouse@${wersja}`];
  const t = surowe.trim();
  if (t.startsWith('[')) {
    let arr;
    try { arr = JSON.parse(t); } catch (e) { throw new BladUruchomienia(`polecenie Lighthouse: zła tablica JSON (${e.message})`); }
    if (!Array.isArray(arr) || !arr.length || !arr.every((x) => typeof x === 'string' && x)) {
      throw new BladUruchomienia('polecenie Lighthouse: tablica JSON musi zawierać niepuste teksty');
    }
    return arr;
  }
  const slowa = t.split(/\s+/).filter(Boolean);
  if (!slowa.length) throw new BladUruchomienia('polecenie Lighthouse jest puste');
  return slowa;
}

/** Flagi Chrome w formacie --chrome-flags Lighthouse (wartość ze spacjami w cudzysłowie). */
function flagiChrome(host) {
  return `--headless=new --no-sandbox --ignore-certificate-errors --host-resolver-rules="MAP ${host} 127.0.0.1"`;
}

function argumentyLighthouse(adres, baza, host) {
  return [
    adres,
    '--only-categories=performance,accessibility,seo',
    '--output=json',
    '--output=html',
    `--output-path=${baza}`,
    '--quiet',
    `--chrome-flags=${flagiChrome(host)}`,
  ];
}

function uruchomProces(polecenie, args, env) {
  return new Promise((resolve) => {
    let err = '';
    let out = '';
    const proc = spawn(polecenie[0], [...polecenie.slice(1), ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    const zegar = setTimeout(() => { err += `\n[przekroczony limit ${LIMIT_PRZEBIEGU_MS / 1000} s]`; proc.kill('SIGKILL'); }, LIMIT_PRZEBIEGU_MS);
    proc.stdout.on('data', (d) => { out = (out + d).slice(-4000); });
    proc.stderr.on('data', (d) => { err = (err + d).slice(-4000); });
    proc.on('error', (e) => { clearTimeout(zegar); resolve({ kod: null, blad: e.message, out, err }); });
    proc.on('close', (kod, sygnal) => { clearTimeout(zegar); resolve({ kod, sygnal, out, err }); });
  });
}

/** Raport JSON przebiegu: Lighthouse przy kilku formatach zapisuje <baza>.report.json. */
function wczytajRaport(baza) {
  // Zapas na inną konwencję nazw: dowolny plik <nazwa>*.json w katalogu wyników.
  const dir = path.dirname(baza);
  const nazwa = path.basename(baza);
  const inne = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.startsWith(`${nazwa}.`) && f.endsWith('.json')).sort().map((f) => path.join(dir, f))
    : [];
  for (const p of [...new Set([`${baza}.report.json`, `${baza}.json`, ...inne])]) {
    if (!fs.existsSync(p)) continue;
    try { return { sciezka: p, lhr: JSON.parse(fs.readFileSync(p, 'utf8')) }; } catch (e) {
      throw new BladUruchomienia(`raport ${p} nie jest poprawnym JSON: ${e.message}`);
    }
  }
  return null;
}

/* ---------- wyjście ---------- */

const komorka = (k) => (k.prog === null ? `${k.mediana} (bez progu)` : `${k.mediana} / ${k.prog}`);

function tabelaMarkdown(wynik) {
  const w = [];
  w.push(`### Lighthouse ${wynik.wersja}: ${wynik.ok ? 'progi spełnione' : wynik.blad ? 'błąd uruchomienia' : 'próg niespełniony'}`);
  w.push('');
  w.push(`Build z CI podawany lokalnie pod nazwą hosta produkcji${wynik.host ? ` (\`${wynik.host}\`)` : ''}: TLS z certyfikatem samopodpisanym, gzip; telefon, symulowane łącze. Nie jest to pomiar produkcji.`);
  w.push(`Mediana z ${wynik.przebiegi} przebiegów / próg.`);
  w.push('');
  if (wynik.strony.length) {
    w.push(`| Strona | ${KATEGORIE.map((k) => NAZWY_KATEGORII[k]).join(' | ')} | Wynik |`);
    w.push(`|---|${KATEGORIE.map(() => '---').join('|')}|---|`);
    for (const s of wynik.strony) {
      const kom = KATEGORIE.map((k) => `${komorka(s.kategorie[k])}${s.kategorie[k].ok ? '' : ' **poniżej**'}`);
      w.push(`| \`${s.plik}\` | ${kom.join(' | ')} | ${s.ok ? 'OK' : 'PONIŻEJ PROGU'} |`);
    }
    w.push('');
    for (const s of wynik.strony) {
      w.push(`Przebiegi \`${s.plik}\`: ${KATEGORIE.map((k) => `${NAZWY_KATEGORII[k]} ${s.kategorie[k].wyniki.join(', ')}`).join('; ')}.`);
      for (const kat of KATEGORIE_AUDYTOW) {
        const a = s.audyty[kat];
        if (!a.lista.length) continue;
        w.push('');
        w.push(`Niezaliczone audyty ${NAZWY_KATEGORII[kat]} (\`${s.plik}\`, przebieg ${a.przebieg}):`);
        for (const x of a.lista) w.push(`- \`${x.id}\`: ${x.tytul}`);
      }
      w.push('');
    }
  }
  if (wynik.blad) {
    w.push(`**Błąd uruchomienia:** ${wynik.blad}`);
    w.push('');
  }
  return w.join('\n');
}

function tabelaKonsola(wynik) {
  const w = [];
  for (const s of wynik.strony) {
    w.push(`[lighthouse] ${s.plik}: ${s.ok ? 'OK' : 'PONIŻEJ PROGU'}`);
    for (const k of KATEGORIE) {
      const c = s.kategorie[k];
      w.push(`[lighthouse]   ${NAZWY_KATEGORII[k].padEnd(11)} mediana ${String(c.mediana).padStart(5)}  próg ${c.prog === null ? '  —' : String(c.prog).padStart(3)}  przebiegi ${c.wyniki.join(', ')}${c.ok ? '' : '  <- PONIŻEJ PROGU'}`);
    }
    for (const kat of KATEGORIE_AUDYTOW) {
      for (const x of s.audyty[kat].lista) w.push(`[lighthouse]   niezaliczony audyt ${NAZWY_KATEGORII[kat]}: ${x.id} (${x.tytul})`);
    }
  }
  return w.join('\n');
}

function zapiszWyniki(katalog, wynik, env) {
  const md = tabelaMarkdown(wynik);
  fs.writeFileSync(path.join(katalog, 'wynik.json'), JSON.stringify(wynik, null, 2) + '\n');
  fs.writeFileSync(path.join(katalog, 'wynik.md'), md + '\n');
  if (env.GITHUB_STEP_SUMMARY) {
    try { fs.appendFileSync(env.GITHUB_STEP_SUMMARY, md + '\n'); } catch (e) {
      console.error(`[lighthouse] nie da się dopisać podsumowania joba: ${e.message}`);
    }
  }
}

/* ---------- główny przebieg ---------- */

function nazwaBazowa(plik) {
  return plik.replace(/\.html$/i, '').replace(/[^a-z0-9-]+/gi, '_');
}

async function main(args = process.argv.slice(2), env = process.env) {
  const opcja = (nazwa) => {
    const a = args.find((x) => x.startsWith(`--${nazwa}=`));
    return a ? a.slice(nazwa.length + 3) : undefined;
  };
  const distArg = args.find((a) => !a.startsWith('--'));
  if (!distArg) {
    console.error('Użycie: node tools/lighthouse.cjs <katalog dist> [--wyniki=<katalog>] [--konfig=<plik>] [--polecenie=<polecenie>]');
    return 2;
  }

  let katalogWynikow = null;
  let serwer = null;
  const wynik = { wersja: null, host: null, przebiegi: null, adres: null, strony: [], ok: false, kod: 2, blad: null };
  try {
    katalogWynikow = opcja('wyniki')
      ? path.resolve(opcja('wyniki'))
      : fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-lighthouse-'));
    fs.mkdirSync(katalogWynikow, { recursive: true });
    console.log(`[lighthouse] wyniki: ${katalogWynikow}`);

    const konfig = wczytajKonfiguracje(path.resolve(opcja('konfig') || path.join(__dirname, 'lighthouse.json')));
    wynik.wersja = konfig.wersja;
    wynik.host = konfig.host;
    wynik.przebiegi = konfig.przebiegi;

    const dist = path.resolve(distArg);
    if (!fs.existsSync(dist) || !fs.statSync(dist).isDirectory()) throw new BladUruchomienia(`brak katalogu ${dist}`);
    const braki = konfig.strony.map((s) => s.plik).filter((p) => !fs.existsSync(path.join(dist, p)));
    if (braki.length) throw new BladUruchomienia(`brak plików w ${dist}: ${braki.join(', ')}`);

    const polecenie = polecenieLighthouse(konfig.wersja, { opcja: opcja('polecenie'), env });

    const tls = utworzCertyfikat(konfig.host, { env });
    serwer = await startSerwer(dist, { tls, host: konfig.host });
    wynik.adres = serwer.adres;
    console.log(`[lighthouse] serwer: ${serwer.adres} -> 127.0.0.1:${serwer.port}, TLS z certyfikatem samopodpisanym (katalog ${dist})`);
    console.log(`[lighthouse] polecenie: ${polecenie.join(' ')}`);

    for (const strona of konfig.strony) {
      const adres = `${serwer.adres}/${strona.plik}`;
      const raporty = [];
      for (let n = 1; n <= konfig.przebiegi; n++) {
        const baza = path.join(katalogWynikow, `${nazwaBazowa(strona.plik)}-${n}`);
        console.log(`[lighthouse] ${strona.plik}: przebieg ${n} z ${konfig.przebiegi}`);
        const r = await uruchomProces(polecenie, argumentyLighthouse(adres, baza, konfig.host), env);
        const raport = wczytajRaport(baza);
        if (!raport) {
          const powod = r.blad ? `nie da się uruchomić (${r.blad})` : r.sygnal ? `sygnał ${r.sygnal}` : `kod ${r.kod}`;
          throw new BladUruchomienia(`Lighthouse nie zwrócił raportu dla ${strona.plik} (przebieg ${n}, ${powod})${r.err.trim() ? `:\n${r.err.trim()}` : ''}`);
        }
        try { wynikiKategorii(raport.lhr); } catch (e) {
          throw new BladUruchomienia(`${strona.plik}, przebieg ${n}: ${e.message}`);
        }
        raporty.push(raport.lhr);
      }
      wynik.strony.push(ocenStrone(strona, raporty));
    }

    wynik.ok = wynik.strony.every((s) => s.ok);
    wynik.kod = wynik.ok ? 0 : 1;
  } catch (e) {
    if (!(e instanceof BladUruchomienia)) throw e;
    wynik.blad = e.message;
    wynik.ok = false;
    wynik.kod = 2;
  } finally {
    if (serwer) await serwer.close();
  }

  if (wynik.strony.length) console.log(tabelaKonsola(wynik));
  if (katalogWynikow) zapiszWyniki(katalogWynikow, wynik, env);
  if (wynik.kod === 2) console.error(`[lighthouse] BŁĄD URUCHOMIENIA: ${wynik.blad}`);
  else if (wynik.kod === 1) console.error('[lighthouse] PRÓG NIESPEŁNIONY (szczegóły wyżej i w wynik.md)');
  else console.log('[lighthouse] OK: wszystkie progi spełnione');
  return wynik.kod;
}

if (require.main === module) {
  main().then((kod) => { process.exitCode = kod; }, (e) => {
    console.error(`[lighthouse] BŁĄD URUCHOMIENIA: ${e && e.stack ? e.stack : e}`);
    process.exitCode = 2;
  });
}

module.exports = {
  KATEGORIE, MIME, sprawdzKonfiguracje, wczytajKonfiguracje, mediana, wynikiKategorii, niezaliczoneAudyty,
  ocenStrone, startSerwer, utworzCertyfikat, polecenieLighthouse, flagiChrome, argumentyLighthouse, main,
};
