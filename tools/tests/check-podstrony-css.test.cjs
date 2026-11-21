'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { tmp, zapisz, uruchom, TOOLS, REPO } = require('./pomoc.cjs');
const { sprawdzPodstronyCss, rozbij, zbiorWartosci, tokeny, kolorWprost, parseCss } = require('../lib/css.cjs');

const SKRYPT = path.join(TOOLS, 'check-podstrony-css.cjs');
const STYLES = path.join(REPO, 'public/assets/css/styles.css');

const POPRAWNY = `/* Układ podstron: tylko to, czego brakuje w styles.css. */
.film img { width: 100%; height: 100%; object-fit: cover; }
.sub-grid {
  display: grid;
  gap: 12px;
  margin: 0 auto;
  padding-block: 44px;
  border-radius: var(--r-lg);
  color: var(--ink-2);
  background: transparent;
  border: 1px solid currentColor;
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  line-height: 1.5;
}
@media (max-width: 760px) { .sub-grid { gap: 12px; color: inherit; } }
`;

function sprawdz(css) {
  const dir = tmp();
  const p = zapisz(dir, 'podstrony.css', css);
  return uruchom([SKRYPT, `--css=${p}`, `--tokeny=${STYLES}`]);
}

test('check-podstrony-css: brak pliku stylów podstron — kod 0', () => {
  const r = uruchom([SKRYPT, `--css=${path.join(tmp(), 'brak.css')}`, `--tokeny=${STYLES}`]);
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /nie ma czego sprawdzać/);
});

test('check-podstrony-css: domyślne ścieżki repozytorium działają', () => {
  const r = uruchom([SKRYPT]);
  assert.equal(r.kod, 0, r.err);
});

test('check-podstrony-css: plik poprawny — kod 0', () => {
  const r = sprawdz(POPRAWNY);
  assert.equal(r.kod, 0, r.err);
  assert.match(r.out, /^OK/);
});

test('check-podstrony-css: kolor wpisany wprost — kod 1 z linią, właściwością i wartością', () => {
  const r = sprawdz('.a {\n  gap: 12px;\n  color: #ff5b14;\n}\n');
  assert.equal(r.kod, 1);
  assert.match(r.err, /podstrony\.css:3: color: #ff5b14 — kolor szesnastkowy #ff5b14/);
});

test('check-podstrony-css: nowy rozmiar pisma — kod 1', () => {
  const r = sprawdz('.a { font-size: 13.5px; }\n');
  assert.equal(r.kod, 1);
  assert.match(r.err, /podstrony\.css:1: font-size: 13\.5px — wartość „13\.5px” nie występuje dla font-size/);
});

test('check-podstrony-css: pozostałe zakazy', () => {
  const style = require('node:fs').readFileSync(STYLES, 'utf8');
  const powody = (css) => sprawdzPodstronyCss(css, style).map((b) => b.powod).join('\n');
  assert.match(powody('@import "x.css";'), /@import/);
  assert.match(powody('@font-face { font-family: X; src: url(x.woff2); }'), /@font-face/);
  assert.match(powody('.a { background: url(x.png); }'), /url/);
  assert.match(powody(':root { --nowy: 1px; }'), /własnej zmiennej/);
  assert.match(powody('.a { color: var(--nieznany); }'), /--nieznany nie jest tokenem/);
  assert.match(powody('.a { font-family: Arial, sans-serif; }'), /font-family/);
  assert.match(powody('.a { box-shadow: 0 1px 2px rgba(0,0,0,.2); }'), /rgba/);
  assert.match(powody('.a { border-color: red; }'), /nazwa koloru „red”/);
  assert.match(powody('.a { margin: 0 13px; }'), /margin-right/);
  assert.match(powody('.a { gap: 12px 777px; }'), /column-gap/);
  assert.match(powody('.a { border-radius: 7px; }'), /border-top-left-radius/);
  assert.match(powody('.a { letter-spacing: .5em; }'), /letter-spacing/);
  assert.match(powody('.a { font-weight: 850; }'), /font-weight/);
  assert.equal(powody('.a { animation: field 7s infinite both; transition: color .2s; }'), '');
});

test('css: skróty są rozbijane na składowe', () => {
  assert.deepEqual(rozbij('margin', '0 auto'), [['margin-top', '0'], ['margin-right', 'auto'], ['margin-bottom', '0'], ['margin-left', 'auto']]);
  assert.deepEqual(rozbij('padding-inline', '4px 8px'), [['padding-left', '4px'], ['padding-right', '8px']]);
  assert.deepEqual(rozbij('gap', 'clamp(1px, 2vw, 3px) 4px'), [['row-gap', 'clamp(1px, 2vw, 3px)'], ['column-gap', '4px']]);
  assert.equal(rozbij('border-radius', '1px 2px / 3px')[0][1], '1px 3px');
});

test('css: zbiór wartości i tokeny wyliczane z styles.css', () => {
  const style = require('node:fs').readFileSync(STYLES, 'utf8');
  const z = zbiorWartosci(style);
  assert.ok(z.get('font-size').has('var(--fs-h3)'));
  assert.ok(z.get('margin-left').has('auto'));
  const t = tokeny(style);
  assert.ok(t.has('--accent') && t.has('--font-body') && t.has('--header-h'));
  assert.ok(!t.has('--d'));
  assert.equal(kolorWprost('var(--night-2)'), null);
  assert.equal(parseCss('a{b:c}\n/* x; } */\nd { e: "f;}" }').deklaracje.length, 2);
});
