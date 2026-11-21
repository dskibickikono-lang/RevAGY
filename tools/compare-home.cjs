#!/usr/bin/env node
/* Ochrona strony głównej.
   node tools/compare-home.cjs --dist=<katalog> [--raport=<plik.md>]

   1. <dist>/index.html musi być bajtowo identyczny z migawką tools/baseline/index.html
      (brak migawki: komunikat i kod 0, narzędzie jeszcze nie jest włączone).
   2. Migawka jest porównywana z bazą (tools/lib/baza.cjs) na poziomie znaczników, atrybutów i tekstów.
      Każda różnica musi pasować do wpisu w tools/etapy/zmiana-strony-glownej.json,
      a każdy wpis musi zostać zużyty dokładnie `razy` razy.
   3. Lista zmian trafia na wyjście, a przy --raport albo GITHUB_STEP_SUMMARY także do tabeli w Markdownie.
   Kody: 0 zgodnie, 1 różnica spoza listy / niezużyty wpis / migawka różna od builda, 2 zły sposób wywołania. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { wczytajBaze, MIGAWKA } = require('./lib/baza.cjs');
const { porownaj, dopasuj, sprawdzListe, opisz, raportMarkdown } = require('./lib/porownanie.cjs');

const LISTA = 'tools/etapy/zmiana-strony-glownej.json';

function pierwszaRoznica(a, b) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  let line = 1;
  for (let k = 0; k < i; k++) if (a[k] === 10) line++;
  return { offset: i, line };
}

function main(argv = process.argv.slice(2), env = process.env, repoRoot = path.join(__dirname, '..')) {
  const opt = (name) => { const a = argv.find((x) => x.startsWith(`--${name}=`)); return a ? a.slice(name.length + 3) : null; };
  const distArg = opt('dist');
  const raportArg = opt('raport');
  if (!distArg) {
    console.error('Użycie: node tools/compare-home.cjs --dist=<katalog> [--raport=<plik.md>]');
    return 2;
  }
  const migawkaPath = path.join(repoRoot, MIGAWKA);
  if (!fs.existsSync(migawkaPath)) {
    console.log(`compare-home: brak migawki ${MIGAWKA} — kontrola jeszcze nie jest włączona, pomijam.`);
    return 0;
  }
  const distIndex = path.resolve(distArg, 'index.html');
  if (!fs.existsSync(distIndex)) {
    console.error(`compare-home: brak ${distIndex}`);
    return 1;
  }
  const migawka = fs.readFileSync(migawkaPath);
  const zbudowany = fs.readFileSync(distIndex);
  let kod = 0;
  if (!migawka.equals(zbudowany)) {
    const r = pierwszaRoznica(zbudowany, migawka);
    console.error(`BŁĄD: ${path.relative(process.cwd(), distIndex) || distIndex} różni się od migawki ${MIGAWKA} `
      + `(rozmiary ${zbudowany.length} i ${migawka.length} B, pierwsza różnica w bajcie ${r.offset}, linia ${r.line}). `
      + 'Każda zmiana strony głównej wymaga aktualizacji migawki w tym samym PR.');
    kod = 1;
  } else {
    console.log(`OK: index.html jest bajtowo identyczny z migawką ${MIGAWKA}.`);
  }

  let baza;
  try {
    baza = wczytajBaze({ repoRoot, env, log: (m) => console.log(`compare-home: ${m}`) });
  } catch (e) {
    console.error(`BŁĄD: ${e.message}`);
    return 1;
  }
  if (!baza) {
    console.log('compare-home: brak bazy do porównania (REVAGY_BAZA_PLIK, REVAGY_BAZA_REF / GITHUB_BASE_REF, tools/baseline/index.baza.html) — sprawdzona tylko migawka.');
    return kod;
  }
  const migawkaHtml = migawka.toString('utf8');
  if (baza.html === migawkaHtml) {
    console.log(`OK: migawka jest identyczna z bazą (${baza.zrodlo}); lista zmian nie jest potrzebna.`);
    zapiszRaport(raportMarkdown({ zmiany: [], problemy: [], zrodlo: baza.zrodlo }), raportArg, env);
    return kod;
  }

  const listaPath = path.join(repoRoot, LISTA);
  let lista = null;
  const problemyListy = [];
  if (fs.existsSync(listaPath)) {
    try { lista = JSON.parse(fs.readFileSync(listaPath, 'utf8')); } catch (e) { problemyListy.push(`${LISTA}: niepoprawny JSON (${e.message})`); }
    if (lista) problemyListy.push(...sprawdzListe(lista).map((p) => `${LISTA}: ${p}`));
  } else {
    problemyListy.push(`brak pliku ${LISTA}, a migawka różni się od bazy`);
  }

  const zmiany = porownaj(baza.html, migawkaHtml);
  const { problemy } = dopasuj(zmiany, problemyListy.length ? null : lista);
  const wszystkie = [...problemyListy, ...problemy];

  console.log(`\nZmiany strony głównej względem bazy (${baza.zrodlo}): ${zmiany.length}`);
  for (const z of zmiany) console.log(`  ${z.wpis ? `[${z.wpis}]` : '[SPOZA LISTY]'} ${opisz(z)}`);
  zapiszRaport(raportMarkdown({ zmiany, problemy: wszystkie, zrodlo: baza.zrodlo, etap: lista && lista.etap }), raportArg, env);

  if (wszystkie.length) {
    console.error(`\nBŁĄD: ${wszystkie.length} problem(ów) z listą zmian strony głównej. Pierwsze ${Math.min(20, wszystkie.length)}:`);
    for (const p of wszystkie.slice(0, 20)) console.error(`  - ${p}`);
    return 1;
  }
  console.log('OK: wszystkie zmiany strony głównej są na liście i każdy wpis został zużyty.');
  return kod;
}

function zapiszRaport(tresc, raportArg, env) {
  if (raportArg) fs.writeFileSync(raportArg, tresc + '\n');
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, tresc + '\n');
}

if (require.main === module) process.exit(main());

module.exports = { main };
