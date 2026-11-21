'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { tmp, zapisz, uruchom, TOOLS } = require('./pomoc.cjs');
const { sprawdzStrone, sprawdzRejestr, sprawdzFilm } = require('../lib/tresc.cjs');
const { parse } = require('../lib/html.cjs');

const SKRYPT = path.join(TOOLS, 'check-tresc.cjs');
const NAZWY = JSON.parse(fs.readFileSync(path.join(TOOLS, 'nazwy-systemow.json'), 'utf8')).nazwy;
const FRAZY = JSON.parse(fs.readFileSync(path.join(TOOLS, 'zakazane-frazy.json'), 'utf8')).frazy;
const REJESTR = JSON.parse(fs.readFileSync(path.join(TOOLS, 'rejestr-twierdzen.json'), 'utf8'));

const KADR = `<div class="film-outer"><div class="film" data-scale>
  <img src="assets/video/integracja-systemow-kadr.jpg" width="1600" height="900" alt="Schemat: dane z systemu ERP trafiają do CRM bez przepisywania" loading="lazy" decoding="async">
</div></div>`;
const FILM = `<div class="film-outer"><div class="film" data-scale>
  <video data-autoplay data-main-video muted loop playsinline preload="none" poster="assets/video/integracja-systemow.jpg" aria-label="Animacja: przepływ danych między systemami">
    <source src="assets/video/integracja-systemow.webm" type="video/webm">
    <source src="assets/video/integracja-systemow.mp4" type="video/mp4">
  </video>
  <button class="film-toggle" type="button" data-video-toggle aria-label="Wstrzymaj film" aria-pressed="false"><span></span></button>
</div></div>`;

function strona({ title = 'Systemy bez przepisywania danych | REVAGY', opis = 'Łączymy system ERP, CRM i sklep.', main, film = KADR } = {}) {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>${title}</title>
<meta name="description" content="${opis}"><meta property="og:url" content="https://revagy.pl/integracja-systemow.html"></head>
<body><header class="site-header"><nav class="main-nav"><a href="./#proces">Jak wdrażamy</a></nav></header>
<main id="start">
  <section class="section"><h1>Systemy, które same wymieniają dane</h1>
  ${main || '<p>Audyt procesu trwa 3–5 dni roboczych i kosztuje 1&nbsp;990 zł. Pierwsza integracja: 14 dni roboczych od dostępu do systemów.</p>'}
  </section>
  <section class="section" id="film">${film}</section>
</main>
<footer class="site-footer"><p>© 2026 REVAGY · NIP 7441749535</p></footer></body></html>`;
}

const sprawdz = (html, extra = {}) => sprawdzStrone({ plik: 'integracja-systemow.html', html, strona: { plik: 'integracja-systemow.html', film: 'integracja-systemow' }, nazwy: NAZWY, frazy: FRAZY, rejestr: REJESTR, ...extra });

test('check-tresc: poprawna strona w stanie „kadr”', () => {
  assert.deepEqual(sprawdz(strona()), []);
});

test('check-tresc: poprawna strona w stanie „film”', () => {
  assert.deepEqual(sprawdz(strona({ film: FILM })), []);
});

test('check-tresc: nazwa własna systemu w treści, tytule i opisie', () => {
  const b = sprawdz(strona({ title: 'Integracja z Pipedrive', opis: 'Łączymy enova365 z CRM', main: '<p>Łączymy SAP z resztą firmy.</p>' }));
  assert.ok(b.some((x) => /„Pipedrive” w: tytuł/.test(x)), b.join('\n'));
  assert.ok(b.some((x) => /„enova365” w: opis/.test(x)), b.join('\n'));
  assert.ok(b.some((x) => /„SAP” w: treść <main>/.test(x)), b.join('\n'));
});

test('check-tresc: nazwa systemu tylko jako całe słowo (bez fałszywych trafień)', () => {
  assert.deepEqual(sprawdz(strona({ main: '<p>Sapphire, makeup i teamsy to nie nazwy z listy.</p>' })), []);
  assert.ok(sprawdz(strona({ main: '<p>Pracujemy z Microsoft&nbsp;365.</p>' })).some((x) => /Microsoft/.test(x)));
});

test('check-tresc: liczba bez wpisu w rejestrze', () => {
  const b = sprawdz(strona({ main: '<p>Oszczędzamy 120 godzin miesięcznie.</p>' }));
  assert.equal(b.length, 1, b.join('\n'));
  assert.match(b[0], /liczba „120” bez wpisu/);
});

test('check-tresc: liczba pokryta tylko wpisem do potwierdzenia', () => {
  const rejestr = { twierdzenia: [...REJESTR.twierdzenia, { id: 'x', fraza: 'ok. 40% mniej', strony: ['*'], rodzaj: 'wynik-wdrozenia', zrodlo: 'test', jakMierzone: 'test', status: 'do-potwierdzenia' }] };
  const b = sprawdz(strona({ main: '<p>Ok. 40% mniej pracy ręcznej.</p>' }), { rejestr });
  assert.equal(b.length, 1, b.join('\n'));
  assert.match(b[0], /„40” pokryta tylko wpisem do potwierdzenia \(x\)/);
});

test('check-tresc: liczby i frazy nie łączą się ponad granicą bloków', () => {
  const b = sprawdz(strona({ main: '<ul><li>1 990</li><li>zł</li></ul><select><option>do 50</option><option>200 osób</option></select>' }));
  assert.deepEqual(b.filter((x) => /liczba/.test(x)).map((x) => /liczba „([^”]+)”/.exec(x)[1]), ['1 990', '50', '200']);
});

test('check-tresc: wpis ograniczony do innej strony nie pokrywa liczby', () => {
  const rejestr = { twierdzenia: [{ id: 'y', fraza: '7 kroków', strony: ['inna.html'], rodzaj: 'fakt', zrodlo: 't', jakMierzone: null, status: 'potwierdzone' }] };
  assert.ok(sprawdz(strona({ main: '<p>7 kroków</p>' }), { rejestr: { twierdzenia: [...REJESTR.twierdzenia, ...rejestr.twierdzenia] } }).some((x) => /„7”/.test(x)));
});

test('check-tresc: B2B i n8n nie są liczbami; zakazane frazy i {{…}}', () => {
  const b = sprawdz(strona({ main: '<p>Dla firm B2B. Bezpłatny audyt już wkrótce. Cena {{CENA_START_OD}}.</p><a href="mailto:a@b.pl?subject=Bezp%C5%82atny%20audyt">x</a>' }));
  assert.ok(b.some((x) => /zakazana fraza „Bezpłatny audyt”/.test(x)), b.join('\n'));
  assert.ok(b.some((x) => /zakazana fraza „wkrótce”/.test(x)), b.join('\n'));
  assert.ok(b.some((x) => /niewypełnione miejsce \{\{CENA_START_OD\}\}/.test(x)), b.join('\n'));
  assert.ok(!b.some((x) => /liczba/.test(x)), b.join('\n'));
});

test('check-tresc: błędne miejsca na film', () => {
  const f = (html) => sprawdzFilm(parse(html), 'integracja-systemow');
  assert.ok(f(KADR.replace(/ alt="[^"]*"/, ' alt=""')).some((x) => /alt/.test(x)));
  assert.ok(f(KADR.replace('width="1600"', 'width="1280"')).some((x) => /1600/.test(x)));
  assert.ok(f(KADR.replace(' data-scale', '')).some((x) => /data-scale/.test(x)));
  assert.ok(f(KADR + KADR).some((x) => /dokładnie jedna ramka/.test(x)));
  assert.ok(f(FILM.replace('<img', '').replace('</video>', '</video><img src="a.jpg" width="1600" height="900" alt="a">')).some((x) => /<img> obok filmu/.test(x)));
  assert.ok(f(FILM.replace(/<button[\s\S]*?<\/button>/, '')).some((x) => /przycisk/.test(x)));
  assert.ok(f(FILM.replace(/<source src="assets\/video\/integracja-systemow.mp4"[^>]*>/, '')).some((x) => /źródła/.test(x)));
  assert.ok(f(KADR.replace('</div></div>', '<button data-video-toggle></button></div></div>')).some((x) => /bez filmu/.test(x)));
  assert.deepEqual(sprawdzFilm(parse('<main></main>'), null).length, 1);
});

test('check-tresc: rejestr — walidacja i ostrzeżenie o „jak mierzone”', () => {
  assert.deepEqual(sprawdzRejestr(REJESTR), { bledy: [], ostrzezenia: [] });
  const r = sprawdzRejestr({ twierdzenia: [{ id: 'a', fraza: '10', strony: ['*'], rodzaj: 'wynik-wdrozenia', zrodlo: 'x', jakMierzone: null, status: 'potwierdzone' }, { id: 'a', fraza: '', strony: [], rodzaj: 'inne', status: 'nie' }] });
  assert.equal(r.ostrzezenia.length, 1);
  assert.ok(r.bledy.length >= 4, r.bledy.join('\n'));
});

test('check-tresc: listy startowe', () => {
  for (const n of ['Pipedrive', 'Comarch ERP', 'PostgreSQL', 'KSeF']) assert.ok(NAZWY.includes(n), n);
  assert.ok(!NAZWY.includes('REST i webhooki'));
  assert.ok(FRAZY.includes('w Unii Europejskiej'));
});

test('check-tresc CLI: pusta lista podstron — kod 0', () => {
  const dir = tmp();
  const pod = zapisz(dir, 'podstrony.json', { strony: [] });
  const r = uruchom([SKRYPT, `--dist=${dir}`, `--podstrony=${pod}`]);
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /pusta/);
});

test('check-tresc CLI: domyślne pliki repozytorium (pusta lista) — kod 0', () => {
  const r = uruchom([SKRYPT, `--dist=${tmp()}`]);
  assert.equal(r.kod, 0, r.err);
});

test('check-tresc CLI: strona z błędem i strona poprawna', () => {
  const dir = tmp();
  const pod = zapisz(dir, 'podstrony.json', { strony: [{ plik: 'integracja-systemow.html', film: 'integracja-systemow', skrypty: ['app.js'] }] });
  zapisz(dir, 'dist/integracja-systemow.html', strona({ film: FILM }));
  const ok = uruchom([SKRYPT, `--dist=${path.join(dir, 'dist')}`, `--podstrony=${pod}`]);
  assert.equal(ok.kod, 0, ok.err);
  zapisz(dir, 'dist/integracja-systemow.html', strona({ main: '<p>Łączymy HubSpot w 48 godzin.</p>' }));
  const zle = uruchom([SKRYPT, `--dist=${path.join(dir, 'dist')}`, `--podstrony=${pod}`]);
  assert.equal(zle.kod, 1);
  assert.match(zle.err, /integracja-systemow\.html: nazwa własna systemu „HubSpot”/);
  assert.match(zle.err, /liczba „48” bez wpisu/);
  const brak = uruchom([SKRYPT, `--dist=${tmp()}`, `--podstrony=${pod}`]);
  assert.equal(brak.kod, 1);
  assert.match(brak.err, /brak pliku/);
  assert.equal(uruchom([SKRYPT]).kod, 2);
});
