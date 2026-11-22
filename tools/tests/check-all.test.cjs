'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { tmp, zapisz, uruchom, TOOLS } = require('./pomoc.cjs');

// Sztuczne repozytorium: kopia check-all.cjs i atrapy kroków, które zapisują swoje wywołanie.
function repo(kody) {
  const dir = tmp('revagy-check-all-');
  fs.mkdirSync(path.join(dir, 'tools'), { recursive: true });
  fs.copyFileSync(path.join(TOOLS, 'check-all.cjs'), path.join(dir, 'tools', 'check-all.cjs'));
  for (const [plik, kod] of Object.entries(kody)) {
    zapisz(dir, `tools/${plik}`, `require('node:fs').appendFileSync(require('node:path').join(__dirname, '..', 'log.txt'), ${JSON.stringify(plik)} + '\\n');\nprocess.exit(${kod});\n`);
  }
  return dir;
}
const log = (dir) => (fs.existsSync(path.join(dir, 'log.txt')) ? fs.readFileSync(path.join(dir, 'log.txt'), 'utf8').trim().split('\n') : []);

test('check-all: po błędzie uruchamia pozostałe kroki, podsumowuje i kończy kodem 1', () => {
  const dir = repo({ 'validate-dist.cjs': 1, 'compare-home.cjs': 0, 'check-podstrony-css.cjs': 0, 'check-tresc.cjs': 1 });
  const r = uruchom([path.join(dir, 'tools', 'check-all.cjs'), path.join(dir, 'dist')], { cwd: dir });
  assert.equal(r.kod, 1, r.out + r.err);
  assert.deepEqual(log(dir), ['validate-dist.cjs', 'compare-home.cjs', 'check-podstrony-css.cjs', 'check-tresc.cjs']);
  assert.match(r.out, /OK\s+compare-home/);
  assert.match(r.out, /BŁĄD\s+validate-dist \(kod 1\)/);
  assert.match(r.out, /BŁĄD\s+check-tresc \(kod 1\)/);
  assert.match(r.out, /POMINIĘTE\s+tests \(brak tools\/tests\)/);
  assert.match(r.err, /2 z 6 kroków zawiodło: validate-dist, check-tresc/);
  assert.match(r.out, /POMINIĘTE\s+compare-film \(brak tools\/compare-film\.cjs\)/);
});

test('check-all: wszystkie kroki przechodzą — kod 0', () => {
  const dir = repo({ 'validate-dist.cjs': 0, 'compare-home.cjs': 0, 'check-podstrony-css.cjs': 0, 'check-tresc.cjs': 0 });
  const r = uruchom([path.join(dir, 'tools', 'check-all.cjs'), path.join(dir, 'dist')], { cwd: dir });
  assert.equal(r.kod, 0, r.out + r.err);
  assert.equal(log(dir).length, 4);
  assert.match(r.out, /OK: 4 kroków zakończonych powodzeniem/);
});

test('check-all: bez katalogu — kod 1 i opis użycia', () => {
  const r = uruchom([path.join(TOOLS, 'check-all.cjs')]);
  assert.equal(r.kod, 1);
  assert.match(r.err, /Użycie/);
});
