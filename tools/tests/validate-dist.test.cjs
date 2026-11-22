'use strict';
/* Testy negatywne walidatora wydania (T-02 z audytu T-028): walidator musi odrzucić zepsuty katalog.
   Każdy przypadek kopiuje dist/ do katalogu tymczasowego, psuje jedną rzecz i oczekuje kodu 1 z właściwym komunikatem.
   Testy wymagają dist/ zgodnego z kontraktem (build z kluczem Turnstile, jak w CI). Gdy dist/ nie ma albo sam
   nie przechodzi walidacji, przypadki są pomijane z podaniem powodu, a nie zaliczane. */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const ROOT = path.join(__dirname, '../..');
const DIST = path.join(ROOT, 'dist');
const WALIDATOR = path.join(ROOT, 'tools/validate-dist.cjs');

function waliduj(dir) {
  const r = spawnSync(process.execPath, [WALIDATOR, dir], { cwd: ROOT, encoding: 'utf8' });
  return { kod: r.status, tekst: `${r.stdout}\n${r.stderr}` };
}

let powodPominiecia = null;
if (!fs.existsSync(path.join(DIST, 'index.html'))) powodPominiecia = 'brak dist/ (uruchom build)';
else if (waliduj(DIST).kod !== 0) powodPominiecia = 'dist/ sam nie przechodzi walidacji (build bez klucza Turnstile albo nieaktualny)';

function kopia() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-walidator-'));
  fs.cpSync(DIST, dir, { recursive: true });
  return dir;
}

function przypadek(nazwa, zepsuj, wzorzec) {
  test(`walidator odrzuca: ${nazwa}`, { skip: powodPominiecia || false }, () => {
    const dir = kopia();
    try {
      zepsuj(dir);
      const { kod, tekst } = waliduj(dir);
      assert.equal(kod, 1, tekst.slice(0, 600));
      assert.match(tekst, wzorzec);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

const zamien = (dir, rel, f) => {
  const p = path.join(dir, rel);
  fs.writeFileSync(p, f(fs.readFileSync(p, 'utf8')));
};

test('walidator przyjmuje niezmieniony dist/', { skip: powodPominiecia || false }, () => {
  const dir = kopia();
  try {
    const { kod, tekst } = waliduj(dir);
    assert.equal(kod, 0, tekst.slice(0, 600));
    assert.match(tekst, /WALIDACJA OK/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

przypadek('brak wymaganego pliku', (d) => fs.unlinkSync(path.join(d, 'robots.txt')), /Brak wymaganego pliku: robots\.txt/);
przypadek('nadmiarowy plik', (d) => fs.writeFileSync(path.join(d, 'kopia.bak'), 'x'), /Nadmiarowy plik w katalogu: kopia\.bak/);
przypadek('dowiązanie symboliczne', (d) => fs.symlinkSync('index.html', path.join(d, 'skrot.html')), /Symlink zabroniony/);
przypadek('plik wykonywalny', (d) => fs.chmodSync(path.join(d, 'robots.txt'), 0o755), /Plik wykonywalny zabroniony: robots\.txt/);
przypadek('zmieniony plik zasobu', (d) => fs.appendFileSync(path.join(d, 'assets/js/app.js'), '\n// zmiana'), /Rozbieżność pliku publicznego assets\/js\/app\.js/);
przypadek('skrypt wpisany w stronę', (d) => zamien(d, 'kontakt.html', (s) => s.replace('</body>', '<script>alert(1)</script></body>')), /kontakt\.html: wykryto inline <script> bez src/);
przypadek('zmieniona treść strony głównej', (d) => zamien(d, 'index.html', (s) => s.replace('Procesy, które robią się same', 'Procesy, które robią się same!')), /index\.html różni się od migawki/);
przypadek('zmieniona treść podstrony', (d) => zamien(d, 'finanse.html', (s) => s.replace('</h1>', ' </h1>')), /htmlBaseline: rozbieżność strony finanse\.html/);
przypadek('wersja zasobu niezgodna z plikiem', (d) => zamien(d, 'finanse.html', (s) => s.replace(/assets\/js\/app\.js\?v=[0-9a-f]{8}/, 'assets/js/app.js?v=00000000')), /finanse\.html: .*app\.js\?v=00000000.*oczekiwano \?v=/);
przypadek('odnośnik do nieistniejącego pliku', (d) => zamien(d, 'finanse.html', (s) => s.replace('href="kontakt.html"', 'href="nie-ma.html"')), /finanse\.html: <a href="nie-ma\.html"> wskazuje na nieistniejący plik/);
przypadek('strona usunięta z mapy witryny', (d) => zamien(d, 'sitemap.xml', (s) => s.replace(/\s*<url><loc>https:\/\/revagy\.pl\/finanse\.html<\/loc>.*<\/url>/, '')), /sitemap\.xml: brak adresu kanonicznego strony finanse\.html/);
przypadek('zdublowany adres kanoniczny', (d) => zamien(d, 'finanse.html', (s) => s.replace('<link rel="canonical" href="https://revagy.pl/finanse.html">', '<link rel="canonical" href="https://revagy.pl/wdrozenia.html">')), /ten sam adres kanoniczny/);
przypadek('katalog _astro w artefakcie', (d) => { fs.mkdirSync(path.join(d, '_astro')); fs.writeFileSync(path.join(d, '_astro/x.js'), '1'); }, /Zabroniony katalog w artefakcie: _astro/);
