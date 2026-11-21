#!/usr/bin/env node
/* Wszystkie kontrole katalogu wynikowego po kolei. Pierwszy błąd kończy całość kodem 1.
   1. tools/validate-dist.cjs <dist> [argumenty]   (zawsze; argumenty przekazywane bez zmian, np. --manifest-out=…)
   2. tools/compare-home.cjs --dist=<dist>          (jeśli plik istnieje)
   3. tools/check-podstrony-css.cjs                 (jeśli plik istnieje)
   4. tools/check-tresc.cjs --dist=<dist>           (jeśli plik istnieje)
   5. node --test tools/tests/                      (jeśli katalog istnieje)

   Użycie:
     node tools/check-all.cjs <dist> [argumenty walidatora]
*/
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

function main() {
  const args = process.argv.slice(2);
  const distArg = args.find((a) => !a.startsWith('--'));
  if (!distArg) {
    console.error('Użycie: node tools/check-all.cjs <dist> [argumenty walidatora]');
    process.exit(1);
  }
  const dist = path.resolve(distArg);
  const extra = args.filter((a) => a !== distArg);

  const steps = [
    { name: 'validate-dist', file: 'tools/validate-dist.cjs', argv: ['tools/validate-dist.cjs', dist, ...extra] },
    { name: 'compare-home', file: 'tools/compare-home.cjs', argv: ['tools/compare-home.cjs', `--dist=${dist}`] },
    { name: 'check-podstrony-css', file: 'tools/check-podstrony-css.cjs', argv: ['tools/check-podstrony-css.cjs'] },
    { name: 'check-tresc', file: 'tools/check-tresc.cjs', argv: ['tools/check-tresc.cjs', `--dist=${dist}`] },
    { name: 'tests', file: 'tools/tests', argv: ['--test', 'tools/tests/'] },
  ];

  let run = 0;
  for (const step of steps) {
    if (!fs.existsSync(path.join(ROOT, step.file))) {
      console.log(`[check-all] ${step.name}: pominięte (brak ${step.file})`);
      continue;
    }
    console.log(`[check-all] ${step.name}: node ${step.argv.join(' ')}`);
    const res = spawnSync(process.execPath, step.argv, { cwd: ROOT, stdio: 'inherit' });
    if (res.error || res.status !== 0) {
      const why = res.error ? res.error.message : (res.signal ? `sygnał ${res.signal}` : `kod ${res.status}`);
      console.error(`[check-all] BŁĄD w kroku ${step.name} (${why})`);
      process.exit(1);
    }
    run++;
  }
  console.log(`[check-all] OK: ${run} kroków zakończonych powodzeniem`);
}

main();
