'use strict';
/* Mały parser CSS i reguły dla pliku stylów podstron (plan, rozdział 2.3, punkt 1). */

/** Rozkłada CSS na deklaracje i reguły @. Zwraca { deklaracje: [{prop, value, line, blok}], atReguly: [{name, prelude, line}] }.
    `blok` to łańcuch preludiów od zewnątrz, np. ['@media (max-width: 600px)', ':root']. */
function parseCss(src) {
  const deklaracje = [];
  const atReguly = [];
  const stack = [];
  let buf = '';
  let bufStart = -1;
  let line = 1;
  let bufLine = 1;
  let i = 0;
  const n = src.length;
  const flushDecl = () => {
    const text = buf.trim();
    if (text) {
      if (text[0] === '@') {
        const m = /^@([a-zA-Z-]+)\s*([\s\S]*)$/.exec(text);
        atReguly.push({ name: m ? m[1].toLowerCase() : text, prelude: m ? m[2].trim() : '', line: bufLine });
      } else {
        const c = text.indexOf(':');
        if (c > 0) {
          deklaracje.push({ prop: text.slice(0, c).trim().toLowerCase().replace(/^--/, '--'), rawProp: text.slice(0, c).trim(),
            value: text.slice(c + 1).trim(), line: bufLine, blok: stack.map((s) => s.prelude) });
        }
      }
    }
    buf = '';
    bufStart = -1;
  };
  while (i < n) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      for (let k = i; k < stop; k++) if (src[k] === '\n') line++;
      i = stop;
      buf += ' ';
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && src[j] !== ch) { if (src[j] === '\\') j++; j++; }
      if (bufStart === -1) { bufStart = i; bufLine = line; }
      const chunk = src.slice(i, j + 1);
      for (const c of chunk) if (c === '\n') line++;
      buf += chunk;
      i = j + 1;
      continue;
    }
    if (ch === '{') {
      const prelude = buf.trim().replace(/\s+/g, ' ');
      if (prelude[0] === '@') {
        const m = /^@([a-zA-Z-]+)/.exec(prelude);
        atReguly.push({ name: m ? m[1].toLowerCase() : prelude, prelude, line: bufLine, blokowa: true });
      }
      stack.push({ prelude, line: bufLine });
      buf = '';
      bufStart = -1;
      i++;
      continue;
    }
    if (ch === ';') { flushDecl(); i++; continue; }
    if (ch === '}') { flushDecl(); stack.pop(); i++; continue; }
    if (ch === '\n') line++;
    if (bufStart === -1 && !/\s/.test(ch)) { bufStart = i; bufLine = line; }
    buf += ch;
    i++;
  }
  flushDecl();
  return { deklaracje, atReguly };
}

/** Dzieli wartość na składowe na najwyższym poziomie (nie wewnątrz nawiasów). */
function skladowe(value, sep = /\s/) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && sep.test(ch)) { if (cur.trim()) out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Postać porównywana: bez !important, małe litery poza var(), zwinięte spacje, 0px → 0. */
function normalizuj(v) {
  let s = String(v).replace(/!\s*important\s*$/i, '').trim().replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*,\s*/g, ', ').toLowerCase();
  if (/^-?0*\.?0+(px|rem|em|%|vw|vh)?$/.test(s)) s = '0';
  return s;
}

const SPACING = ['top', 'right', 'bottom', 'left'];
const box = (vals) => {
  const [a, b = a, c = a, d = b] = vals;
  return [a, b, c, d];
};

/** Rozbija skrót na właściwości składowe: [[prop, value], ...]. Właściwości logiczne → fizyczne (LTR). */
function rozbij(prop, value) {
  const v = value.replace(/!\s*important\s*$/i, '').trim();
  const parts = skladowe(v);
  if (prop === 'margin' || prop === 'padding') {
    if (parts.length < 1 || parts.length > 4) return [[prop, v]];
    return box(parts).map((x, k) => [`${prop}-${SPACING[k]}`, x]);
  }
  const logical = /^(margin|padding)-(inline|block)(?:-(start|end))?$/.exec(prop);
  if (logical) {
    const [, base, axis, edge] = logical;
    const sides = axis === 'inline' ? ['left', 'right'] : ['top', 'bottom'];
    if (edge) return [[`${base}-${edge === 'start' ? sides[0] : sides[1]}`, v]];
    const [s, e = s] = parts;
    return [[`${base}-${sides[0]}`, s], [`${base}-${sides[1]}`, e]];
  }
  if (prop === 'gap' || prop === 'grid-gap') {
    const [r, c = r] = parts;
    return [['row-gap', r], ['column-gap', c]];
  }
  if (prop === 'grid-row-gap') return [['row-gap', v]];
  if (prop === 'grid-column-gap') return [['column-gap', v]];
  if (prop === 'border-radius') {
    const [h, vv] = v.split('/').map((x) => skladowe(x.trim()));
    const H = box(h);
    const V = vv ? box(vv) : null;
    return ['top-left', 'top-right', 'bottom-right', 'bottom-left']
      .map((c, k) => [`border-${c}-radius`, V ? `${H[k]} ${V[k]}` : H[k]]);
  }
  return [[prop, v]];
}

const SPRAWDZANE = /^(font-size|font-weight|line-height|letter-spacing|font|margin(-(top|right|bottom|left))?|padding(-(top|right|bottom|left))?|(margin|padding)-(inline|block)(-(start|end))?|gap|grid-gap|row-gap|column-gap|grid-row-gap|grid-column-gap|border-radius|border-(top|bottom)-(left|right)-radius)$/;

/** Zbiór dozwolonych wartości: Map(prop składowa → Set(wartość)), z całego styles.css. */
function zbiorWartosci(stylesSrc) {
  const { deklaracje } = parseCss(stylesSrc);
  const m = new Map();
  for (const d of deklaracje) {
    if (!SPRAWDZANE.test(d.prop)) continue;
    for (const [p, v] of rozbij(d.prop, d.value)) {
      if (!m.has(p)) m.set(p, new Set());
      m.get(p).add(normalizuj(v));
    }
  }
  return m;
}

/** Tokeny zdefiniowane w :root (także wewnątrz @media). */
function tokeny(stylesSrc) {
  const { deklaracje } = parseCss(stylesSrc);
  const out = new Set();
  for (const d of deklaracje) {
    if (!d.prop.startsWith('--')) continue;
    const sel = d.blok[d.blok.length - 1] || '';
    if (sel.split(',').map((s) => s.trim()).includes(':root')) out.add(d.prop);
  }
  return out;
}

const NAMED_COLORS = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood '
  + 'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey '
  + 'darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey '
  + 'darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite '
  + 'gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon '
  + 'lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue '
  + 'lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid '
  + 'mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin '
  + 'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff '
  + 'peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver '
  + 'skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow '
  + 'yellowgreen canvas canvastext linktext visitedtext activetext buttonface buttontext buttonborder field fieldtext highlight highlighttext '
  + 'selecteditem selecteditemtext mark marktext graytext accentcolor accentcolortext').split(/\s+/));

const KOLOR_FUNKCJE = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|device-cmyk)\s*\(/i;

/** Szuka koloru wpisanego wprost. Zwraca opis albo null. */
const PRZYJMUJE_KOLOR = /^(color|background(-color|-image)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration(-color)?|text-emphasis(-color)?|column-rule(-color)?|filter|scrollbar-color|stop-color|flood-color|lighting-color)$/;

function kolorWprost(value, prop = 'color') {
  const bezVar = value.replace(/var\(\s*--[a-zA-Z0-9_-]+/g, 'var(').replace(/"[^"]*"|'[^']*'/g, '""');
  const hex = /#[0-9a-fA-F]{3,8}\b/.exec(bezVar);
  if (hex) return `kolor szesnastkowy ${hex[0]}`;
  const fn = KOLOR_FUNKCJE.exec(bezVar);
  if (fn) return `funkcja koloru ${fn[1]}()`;
  if (!PRZYJMUJE_KOLOR.test(prop)) return null;
  for (const id of bezVar.match(/[a-zA-Z][a-zA-Z-]*/g) || []) {
    if (NAMED_COLORS.has(id.toLowerCase())) return `nazwa koloru „${id}”`;
  }
  return null;
}

const FONT_FAMILY_OK = new Set(['var(--font-display)', 'var(--font-body)', 'var(--font-mono)']);

/** Sprawdza plik stylów podstron. Zwraca listę błędów { line, prop, value, powod }. */
function sprawdzPodstronyCss(src, stylesSrc) {
  const dozwolone = zbiorWartosci(stylesSrc);
  const znane = tokeny(stylesSrc);
  const bledy = [];
  const { deklaracje, atReguly } = parseCss(src);
  for (const a of atReguly) {
    if (a.name === 'font-face') bledy.push({ line: a.line, prop: '@font-face', value: '', powod: 'reguła @font-face jest niedozwolona' });
    if (a.name === 'import') bledy.push({ line: a.line, prop: '@import', value: a.prelude, powod: 'reguła @import jest niedozwolona' });
    if (a.name === 'property') bledy.push({ line: a.line, prop: '@property', value: a.prelude, powod: 'definicja własnej zmiennej (@property) jest niedozwolona' });
  }
  for (const d of deklaracje) {
    const base = { line: d.line, prop: d.rawProp, value: d.value };
    if (d.rawProp.startsWith('--')) { bledy.push({ ...base, powod: 'definicja własnej zmiennej jest niedozwolona' }); continue; }
    if (/url\s*\(/i.test(d.value)) bledy.push({ ...base, powod: 'odwołanie url(...) jest niedozwolone' });
    for (const v of new Set([...d.value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)].map((m) => m[1]))) {
      if (!znane.has(v)) bledy.push({ ...base, powod: `zmienna ${v} nie jest tokenem z :root w styles.css` });
    }
    const kolor = kolorWprost(d.value, d.prop);
    if (kolor) bledy.push({ ...base, powod: `${kolor} wpisany wprost; użyj var(--token), transparent, currentColor albo inherit` });
    if (d.prop === 'font-family' && !FONT_FAMILY_OK.has(normalizuj(d.value))) {
      bledy.push({ ...base, powod: 'font-family dozwolone tylko jako var(--font-display), var(--font-body) albo var(--font-mono)' });
    }
    if (SPRAWDZANE.test(d.prop)) {
      for (const [p, v] of rozbij(d.prop, d.value)) {
        const nv = normalizuj(v);
        if (nv === 'inherit') continue;
        if (!(dozwolone.get(p) || new Set()).has(nv)) {
          bledy.push({ ...base, powod: `wartość „${v}” nie występuje dla ${p} w styles.css` });
        }
      }
    }
  }
  return bledy.sort((a, b) => a.line - b.line);
}

module.exports = { parseCss, skladowe, normalizuj, rozbij, zbiorWartosci, tokeny, kolorWprost, sprawdzPodstronyCss };
