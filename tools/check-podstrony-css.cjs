#!/usr/bin/env node
/* Statyczna kontrola stylów podstron (plan, rozdział 2.3, punkt 1).
   node tools/check-podstrony-css.cjs [--css=<podstrony.css>] [--tokeny=<styles.css>]

   Domyślnie public/assets/css/podstrony.css względem public/assets/css/styles.css.
   Brak pliku stylów podstron: kod 0. Błąd: kod 1, każdy z linią, właściwością i wartością. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { sprawdzPodstronyCss } = require('./lib/css.cjs');

function main(argv = process.argv.slice(2)) {
  const root = path.join(__dirname, '..');
  const opt = (name, def) => { const a = argv.find((x) => x.startsWith(`--${name}=`)); return a ? path.resolve(a.slice(name.length + 3)) : def; };
  const cssPath = opt('css', path.join(root, 'public/assets/css/podstrony.css'));
  const stylesPath = opt('tokeny', path.join(root, 'public/assets/css/styles.css'));
  const rel = (p) => path.relative(process.cwd(), p) || p;

  if (!fs.existsSync(cssPath)) {
    console.log(`check-podstrony-css: brak ${rel(cssPath)} — nie ma czego sprawdzać.`);
    return 0;
  }
  if (!fs.existsSync(stylesPath)) {
    console.error(`check-podstrony-css: brak pliku wzorcowego ${rel(stylesPath)}`);
    return 1;
  }
  const bledy = sprawdzPodstronyCss(fs.readFileSync(cssPath, 'utf8'), fs.readFileSync(stylesPath, 'utf8'));
  if (!bledy.length) {
    console.log(`OK: ${rel(cssPath)} używa wyłącznie tokenów i wartości z ${rel(stylesPath)}.`);
    return 0;
  }
  console.error(`BŁĄD: ${rel(cssPath)}: ${bledy.length} niezgodności z ${rel(stylesPath)}:`);
  for (const b of bledy) console.error(`  ${rel(cssPath)}:${b.line}: ${b.prop}${b.value ? `: ${b.value}` : ''} — ${b.powod}`);
  return 1;
}

if (require.main === module) process.exit(main());

module.exports = { main };
