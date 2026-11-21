'use strict';
/* Baza do porównania strony głównej: migawka index.html z gałęzi bazowej.
   Kolejność źródeł:
   1. plik ze zmiennej REVAGY_BAZA_PLIK,
   2. `git show <ref>:tools/baseline/index.html`, gdzie ref to REVAGY_BAZA_REF albo origin/$GITHUB_BASE_REF
      (w CI z GITHUB_BASE_REF najpierw `git fetch --depth=1 origin $GITHUB_BASE_REF`),
   3. plik tools/baseline/index.baza.html.
   Brak każdego z nich: null. */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const MIGAWKA = 'tools/baseline/index.html';
const BAZA_LOKALNA = 'tools/baseline/index.baza.html';

function git(repoRoot, args) {
  return execFileSync('git', ['-C', repoRoot, ...args], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

/**
 * @param {{ repoRoot: string, env?: NodeJS.ProcessEnv, log?: (msg: string) => void }} opts
 * @returns {{ html: string, zrodlo: string } | null}
 */
function wczytajBaze({ repoRoot, env = process.env, log = () => {} } = {}) {
  if (!repoRoot) throw new Error('wczytajBaze: brak repoRoot');

  if (env.REVAGY_BAZA_PLIK) {
    const plik = path.resolve(repoRoot, env.REVAGY_BAZA_PLIK);
    if (!fs.existsSync(plik)) throw new Error(`REVAGY_BAZA_PLIK wskazuje nieistniejący plik: ${plik}`);
    return { html: fs.readFileSync(plik, 'utf8'), zrodlo: `plik ${env.REVAGY_BAZA_PLIK} (REVAGY_BAZA_PLIK)` };
  }

  let ref = env.REVAGY_BAZA_REF || '';
  if (!ref && env.GITHUB_BASE_REF) {
    ref = `origin/${env.GITHUB_BASE_REF}`;
    try {
      git(repoRoot, ['fetch', '--depth=1', 'origin', `${env.GITHUB_BASE_REF}:refs/remotes/origin/${env.GITHUB_BASE_REF}`]);
    } catch (e) {
      log(`git fetch origin ${env.GITHUB_BASE_REF} nie powiódł się: ${String(e.stderr || e.message).trim()}`);
    }
  }
  if (ref) {
    try {
      const html = git(repoRoot, ['show', `${ref}:${MIGAWKA}`]).toString('utf8');
      return { html, zrodlo: `git ${ref}:${MIGAWKA}` };
    } catch (e) {
      log(`Brak ${MIGAWKA} w ${ref}: ${String(e.stderr || e.message).trim().split('\n')[0]}`);
    }
  }

  const lokalna = path.join(repoRoot, BAZA_LOKALNA);
  if (fs.existsSync(lokalna)) return { html: fs.readFileSync(lokalna, 'utf8'), zrodlo: `plik ${BAZA_LOKALNA}` };
  return null;
}

module.exports = { wczytajBaze, MIGAWKA, BAZA_LOKALNA };
