'use strict';
/* tools/indexnow-ping.cjs bez sieci: klucz z public/, adresy z mapy witryny i treść zgłoszenia. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { tmp, zapisz } = require('./pomoc.cjs');
const { znajdzKlucz, adresyZMapy, zbudujZgloszenie } = require('../indexnow-ping.cjs');

const KLUCZ = '0123456789abcdef0123456789abcdef';

test('indexnow: klucz to jedyny plik <hex32>.txt z treścią równą nazwie', () => {
  const dir = tmp();
  zapisz(dir, `${KLUCZ}.txt`, `${KLUCZ}\n`);
  zapisz(dir, 'robots.txt', 'User-agent: *');
  assert.equal(znajdzKlucz(dir), KLUCZ);
  zapisz(dir, `${KLUCZ}.txt`, 'inny');
  assert.throws(() => znajdzKlucz(dir), /nie jest równa/);
  const puste = tmp();
  assert.throws(() => znajdzKlucz(puste), /jest 0/);
});

test('indexnow: adresy z <loc> bez powtórzeń, adres spoza revagy.pl to błąd', () => {
  const xml = '<urlset><url><loc>https://revagy.pl/</loc></url><url><loc> https://revagy.pl/a.html </loc></url><url><loc>https://revagy.pl/</loc></url></urlset>';
  assert.deepEqual(adresyZMapy(xml), ['https://revagy.pl/', 'https://revagy.pl/a.html']);
  assert.throws(() => adresyZMapy('<loc>https://example.com/</loc>'), /spoza revagy\.pl/);
});

test('indexnow: zgłoszenie ma host, key, keyLocation i urlList', () => {
  assert.deepEqual(zbudujZgloszenie(KLUCZ, ['https://revagy.pl/']), {
    host: 'revagy.pl', key: KLUCZ, keyLocation: `https://revagy.pl/${KLUCZ}.txt`, urlList: ['https://revagy.pl/'],
  });
});

test('indexnow: repozytorium ma ważny klucz, --dry-run obejmuje całą mapę witryny i nie łączy się z siecią', () => {
  const root = path.join(__dirname, '..', '..');
  const klucz = znajdzKlucz(path.join(root, 'public'));
  const res = spawnSync(process.execPath, [path.join(root, 'tools', 'indexnow-ping.cjs'), '--dry-run'], { cwd: root, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, new RegExp(`"keyLocation": "https://revagy.pl/${klucz}.txt"`));
  assert.match(res.stdout, /nic nie zostało wysłane/);
  assert.equal(spawnSync(process.execPath, [path.join(root, 'tools', 'indexnow-ping.cjs'), '--zle'], { encoding: 'utf8' }).status, 2);
});
