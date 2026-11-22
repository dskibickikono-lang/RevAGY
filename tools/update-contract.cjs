#!/usr/bin/env node
/* Odtwarza w tools/dom-contract.json pola wyliczane z katalogu wynikowego:
   - pages            — kontrakt DOM każdej strony HTML (bez formularza i jego skryptu, jak w walidatorze),
   - htmlBaseline     — suma SHA-256 i rozmiar każdej strony HTML,
   - publicFiles      — suma SHA-256 i rozmiar każdego innego pliku (poza generatedFiles),
   - contactForm.htmlSha256 — wspólna suma formularza (klucz witryny zastąpiony stałą).
   Pozostałe pola (baselineCommit, structuredData, generatedFiles, mediaBudget, contactForm.script)
   zostają bez zmian. Logika jest ta sama co w tools/validate-dist.cjs (wspólne funkcje).

   Użycie:
     node tools/update-contract.cjs <katalog> [--snapshot]

   --snapshot  kopiuje też <katalog>/index.html do tools/baseline/index.html (migawka strony głównej).
*/
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { extractHtmlContract, pageComparison, collectFiles } = require('./validate-dist.cjs');

function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('--'));
  const snapshot = args.includes('--snapshot');
  const unknown = args.filter((a) => a.startsWith('--') && a !== '--snapshot');
  if (!targetArg || unknown.length) {
    console.error('Użycie: node tools/update-contract.cjs <katalog> [--snapshot]');
    process.exit(1);
  }
  const targetDir = path.resolve(targetArg);
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Katalog nie istnieje: ${targetDir}`);
    process.exit(1);
  }

  const contractPath = path.join(__dirname, 'dom-contract.json');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const generated = new Set(Object.keys(contract.generatedFiles || {}));

  const { errors, actualMap } = collectFiles(targetDir);
  if (errors.length) {
    console.error('Katalog ma błędy struktury (popraw je przed aktualizacją kontraktu):');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const pages = {};
  const htmlBaseline = {};
  const publicFiles = {};
  const formHashes = new Map();
  for (const [rel, entry] of actualMap) { // kolejność: posortowana bajtowo, jak w walidatorze
    if (generated.has(rel)) continue;
    if (rel.endsWith('.html')) {
      const html = fs.readFileSync(entry.full, 'utf8');
      const cmp = pageComparison(rel, html);
      if (cmp.hasForm) {
        if (cmp.formCount !== 1 || !cmp.sitekeyOk) {
          console.error(`${rel}: formularz musi być jeden i mieć klucz witryny`);
          process.exit(1);
        }
        formHashes.set(rel, cmp.formHash);
      }
      pages[rel] = extractHtmlContract(cmp.comparisonHtml);
      htmlBaseline[rel] = { sha256: entry.sha256, size: entry.size };
    } else {
      publicFiles[rel] = { sha256: entry.sha256, size: entry.size };
    }
  }

  const uniqueForms = new Set(formHashes.values());
  if (uniqueForms.size > 1) {
    console.error(`Formularze różnią się między stronami: ${[...formHashes].map(([r, h]) => `${r}=${h}`).join(', ')}`);
    process.exit(1);
  }

  const changed = [];
  const setField = (name, value) => {
    if (JSON.stringify(contract[name]) !== JSON.stringify(value)) changed.push(name);
    contract[name] = value; // istniejący klucz zachowuje swoje miejsce w pliku
  };
  setField('publicFiles', publicFiles);
  setField('htmlBaseline', htmlBaseline);
  setField('pages', pages);
  if (uniqueForms.size === 1) {
    const [formHash] = uniqueForms;
    if (!contract.contactForm) contract.contactForm = { htmlSha256: null, script: 'assets/js/kontakt.js' };
    if (contract.contactForm.htmlSha256 !== formHash) changed.push('contactForm.htmlSha256');
    contract.contactForm.htmlSha256 = formHash;
  } else {
    console.warn('Uwaga: w katalogu nie ma formularza (build bez klucza Turnstile?); contactForm.htmlSha256 bez zmian.');
  }

  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
  console.log(`Zapisano ${path.relative(process.cwd(), contractPath) || contractPath}: ${Object.keys(pages).length} stron, ${Object.keys(publicFiles).length} plików publicznych. Zmienione pola: ${changed.length ? changed.join(', ') : 'brak'}`);

  if (snapshot) {
    const src = actualMap.get('index.html');
    if (!src) {
      console.error('Brak index.html w katalogu, migawka nie została zapisana');
      process.exit(1);
    }
    const dst = path.join(__dirname, 'baseline', 'index.html');
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src.full, dst);
    fs.chmodSync(dst, 0o644);
    console.log(`Zapisano migawkę ${path.relative(process.cwd(), dst) || dst} (${src.size} B, ${src.sha256})`);
  }
}

main();
