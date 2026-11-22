'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { tmp, zapisz, uruchom, TOOLS } = require('./pomoc.cjs');
const { sprawdzStrone, sprawdzRejestr, sprawdzFilm, sprawdzWyjatki } = require('../lib/tresc.cjs');
const { parse } = require('../lib/html.cjs');

const SKRYPT = path.join(TOOLS, 'check-tresc.cjs');
const LISTA_NAZW = JSON.parse(fs.readFileSync(path.join(TOOLS, 'nazwy-systemow.json'), 'utf8'));
const NAZWY = LISTA_NAZW.nazwy;
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

test('check-tresc: data w <time> nie jest twierdzeniem, ta sama liczba poza <time> jest', () => {
  const autor = '<p class="autor">Dawid Skibicki, założyciel REVAGY · Aktualizacja: <time datetime="2026-11-21">21 listopada 2026</time></p>';
  assert.deepEqual(sprawdz(strona({ main: autor })), []);
  const b = sprawdz(strona({ main: '<p>Aktualizacja: 21 listopada 2026</p>' }));
  assert.equal(b.length, 2, b.join('\n'));
  assert.match(b[0], /liczba „21” bez wpisu/);
  assert.match(b[1], /liczba „2026” bez wpisu/);
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
  assert.deepEqual(sprawdzFilm(parse('<main></main>'), undefined).length, 1);
});

test('check-tresc: "film": null oznacza stronę bez filmu', () => {
  assert.deepEqual(sprawdzFilm(parse('<main><p>Tekst</p></main>'), null), []);
  assert.match(sprawdzFilm(parse('<main></main>'), undefined)[0], /brak pola "film"/);
  assert.match(sprawdzFilm(parse(`<main>${KADR}</main>`), null)[0], /"film": null/);
  assert.match(sprawdzFilm(parse('<main><video></video></main>'), null)[0], /"film": null/);
  // pełna strona bez ramki filmu: z "film": null przechodzi, bez pola "film" nie
  const html = strona({ film: '' });
  assert.deepEqual(sprawdzStrone({ plik: 'jak-wybrac-pierwszy-proces.html', html, strona: { plik: 'jak-wybrac-pierwszy-proces.html', film: null }, nazwy: NAZWY, frazy: FRAZY, rejestr: REJESTR }), []);
  assert.ok(sprawdzStrone({ plik: 'jak-wybrac-pierwszy-proces.html', html, strona: { plik: 'jak-wybrac-pierwszy-proces.html' }, nazwy: NAZWY, frazy: FRAZY, rejestr: REJESTR }).some((x) => /brak pola "film"/.test(x)));
});

test('check-tresc (CLI): wpis z "film": null w podstrony.json', () => {
  const dir = tmp();
  zapisz(dir, 'dist/jak-wybrac-pierwszy-proces.html', strona({ film: '' }));
  const zNull = zapisz(dir, 'podstrony-null.json', { strony: [{ plik: 'jak-wybrac-pierwszy-proces.html', film: null, skrypty: ['assets/js/analytics.js?v=4'] }] });
  const bezPola = zapisz(dir, 'podstrony-bez.json', { strony: [{ plik: 'jak-wybrac-pierwszy-proces.html' }] });
  const ok = uruchom([SKRYPT, `--dist=${path.join(dir, 'dist')}`, `--podstrony=${zNull}`]);
  assert.equal(ok.kod, 0, ok.out + ok.err);
  const zle = uruchom([SKRYPT, `--dist=${path.join(dir, 'dist')}`, `--podstrony=${bezPola}`]);
  assert.equal(zle.kod, 1, zle.out + zle.err);
  assert.match(zle.err, /brak pola "film"/);
});

test('check-tresc: rejestr — walidacja i ostrzeżenie o „jak mierzone”', () => {
  // Rejestr repozytorium: bez błędów; ostrzeżenia tylko dla wyników wdrożeń bez „jak mierzone” (ZASADY 7.4: wychodzą anonimowo ze „ok.”).
  const repo = sprawdzRejestr(REJESTR);
  assert.deepEqual(repo.bledy, []);
  const bezPomiaru = REJESTR.twierdzenia.filter((t) => t.rodzaj === 'wynik-wdrozenia' && !t.jakMierzone).length;
  assert.equal(repo.ostrzezenia.length, bezPomiaru, repo.ostrzezenia.join('\n'));
  for (const o of repo.ostrzezenia) assert.match(o, /wynik wdrożenia bez opisu „jak mierzone”/);
  const r = sprawdzRejestr({ twierdzenia: [{ id: 'a', fraza: '10', strony: ['*'], rodzaj: 'wynik-wdrozenia', zrodlo: 'x', jakMierzone: null, status: 'potwierdzone' }, { id: 'a', fraza: '', strony: [], rodzaj: 'inne', status: 'nie' }] });
  assert.equal(r.ostrzezenia.length, 1);
  assert.ok(r.bledy.length >= 4, r.bledy.join('\n'));
});

test('check-tresc: listy startowe', () => {
  for (const n of ['Pipedrive', 'Comarch ERP', 'PostgreSQL']) assert.ok(NAZWY.includes(n), n);
  assert.ok(!NAZWY.includes('REST i webhooki'));
  assert.ok(FRAZY.includes('w Unii Europejskiej'));
});

test('check-tresc: KSeF to udokumentowany wyjątek (T-021), nazwa dostawcy dalej jest błędem', () => {
  assert.ok(!NAZWY.includes('KSeF'));
  const ksef = (LISTA_NAZW.wyjatki || []).find((w) => w.nazwa === 'KSeF');
  assert.ok(ksef, 'brak wyjątku KSeF w nazwy-systemow.json');
  assert.match(ksef.zrodlo, /T-021/);
  assert.ok(ksef.uzasadnienie.trim());
  assert.deepEqual(sprawdzWyjatki(LISTA_NAZW.wyjatki, NAZWY), []);
  assert.deepEqual(sprawdz(strona({ main: '<p>Faktura z KSeF ma ustaloną strukturę.</p>' })), []);
  const b = sprawdz(strona({ main: '<p>Faktury z KSeF trafiają do Comarch ERP.</p>' }));
  assert.equal(b.length, 1, b.join('\n'));
  assert.match(b[0], /„Comarch ERP” w: treść <main>/);
  // wyjątek nie może jednocześnie stać na liście nazw, a wpis musi mieć uzasadnienie i źródło
  assert.ok(sprawdzWyjatki([{ nazwa: 'KSeF', uzasadnienie: 'x', zrodlo: 'T-021' }], ['KSeF']).some((x) => /jednocześnie na liście/.test(x)));
  assert.ok(sprawdzWyjatki([{ nazwa: 'KSeF' }], []).some((x) => /brak pola "uzasadnienie"/.test(x)));
  assert.deepEqual(sprawdzWyjatki(undefined, NAZWY), []);
  assert.equal(sprawdzWyjatki('KSeF', NAZWY).length, 1);
});

test('check-tresc: nagłówki — jeden h1 na początku <main>, bez przeskoku poziomu w całym dokumencie', () => {
  assert.deepEqual(sprawdz(strona({ main: '<h2>Sekcja</h2><h3>Kafel</h3><h2>Druga</h2><h3>Pytanie</h3>' })), []);
  const przeskok = sprawdz(strona({ main: '<h2>Sekcja</h2><h4>Kafel</h4>' }));
  assert.equal(przeskok.length, 1, przeskok.join('\n'));
  assert.match(przeskok[0], /przeskok z poziomu 2 do poziomu 4 \(<h4>\) przy „Kafel”/);
  assert.ok(sprawdz(strona({ main: '<h1>Drugi tytuł</h1>' })).some((x) => /dokładnie jeden <h1>, jest 2/.test(x)));
  const bezH1 = strona().replace('<h1>Systemy, które same wymieniają dane</h1>', '<h2>Systemy, które same wymieniają dane</h2>');
  assert.ok(sprawdz(bezH1).some((x) => /pierwszy nagłówek w <main> to <h2>/.test(x)));
});

test('check-tresc: nagłówki stopki — h4 po h2 to przeskok, aria-level="2" go usuwa, błędne aria-level nie maskuje', () => {
  const zeStopka = (h4) => strona({ main: '<h2>Ostatnia sekcja</h2>' }).replace('<footer class="site-footer">', `<footer class="site-footer"><nav>${h4}</nav>`);
  const bez = sprawdz(zeStopka('<h4>Dla działów</h4>'));
  assert.equal(bez.length, 1, bez.join('\n'));
  assert.match(bez[0], /przeskok z poziomu 2 do poziomu 4 \(<h4>\) przy „Dla działów”/);
  assert.deepEqual(sprawdz(zeStopka('<h4 aria-level="2">Dla działów</h4><h4 aria-level="2">Firma</h4>')), []);
  for (const zla of ['0', '-1', 'dwa', '', '2.5']) {
    const b = sprawdz(zeStopka(`<h4 aria-level="${zla}">Dla działów</h4>`));
    assert.ok(b.some((x) => /przeskok z poziomu 2 do poziomu 4/.test(x)), `aria-level="${zla}": ${b.join('\n')}`);
  }
});

test('check-tresc: reguła nagłówków nie dotyczy stron spoza tools/podstrony.json', () => {
  // Strona główna (BaseLayout) ma h4 w stopce po h2: CLI sprawdza tylko pliki z listy podstron.
  const dir = tmp();
  const pod = zapisz(dir, 'podstrony.json', { strony: [{ plik: 'integracja-systemow.html', film: 'integracja-systemow', skrypty: ['app.js'] }] });
  zapisz(dir, 'dist/integracja-systemow.html', strona({ film: FILM }));
  zapisz(dir, 'dist/index.html', strona({ main: '<h2>Sekcja</h2><h4>Przeskok</h4>' }));
  const r = uruchom([SKRYPT, `--dist=${path.join(dir, 'dist')}`, `--podstrony=${pod}`]);
  assert.equal(r.kod, 0, r.err);
  assert.doesNotMatch(r.out + r.err, /index\.html/);
});

test('check-tresc CLI: pusta lista podstron — kod 0', () => {
  const dir = tmp();
  const pod = zapisz(dir, 'podstrony.json', { strony: [] });
  const r = uruchom([SKRYPT, `--dist=${dir}`, `--podstrony=${pod}`]);
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /pusta/);
});

test('check-tresc CLI: domyślne pliki repozytorium wczytują się bez błędów formatu', () => {
  // Pusty katalog: jedyne błędy to brak plików stron z tools/podstrony.json (rejestr, listy i format są poprawne).
  const r = uruchom([SKRYPT, `--dist=${tmp()}`]);
  const strony = JSON.parse(fs.readFileSync(path.join(TOOLS, 'podstrony.json'), 'utf8')).strony;
  if (!strony.length) { assert.equal(r.kod, 0, r.err); return; }
  assert.equal(r.kod, 1, r.out);
  const bledy = r.err.split('\n').filter((l) => l.startsWith('  - '));
  assert.equal(bledy.length, strony.length, r.err);
  for (const b of bledy) assert.match(b, /: brak pliku w /);
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
