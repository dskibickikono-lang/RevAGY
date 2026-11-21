'use strict';
/* Pomocnicze funkcje testów narzędzi kontrolnych. */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const TOOLS = path.join(__dirname, '..');
const REPO = path.join(TOOLS, '..');

function tmp(prefix = 'revagy-narzedzia-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function zapisz(dir, rel, tresc) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof tresc === 'string' || Buffer.isBuffer(tresc) ? tresc : JSON.stringify(tresc, null, 2));
  return p;
}

/** Uruchamia skrypt node i zwraca { kod, out, err }. */
function uruchom(args, { env = {}, cwd = REPO } = {}) {
  const r = spawnSync(process.execPath, args, {
    cwd,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env },
    encoding: 'utf8',
  });
  return { kod: r.status, out: r.stdout, err: r.stderr };
}

/** Zbudowana strona główna do testów: zmienna REVAGY_TEST_INDEX, produkcja, dist/ albo migawka. */
function indexBazowy() {
  const kandydaci = [
    process.env.REVAGY_TEST_INDEX,
    '/var/www/revagy.pl/current/index.html',
    path.join(REPO, 'dist/index.html'),
    path.join(REPO, 'tools/baseline/index.html'),
  ].filter(Boolean);
  const p = kandydaci.find((x) => fs.existsSync(x));
  return p ? { sciezka: p, html: fs.readFileSync(p, 'utf8') } : null;
}

module.exports = { TOOLS, REPO, tmp, zapisz, uruchom, indexBazowy };
