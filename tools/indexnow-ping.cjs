#!/usr/bin/env node
/* IndexNow (Bing, Yandex, Seznam i inne): zgłoszenie adresów z mapy witryny po wydaniu.
   Uruchamia ręcznie właściciel po wdrożeniu artefaktu na produkcję. Skrypt nie jest częścią CI.

   Użycie:
     node tools/indexnow-ping.cjs              # sprawdza plik klucza na produkcji i wysyła listę adresów
     node tools/indexnow-ping.cjs --dry-run    # tylko wypisuje, co zostałoby wysłane (bez sieci)
     node tools/indexnow-ping.cjs --sitemap=dist/sitemap.xml

   Klucz: jedyny plik public/<32 znaki hex>.txt, którego treść jest równa nazwie. Plik jest publiczny
   z definicji (wyszukiwarka pobiera go z https://revagy.pl/<klucz>.txt), więc nie jest sekretem.
   Kody: 0 przyjęte (200/202) albo --dry-run, 1 błąd, 2 zły sposób wywołania. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const HOST = 'revagy.pl';
const ORIGIN = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const ROOT = path.join(__dirname, '..');

const ODPOWIEDZI = {
  200: 'przyjęte',
  202: 'przyjęte, klucz czeka na weryfikację',
  400: 'niepoprawne żądanie',
  403: 'klucz nieważny (plik klucza nie odpowiada kluczowi)',
  422: 'adresy nie należą do hosta albo klucz nie pasuje do schematu',
  429: 'za dużo żądań, spróbuj później',
};

function znajdzKlucz(publicDir) {
  const pliki = fs.readdirSync(publicDir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (pliki.length !== 1) throw new Error(`oczekiwany dokładnie jeden plik klucza <hex32>.txt w ${publicDir}, jest ${pliki.length}`);
  const klucz = pliki[0].slice(0, -4);
  const tresc = fs.readFileSync(path.join(publicDir, pliki[0]), 'utf8').trim();
  if (tresc !== klucz) throw new Error(`treść ${pliki[0]} nie jest równa kluczowi z nazwy pliku`);
  return klucz;
}

function adresyZMapy(xml) {
  const adresy = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const obce = adresy.filter((u) => new URL(u).host !== HOST);
  if (obce.length) throw new Error(`adresy spoza ${HOST} w mapie witryny: ${obce.join(', ')}`);
  return [...new Set(adresy)];
}

function zbudujZgloszenie(klucz, urlList) {
  return { host: HOST, key: klucz, keyLocation: `${ORIGIN}/${klucz}.txt`, urlList };
}

async function main(argv = process.argv.slice(2)) {
  const nieznane = argv.filter((a) => a !== '--dry-run' && !a.startsWith('--sitemap='));
  if (nieznane.length) {
    console.error('Użycie: node tools/indexnow-ping.cjs [--dry-run] [--sitemap=<plik>]');
    return 2;
  }
  const dryRun = argv.includes('--dry-run');
  const sitemapArg = argv.find((a) => a.startsWith('--sitemap='));
  const sitemap = sitemapArg ? path.resolve(sitemapArg.slice('--sitemap='.length)) : path.join(ROOT, 'public', 'sitemap.xml');

  const klucz = znajdzKlucz(path.join(ROOT, 'public'));
  const urlList = adresyZMapy(fs.readFileSync(sitemap, 'utf8'));
  if (!urlList.length) throw new Error(`brak adresów <loc> w ${sitemap}`);
  const zgloszenie = zbudujZgloszenie(klucz, urlList);

  console.log(`IndexNow: ${urlList.length} adresów z ${path.relative(process.cwd(), sitemap) || sitemap}, klucz ${zgloszenie.keyLocation}`);
  for (const u of urlList) console.log(`  ${u}`);
  if (dryRun) {
    console.log('--dry-run: nic nie zostało wysłane.');
    console.log(JSON.stringify(zgloszenie, null, 2));
    return 0;
  }

  // Bez opublikowanego pliku klucza wyszukiwarka odrzuci zgłoszenie (403), więc najpierw sprawdzamy produkcję.
  const plik = await fetch(zgloszenie.keyLocation, { redirect: 'manual' });
  const trescPliku = plik.ok ? (await plik.text()).trim() : '';
  if (trescPliku !== klucz) {
    console.error(`BŁĄD: ${zgloszenie.keyLocation} odpowiada ${plik.status}${plik.ok ? ' z inną treścią' : ''}. Najpierw wdroż wydanie z plikiem klucza.`);
    return 1;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(zgloszenie),
  });
  const opis = ODPOWIEDZI[res.status] || 'nieoczekiwana odpowiedź';
  if (res.status === 200 || res.status === 202) {
    console.log(`OK: ${ENDPOINT} odpowiedział ${res.status} (${opis}).`);
    return 0;
  }
  const body = (await res.text().catch(() => '')).slice(0, 500);
  console.error(`BŁĄD: ${ENDPOINT} odpowiedział ${res.status} (${opis})${body ? `: ${body}` : ''}`);
  return 1;
}

if (require.main === module) {
  main().then((kod) => process.exit(kod), (e) => { console.error(`BŁĄD: ${e.message}`); process.exit(1); });
}

module.exports = { znajdzKlucz, adresyZMapy, zbudujZgloszenie, HOST, ENDPOINT };
