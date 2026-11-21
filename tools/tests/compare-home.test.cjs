'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { tmp, zapisz, uruchom, indexBazowy, TOOLS } = require('./pomoc.cjs');
const { porownaj, dopasuj, sprawdzListe } = require('../lib/porownanie.cjs');
const { decodeEntities, collapse } = require('../lib/html.cjs');

const SKRYPT = path.join(TOOLS, 'compare-home.cjs');

/** Uruchamia compare-home z podanym katalogiem repozytorium (main(argv, env, repoRoot)). */
function compareHome(repo, argv, env = {}) {
  const kod = `process.exit(require(${JSON.stringify(SKRYPT)}).main(${JSON.stringify(argv)}, process.env, ${JSON.stringify(repo)}))`;
  return uruchom(['-e', kod], { env });
}

function repoZMigawka(migawka, { dist = migawka, lista } = {}) {
  const repo = tmp();
  if (migawka !== null) zapisz(repo, 'tools/baseline/index.html', migawka);
  if (lista) zapisz(repo, 'tools/etapy/zmiana-strony-glownej.json', lista);
  const distDir = path.join(repo, 'dist');
  zapisz(repo, 'dist/index.html', dist);
  return { repo, distDir };
}

const MALA = '<!doctype html><html><body><main><h2 class="h2">Pracujemy na tym, co już macie</h2>'
  + '<p>Akapit <a class="btn" href="#kontakt">Umów audyt</a></p><p>Drugi</p></main></body></html>';

test('compare-home: brak migawki — komunikat i kod 0', () => {
  const { repo, distDir } = repoZMigawka(null, { dist: MALA });
  const r = compareHome(repo, [`--dist=${distDir}`]);
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /brak migawki/);
});

test('compare-home: brak --dist — kod 2', () => {
  const r = uruchom([SKRYPT]);
  assert.equal(r.kod, 2);
});

test('compare-home: zbudowany index.html różny od migawki — kod 1', () => {
  const { repo, distDir } = repoZMigawka(MALA, { dist: MALA.replace('Drugi', 'Inny') });
  const r = compareHome(repo, [`--dist=${distDir}`]);
  assert.equal(r.kod, 1);
  assert.match(r.err, /różni się od migawki/);
});

test('compare-home: baza identyczna z migawką — lista ignorowana, kod 0', () => {
  const { repo, distDir } = repoZMigawka(MALA, { lista: { 'strona-glowna': { teksty: [{ bylo: 'x', jest: 'y' }] } } });
  const bazaPlik = zapisz(repo, 'baza.html', MALA);
  const r = compareHome(repo, [`--dist=${distDir}`], { REVAGY_BAZA_PLIK: bazaPlik });
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /identyczna z bazą/);
});

test('compare-home: brak bazy — sprawdzana tylko migawka', () => {
  const { repo, distDir } = repoZMigawka(MALA);
  const r = compareHome(repo, [`--dist=${distDir}`]);
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /brak bazy/);
});

const prawdziwy = indexBazowy();

test('compare-home: prawdziwa strona główna z jedną zmienioną frazą, bez listy — kod 1', { skip: !prawdziwy && 'brak zbudowanego index.html' }, () => {
  const m = /<h2 class="h2">([^<]+)<\/h2>/.exec(prawdziwy.html);
  assert.ok(m, 'w index.html jest nagłówek h2');
  const nowa = prawdziwy.html.replace(m[0], `<h2 class="h2">${m[1]} i więcej</h2>`);
  const { repo, distDir } = repoZMigawka(nowa);
  const r = compareHome(repo, [`--dist=${distDir}`], { REVAGY_BAZA_PLIK: prawdziwy.sciezka });
  assert.equal(r.kod, 1);
  assert.match(r.out, /SPOZA LISTY/);
  assert.match(r.err, /brak pliku tools\/etapy\/zmiana-strony-glownej\.json/);
  assert.match(r.err, /zmiana spoza listy/);
});

test('compare-home: prawdziwa strona główna z jedną zmienioną frazą i pasującą listą — kod 0 i raport', { skip: !prawdziwy && 'brak zbudowanego index.html' }, () => {
  const m = /<h2 class="h2">([^<]+)<\/h2>/.exec(prawdziwy.html);
  const nowa = prawdziwy.html.replace(m[0], `<h2 class="h2">${m[1]} i więcej</h2>`);
  const lista = { etap: '0', opis: 'test', 'strona-glowna': { teksty: [{ bylo: collapse(decodeEntities(m[1])), jest: collapse(decodeEntities(`${m[1]} i więcej`)), razy: 1 }], atrybuty: [], dodane: [], usuniete: [] }, geometria: { sekcje: [] } };
  const { repo, distDir } = repoZMigawka(nowa, { lista });
  const raport = path.join(repo, 'raport.md');
  const summary = path.join(repo, 'summary.md');
  const r = compareHome(repo, [`--dist=${distDir}`, `--raport=${raport}`], { REVAGY_BAZA_PLIK: prawdziwy.sciezka, GITHUB_STEP_SUMMARY: summary });
  assert.equal(r.kod, 0, r.err + r.out);
  assert.match(r.out, /\[teksty\[0\]\]/);
  const md = fs.readFileSync(raport, 'utf8');
  assert.match(md, /\| 1 \| tekst \|/);
  assert.equal(fs.readFileSync(summary, 'utf8'), md);
});

test('compare-home: wpis z razy=2 zużyty raz — kod 1', { skip: !prawdziwy && 'brak zbudowanego index.html' }, () => {
  const m = /<h2 class="h2">([^<]+)<\/h2>/.exec(prawdziwy.html);
  const nowa = prawdziwy.html.replace(m[0], `<h2 class="h2">${m[1]} i więcej</h2>`);
  const lista = { etap: '0', 'strona-glowna': { teksty: [{ bylo: collapse(decodeEntities(m[1])), jest: collapse(decodeEntities(`${m[1]} i więcej`)), razy: 2 }] } };
  const { repo, distDir } = repoZMigawka(nowa, { lista });
  const r = compareHome(repo, [`--dist=${distDir}`], { REVAGY_BAZA_PLIK: prawdziwy.sciezka });
  assert.equal(r.kod, 1);
  assert.match(r.err, /zużyty 1 z 2/);
});

test('compare-home: baza z git show <REVAGY_BAZA_REF>:tools/baseline/index.html', () => {
  const repo = tmp();
  const git = (...a) => execFileSync('git', ['-C', repo, ...a], { stdio: 'pipe', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });
  git('init', '-q');
  zapisz(repo, 'tools/baseline/index.html', MALA);
  git('add', '.');
  git('commit', '-q', '-m', 'baza');
  const nowa = MALA.replace('Drugi', 'Drugi akapit');
  zapisz(repo, 'tools/baseline/index.html', nowa);
  zapisz(repo, 'dist/index.html', nowa);
  const bez = compareHome(repo, [`--dist=${path.join(repo, 'dist')}`], { REVAGY_BAZA_REF: 'HEAD' });
  assert.equal(bez.kod, 1);
  assert.match(bez.out, /git HEAD:tools\/baseline\/index\.html/);
  zapisz(repo, 'tools/etapy/zmiana-strony-glownej.json', { 'strona-glowna': { teksty: [{ bylo: 'Drugi', jest: 'Drugi akapit' }] } });
  const z = compareHome(repo, [`--dist=${path.join(repo, 'dist')}`], { REVAGY_BAZA_REF: 'HEAD' });
  assert.equal(z.kod, 0, z.err);
});

test('porownanie: dodany odnośnik, zmieniony atrybut i usunięty akapit', () => {
  const baza = MALA.replace('</h2>', '</h2><p>Usuń mnie</p>');
  const nowa = MALA
    .replace('href="#kontakt"', 'href="./kontakt.html"')
    .replace('<p>Drugi</p>', '<p>Drugi <a class="link-btn" href="integracja-systemow.html">Zobacz, jak łączymy systemy</a></p>');
  assert.deepEqual(porownaj(nowa, nowa), []);

  const z = porownaj(baza, nowa);
  const rodzaje = z.map((x) => x.rodzaj).sort();
  assert.deepEqual(rodzaje, ['atrybut', 'dodane', 'usuniete']);
  const lista = { 'strona-glowna': {
    atrybuty: [{ znacznik: 'a', atrybut: 'href', bylo: '#kontakt', jest: './kontakt.html' }],
    dodane: [{ znacznik: 'a', klasa: 'link-btn', href: 'integracja-systemow.html', tekst: 'Zobacz, jak łączymy systemy' }],
    usuniete: [{ znacznik: 'p', tekst: 'Usuń mnie' }],
  } };
  assert.deepEqual(sprawdzListe(lista), []);
  assert.deepEqual(dopasuj(z, lista).problemy, []);

  const zly = { 'strona-glowna': { dodane: [{ znacznik: 'a', klasa: 'link-btn', href: 'inny.html' }] } };
  const p = dopasuj(porownaj(baza, nowa), zly).problemy;
  assert.equal(p.length, 4); // atrybut, dodany link, usunięty akapit spoza listy + niezużyty wpis
});

test('porownanie: wstawienie elementu przed takim samym nie udaje zmiany tekstu', () => {
  const baza = '<ul><li><a href="#a">A</a></li><li><a href="#b">B</a></li></ul>';
  const nowa = '<ul><li><a href="#n">Nowy</a></li><li><a href="#a">A</a></li><li><a href="#b">B</a></li></ul>';
  const z = porownaj(baza, nowa);
  assert.equal(z.length, 1);
  assert.equal(z[0].rodzaj, 'dodane');
  assert.equal(z[0].znacznik, 'li');
  assert.equal(z[0].tekst, 'Nowy');
});

test('porownanie: niepoprawna lista jest zgłaszana', () => {
  assert.ok(sprawdzListe({}).length);
  assert.ok(sprawdzListe({ 'strona-glowna': { teksty: [{ bylo: 'a' }] } }).length);
  assert.ok(sprawdzListe({ 'strona-glowna': { dodane: [{}] } }).length);
  assert.ok(sprawdzListe({ 'strona-glowna': { teksty: [{ bylo: 'a', jest: 'b', razy: 0 }] } }).length);
});
