'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');

const modul = () => import(pathToFileURL(path.join(__dirname, '../../src/config/zasoby.mjs')).href);

test('zasob: parametr ?v= to pierwsze 8 znaków SHA-256 treści pliku', async () => {
  const { zasob } = await modul();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-zasoby-'));
  fs.mkdirSync(path.join(dir, 'assets/js'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'assets/js/a.js'), 'console.log(1);');
  const skrot = crypto.createHash('sha256').update('console.log(1);').digest('hex').slice(0, 8);
  assert.equal(zasob('assets/js/a.js', dir), `assets/js/a.js?v=${skrot}`);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('zasob: brak pliku i zła ścieżka zatrzymują build', async () => {
  const { zasob } = await modul();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revagy-zasoby-'));
  assert.throws(() => zasob('assets/js/nie-ma.js', dir), /brak pliku/);
  assert.throws(() => zasob('../sekret.txt', dir), /nieprawidłowa ścieżka/);
  assert.throws(() => zasob('/assets/js/a.js', dir), /nieprawidłowa ścieżka/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('zasob: adresy w układach nie mają już ręcznego numeru wersji', () => {
  for (const f of ['src/layouts/BaseLayout.astro', 'src/layouts/PodstronaLayout.astro', 'src/components/Clarity.astro']) {
    const s = fs.readFileSync(path.join(__dirname, '../..', f), 'utf8');
    assert.equal(/\?v=\d/.test(s), false, f);
  }
});
