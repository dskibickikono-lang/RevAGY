'use strict';
/* Etapy filmowe (F1–F5): plan renderu, porównanie B kontraktu, VideoObject i źródła scen. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { tmp, zapisz, uruchom, TOOLS } = require('./pomoc.cjs');
const { planuj } = require('../media-plan.cjs');
const { porownajKontraktFilmu, ocen, sprawdzEtap } = require('../compare-film.cjs');
const { plikiVideoObject } = require('../lib/podstrona.cjs');
const { parse, textOf } = require('../lib/html.cjs');
const { frazaRe } = require('../lib/tresc.cjs');

const REPO = path.join(TOOLS, '..');

// ---------- plan renderu ----------
const FILMY = { a: { czasSekundy: 14 }, b: { czasSekundy: null }, c: {} };
const plik = (lista) => (rel) => lista.includes(rel);
const wszystkieSceny = ['tools/scenes/a.html', 'tools/scenes/b.html', 'tools/scenes/c.html'];

test('media-plan: tryb „film” tylko dla sceny z ustawionym czasem, reszta „kadr”', () => {
  const r = planuj({ zmienione: ['tools/scenes/a.html', 'tools/scenes/b.html', 'tools/scenes/og-image.html'], filmy: FILMY, filmyPodstron: ['a', 'b', 'c'], istnieje: plik(wszystkieSceny) });
  assert.deepEqual(r.plan, [{ scena: 'a', tryb: 'film' }, { scena: 'b', tryb: 'kadr' }]);
});

test('media-plan: zmiana wspólnych plików renderu obejmuje wszystkie filmy podstron', () => {
  const r = planuj({ zmienione: ['tools/render-kadr.cjs'], filmy: FILMY, filmyPodstron: ['a', 'b', 'c'], istnieje: plik(wszystkieSceny) });
  assert.deepEqual(r.plan.map((x) => x.scena), ['a', 'b', 'c']);
});

test('media-plan: zmiana filmy.mjs dodaje film z czasem, którego plików jeszcze nie ma', () => {
  const r = planuj({ zmienione: ['src/config/filmy.mjs'], filmy: FILMY, filmyPodstron: ['a', 'b', 'c'], istnieje: plik(wszystkieSceny) });
  assert.deepEqual(r.plan, [{ scena: 'a', tryb: 'film' }]);
  const zPlikami = planuj({ zmienione: ['src/config/filmy.mjs'], filmy: FILMY, filmyPodstron: [], istnieje: plik([...wszystkieSceny, 'public/assets/video/a.webm', 'public/assets/video/a.mp4', 'public/assets/video/a.jpg']) });
  assert.deepEqual(zPlikami.plan, []);
});

test('media-plan: film pominięty, gdy pliki są i scena nie zmieniła się od poprzedniego wypchnięcia', () => {
  const pliki = [...wszystkieSceny, 'public/assets/video/a.webm', 'public/assets/video/a.mp4', 'public/assets/video/a.jpg'];
  const pominiety = planuj({ zmienione: ['tools/scenes/a.html'], zmienioneOdPoprzedniego: ['public/assets/video/a.mp4', 'tools/dom-contract.json'], filmy: FILMY, filmyPodstron: [], istnieje: plik(pliki) });
  assert.deepEqual(pominiety.plan, []);
  assert.equal(pominiety.pominiete[0].scena, 'a');
  // scena zmieniona od poprzedniego wypchnięcia: render
  assert.deepEqual(planuj({ zmienione: ['tools/scenes/a.html'], zmienioneOdPoprzedniego: ['tools/scenes/a.html'], filmy: FILMY, filmyPodstron: [], istnieje: plik(pliki) }).plan, [{ scena: 'a', tryb: 'film' }]);
  // nieznane zmiany od poprzedniego wypchnięcia: render
  assert.deepEqual(planuj({ zmienione: ['tools/scenes/a.html'], filmy: FILMY, filmyPodstron: [], istnieje: plik(pliki) }).plan, [{ scena: 'a', tryb: 'film' }]);
  // brak jednego pliku filmu: render
  assert.deepEqual(planuj({ zmienione: ['tools/scenes/a.html'], zmienioneOdPoprzedniego: [], filmy: FILMY, filmyPodstron: [], istnieje: plik(pliki.filter((x) => !x.endsWith('a.jpg'))) }).plan, [{ scena: 'a', tryb: 'film' }]);
});

test('media-plan: usunięta scena jest pomijana, zła nazwa to błąd; CLI z repozytorium', () => {
  const r = planuj({ zmienione: ['tools/scenes/a.html'], filmy: FILMY, filmyPodstron: [], istnieje: () => false });
  assert.deepEqual(r.plan, []);
  // zła nazwa trafia do planu przez listę filmów podstron przy zmianie wspólnych plików renderu
  assert.throws(() => planuj({ zmienione: ['tools/render-kadr.cjs'], filmy: {}, filmyPodstron: ['Zła_Nazwa'], istnieje: () => true }), /Zła nazwa/);
  const dir = tmp();
  const lista = zapisz(dir, 'zmienione.txt', 'tools/scenes/integracja-systemow.html\n');
  const cli = uruchom([path.join(TOOLS, 'media-plan.cjs'), `--zmienione=${lista}`]);
  assert.equal(cli.kod, 0, cli.err);
  assert.match(cli.out, /^integracja-systemow (kadr|film)$/m);
  assert.equal(uruchom([path.join(TOOLS, 'media-plan.cjs'), '--scena=integracja-systemow', '--tryb=film']).out.trim(), 'integracja-systemow film');
  assert.equal(uruchom([path.join(TOOLS, 'media-plan.cjs'), '--scena=integracja-systemow', '--tryb=wideo']).kod, 2);
});

// ---------- porównanie B kontraktu ----------
const ETAP = { etap: 'film-x', film: 'x', strona: 'x.html', polaStrony: ['videos', 'keyedElements', 'localRefs', 'jsonLd'] };
function kontrakt() {
  return {
    publicFiles: { 'assets/css/styles.css': { sha256: 'a', size: 1 }, 'assets/video/x-kadr.jpg': { sha256: 'k', size: 2 } },
    htmlBaseline: { 'index.html': { sha256: 'i', size: 3 }, 'x.html': { sha256: 'x1', size: 4 } },
    pages: { 'index.html': { headings: ['A'] }, 'x.html': { headings: ['X'], videos: [], keyedElements: [1], localRefs: [1], jsonLd: [1] } },
    mediaBudget: { 'assets/video/*.jpg': 150000 },
  };
}
function wStanieFilm() {
  const k = kontrakt();
  delete k.publicFiles['assets/video/x-kadr.jpg'];
  for (const e of ['webm', 'mp4', 'jpg']) k.publicFiles[`assets/video/x.${e}`] = { sha256: e, size: 5 };
  k.htmlBaseline['x.html'] = { sha256: 'x2', size: 6 };
  Object.assign(k.pages['x.html'], { videos: [{ poster: 'assets/video/x.jpg' }], keyedElements: [1, 2], localRefs: [2], jsonLd: [2] });
  return k;
}

test('compare-film: kontrakt bez zmian i poprawny stan „film” przechodzą', () => {
  assert.deepEqual(ocen(kontrakt(), kontrakt(), [ETAP]), { ok: true, etap: null, problemy: [], dotyczy: false });
  assert.deepEqual(porownajKontraktFilmu(kontrakt(), wStanieFilm(), ETAP), []);
  assert.equal(ocen(kontrakt(), wStanieFilm(), [{ ...ETAP, film: 'y', strona: 'y.html' }, ETAP]).ok, true);
});

test('compare-film: zmiany poza ramką filmu i danymi strukturalnymi są błędem', () => {
  const zmiana = (fn) => { const k = wStanieFilm(); fn(k); return porownajKontraktFilmu(kontrakt(), k, ETAP); };
  assert.ok(zmiana((k) => { k.htmlBaseline['index.html'].sha256 = 'zmiana'; }).some((p) => /htmlBaseline: zmieniona strona index\.html/.test(p)));
  assert.ok(zmiana((k) => { k.pages['x.html'].headings = ['Y']; }).some((p) => /pages\.x\.html\.headings/.test(p)));
  assert.ok(zmiana((k) => { k.pages['index.html'].headings = ['B']; }).some((p) => /kontrakt DOM strony index\.html/.test(p)));
  assert.ok(zmiana((k) => { k.publicFiles['assets/video/x-kadr.jpg'] = { sha256: 'k', size: 2 }; }).some((p) => /powinien zniknąć/.test(p)));
  assert.ok(zmiana((k) => { delete k.publicFiles['assets/video/x.webm']; }).some((p) => /brak assets\/video\/x\.webm/.test(p)));
  assert.ok(zmiana((k) => { k.publicFiles['assets/css/styles.css'].sha256 = 'b'; }).some((p) => /zmieniony assets\/css\/styles\.css/.test(p)));
  assert.ok(zmiana((k) => { k.mediaBudget['assets/video/*.jpg'] = 200000; }).some((p) => /„mediaBudget”/.test(p)));
  assert.ok(zmiana((k) => { k.pages['x.html'].videos = []; }).some((p) => /brak filmu/.test(p)));
});

test('compare-film: reguła włącza się tylko dla zmiany, która wprowadza film', () => {
  const ETAP_Y = { ...ETAP, etap: 'film-y', film: 'y', strona: 'y.html' };
  // baza po wcześniejszym filmie y (pliki y już są), zwykła zmiana innej strony bez filmu: przechodzi
  const poFilmieY = () => {
    const k = kontrakt();
    for (const e of ['webm', 'mp4', 'jpg']) k.publicFiles[`assets/video/y.${e}`] = { sha256: `y${e}`, size: 7 };
    return k;
  };
  const zmianaStrony = poFilmieY();
  zmianaStrony.htmlBaseline['index.html'] = { sha256: 'nowa', size: 9 };
  zmianaStrony.pages['index.html'].headings = ['A', 'B'];
  zmianaStrony.pages['nowa.html'] = { headings: ['N'] };
  const bezFilmu = ocen(poFilmieY(), zmianaStrony, [ETAP, ETAP_Y]);
  assert.deepEqual(bezFilmu, { ok: true, etap: null, problemy: [], dotyczy: false });
  // film dokładnie według etapu: przechodzi
  const film = ocen(kontrakt(), wStanieFilm(), [ETAP, ETAP_Y]);
  assert.equal(film.ok, true);
  assert.equal(film.etap.film, 'x');
  // film plus zmiana innej strony: błąd
  const filmIInne = wStanieFilm();
  filmIInne.htmlBaseline['index.html'] = { sha256: 'nowa', size: 9 };
  const r1 = ocen(kontrakt(), filmIInne, [ETAP]);
  assert.equal(r1.ok, false);
  assert.ok(r1.problemy.some((p) => /zmieniona strona index\.html/.test(p)), r1.problemy.join('\n'));
  // dwa filmy naraz: błąd
  const dwa = wStanieFilm();
  for (const e of ['webm', 'mp4', 'jpg']) dwa.publicFiles[`assets/video/y.${e}`] = { sha256: e, size: 7 };
  const r2 = ocen(kontrakt(), dwa, [ETAP, ETAP_Y]);
  assert.equal(r2.ok, false);
  assert.ok(r2.problemy.some((p) => /jeden film na PR/.test(p)), r2.problemy.join('\n'));
  // niekompletny zestaw plików: błąd
  const czesc = kontrakt();
  czesc.publicFiles['assets/video/x.webm'] = { sha256: 'w', size: 5 };
  czesc.publicFiles['assets/video/x.mp4'] = { sha256: 'm', size: 5 };
  const r3 = ocen(kontrakt(), czesc, [ETAP]);
  assert.equal(r3.ok, false);
  assert.ok(r3.problemy.some((p) => /niekompletny zestaw/.test(p)), r3.problemy.join('\n'));
  // kontrakt bez zmian: przechodzi
  assert.equal(ocen(poFilmieY(), poFilmieY(), [ETAP, ETAP_Y]).ok, true);
});

test('compare-film: plik etapu z repozytorium jest poprawny; CLI z bazą z pliku', () => {
  const katalog = path.join(REPO, 'tools/etapy');
  for (const f of fs.readdirSync(katalog).filter((x) => /^film-.*\.json$/.test(x))) {
    const e = JSON.parse(fs.readFileSync(path.join(katalog, f), 'utf8'));
    assert.deepEqual(sprawdzEtap(e, f), [], f);
    assert.ok(fs.existsSync(path.join(REPO, 'tools/scenes', `${e.film}.html`)), `${f}: brak sceny ${e.film}`);
  }
  assert.ok(sprawdzEtap({ film: 'x', strona: 'x.html', polaStrony: ['headings'] }, 'zly.json').length);
  const dir = tmp();
  const baza = zapisz(dir, 'baza.json', kontrakt());
  const teraz = zapisz(dir, 'teraz.json', wStanieFilm());
  const etapy = path.join(dir, 'etapy');
  zapisz(etapy, 'film-x.json', ETAP);
  const ok = uruchom([path.join(TOOLS, 'compare-film.cjs'), `--etapy=${etapy}`, `--kontrakt=${teraz}`], { env: { REVAGY_BAZA_KONTRAKT: baza } });
  assert.equal(ok.kod, 0, ok.err);
  const zly = wStanieFilm();
  zly.htmlBaseline['index.html'].sha256 = 'zmiana';
  const teraz2 = zapisz(dir, 'teraz2.json', zly);
  const bl = uruchom([path.join(TOOLS, 'compare-film.cjs'), `--etapy=${etapy}`, `--kontrakt=${teraz2}`], { env: { REVAGY_BAZA_KONTRAKT: baza } });
  assert.equal(bl.kod, 1);
  assert.match(bl.err, /zmieniona strona index\.html/);
  const bezBazy = uruchom([path.join(TOOLS, 'compare-film.cjs'), `--etapy=${etapy}`, `--kontrakt=${teraz}`]);
  assert.equal(bezBazy.kod, 0);
  assert.match(bezBazy.out, /brak kontraktu bazowego/);
});

// ---------- VideoObject ----------
test('VideoObject: lokalne pliki z thumbnailUrl i contentUrl; walidator zgłasza brak pliku', () => {
  const ld = { '@context': 'https://schema.org', '@graph': [{ '@type': 'VideoObject', thumbnailUrl: 'https://revagy.pl/assets/video/x.jpg', contentUrl: 'https://revagy.pl/assets/video/x.mp4', embedUrl: 'https://example.com/v' }] };
  const html = `<html><head><script type="application/ld+json">${JSON.stringify(ld)}</script></head><body></body></html>`;
  assert.deepEqual(plikiVideoObject(html).map((x) => x.rel), ['assets/video/x.jpg', 'assets/video/x.mp4']);
  assert.deepEqual(plikiVideoObject('<html><body></body></html>'), []);
  const lista = JSON.parse(fs.readFileSync(path.join(TOOLS, 'podstrony.json'), 'utf8')).strony.map((s) => s.plik);
  if (!lista.length) return;
  const dir = tmp();
  zapisz(dir, lista[0], html.replace('<body>', '<body><main id="start"></main>'));
  const r = uruchom([path.join(TOOLS, 'validate-dist.cjs'), dir]);
  assert.equal(r.kod, 1);
  assert.match(r.err, new RegExp(`${lista[0].replace('.', '\\.')}: VideoObject\\.contentUrl wskazuje na nieistniejący plik assets/video/x\\.mp4`));
});

// ---------- źródła scen ----------
test('sceny filmów podstron: bez nazw własnych systemów i firm w tekście sceny', () => {
  const nazwy = JSON.parse(fs.readFileSync(path.join(TOOLS, 'nazwy-systemow.json'), 'utf8')).nazwy;
  const filmy = JSON.parse(fs.readFileSync(path.join(TOOLS, 'podstrony.json'), 'utf8')).strony.map((s) => s.film).filter((f) => typeof f === 'string');
  const FIRMY = /(?<![\p{L}\p{N}])(sp\. ?z ?o\.? ?o\.?|s\.a\.|sp\. ?k\.|sp\. ?j\.|spółka akcyjna)(?![\p{L}\p{N}])/iu;
  for (const f of filmy) {
    const p = path.join(REPO, 'tools/scenes', `${f}.html`);
    if (!fs.existsSync(p)) continue;
    const tekst = textOf(parse(fs.readFileSync(p, 'utf8')));
    for (const n of nazwy) assert.doesNotMatch(tekst, frazaRe(n, { slowo: true }), `${f}: nazwa systemu „${n}”`);
    assert.doesNotMatch(tekst, FIRMY, `${f}: forma prawna firmy w scenie`);
  }
  // kontrola działa: nazwa systemu i forma prawna są wykrywane
  assert.match(textOf(parse('<p>Dane z SAP do Przykład Sp. z o.o.</p>')), frazaRe('SAP', { slowo: true }));
  assert.match('Przykład Sp. z o.o.', FIRMY);
});
