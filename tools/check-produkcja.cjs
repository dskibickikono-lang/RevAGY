#!/usr/bin/env node
/* Kontrola produkcji po wydaniu (D-01 i D-17 z audytu T-028): nagłówki bezpieczeństwa odpowiedzi serwera muszą być
   takie same jak w deploy/nginx/revagy-naglowki.conf. Strona i nagłówki są wdrażane osobno, więc bez tej kontroli
   rozjazd wychodzi dopiero wtedy, gdy coś przestaje działać. Tylko odczyt (GET), nic nie zmienia.

   Użycie:
     node tools/check-produkcja.cjs [adres bazowy]        (domyślnie https://revagy.pl)
   Sprawdza stronę główną, jedną podstronę, arkusz stylów i stronę błędu oraz kilka kodów odpowiedzi.
   Kody: 0 zgodnie, 1 różnica, 2 błąd uruchomienia albo sieci. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const WZORZEC = path.join(__dirname, '../deploy/nginx/revagy-naglowki.conf');

/** add_header <nazwa> "<wartość>" always; → { nazwa małymi literami: wartość } */
function naglowkiZWzorca(tresc) {
  const out = {};
  for (const m of tresc.matchAll(/^add_header\s+(\S+)\s+"([^"]+)"\s+always;/gm)) out[m[1].toLowerCase()] = m[2];
  return out;
}

/** Różnice między oczekiwanymi a faktycznymi nagłówkami (nazwy bez rozróżniania wielkości liter). */
function porownajNaglowki(oczekiwane, faktyczne) {
  const bledy = [];
  for (const [nazwa, wartosc] of Object.entries(oczekiwane)) {
    const jest = faktyczne[nazwa];
    if (jest === undefined || jest === null) bledy.push(`brak nagłówka ${nazwa}`);
    else if (String(jest).trim() !== wartosc) bledy.push(`${nazwa}: oczekiwano „${wartosc}”, jest „${String(jest).trim()}”`);
  }
  return bledy;
}

async function main(argv = process.argv.slice(2)) {
  const baza = (argv[0] || 'https://revagy.pl').replace(/\/$/, '');
  let u;
  try { u = new URL(baza); } catch { console.error(`Nieprawidłowy adres: ${baza}`); return 2; }
  if (u.protocol !== 'https:') { console.error('Adres musi zaczynać się od https://'); return 2; }
  const oczekiwane = naglowkiZWzorca(fs.readFileSync(WZORZEC, 'utf8'));
  if (!oczekiwane['content-security-policy']) { console.error('Brak CSP we wzorcu nagłówków.'); return 2; }

  const pobierz = (sciezka) => fetch(baza + sciezka, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'revagy-kontrola-produkcji' } });
  const bledy = [];
  let sprawdzen = 0;
  const zNaglowkami = [['/', 200], ['/finanse.html', 200], ['/assets/css/styles.css', 200], ['/nie-ma-takiej-strony.html', 404]];
  const kody = [['/.git/config', 403], ['/api/kontakt', 403], ['/polityka-prywatnosci.html', 200], ['/sitemap.xml', 200], ['/llms.txt', 200]];
  try {
    for (const [sciezka, kod] of zNaglowkami) {
      const r = await pobierz(sciezka);
      sprawdzen++;
      if (r.status !== kod) bledy.push(`${sciezka}: kod ${r.status}, oczekiwano ${kod}`);
      const roznice = porownajNaglowki(oczekiwane, Object.fromEntries(r.headers));
      sprawdzen += Object.keys(oczekiwane).length;
      bledy.push(...roznice.map((b) => `${sciezka}: ${b}`));
    }
    for (const [sciezka, kod] of kody) {
      const r = await pobierz(sciezka);
      sprawdzen++;
      if (r.status !== kod) bledy.push(`${sciezka}: kod ${r.status}, oczekiwano ${kod}`);
    }
  } catch (e) {
    console.error(`BŁĄD sieci: ${e.message}`);
    return 2;
  }
  if (bledy.length) {
    console.error(`KONTROLA PRODUKCJI ${baza}: ${bledy.length} różnic(e) na ${sprawdzen} sprawdzeń:`);
    for (const b of bledy) console.error(`  - ${b}`);
    return 1;
  }
  console.log(`KONTROLA PRODUKCJI ${baza}: OK, ${sprawdzen} sprawdzeń; nagłówki zgodne z deploy/nginx/revagy-naglowki.conf.`);
  return 0;
}

if (require.main === module) main().then((k) => process.exit(k), (e) => { console.error(e); process.exit(2); });

module.exports = { naglowkiZWzorca, porownajNaglowki, main };
