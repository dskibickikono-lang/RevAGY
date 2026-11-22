'use strict';
/* Lokalny serwer testu dymnego bez przeglądarki: /__baza.html z tymi samymi nagłówkami co strona. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const http = require('node:http');
const { tmp, zapisz } = require('./pomoc.cjs');

const maOpenssl = spawnSync('openssl', ['version']).status === 0;

const pobierz = (url) => new Promise((resolve, reject) => {
  http.get(url, (res) => {
    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
  }).on('error', reject);
});

test('harness: /__baza.html podaje bazę z nagłówkami strony; bez bazy to zwykłe 404', { skip: !maOpenssl && 'brak openssl' }, async () => {
  const { startLocalHarness, BAZA_PATH } = require('../smoke-test.cjs');
  const dist = tmp();
  zapisz(dist, 'index.html', '<!doctype html><title>bieżąca</title>');
  zapisz(dist, '404.html', '<!doctype html><title>404</title>');

  const z = await startLocalHarness(dist, { bazaHtml: '<!doctype html><title>baza ąę</title>' });
  try {
    const strona = await pobierz(`${z.httpBase}/`);
    const baza = await pobierz(`${z.httpBase}${BAZA_PATH}`);
    assert.equal(baza.status, 200);
    assert.equal(baza.body, '<!doctype html><title>baza ąę</title>');
    for (const h of ['content-type', 'cache-control', 'content-security-policy', 'x-revagy-local-harness']) {
      assert.equal(baza.headers[h], strona.headers[h], h);
    }
  } finally { z.close(); }

  const bez = await startLocalHarness(dist);
  try {
    assert.equal((await pobierz(`${bez.httpBase}${BAZA_PATH}`)).status, 404);
  } finally { bez.close(); }
});
