'use strict';
/* Zdanie ujawnienia (D-055, T-038, przegląd PR #50): tylko na stronach, które pokazują etykietę „Grupa KONO”.
   1. Pomocnik pokazUjawnienie z src/data/dowody.mjs na danych testowych.
   2. Zbudowane strony (dist): liczba elementów .dowod-ujawnienie. Bez builda test jest pomijany. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.join(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const wczytaj = () => import(pathToFileURL(path.join(ROOT, 'src', 'data', 'dowody.mjs')).href);

const dane = (zmiany = {}) => ({
  zdanieUjawnienia: 'Opisy oznaczone „Grupa KONO” pochodzą ze spółek Grupy KONO, która jest klientem REVAGY.',
  wdrozenia: {
    niezalezna: { nazwaSpolki: 'Spółka niezależna', etykietaPowiazania: null },
    anonimowa: { nazwaSpolki: null, etykietaPowiazania: null },
    pilotaz: { nazwaSpolki: 'HR KONO', etykietaPowiazania: 'Grupa KONO', zgodaNaWynik: true },
    ...zmiany,
  },
});

test('ujawnienie: brak etykiety „Grupa KONO” — zdania nie ma', async () => {
  const { pokazUjawnienie } = await wczytaj();
  assert.equal(pokazUjawnienie(['niezalezna'], dane()), false);
  assert.equal(pokazUjawnienie(['niezalezna', 'anonimowa'], dane()), false);
});

test('ujawnienie: etykieta „Grupa KONO” — zdanie jest; wyłączenie zgodaNaWynik go nie ukrywa', async () => {
  const { pokazUjawnienie } = await wczytaj();
  assert.equal(pokazUjawnienie(['niezalezna', 'pilotaz'], dane()), true);
  const bezZgody = dane({ pilotaz: { nazwaSpolki: 'HR KONO', etykietaPowiazania: 'Grupa KONO', zgodaNaWynik: false } });
  assert.equal(pokazUjawnienie(['pilotaz'], bezZgody), true);
});

test('ujawnienie: puste zdanieUjawnienia — zdania nie ma; literówka w identyfikatorze — błąd', async () => {
  const { pokazUjawnienie } = await wczytaj();
  assert.equal(pokazUjawnienie(['pilotaz'], { ...dane(), zdanieUjawnienia: null }), false);
  assert.throws(() => pokazUjawnienie(['nie-ma'], dane()), /brak wpisu „nie-ma”/);
});

const OCZEKIWANE = {
  'kadry-i-place.html': 0,
  'sprzedaz.html': 0,
  'produkcja-i-logistyka.html': 1,
  'finanse.html': 1,
  'wdrozenia.html': 1,
  'integracja-systemow.html': 1,
};
const zbudowane = Object.keys(OCZEKIWANE).every((f) => fs.existsSync(path.join(DIST, f)));

test('ujawnienie: liczba zdań ujawnienia na zbudowanych stronach', { skip: !zbudowane && 'brak zbudowanych stron w dist' }, () => {
  for (const [plik, ile] of Object.entries(OCZEKIWANE)) {
    const html = fs.readFileSync(path.join(DIST, plik), 'utf8');
    const jest = (html.match(/class="autor dowod-ujawnienie"/g) || []).length;
    assert.equal(jest, ile, `${plik}: oczekiwano ${ile} zdań ujawnienia, jest ${jest}`);
  }
});
