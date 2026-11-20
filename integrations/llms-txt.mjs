// Integracja Astro: po buildzie generuje dist/llms.txt i dist/llms-full.txt
// (format z https://llmstxt.org) z gotowych stron HTML.
//
// - Lista i kolejność stron pochodzi z dist/sitemap.xml, więc nowa podstrona albo wpis
//   na blogu trafia do llms.txt, gdy tylko pojawi się w sitemapie.
// - Tytuł, opis i treść są czytane z wygenerowanego HTML (<title>, meta description, <main>),
//   więc pliki nie rozjeżdżają się ze stroną.
// - Z treści pomijane są elementy niewidoczne dla czytelnika i elementy interfejsu:
//   aria-hidden="true", hidden, <script>, <style>, <svg>, <form>, <video>, <button> itd.
// - Strony z meta robots "noindex" są pomijane.
// Bez zależności zewnętrznych: HTML strony jest nasz i przewidywalny, wystarcza prosty tokenizer.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MARKA } from '../src/config/marka.mjs';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const POMIJANE = new Set(['script', 'style', 'svg', 'template', 'noscript', 'form', 'video', 'audio', 'canvas', 'button', 'select', 'textarea', 'iframe', 'nav']);
const BLOKOWE = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'aside', 'ul', 'ol', 'table', 'tr', 'blockquote', 'figure', 'figcaption', 'details', 'summary', 'dl', 'dt', 'dd']);
// Strony pomocnicze: w llms.txt trafiają do sekcji „Opcjonalne”
const OPCJONALNE = new Set(['polityka-prywatnosci.html']);

const ENCJE = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", shy: '', ndash: '–', mdash: '—', hellip: '…', bdquo: '„', rdquo: '”', ldquo: '“', rarr: '→', larr: '←', middot: '·', times: '×',
  copy: '©', reg: '®', trade: '™', sect: '§', para: '¶', euro: '€', deg: '°', plusmn: '±', le: '≤', ge: '≥', ne: '≠', asymp: '≈',
  minus: '−', divide: '÷', sup1: '¹', sup2: '²', sup3: '³', frac12: '½', frac14: '¼', frac34: '¾', laquo: '«', raquo: '»',
  lsquo: '‘', rsquo: '’', sbquo: '‚', bull: '•', uarr: '↑', darr: '↓', harr: '↔', check: '✓', thinsp: ' ', ensp: ' ', emsp: ' ' };

export function dekoduj(s) {
  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const kod = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(kod) ? String.fromCodePoint(kod) : m;
    }
    return Object.prototype.hasOwnProperty.call(ENCJE, e.toLowerCase()) ? ENCJE[e.toLowerCase()] : m;
  });
}

function atrybut(attrs, nazwa) {
  const m = attrs.match(new RegExp(`(?:^|\\s)${nazwa}(?:\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+)))?`, 'i'));
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? '';
}

function metaZawartosc(html, nazwa) {
  for (const m of html.matchAll(/<meta\b([^>]*)>/gi)) {
    if ((atrybut(m[1], 'name') || '').toLowerCase() === nazwa) return dekoduj(atrybut(m[1], 'content') || '');
  }
  return null;
}

// <main> → zwykły tekst z nagłówkami i listami w składni Markdown
export function tekstZHtml(html) {
  const start = html.search(/<main\b/i);
  // ostatnie zamknięcie </main>, bez względu na wielkość liter (symetrycznie do otwarcia)
  let koniec = -1;
  for (const m of html.matchAll(/<\/main\s*>/gi)) koniec = m.index;
  if (start < 0 || koniec < 0) return '';
  const zrodlo = html.slice(start, koniec).replace(/<!--[\s\S]*?-->/g, '');

  const wynik = [];
  const stos = []; // { tag, pomin }
  let pomijanie = 0;
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>|([^<]+)/g;
  for (const m of zrodlo.matchAll(re)) {
    if (m[5] !== undefined) {
      if (!pomijanie) wynik.push(m[5].replace(/\s+/g, ' '));
      continue;
    }
    const zamyka = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3] || '';
    if (!zamyka) {
      if (VOID.has(tag) || m[4] === '/') {
        if (!pomijanie && tag === 'br') wynik.push('\n');
        continue;
      }
      const pomin =
        POMIJANE.has(tag) ||
        atrybut(attrs, 'aria-hidden') === 'true' ||
        atrybut(attrs, 'hidden') !== null;
      stos.push({ tag, pomin });
      if (pomin) { pomijanie++; continue; }
      if (pomijanie) continue;
      const h = tag.match(/^h([1-6])$/);
      if (h) wynik.push(`\n\n${'#'.repeat(Math.min(6, Number(h[1]) + 1))} `);
      else if (tag === 'li') wynik.push('\n- ');
      else if (tag === 'td' || tag === 'th') wynik.push(' | ');
      else if (BLOKOWE.has(tag)) wynik.push('\n');
      else wynik.push(' '); // granica elementu liniowego: „<span>DOC</span><span>APT</span>” ≠ „DOCAPT”
    } else {
      // zamknij do najbliższego pasującego tagu (toleruje niedomknięte elementy)
      let i = stos.length - 1;
      while (i >= 0 && stos[i].tag !== tag) i--;
      if (i < 0) continue;
      const zdjete = stos.splice(i);
      for (const z of zdjete) if (z.pomin) pomijanie--;
      if (pomijanie) continue;
      if (/^h[1-6]$/.test(tag)) wynik.push('\n\n');
      else if (BLOKOWE.has(tag) || tag === 'li') wynik.push('\n');
      else wynik.push(' ');
    }
  }

  return dekoduj(wynik.join(''))
    .split('\n')
    .map((l) => l.replace(/[ \t ]+/g, ' ').trim())
    .map((l) => l.replace(/ ([.,;:!?)%])/g, '$1').replace(/([(„]) /g, '$1'))
    .filter((l) => !(l === '-' || l === '|'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(- .*)\n\n(?=- )/gm, '$1\n')
    .replace(/^(- .*)\n\n(?=- )/gm, '$1\n')
    .replace(/^(#+ .*)\n(?!\n)/gm, '$1\n\n')
    .trim();
}

// Adres z sitemapy → plik w dist/. Ścieżka katalogowa (np. przyszłe /blog/) → <katalog>/index.html.
function plikDlaAdresu(adres) {
  const p = decodeURIComponent(new URL(adres).pathname);
  if (p === '/' || p === '') return 'index.html';
  const rel = p.replace(/^\//, '');
  return rel.endsWith('/') ? `${rel}index.html` : rel;
}

export function zbierzStrony(distDir) {
  const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
  const adresy = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (adresy.length === 0) throw new Error('llms-txt: sitemap.xml nie zawiera żadnego <loc>');

  const strony = [];
  for (const adres of adresy) {
    const plik = plikDlaAdresu(adres);
    const pelna = path.join(distDir, plik);
    if (!fs.existsSync(pelna) || !fs.statSync(pelna).isFile()) {
      throw new Error(`llms-txt: adres z sitemapy ${adres} nie ma pliku ${plik} w dist/`);
    }
    const html = fs.readFileSync(pelna, 'utf8');
    const robots = (metaZawartosc(html, 'robots') || '').toLowerCase();
    if (robots.includes('noindex')) continue;
    const tytul = dekoduj((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1]).trim();
    const opis = (metaZawartosc(html, 'description') || '').trim();
    const tekst = tekstZHtml(html);
    if (!tytul || !tekst) throw new Error(`llms-txt: strona ${plik} nie ma tytułu albo treści <main>`);
    strony.push({ adres, plik, tytul, opis, tekst, opcjonalna: OPCJONALNE.has(plik) });
  }
  return strony;
}

function naglowek(m) {
  const a = m.adres;
  return [
    `# ${m.nazwa}`,
    '',
    `> ${m.opis}`,
    '',
    `- Strona: ${m.url}`,
    `- Kontakt: ${m.email}`,
    `- Firma: ${m.nazwa}, ${m.wlasciciel}, ${a.ulica}, ${a.kod} ${a.miasto} · NIP ${m.nip} · REGON ${m.regon}`,
    ...m.profile.map((p) => `- Profil: ${p}`),
  ];
}

export function zbudujLlmsTxt(strony, m = MARKA) {
  const wiersz = (s) => `- [${s.tytul}](${s.adres})${s.opis ? `: ${s.opis}` : ''}`;
  return [
    ...naglowek(m),
    '',
    '## Strony',
    '',
    ...strony.filter((s) => !s.opcjonalna).map(wiersz),
    '',
    '## Optional',
    '',
    ...strony.filter((s) => s.opcjonalna).map(wiersz),
    `- [Pełna treść wszystkich stron w jednym pliku](${new URL('llms-full.txt', m.url).href})`,
    '',
  ].join('\n');
}

export function zbudujLlmsFull(strony, m = MARKA) {
  const czesci = [...naglowek(m), ''];
  for (const s of strony) {
    czesci.push('---', '', `## ${s.tytul}`, '', `Adres: ${s.adres}`, '');
    if (s.opis) czesci.push(`> ${s.opis}`, '');
    // nagłówki z treści o jeden poziom niżej niż tytuł strony
    czesci.push(s.tekst.replace(/^(#+) /gm, '#$1 '), '');
  }
  return czesci.join('\n');
}

export default function llmsTxt() {
  return {
    name: 'revagy-llms-txt',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const strony = zbierzStrony(distDir);
        fs.writeFileSync(path.join(distDir, 'llms.txt'), zbudujLlmsTxt(strony), { encoding: 'utf8', mode: 0o644 });
        fs.writeFileSync(path.join(distDir, 'llms-full.txt'), zbudujLlmsFull(strony), { encoding: 'utf8', mode: 0o644 });
        logger.info(`llms.txt i llms-full.txt: ${strony.length} stron`);
      },
    },
  };
}
