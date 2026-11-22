'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { tmp, zapisz, TOOLS } = require('./pomoc.cjs');
const {
  porownajWysokosci, roznicaStylow, sprawdzMenuHref, proporcje16x9, ocenRamkeFilmu, nazwaZrzutu, adresKanoniczny,
  zmierzWysokosciWPrzegladarce, zbierzStyleWPrzegladarce,
} = require('../lib/smoke.cjs');
const { wczytajPodstrony, wczytajGeometrie } = require('../lib/dane.cjs');
const { wczytajBaze } = require('../lib/baza.cjs');

const W = (pary) => pary.map(([klucz, wysokosc]) => ({ klucz, wysokosc }));

test('geometria: równe wysokości przechodzą', () => {
  const a = W([['header', 72], ['#faq', 900.5], ['footer', 400]]);
  assert.deepEqual(porownajWysokosci(a, a), { problemy: [], pominiete: [] });
});

test('geometria: zmieniona wysokość sekcji jest błędem, chyba że sekcja jest w geometria.sekcje', () => {
  const a = W([['header', 72], ['#faq', 900.5], ['footer', 400]]);
  const b = W([['header', 72], ['#faq', 924.5], ['footer', 400]]);
  const r = porownajWysokosci(a, b);
  assert.equal(r.problemy.length, 1);
  assert.match(r.problemy[0], /#faq: 900\.5 px w bazie, 924\.5 px teraz \(różnica 24 px\)/);
  assert.deepEqual(porownajWysokosci(a, b, ['#faq']), { problemy: [], pominiete: ['#faq'] });
});

test('geometria: inna lista sekcji jest błędem', () => {
  const r = porownajWysokosci(W([['#a', 1]]), W([['#a', 1], ['#b', 2]]));
  assert.match(r.problemy[0], /inna lista sekcji/);
});

test('style: podzbiór wzorców przechodzi, nowy kolor i rozmiar są wykazane', () => {
  const wzorce = [{ kolory: ['rgb(0, 0, 0)'], kroje: ['Onest'], rozmiary: ['16px'] }, { kolory: ['rgb(255, 91, 20)'], kroje: [], rozmiary: ['14px'] }];
  assert.deepEqual(roznicaStylow(wzorce, { kolory: ['rgb(255, 91, 20)'], kroje: ['Onest'], rozmiary: ['14px'] }), { kolory: [], kroje: [], rozmiary: [] });
  assert.deepEqual(roznicaStylow(wzorce, { kolory: ['rgb(1, 2, 3)'], kroje: ['Arial'], rozmiary: ['13px'] }), { kolory: ['rgb(1, 2, 3)'], kroje: ['Arial'], rozmiary: ['13px'] });
});

test('menu: odnośniki ./#sekcja do istniejących sekcji', () => {
  const ids = ['proces', 'pakiety', 'faq', 'kontakt'];
  assert.deepEqual(sprawdzMenuHref(['./#proces', './#faq', 'kontakt.html', './'], ids), []);
  assert.match(sprawdzMenuHref(['#proces'], ids).join(' '), /„#proces” zamiast \.\/#sekcja/);
  assert.match(sprawdzMenuHref(['./#nie-ma'], ids).join(' '), /której nie ma/);
  assert.match(sprawdzMenuHref(['kontakt.html'], ids).join(' '), /żadnego odnośnika/);
});

test('film: proporcje 16:9 z tolerancją 1 px', () => {
  assert.ok(proporcje16x9(1280, 720));
  assert.ok(proporcje16x9(358, 201.375));
  assert.ok(proporcje16x9(358, 202));
  assert.ok(!proporcje16x9(358, 210));
  assert.ok(!proporcje16x9(0, 0));
});

test('zrzuty i adresy', () => {
  assert.equal(nazwaZrzutu('/', 1280), 'index-1280.png');
  assert.equal(nazwaZrzutu('integracja-systemow.html', 390), 'integracja-systemow-390.png');
  // wąskie widoki telefonu (393 i 375 px) dla podstron, np. finanse.html
  assert.equal(nazwaZrzutu('finanse.html', 393), 'finanse-393.png');
  assert.equal(nazwaZrzutu('finanse.html', 375), 'finanse-375.png');
  assert.equal(adresKanoniczny('wdrozenia.html'), 'https://revagy.pl/wdrozenia.html');
});

test('funkcje przeglądarkowe są samowystarczalne (bez odwołań do zakresu modułu)', () => {
  for (const f of [zmierzWysokosciWPrzegladarce, zbierzStyleWPrzegladarce]) {
    assert.doesNotThrow(() => new Function(`return (${f.toString()})`)());
    assert.doesNotMatch(f.toString(), /require\(|module\./);
  }
});

test('podstrony.json: format i błędy', () => {
  const dir = tmp();
  assert.deepEqual(wczytajPodstrony(path.join(dir, 'brak.json')), []);
  // Rejestr repozytorium wczytuje się; "film" to nazwa (tekst) albo null.
  for (const s of wczytajPodstrony(path.join(TOOLS, 'podstrony.json'))) assert.ok(s.film === null || typeof s.film === 'string', JSON.stringify(s));
  // Format z obiektem w polu "film" (jak w dawnych fragmentach) jest błędem.
  assert.throws(() => wczytajPodstrony(zapisz(dir, 'obiekt.json', { strony: [{ plik: 'a.html', film: { nazwa: 'a' } }] })), /film musi być nazwą/);
  const ok = zapisz(dir, 'ok.json', { strony: [{ plik: 'integracja-systemow.html', film: 'integracja-systemow', skrypty: ['assets/js/app.js'] }] });
  assert.equal(wczytajPodstrony(ok).length, 1);
  for (const zle of [{}, { strony: [{ plik: '../x.html' }] }, { strony: [{ plik: 'index.html' }] }, { strony: [{ plik: 'a.html' }, { plik: 'a.html' }] }, { strony: [{ plik: 'a.html', film: 'a.mp4' }] }]) {
    assert.throws(() => wczytajPodstrony(zapisz(dir, 'zly.json', zle)));
  }
});

test('plik etapu: geometria.sekcje', () => {
  const repo = tmp();
  assert.deepEqual(wczytajGeometrie(repo), []);
  zapisz(repo, 'tools/etapy/zmiana-strony-glownej.json', { etap: '0', geometria: { sekcje: [{ selektor: '#faq', opis: 'Dłuższe odpowiedzi.' }, { selektor: 'header', opis: 'Dłuższy przycisk.' }] } });
  assert.deepEqual(wczytajGeometrie(repo), ['#faq', 'header']);
  for (const zle of ['#faq', ['#faq'], [{ selektor: '#faq' }], [{ selektor: '', opis: 'x' }], [{ selektor: '#faq', opis: ' ' }]]) {
    zapisz(repo, 'tools/etapy/zmiana-strony-glownej.json', { geometria: { sekcje: zle } });
    assert.throws(() => wczytajGeometrie(repo), undefined, JSON.stringify(zle));
  }
});

test('plik etapu w repozytorium: geometria.sekcje to klucze pomiaru testu dymnego dla migawki', () => {
  const repo = path.join(__dirname, '..', '..');
  const sekcje = wczytajGeometrie(repo);
  const fs = require('node:fs');
  const { parse, find } = require('../lib/html.cjs');
  const doc = parse(fs.readFileSync(path.join(repo, 'tools/baseline/index.html'), 'utf8'));
  const body = find(doc, (e) => e.name === 'body');
  const main = find(doc, (e) => e.name === 'main');
  const el = (n) => n && n.name;
  // te same klucze co zmierzWysokosciWPrzegladarce: body > header, main > section (#id albo nth-of-type), body > footer
  const klucze = [];
  if (body.children.some((c) => el(c) === 'header')) klucze.push('header');
  main.children.filter((c) => el(c) === 'section').forEach((s, i) => klucze.push(s.attrs.id ? `#${s.attrs.id}` : `main > section:nth-of-type(${i + 1})`));
  if (body.children.some((c) => el(c) === 'footer')) klucze.push('footer');
  const obce = sekcje.filter((x) => !klucze.includes(x));
  assert.deepEqual(obce, [], `selektory spoza kluczy pomiaru: ${obce.join(', ')}; dostępne: ${klucze.join(', ')}`);
});

test('baza: kolejność źródeł REVAGY_BAZA_PLIK → git → index.baza.html → null', () => {
  const repo = tmp();
  assert.equal(wczytajBaze({ repoRoot: repo, env: {} }), null);
  zapisz(repo, 'tools/baseline/index.baza.html', 'lokalna');
  assert.deepEqual(wczytajBaze({ repoRoot: repo, env: {} }), { html: 'lokalna', zrodlo: 'plik tools/baseline/index.baza.html' });
  const plik = zapisz(repo, 'inna.html', 'z pliku');
  assert.equal(wczytajBaze({ repoRoot: repo, env: { REVAGY_BAZA_PLIK: plik } }).html, 'z pliku');
  assert.throws(() => wczytajBaze({ repoRoot: repo, env: { REVAGY_BAZA_PLIK: path.join(repo, 'nie-ma.html') } }));

  const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
  execFileSync('git', ['-C', repo, 'init', '-q'], { env });
  zapisz(repo, 'tools/baseline/index.html', 'z gita');
  execFileSync('git', ['-C', repo, 'add', 'tools/baseline/index.html'], { env });
  execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'x'], { env });
  assert.deepEqual(wczytajBaze({ repoRoot: repo, env: { REVAGY_BAZA_REF: 'HEAD' } }), { html: 'z gita', zrodlo: 'git HEAD:tools/baseline/index.html' });
  // ref bez migawki: przejście do pliku lokalnego
  const logi = [];
  assert.equal(wczytajBaze({ repoRoot: repo, env: { REVAGY_BAZA_REF: 'nie-ma-takiego' }, log: (m) => logi.push(m) }).html, 'lokalna');
  assert.equal(logi.length, 1);
  // GITHUB_BASE_REF bez zdalnego origin: fetch zawodzi, show zawodzi, zostaje plik lokalny
  const logi2 = [];
  assert.equal(wczytajBaze({ repoRoot: repo, env: { GITHUB_BASE_REF: 'main' }, log: (m) => logi2.push(m) }).html, 'lokalna');
  assert.match(logi2[0], /git fetch origin main/);
});

test('film: ocena ramki dla strony z filmem i bez filmu ("film": null)', () => {
  const ramka = { w: 1280, h: 720, film: false };
  assert.deepEqual(ocenRamkeFilmu('integracja-systemow', ramka), { nazwa: 'jest ramka .film', ok: true, detail: '', dalej: true });
  assert.deepEqual(ocenRamkeFilmu('integracja-systemow', null), { nazwa: 'jest ramka .film', ok: false, detail: 'brak .film', dalej: false });
  const bez = ocenRamkeFilmu(null, null);
  assert.equal(bez.ok, true);
  assert.equal(bez.dalej, false);
  const zbedna = ocenRamkeFilmu(null, ramka);
  assert.equal(zbedna.ok, false);
  assert.equal(zbedna.dalej, false);
});
