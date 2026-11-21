'use strict';
/* Mały tokenizer i drzewo HTML dla narzędzi kontrolnych (bez zależności spoza Node).
   Obsługuje to, co generuje Astro na tej stronie: znaczniki z atrybutami, teksty, komentarze,
   DOCTYPE, elementy puste oraz surową treść <script>, <style>, <title> i <textarea>.
   Nie jest pełnym parserem HTML5: niedomknięty znacznik zamyka najbliższy pasujący przodek. */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const RCDATA = new Set(['title', 'textarea']);
const BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'br', 'button', 'dd', 'details', 'div', 'dl', 'dt', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'label', 'li',
  'main', 'nav', 'ol', 'option', 'p', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
]);

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '­', ndash: '–', mdash: '—',
  hellip: '…', laquo: '«', raquo: '»', bdquo: '„', rdquo: '”', ldquo: '“', lsquo: '‘', rsquo: '’', sbquo: '‚',
  copy: '©', reg: '®', trade: '™', middot: '·', bull: '•', times: '×', minus: '−', euro: '€', deg: '°',
  thinsp: ' ', ensp: ' ', emsp: ' ', zwj: '‍', zwnj: '‌', rarr: '→', larr: '←', darr: '↓', uarr: '↑',
};

function decodeEntities(s) {
  if (!s || s.indexOf('&') === -1) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      try { return String.fromCodePoint(code); } catch { return m; }
    }
    return Object.prototype.hasOwnProperty.call(NAMED, body) ? NAMED[body] : m;
  });
}

/** Zwija białe znaki HTML (spacja, tabulator, nowa linia, CR, FF) do jednej spacji i obcina brzegi.
    Twarda spacja (U+00A0) zostaje, bo jest częścią treści. */
function collapse(s) {
  return String(s).replace(/[ \t\n\r\f]+/g, ' ').trim();
}

function lineAt(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

function parseAttrs(src) {
  const attrs = [];
  const re = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(src))) {
    const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '';
    attrs.push([m[1].toLowerCase(), decodeEntities(value)]);
  }
  return attrs;
}

/** Rozkłada HTML na tokeny: start, end, text, comment, doctype. Każdy ma numer linii. */
function tokenize(html) {
  const tokens = [];
  const starts = [0];
  for (let i = 0; i < html.length; i++) if (html.charCodeAt(i) === 10) starts.push(i + 1);
  let i = 0;
  const n = html.length;
  const pushText = (from, to, raw) => {
    if (to <= from) return;
    const chunk = html.slice(from, to);
    tokens.push({ type: 'text', raw: chunk, text: raw ? chunk : decodeEntities(chunk), line: lineAt(starts, from) });
  };
  let textFrom = 0;
  while (i < n) {
    if (html[i] !== '<') { i++; continue; }
    if (html.startsWith('<!--', i)) {
      pushText(textFrom, i);
      const end = html.indexOf('-->', i + 4);
      const stop = end === -1 ? n : end + 3;
      tokens.push({ type: 'comment', raw: html.slice(i, stop), line: lineAt(starts, i) });
      i = textFrom = stop;
      continue;
    }
    if (html[i + 1] === '!' || html[i + 1] === '?') {
      pushText(textFrom, i);
      const end = html.indexOf('>', i);
      const stop = end === -1 ? n : end + 1;
      tokens.push({ type: 'doctype', raw: html.slice(i, stop), line: lineAt(starts, i) });
      i = textFrom = stop;
      continue;
    }
    const endTag = /^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/.exec(html.slice(i, i + 200));
    if (endTag) {
      pushText(textFrom, i);
      tokens.push({ type: 'end', name: endTag[1].toLowerCase(), line: lineAt(starts, i) });
      i = textFrom = i + endTag[0].length;
      continue;
    }
    const startName = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(i, i + 100));
    if (!startName) { i++; continue; }
    // koniec znacznika z pominięciem '>' w cudzysłowach
    let j = i + startName[0].length;
    let quote = null;
    while (j < n) {
      const c = html[j];
      if (quote) { if (c === quote) quote = null; } else if (c === '"' || c === "'") quote = c; else if (c === '>') break;
      j++;
    }
    pushText(textFrom, i);
    const name = startName[1].toLowerCase();
    let inner = html.slice(i + startName[0].length, j);
    const selfClosing = /\/\s*$/.test(inner);
    if (selfClosing) inner = inner.replace(/\/\s*$/, '');
    const tok = { type: 'start', name, attrs: parseAttrs(inner), selfClosing, line: lineAt(starts, i) };
    tokens.push(tok);
    i = textFrom = Math.min(j + 1, n);
    if ((RAW.has(name) || RCDATA.has(name)) && !selfClosing) {
      const close = html.toLowerCase().indexOf(`</${name}`, i);
      const stop = close === -1 ? n : close;
      pushText(i, stop, RAW.has(name));
      i = textFrom = stop;
    }
  }
  pushText(textFrom, n);
  return tokens;
}

/** Buduje drzewo z tokenów. Węzły: { type:'element', name, attrs:{}, attrList, children, parent, line } i { type:'text', text }. */
function parse(html) {
  const root = { type: 'root', name: '#root', attrs: {}, attrList: [], children: [], parent: null, line: 1 };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  for (const t of tokenize(html)) {
    if (t.type === 'text') {
      top().children.push({ type: 'text', text: t.text, parent: top(), line: t.line });
    } else if (t.type === 'start') {
      // proste domknięcia niejawne: <li> w <li>, <p> w <p>, <option> w <option>
      if (['li', 'p', 'option', 'dt', 'dd', 'tr', 'td', 'th'].includes(t.name) && top().name === t.name) stack.pop();
      const attrs = {};
      for (const [k, v] of t.attrs) if (!(k in attrs)) attrs[k] = v;
      const el = { type: 'element', name: t.name, attrs, attrList: t.attrs, children: [], parent: top(), line: t.line };
      top().children.push(el);
      if (!VOID.has(t.name) && !t.selfClosing) stack.push(el);
    } else if (t.type === 'end') {
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].name === t.name) { stack.length = k; break; }
      }
    }
  }
  return root;
}

function* walk(node) {
  for (const c of node.children || []) {
    yield c;
    if (c.type === 'element') yield* walk(c);
  }
}

const findAll = (node, pred) => [...walk(node)].filter((n) => n.type === 'element' && pred(n));
const find = (node, pred) => { for (const n of walk(node)) if (n.type === 'element' && pred(n)) return n; return null; };
const classes = (el) => (el.attrs.class || '').split(/[ \t\n\r\f]+/).filter(Boolean);
const hasClass = (el, c) => classes(el).includes(c);
const has = (el, a) => Object.prototype.hasOwnProperty.call(el.attrs, a);

/** Tekst węzła. Granice elementów blokowych dają separator `blok` (domyślnie spację),
    żeby „1</li><li>2” nie zlało się w „12”. */
function textOf(node, { skip = ['script', 'style', 'template', 'noscript'], blok = ' ' } = {}) {
  const out = [];
  const rec = (n) => {
    for (const c of n.children || []) {
      if (c.type === 'text') out.push(c.text);
      else if (c.type === 'element') {
        if (skip.includes(c.name)) continue;
        const block = BLOCK.has(c.name);
        if (block) out.push(blok);
        rec(c);
        if (block) out.push(blok);
      }
    }
  };
  rec(node);
  const t = collapse(out.join(''));
  return blok === ' ' ? t : t.split(blok).map(collapse).filter(Boolean).join(blok);
}

module.exports = { VOID, RAW, BLOCK, tokenize, parse, walk, find, findAll, classes, hasClass, has, textOf, collapse, decodeEntities };
