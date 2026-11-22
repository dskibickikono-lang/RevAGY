'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenize, parse, find, findAll, textOf, collapse, decodeEntities } = require('../lib/html.cjs');

test('html: tokeny ze znacznikami, atrybutami, tekstami i liniami', () => {
  const t = tokenize('<!doctype html>\n<p class="a b" data-x>Ala &amp; <b>kot</b></p><!-- k -->\n<img src="x.jpg" alt=\'„a”\'>');
  assert.deepEqual(t.map((x) => x.type), ['doctype', 'text', 'start', 'text', 'start', 'text', 'end', 'end', 'comment', 'text', 'start']);
  assert.deepEqual(t[2].attrs, [['class', 'a b'], ['data-x', '']]);
  assert.equal(t[3].text, 'Ala & ');
  assert.equal(t[10].line, 3);
  assert.deepEqual(t[10].attrs, [['src', 'x.jpg'], ['alt', '„a”']]);
});

test('html: treść <script> i <style> jest surowa', () => {
  const t = tokenize('<script>if (a < b && c > d) {}</script><style>a>b{}</style>');
  assert.equal(t[1].text, 'if (a < b && c > d) {}');
  assert.equal(t[2].type, 'end');
  assert.equal(t[4].text, 'a>b{}');
});

test('html: znak > w wartości atrybutu nie kończy znacznika', () => {
  const t = tokenize('<a title="a > b" href="#x">t</a>');
  assert.deepEqual(t[0].attrs, [['title', 'a > b'], ['href', '#x']]);
});

test('html: drzewo, elementy puste i tekst z granicami bloków', () => {
  const doc = parse('<main><ul><li>1</li><li>2 <img alt="x">kroki</li></ul><p>A&nbsp;B</p></main>');
  const main = find(doc, (e) => e.name === 'main');
  assert.equal(findAll(main, (e) => e.name === 'li').length, 2);
  assert.equal(textOf(main), '1 2 kroki A B');
});

test('html: zwijanie białych znaków zostawia twardą spację', () => {
  assert.equal(collapse('  a\n\t b c  '), 'a b c');
  assert.equal(decodeEntities('&#8222;x&#x201D; &ndash; &nieznane;'), '„x” – &nieznane;');
});
