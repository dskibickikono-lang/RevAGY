#!/usr/bin/env node
/* Kontrola treści nowych podstron.
   node tools/check-tresc.cjs --dist=<katalog>
     [--podstrony=tools/podstrony.json] [--nazwy=tools/nazwy-systemow.json]
     [--frazy=tools/zakazane-frazy.json] [--rejestr=tools/rejestr-twierdzen.json]

   Dla każdej strony z tools/podstrony.json:
   - brak nazw własnych systemów w tytule, opisie i treści <main> (D-033),
   - brak zakazanych fraz i niewypełnionych {{…}},
   - każda liczba w <main> pokryta potwierdzoną frazą z rejestru twierdzeń,
   - miejsce na film w stanie „kadr” albo „film” (plan 3.8).
   Pusta lista podstron: kod 0. Błąd: kod 1. Zły sposób wywołania: kod 2. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { sprawdzStrone, sprawdzRejestr, sprawdzWyjatki } = require('./lib/tresc.cjs');
const { wczytajPodstrony } = require('./lib/dane.cjs');

function czytajJson(p, opis) {
  if (!fs.existsSync(p)) throw new Error(`brak pliku ${opis}: ${p}`);
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { throw new Error(`${opis}: niepoprawny JSON (${e.message})`); }
}

function main(argv = process.argv.slice(2)) {
  const tools = __dirname;
  const opt = (name, def) => { const a = argv.find((x) => x.startsWith(`--${name}=`)); return a ? path.resolve(a.slice(name.length + 3)) : def; };
  const dist = opt('dist', null);
  if (!dist) {
    console.error('Użycie: node tools/check-tresc.cjs --dist=<katalog>');
    return 2;
  }
  let strony;
  let nazwy;
  let frazy;
  let rejestr;
  const bledyRejestru = [];
  const ostrzezenia = [];
  try {
    strony = wczytajPodstrony(opt('podstrony', path.join(tools, 'podstrony.json')));
    if (!strony.length) {
      console.log('check-tresc: lista podstron w tools/podstrony.json jest pusta — nie ma czego sprawdzać.');
      return 0;
    }
    const listaNazw = czytajJson(opt('nazwy', path.join(tools, 'nazwy-systemow.json')), 'lista nazw systemów');
    nazwy = listaNazw.nazwy;
    frazy = czytajJson(opt('frazy', path.join(tools, 'zakazane-frazy.json')), 'lista zakazanych fraz').frazy;
    rejestr = czytajJson(opt('rejestr', path.join(tools, 'rejestr-twierdzen.json')), 'rejestr twierdzeń');
    if (!Array.isArray(nazwy) || !nazwy.every((x) => typeof x === 'string' && x.trim())) throw new Error('nazwy-systemow.json: "nazwy" musi być tablicą niepustych tekstów');
    bledyRejestru.push(...sprawdzWyjatki(listaNazw.wyjatki, nazwy));
    if (!Array.isArray(frazy) || !frazy.every((x) => typeof x === 'string' && x.trim())) throw new Error('zakazane-frazy.json: "frazy" musi być tablicą niepustych tekstów');
    const r = sprawdzRejestr(rejestr);
    bledyRejestru.push(...r.bledy);
    ostrzezenia.push(...r.ostrzezenia);
  } catch (e) {
    console.error(`BŁĄD: ${e.message}`);
    return 1;
  }

  const bledy = [...bledyRejestru];
  for (const s of strony) {
    const p = path.join(dist, s.plik);
    if (!fs.existsSync(p)) { bledy.push(`${s.plik}: brak pliku w ${dist}`); continue; }
    const wynik = sprawdzStrone({ plik: s.plik, html: fs.readFileSync(p, 'utf8'), strona: s, nazwy, frazy, rejestr });
    if (!wynik.length) console.log(`OK: ${s.plik}`);
    bledy.push(...wynik.map((b) => `${s.plik}: ${b}`));
  }
  for (const o of ostrzezenia) console.log(`OSTRZEŻENIE: ${o}`);
  if (bledy.length) {
    console.error(`BŁĄD: ${bledy.length} problem(ów) w treści podstron:`);
    for (const b of bledy) console.error(`  - ${b}`);
    return 1;
  }
  console.log(`OK: ${strony.length} podstron(a) zgodnych z regułami treści.`);
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { main };
