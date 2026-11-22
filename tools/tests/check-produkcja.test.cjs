'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { naglowkiZWzorca, porownajNaglowki } = require('../check-produkcja.cjs');

const wzorzec = fs.readFileSync(path.join(__dirname, '../../deploy/nginx/revagy-naglowki.conf'), 'utf8');

test('naglowkiZWzorca czyta komplet nagłówków z pliku nginx', () => {
  const n = naglowkiZWzorca(wzorzec);
  assert.deepEqual(Object.keys(n).sort(), ['content-security-policy', 'permissions-policy', 'referrer-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options']);
  assert.match(n['content-security-policy'], /^default-src 'self'/);
});

test('porownajNaglowki: zgodne nagłówki nie dają różnic', () => {
  const n = naglowkiZWzorca(wzorzec);
  assert.deepEqual(porownajNaglowki(n, { ...n, server: 'x' }), []);
});

test('porownajNaglowki: brak nagłówka i inna wartość są zgłaszane', () => {
  const n = naglowkiZWzorca(wzorzec);
  const f = { ...n, 'content-security-policy': n['content-security-policy'].replace(' https://www.clarity.ms', '') };
  delete f['x-frame-options'];
  const b = porownajNaglowki(n, f);
  assert.equal(b.length, 2);
  assert.ok(b.some((x) => x.startsWith('content-security-policy: oczekiwano')));
  assert.ok(b.includes('brak nagłówka x-frame-options'));
});
