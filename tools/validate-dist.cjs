#!/usr/bin/env node
/* Walidator katalogu wynikowego (dist/) dla strony REVAGY.
   Liczby plików i stron bierze z tools/dom-contract.json (nic nie jest wpisane na stałe). Sprawdza:
   - kompletność: każdy plik z kontraktu jest, żadnego nadmiarowego; brak symlinków, hardlinków,
     plików wykonywalnych, katalogu _astro/ i inline JS;
   - sumy SHA-256 i rozmiary plików publicznych (publicFiles) oraz stron HTML (htmlBaseline);
   - blokadę strony głównej: dist/index.html bajtowo równy migawce tools/baseline/index.html;
   - pełny kontrakt DOM/SEO każdej strony (pages) i formularz kontaktowy (contactForm);
   - listę skryptów stron (dla nowych podstron z tools/podstrony.json, jeśli plik istnieje);
   - mapę witryny: adresy z sitemap.xml = adresy kanoniczne stron bez noindex, w obie strony;
   - limity wagi mediów (mediaBudget);
   - dane strukturalne JSON-LD (jedyny dopuszczony blok <script> bez src, nie jest wykonywany)
     oraz pliki generowane przy buildzie: llms.txt i llms-full.txt.

   Użycie:
     node tools/validate-dist.cjs <katalog> [--manifest-out=<ścieżka>] [--bez-blokad-bajtowych]

   --bez-blokad-bajtowych  wyłącza wyłącznie migawkę strony głównej i htmlBaseline (sumy stron HTML).
     Tylko dla tools/test-formularz.cjs, który buduje stronę z testowym kluczem Turnstile, więc strony
     z formularzem różnią się bajtowo od wydania. Wszystkie pozostałe kontrole działają. Nie używać w CI.

   Eksport (dla tools/update-contract.cjs i narzędzi porównujących):
     parseHtml, extractHtmlContract, pageComparison, collectFiles, sha256File
*/
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { sprawdzPodstrone } = require('./lib/podstrona.cjs');

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function decodeEntities(str) {
  return str.replace(/&(#x?[0-9a-fA-F]+|nbsp|amp|lt|gt|quot|apos|#39);/g, (_, ent) => {
    switch (ent) {
      case 'nbsp': return '\u00a0';
      case 'amp': return '&';
      case 'lt': return '<';
      case 'gt': return '>';
      case 'quot': return '"';
      case 'apos':
      case '#39': return "'";
      default:
        if (ent.startsWith('#x') || ent.startsWith('#X')) {
          return String.fromCodePoint(parseInt(ent.slice(2), 16));
        }
        return String.fromCodePoint(parseInt(ent.slice(1), 10));
    }
  });
}

function normalizeText(str) {
  return decodeEntities(str).replace(/[ \t\r\n]+/g, ' ').trim();
}

function parseAttributes(raw) {
  const attrs = {};
  const attrList = [];
  let i = 0;
  const n = raw.length;
  while (i < n) {
    while (i < n && /\s/.test(raw[i])) i++;
    if (i >= n) break;
    if (raw[i] === '/' && i + 1 === n) break;
    const nameStart = i;
    while (i < n && !/[\s=/>]/.test(raw[i])) i++;
    const name = raw.slice(nameStart, i).toLowerCase();
    if (!name) { i++; continue; }
    while (i < n && /\s/.test(raw[i])) i++;
    let value = '';
    if (i < n && raw[i] === '=') {
      i++;
      while (i < n && /\s/.test(raw[i])) i++;
      if (i < n && (raw[i] === '"' || raw[i] === "'")) {
        const q = raw[i++];
        const valStart = i;
        while (i < n && raw[i] !== q) i++;
        value = decodeEntities(raw.slice(valStart, i));
        if (i < n && raw[i] === q) i++;
      } else {
        const valStart = i;
        while (i < n && !/[\s>]/.test(raw[i])) i++;
        value = decodeEntities(raw.slice(valStart, i));
      }
    }
    attrs[name] = value;
    attrList.push([name, value]);
  }
  return { attrs, attrList };
}

function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, attrList: [], children: [], text: '' };
  const stack = [root];
  let doctype = null;
  let i = 0;
  const n = html.length;

  const current = () => stack[stack.length - 1];

  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      const txt = html.slice(i);
      if (txt) current().children.push({ tag: '#text', text: txt });
      break;
    }
    if (lt > i) {
      current().children.push({ tag: '#text', text: html.slice(i, lt) });
    }
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (/^<!doctype\s+/i.test(html.slice(lt, lt + 20))) {
      const gt = html.indexOf('>', lt);
      const rawDoc = html.slice(lt + 9, gt === -1 ? n : gt).trim();
      doctype = rawDoc.toLowerCase();
      i = gt === -1 ? n : gt + 1;
      continue;
    }
    if (html.startsWith('</', lt)) {
      const gt = html.indexOf('>', lt);
      const closeTag = html.slice(lt + 2, gt === -1 ? n : gt).trim().toLowerCase();
      for (let k = stack.length - 1; k >= 1; k--) {
        if (stack[k].tag === closeTag) {
          stack.length = k;
          break;
        }
      }
      i = gt === -1 ? n : gt + 1;
      continue;
    }

    // Open tag
    let j = lt + 1;
    while (j < n && !/[\s/>]/.test(html[j])) j++;
    const tag = html.slice(lt + 1, j).toLowerCase();
    let k = j;
    let quote = null;
    while (k < n) {
      const ch = html[k];
      if (quote) {
        if (ch === quote) quote = null;
      } else {
        if (ch === '"' || ch === "'") quote = ch;
        else if (ch === '>') break;
      }
      k++;
    }
    const rawTagBody = html.slice(j, k);
    const selfClosing = rawTagBody.trimEnd().endsWith('/');
    const { attrs, attrList } = parseAttributes(selfClosing ? rawTagBody.replace(/\/\s*$/, '') : rawTagBody);
    const node = { tag, attrs, attrList, children: [] };
    current().children.push(node);
    i = k < n ? k + 1 : n;

    if (tag === 'script' || tag === 'style') {
      if (!selfClosing) {
        const closeRe = new RegExp(`</${tag}\\s*>`, 'i');
        const rest = html.slice(i);
        const m = closeRe.exec(rest);
        if (m) {
          node.children.push({ tag: '#text', text: rest.slice(0, m.index) });
          i += m.index + m[0].length;
        } else {
          node.children.push({ tag: '#text', text: rest });
          i = n;
        }
      }
    } else if (!VOID_TAGS.has(tag) && !selfClosing) {
      stack.push(node);
    }
  }

  return { doctype, root };
}

function getText(node) {
  if (!node) return '';
  if (node.tag === '#text') return node.text;
  return node.children.map(getText).join('');
}

function walkElements(node, fn) {
  if (!node || node.tag === '#text') return;
  if (node.tag !== '#root') fn(node);
  for (const child of node.children) {
    walkElements(child, fn);
  }
}

function findFirst(node, tag) {
  let found = null;
  walkElements(node, (el) => {
    if (!found && el.tag === tag) found = el;
  });
  return found;
}

function extractHtmlContract(html) {
  const { doctype, root } = parseHtml(html);
  const htmlEl = findFirst(root, 'html');
  const headEl = findFirst(root, 'head');
  const bodyEl = findFirst(root, 'body');

  const titleEl = headEl ? findFirst(headEl, 'title') : null;
  const meta = [];
  const links = [];
  let canonical = null;
  const scripts = [];
  const jsonLd = [];
  const styles = [];
  const astroAttrs = [];

  walkElements(root, (el) => {
    for (const [k] of el.attrList) {
      if (k.startsWith('data-astro-')) astroAttrs.push(`${el.tag}[${k}]`);
    }
    if (el.tag === 'style') styles.push(getText(el));
    if (el.tag === 'script' && el.attrs.type === 'application/ld+json' && !el.attrs.src) {
      jsonLd.push({ text: getText(el).trim(), attrs: el.attrList.map(([k]) => k) });
    } else if (el.tag === 'script') {
      const bodyText = getText(el).trim();
      scripts.push({
        src: el.attrs.src ?? null,
        defer: Object.prototype.hasOwnProperty.call(el.attrs, 'defer'),
        async: Object.prototype.hasOwnProperty.call(el.attrs, 'async'),
        type: el.attrs.type ?? null,
        hasInlineBody: bodyText.length > 0,
      });
    }
  });

  if (headEl) {
    walkElements(headEl, (el) => {
      if (el.tag === 'meta') {
        meta.push({
          charset: el.attrs.charset ? el.attrs.charset.toLowerCase() : null,
          name: el.attrs.name ?? null,
          property: el.attrs.property ?? null,
          content: el.attrs.content ?? null,
        });
      } else if (el.tag === 'link') {
        if (el.attrs.rel === 'canonical') canonical = el.attrs.href ?? null;
        links.push({
          rel: el.attrs.rel ?? null,
          href: el.attrs.href ?? null,
          type: el.attrs.type ?? null,
          sizes: el.attrs.sizes ?? null,
          as: el.attrs.as ?? null,
          crossorigin: Object.prototype.hasOwnProperty.call(el.attrs, 'crossorigin'),
        });
      }
    });
  }

  const bodyDirectTags = bodyEl
    ? bodyEl.children
        .filter((c) => c.tag !== '#text' && c.tag !== 'script')
        .map((c) => ({ tag: c.tag, id: c.attrs.id ?? null, class: c.attrs.class ?? null }))
    : [];

  const mainEl = bodyEl ? findFirst(bodyEl, 'main') : null;
  const mainAttrs = mainEl ? { id: mainEl.attrs.id ?? null, class: mainEl.attrs.class ?? null } : null;
  const mainSections = mainEl
    ? mainEl.children
        .filter((c) => c.tag === 'section')
        .map((s) => ({
          tag: s.tag,
          id: s.attrs.id ?? null,
          class: s.attrs.class ?? null,
          ariaLabel: s.attrs['aria-label'] ?? null,
        }))
    : [];

  const keyedElements = [];
  const headings = [];
  const anchors = [];
  const videos = [];
  const localRefs = [];

  walkElements(headEl || root, (el) => {
    if (el.tag === 'link' && el.attrs.href && el.attrs.rel !== 'canonical') {
      localRefs.push({ tag: 'link', attr: 'href', val: el.attrs.href });
    }
  });

  if (bodyEl) {
    walkElements(bodyEl, (el) => {
      const data = {};
      const aria = {};
      for (const [k, v] of el.attrList) {
        if (k.startsWith('data-')) data[k] = v;
        if (k.startsWith('aria-')) aria[k] = v;
      }
      if (
        el.attrs.id !== undefined ||
        el.attrs.name !== undefined ||
        el.attrs.for !== undefined ||
        Object.keys(data).length > 0 ||
        Object.keys(aria).length > 0
      ) {
        keyedElements.push({
          tag: el.tag,
          id: el.attrs.id ?? null,
          name: el.attrs.name ?? null,
          for: el.attrs.for ?? null,
          data,
          aria,
        });
      }

      if (['h1', 'h2', 'h3', 'h4'].includes(el.tag)) {
        headings.push({
          tag: el.tag,
          id: el.attrs.id ?? null,
          text: normalizeText(getText(el)),
        });
      }

      if (el.tag === 'a') {
        anchors.push({
          href: el.attrs.href ?? null,
          class: el.attrs.class ?? null,
          dataTrack: el.attrs['data-track'] ?? null,
          ariaLabel: el.attrs['aria-label'] ?? null,
          text: normalizeText(getText(el)),
        });
        if (el.attrs.href) localRefs.push({ tag: 'a', attr: 'href', val: el.attrs.href });
      }

      if (el.tag === 'video') {
        const sources = el.children
          .filter((c) => c.tag === 'source')
          .map((s) => ({ src: s.attrs.src ?? null, type: s.attrs.type ?? null }));
        videos.push({
          class: el.attrs.class ?? null,
          poster: el.attrs.poster ?? null,
          preload: el.attrs.preload ?? null,
          dataAutoplay: Object.prototype.hasOwnProperty.call(el.attrs, 'data-autoplay'),
          dataMainVideo: Object.prototype.hasOwnProperty.call(el.attrs, 'data-main-video'),
          ariaLabel: el.attrs['aria-label'] ?? null,
          sources,
        });
        if (el.attrs.poster) localRefs.push({ tag: 'video', attr: 'poster', val: el.attrs.poster });
        for (const s of sources) {
          if (s.src) localRefs.push({ tag: 'source', attr: 'src', val: s.src });
        }
      }

      if (el.tag === 'script' && el.attrs.src) {
        localRefs.push({ tag: 'script', attr: 'src', val: el.attrs.src });
      }
      if (el.tag === 'img' && el.attrs.src) {
        localRefs.push({ tag: 'img', attr: 'src', val: el.attrs.src });
      }
    });
  }

  let calculator = null;
  if (bodyEl) {
    const calcIds = new Set([
      'calc-people', 'calc-hours', 'calc-rate',
      'share-40', 'share-60', 'share-80',
      'out-people', 'out-hours', 'out-rate',
      'res-hours', 'res-year', 'res-fte',
      'lab-now', 'lab-after', 'bar-now', 'bar-after',
    ]);
    const calcEntries = [];
    walkElements(bodyEl, (el) => {
      if (el.attrs.id && calcIds.has(el.attrs.id)) {
        calcEntries.push({
          id: el.attrs.id,
          tag: el.tag,
          type: el.attrs.type ?? null,
          name: el.attrs.name ?? null,
          min: el.attrs.min ?? null,
          max: el.attrs.max ?? null,
          step: el.attrs.step ?? null,
          value: el.attrs.value ?? null,
          checked: Object.prototype.hasOwnProperty.call(el.attrs, 'checked'),
          style: el.attrs.style ?? null,
          text: normalizeText(getText(el)),
        });
      }
    });
    if (calcEntries.length > 0) calculator = calcEntries;
  }

  return {
    doctype,
    htmlLang: htmlEl?.attrs.lang ?? null,
    title: titleEl ? normalizeText(getText(titleEl)) : null,
    canonical,
    meta,
    links,
    scripts,
    stylesCount: styles.length,
    astroAttrs,
    bodyDirectTags,
    mainAttrs,
    mainSections,
    keyedElements,
    headings,
    anchors,
    videos,
    calculator,
    localRefs,
    jsonLd,
  };
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function walkDirStrict(baseDir) {
  const errors = [];
  const files = [];

  function visit(dir) {
    const entries = fs.readdirSync(dir);
    entries.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const name of entries) {
      const full = path.join(dir, name);
      const rel = path.relative(baseDir, full).split(path.sep).join('/');
      const st = fs.lstatSync(full);
      if (st.isSymbolicLink()) {
        errors.push(`Symlink zabroniony w artefakcie: ${rel}`);
        continue;
      }
      if (name === '.git' || name === 'site' || name === '_astro') {
        errors.push(`Zabroniony katalog w artefakcie: ${rel}`);
      }
      if (st.isDirectory()) {
        visit(full);
      } else if (st.isFile()) {
        if (st.nlink > 1) errors.push(`Hardlink zabroniony (nlink=${st.nlink}): ${rel}`);
        if ((st.mode & 0o111) !== 0) errors.push(`Plik wykonywalny zabroniony: ${rel}`);
        files.push({ rel, full, size: st.size });
      } else {
        errors.push(`Niedozwolony typ pliku specjalnego: ${rel}`);
      }
    }
  }

  visit(baseDir);
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  return { files, errors };
}

function deepEqualJson(a, b, where = 'root', diffs = []) {
  if (a === b) return diffs;
  if (typeof a !== typeof b || a === null || b === null) {
    diffs.push(`${where}: oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)}`);
    return diffs;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      diffs.push(`${where}: niezgodność tablicy i obiektu`);
      return diffs;
    }
    if (a.length !== b.length) {
      diffs.push(`${where}.length: oczekiwano ${b.length}, jest ${a.length}`);
    }
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      deepEqualJson(a[i], b[i], `${where}[${i}]`, diffs);
      if (diffs.length >= 25) break;
    }
    return diffs;
  }
  if (typeof a === 'object') {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    for (const k of keys) {
      if (!(k in a)) diffs.push(`${where}.${k}: brak pola`);
      else if (!(k in b)) diffs.push(`${where}.${k}: nadmiarowe pole`);
      else deepEqualJson(a[k], b[k], `${where}.${k}`, diffs);
      if (diffs.length >= 25) break;
    }
    return diffs;
  }
  diffs.push(`${where}: oczekiwano ${JSON.stringify(b)}, jest ${JSON.stringify(a)}`);
  return diffs;
}

function resolveLocalRef(targetDir, pageRel, refVal) {
  if (/^(https?:|mailto:|data:|tel:|#)/i.test(refVal)) return { external: true };
  const clean = refVal.split('#')[0].split('?')[0];
  if (!clean) return { external: true };
  let relPath;
  if (clean.startsWith('/')) {
    relPath = clean === '/' ? 'index.html' : clean.slice(1);
  } else if (clean === './') {
    relPath = 'index.html';
  } else {
    const baseDir = path.posix.dirname(pageRel);
    relPath = baseDir === '.' ? clean : path.posix.normalize(path.posix.join(baseDir, clean));
  }
  const diskPath = path.join(targetDir, ...relPath.split('/'));
  return { external: false, relPath, exists: fs.existsSync(diskPath) && fs.statSync(diskPath).isFile() };
}

// JSON-LD: parsowanie, @context, Organization zgodna ze spec z kontraktu (NIP, profile itd.)
function checkJsonLd(pageRel, block, spec, actualMap) {
  const errs = [];
  const raw = block.text;
  // Blok danych ma mieć wyłącznie atrybut type — defer/async/src/id itp. oznaczają pomyłkę
  const extraAttrs = block.attrs.filter((a) => a !== 'type');
  if (extraAttrs.length) errs.push(`${pageRel}: blok JSON-LD ma niedozwolone atrybuty: ${extraAttrs.join(', ')}`);
  if (/<\/|<!--/.test(raw)) errs.push(`${pageRel}: JSON-LD zawiera niezakodowane „</” lub „<!--”`);
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return [`${pageRel}: JSON-LD nie jest poprawnym JSON (${e.message})`];
  }
  if (data['@context'] !== 'https://schema.org') errs.push(`${pageRel}: JSON-LD bez @context https://schema.org`);
  const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];
  const types = graph.map((n) => n['@type']);
  for (const t of spec.types || []) {
    if (!types.includes(t)) errs.push(`${pageRel}: JSON-LD bez węzła @type=${t}`);
  }
  const org = graph.find((n) => n['@type'] === 'Organization');
  if (org && spec.organization) {
    for (const [k, v] of Object.entries(spec.organization)) {
      const got = org[k];
      const ok = Array.isArray(v) ? JSON.stringify(got) === JSON.stringify(v) : got === v;
      if (!ok) errs.push(`${pageRel}: JSON-LD Organization.${k}: oczekiwano ${JSON.stringify(v)}, jest ${JSON.stringify(got)}`);
    }
  }
  if (org && spec.regon) {
    const regon = (org.identifier || []).find((i) => i && i.propertyID === 'REGON');
    if (!regon || regon.value !== spec.regon) errs.push(`${pageRel}: JSON-LD Organization bez REGON ${spec.regon}`);
  }
  // Lokalne zasoby wskazane w JSON-LD muszą istnieć w dist/ (localRefs widzi tylko atrybuty HTML)
  if (org) {
    const local = [
      ['logo.url', org.logo && typeof org.logo === 'object' ? org.logo.url : org.logo],
      ['image', org.image],
    ];
    for (const [field, url] of local) {
      if (!url) { errs.push(`${pageRel}: JSON-LD Organization.${field} jest puste`); continue; }
      let u;
      try { u = new URL(url); } catch { errs.push(`${pageRel}: JSON-LD Organization.${field} nie jest adresem URL`); continue; }
      if (u.origin !== 'https://revagy.pl') continue;
      const rel = decodeURIComponent(u.pathname.replace(/^\//, ''));
      if (!actualMap.has(rel)) errs.push(`${pageRel}: JSON-LD Organization.${field} wskazuje na nieistniejący plik ${rel}`);
    }
  }
  if (spec.types && spec.types.includes('WebSite')) {
    const site = graph.find((n) => n['@type'] === 'WebSite');
    if (site) {
      if (org && site.url !== org.url) errs.push(`${pageRel}: JSON-LD WebSite.url (${site.url}) różni się od Organization.url (${org.url})`);
      if (!org || !org['@id'] || !site.publisher || site.publisher['@id'] !== org['@id']) {
        errs.push(`${pageRel}: JSON-LD WebSite.publisher.@id nie wskazuje na Organization.@id`);
      }
    }
  }
  return errs;
}

// llms.txt / llms-full.txt: treść zależy od stron, więc zamiast sumy SHA sprawdzamy strukturę
// i to, że każda strona z sitemapy jest opisana (oraz nic poza nimi).
function checkGeneratedFiles(targetDir, spec, actualMap) {
  const errs = [];
  if (!Object.keys(spec).length) return errs;
  const sitemapPath = path.join(targetDir, 'sitemap.xml');
  const sitemapUrls = fs.existsSync(sitemapPath)
    ? [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
    : [];
  for (const [rel, rules] of Object.entries(spec)) {
    const entry = actualMap.get(rel);
    if (!entry) continue;
    const buf = fs.readFileSync(entry.full);
    const txt = buf.toString('utf8');
    if (!Buffer.from(txt, 'utf8').equals(buf)) { errs.push(`${rel}: plik nie jest poprawnym UTF-8`); continue; }
    if (rules.startsWith && !txt.startsWith(rules.startsWith)) errs.push(`${rel}: nie zaczyna się od ${JSON.stringify(rules.startsWith)}`);
    if (rules.minBytes && buf.length < rules.minBytes) errs.push(`${rel}: za mały (${buf.length} B < ${rules.minBytes} B)`);
    if (rules.maxBytes && buf.length > rules.maxBytes) errs.push(`${rel}: za duży (${buf.length} B > ${rules.maxBytes} B)`);
    for (const must of rules.mustContain || []) {
      if (!txt.includes(must)) errs.push(`${rel}: brak wymaganego fragmentu ${JSON.stringify(must)}`);
    }
    if (/<(script|style|svg|form)\b/i.test(txt)) errs.push(`${rel}: zawiera znaczniki HTML (script/style/svg/form)`);
    if (rules.linksMatchSitemap) {
      const links = [...txt.matchAll(/\]\((https:\/\/revagy\.pl\/[^)\s]*)\)/g)].map((m) => m[1]);
      const pageLinks = links.filter((u) => !u.endsWith('.txt'));
      const missing = sitemapUrls.filter((u) => !pageLinks.includes(u));
      const extra = pageLinks.filter((u) => !sitemapUrls.includes(u));
      if (missing.length) errs.push(`${rel}: brak stron z sitemapy: ${missing.join(', ')}`);
      if (extra.length) errs.push(`${rel}: odnośniki spoza sitemapy: ${extra.join(', ')}`);
      for (const u of links.filter((x) => x.endsWith('.txt'))) {
        const f = new URL(u).pathname.slice(1);
        if (!actualMap.has(f)) errs.push(`${rel}: odnośnik ${u} wskazuje na nieistniejący plik`);
      }
    }
    if (rules.sectionsMatchSitemap) {
      const addrs = [...txt.matchAll(/^Adres: (\S+)$/gm)].map((m) => m[1]);
      const missing = sitemapUrls.filter((u) => !addrs.includes(u));
      const extra = addrs.filter((u) => !sitemapUrls.includes(u));
      if (missing.length) errs.push(`${rel}: brak sekcji dla stron: ${missing.join(', ')}`);
      if (extra.length) errs.push(`${rel}: sekcje stron spoza sitemapy: ${extra.join(', ')}`);
      if (addrs.length !== new Set(addrs).size) errs.push(`${rel}: zdublowane sekcje stron`);
    }
  }
  return errs;
}

const ROOT = path.join(__dirname, '..');
const SNAPSHOT_PATH = path.join(__dirname, 'baseline', 'index.html');
const PODSTRONY_PATH = path.join(__dirname, 'podstrony.json');

// Formularz kontaktowy: jedna wspólna suma HTML (klucz witryny zastąpiony stałą), a kontrakt DOM
// strony liczony jest z HTML bez formularza i bez jego skryptu. Tej samej funkcji używa update-contract.cjs.
function pageComparison(pageRel, html) {
  const result = { comparisonHtml: html, formCount: 0, formHash: null, sitekeyOk: true, hasForm: false };
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)];
  if ((pageRel === 'index.html' || pageRel === 'kontakt.html') && forms.length) {
    const formHtml = forms[0][0];
    const sitekey = formHtml.match(/data-sitekey="([^"]+)"/);
    const normalizedForm = formHtml.replace(/data-sitekey="[^"]*"/, 'data-sitekey="PUBLIC_SITEKEY"');
    result.hasForm = true;
    result.formCount = forms.length;
    result.sitekeyOk = Boolean(sitekey && sitekey[1].trim());
    result.formHash = crypto.createHash('sha256').update(normalizedForm).digest('hex');
    result.comparisonHtml = html.replace(formHtml, '').replace(/<script\b[^>]*src="\/?assets\/js\/kontakt\.js\?v=1"[^>]*>[\s\S]*?<\/script>/, '');
  }
  return result;
}

// Pliki katalogu wynikowego z sumami (ta sama lista co w manifeście wydania)
function collectFiles(targetDir) {
  const { files, errors } = walkDirStrict(targetDir);
  const actualMap = new Map();
  const manifestLines = [];
  for (const f of files) {
    const hash = sha256File(f.full);
    actualMap.set(f.rel, { sha256: hash, size: f.size, full: f.full });
    manifestLines.push(`${hash}  ${f.rel}\n`);
  }
  return { files, errors, actualMap, manifestLines };
}

// Blokada strony głównej: bajtowa zgodność z migawką, przy różnicy numer i treść pierwszej innej linii
function checkSnapshot(actualMap) {
  const entry = actualMap.get('index.html');
  if (!entry) return [];
  const rel = path.relative(ROOT, SNAPSHOT_PATH).split(path.sep).join('/');
  if (!fs.existsSync(SNAPSHOT_PATH)) return [`Brak migawki strony głównej ${rel}`];
  const want = fs.readFileSync(SNAPSHOT_PATH);
  const got = fs.readFileSync(entry.full);
  if (want.equals(got)) return [];
  const a = want.toString('utf8').split('\n');
  const b = got.toString('utf8').split('\n');
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const cut = (s) => (s === undefined ? '(brak linii)' : JSON.stringify(s.length > 240 ? `${s.slice(0, 240)}…` : s));
  return [
    `index.html różni się od migawki ${rel} (${got.length} B, migawka ${want.length} B). Pierwsza różnica w linii ${i + 1}:`
      + `\n      migawka: ${cut(a[i])}\n      dist:    ${cut(b[i])}`
      + `\n    Jeśli zmiana jest zamierzona: node tools/update-contract.cjs <dist> --snapshot`,
  ];
}

// htmlBaseline: suma i rozmiar każdej strony wpisanej w to pole
function checkHtmlBaseline(contract, actualMap) {
  const errs = [];
  for (const [rel, meta] of Object.entries(contract.htmlBaseline || {})) {
    const got = actualMap.get(rel);
    if (!got) { errs.push(`htmlBaseline: brak strony ${rel}`); continue; }
    if (got.sha256 !== meta.sha256 || got.size !== meta.size) {
      errs.push(`htmlBaseline: rozbieżność strony ${rel}: oczekiwano ${meta.sha256} (${meta.size} B), jest ${got.sha256} (${got.size} B)`);
    }
  }
  return errs;
}

// Mapa witryny = adresy kanoniczne stron bez noindex, w obie strony
function checkSitemap(targetDir, actualMap) {
  const errs = [];
  const sitemapPath = path.join(targetDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return ['sitemap.xml: brak pliku'];
  const locs = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  const inSitemap = new Set(locs);
  if (inSitemap.size !== locs.length) errs.push('sitemap.xml: zdublowane adresy');
  const canonicals = new Map();
  for (const [rel, entry] of actualMap) {
    if (!rel.endsWith('.html')) continue;
    const parsed = extractHtmlContract(fs.readFileSync(entry.full, 'utf8'));
    const robots = parsed.meta.find((m) => (m.name || '').toLowerCase() === 'robots');
    if (robots && /noindex/i.test(robots.content || '')) continue;
    if (!parsed.canonical) { errs.push(`${rel}: strona bez noindex nie ma adresu kanonicznego`); continue; }
    if (canonicals.has(parsed.canonical)) errs.push(`${rel}: ten sam adres kanoniczny co ${canonicals.get(parsed.canonical)} (${parsed.canonical})`);
    canonicals.set(parsed.canonical, rel);
  }
  for (const [url, rel] of canonicals) {
    if (!inSitemap.has(url)) errs.push(`sitemap.xml: brak adresu kanonicznego strony ${rel} (${url})`);
  }
  for (const url of inSitemap) {
    if (!canonicals.has(url)) errs.push(`sitemap.xml: adres ${url} nie jest adresem kanonicznym żadnej strony bez noindex`);
  }
  return errs;
}

// mediaBudget: { "assets/video/*.mp4": 1100000, ... } — gwiazdka obejmuje znaki bez „/”
function checkMediaBudget(contract, actualMap) {
  const errs = [];
  for (const [pattern, maxBytes] of Object.entries(contract.mediaBudget || {})) {
    const re = new RegExp(`^${pattern.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
    for (const [rel, entry] of actualMap) {
      if (re.test(rel) && entry.size > maxBytes) {
        errs.push(`mediaBudget: ${rel} ma ${entry.size} B, limit dla ${pattern} to ${maxBytes} B`);
      }
    }
  }
  return errs;
}

// tools/podstrony.json (opcjonalny): { "strony": [ { "plik": "…html", "film": "…" | null, "skrypty": ["…"] } ] }
// Bez "skrypty" strona dostaje listę domyślną (analytics.js).
function readPodstronyScripts() {
  if (!fs.existsSync(PODSTRONY_PATH)) return { map: {}, pliki: [], errors: [] };
  try {
    const data = JSON.parse(fs.readFileSync(PODSTRONY_PATH, 'utf8'));
    const map = {};
    const pliki = [];
    for (const s of data.strony || []) {
      if (!s || typeof s.plik !== 'string' || (s.skrypty !== undefined && !Array.isArray(s.skrypty))) {
        return { map: {}, pliki: [], errors: ['tools/podstrony.json: każda strona musi mieć pole "plik", a "skrypty" (jeśli jest) musi być tablicą'] };
      }
      pliki.push(s.plik);
      if (s.skrypty) map[s.plik] = s.skrypty;
    }
    return { map, pliki, errors: [] };
  } catch (e) {
    return { map: {}, pliki: [], errors: [`tools/podstrony.json: niepoprawny JSON (${e.message})`] };
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('--'));
  const manifestArg = args.find((a) => a.startsWith('--manifest-out='));
  const bezBlokadBajtowych = args.includes('--bez-blokad-bajtowych');
  const unknownArgs = args.filter((a) => a.startsWith('--') && !a.startsWith('--manifest-out=') && a !== '--bez-blokad-bajtowych');
  if (unknownArgs.length) {
    console.error(`Nieznane opcje: ${unknownArgs.join(' ')}`);
    process.exit(1);
  }
  if (!targetArg) {
    console.error('Użycie: node tools/validate-dist.cjs <katalog> [--manifest-out=<plik>]');
    process.exit(1);
  }
  const targetDir = path.resolve(targetArg);
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`Katalog nie istnieje: ${targetDir}`);
    process.exit(1);
  }

  const contractPath = path.join(__dirname, 'dom-contract.json');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  const { files, errors, actualMap, manifestLines } = collectFiles(targetDir);

  const generatedFiles = contract.generatedFiles || {};
  const expectedAll = new Set([
    ...Object.keys(contract.publicFiles),
    ...Object.keys(contract.pages),
    ...Object.keys(generatedFiles),
  ]);
  for (const exp of expectedAll) {
    if (!actualMap.has(exp)) errors.push(`Brak wymaganego pliku: ${exp}`);
  }
  for (const act of actualMap.keys()) {
    if (!expectedAll.has(act)) errors.push(`Nadmiarowy plik w katalogu: ${act}`);
  }

  // Sprawdź publiczne assety bajt po bajcie
  for (const [rel, meta] of Object.entries(contract.publicFiles)) {
    const got = actualMap.get(rel);
    if (!got) continue;
    if (got.sha256 !== meta.sha256 || got.size !== meta.size) {
      errors.push(`Rozbieżność pliku publicznego ${rel}: oczekiwano ${meta.sha256} (${meta.size} B), jest ${got.sha256} (${got.size} B)`);
    }
  }

  // Strony HTML: sumy z htmlBaseline i bajtowa migawka strony głównej
  if (bezBlokadBajtowych) {
    console.log('UWAGA: --bez-blokad-bajtowych — migawka strony głównej i htmlBaseline NIE są sprawdzane.');
  } else {
    errors.push(...checkHtmlBaseline(contract, actualMap));
    errors.push(...checkSnapshot(actualMap));
  }

  // Mapa witryny i limity wagi mediów
  errors.push(...checkSitemap(targetDir, actualMap));
  errors.push(...checkMediaBudget(contract, actualMap));

  // Sprawdź niezmienniki analytics.js
  const analyticsEntry = actualMap.get('assets/js/analytics.js');
  if (analyticsEntry) {
    const ajs = fs.readFileSync(analyticsEntry.full, 'utf8');
    const invariants = [
      "matomoUrl: 'https://stats.revagy.pl/'",
      "siteId: '1'",
      "hosts: ['revagy.pl', 'www.revagy.pl']",
      "cookieDomain: '*.revagy.pl'",
      "storageKey: 'revagy-zgoda-analityka'",
    ];
    for (const inv of invariants) {
      if (!ajs.includes(inv)) errors.push(`Naruszenie niezmiennika w analytics.js: brak ${inv}`);
    }
  }

  // Sprawdź każdą stronę HTML i pełny kontrakt DOM
  // Układ strony z 9f8c86f: app.js tylko na stronie głównej, analytics.js wszędzie (podstrony ścieżką względną).
  // Nowe podstrony: lista skryptów z tools/podstrony.json (ma pierwszeństwo przed tablicą poniżej).
  const defaultPageScripts = ['assets/js/analytics.js?v=4'];
  const podstrony = readPodstronyScripts();
  errors.push(...podstrony.errors);
  const expectedScripts = {
    '404.html': ['/assets/js/analytics.js?v=4'],
    'index.html': ['assets/js/app.js?v=4', 'assets/js/analytics.js?v=4'],
    'kontakt.html': defaultPageScripts,
    'polityka-prywatnosci.html': defaultPageScripts,
    ...podstrony.map,
  };

  for (const [pageRel, expectedDom] of Object.entries(contract.pages)) {
    const entry = actualMap.get(pageRel);
    if (!entry) continue;
    const html = fs.readFileSync(entry.full, 'utf8');
    if (html.includes('/_astro/')) errors.push(`${pageRel}: zawiera zabronioną referencję /_astro/`);

    const parsed = extractHtmlContract(html);
    let pageScripts = expectedScripts[pageRel] || defaultPageScripts;
    const cmp = pageComparison(pageRel, html);
    const { comparisonHtml } = cmp;
    if (cmp.hasForm) {
      if (cmp.formCount !== 1) errors.push(`${pageRel}: oczekiwano jednego formularza`);
      if (!cmp.sitekeyOk) errors.push(`${pageRel}: formularz bez klucza witryny`);
      if (cmp.formHash !== contract.contactForm.htmlSha256) errors.push(`${pageRel}: formularz niezgodny z kontraktem HTML`);
      pageScripts = [contract.contactForm.script, ...pageScripts];
    }
    if (parsed.stylesCount > 0) errors.push(`${pageRel}: zawiera wygenerowany blok <style>`);
    if (parsed.astroAttrs.length > 0) errors.push(`${pageRel}: zawiera atrybuty Astro (${parsed.astroAttrs.slice(0, 5).join(', ')})`);

    // Weryfikacja skryptów
    const gotScriptSrcs = parsed.scripts.map((s) => s.src);
    if (JSON.stringify(gotScriptSrcs) !== JSON.stringify(pageScripts)) {
      errors.push(`${pageRel}: nieprawidłowe skrypty: oczekiwano ${JSON.stringify(pageScripts)}, jest ${JSON.stringify(gotScriptSrcs)}`);
    }
    for (const s of parsed.scripts) {
      if (!s.src) errors.push(`${pageRel}: wykryto inline <script> bez src`);
      if (s.hasInlineBody) errors.push(`${pageRel}: <script src="${s.src}"> zawiera treść inline`);
      if (!s.defer) errors.push(`${pageRel}: <script src="${s.src}"> nie ma atrybutu defer`);
      if (s.async) errors.push(`${pageRel}: <script src="${s.src}"> ma zabroniony atrybut async`);
      if (s.type) errors.push(`${pageRel}: <script src="${s.src}"> ma zabroniony atrybut type="${s.type}"`);
    }

    // Weryfikacja lokalnych odnośników
    for (const ref of parsed.localRefs) {
      const res = resolveLocalRef(targetDir, pageRel, ref.val);
      if (!res.external && !res.exists) {
        errors.push(`${pageRel}: <${ref.tag} ${ref.attr}="${ref.val}"> wskazuje na nieistniejący plik (${res.relPath})`);
      }
      if (pageRel === '404.html' && !res.external && !ref.val.startsWith('/')) {
        errors.push(`404.html: <${ref.tag} ${ref.attr}="${ref.val}"> musi zaczynać się od /`);
      }
    }

    // Dane strukturalne JSON-LD: tylko na stronach z kontraktu, poprawny JSON, zgodne z marką
    const ldSpec = (contract.structuredData || {})[pageRel];
    // Podstrony z tools/podstrony.json mają własne reguły danych strukturalnych (niżej, tools/lib/podstrona.cjs).
    if (!ldSpec && parsed.jsonLd.length && !podstrony.pliki.includes(pageRel)) errors.push(`${pageRel}: nieoczekiwany blok JSON-LD`);
    if (ldSpec) {
      if (parsed.jsonLd.length !== 1) errors.push(`${pageRel}: oczekiwano 1 bloku JSON-LD, jest ${parsed.jsonLd.length}`);
      else errors.push(...checkJsonLd(pageRel, parsed.jsonLd[0], ldSpec, actualMap));
    }

    // Porównanie pełnego kontraktu DOM (bez localRefs i JSON-LD, które porównujemy osobno)
    const { localRefs: _a, jsonLd: _c, ...actualDom } = extractHtmlContract(comparisonHtml);
    const { localRefs: _b, jsonLd: _d, ...baselineDom } = expectedDom;
    const domDiffs = deepEqualJson(actualDom, baselineDom, pageRel);
    for (const d of domDiffs) errors.push(`DOM ${d}`);
  }

  // Nowe podstrony: jeden blok danych strukturalnych, jeden adres strony, FAQPage = widoczne pytania,
  // VideoObject tylko przy <video>, style tylko --d:<liczba>ms. Działa także przed wpisaniem strony do kontraktu.
  for (const plik of podstrony.pliki) {
    const entry = actualMap.get(plik);
    if (!entry) { errors.push(`${plik}: brak strony wymienionej w tools/podstrony.json`); continue; }
    errors.push(...sprawdzPodstrone(plik, fs.readFileSync(entry.full, 'utf8')).map((b) => `${plik}: ${b}`));
  }

  errors.push(...checkGeneratedFiles(targetDir, generatedFiles, actualMap));

  if (manifestArg) {
    const outPath = path.resolve(manifestArg.slice('--manifest-out='.length));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, manifestLines.join(''), 'utf8');
    console.log(`Zapisano manifest (${manifestLines.length} plików): ${outPath}`);
  }

  if (errors.length > 0) {
    console.error(`WALIDACJA BŁĄD (${errors.length} problemów):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const publicCount = Object.keys(contract.publicFiles).length;
  const pageCount = Object.keys(contract.pages).length;
  const genCount = Object.keys(generatedFiles).length;
  const manifestSha = crypto.createHash('sha256').update(manifestLines.join('')).digest('hex');
  const baselineCount = Object.keys(contract.htmlBaseline || {}).length;
  const bajtowo = bezBlokadBajtowych
    ? 'htmlBaseline i migawka POMINIĘTE (--bez-blokad-bajtowych)'
    : `${baselineCount}/${baselineCount} stron zgodnych z htmlBaseline, index.html zgodny z migawką`;
  console.log(`WALIDACJA OK: ${files.length} plików (${publicCount}/${publicCount} assetów zgodnych bajtowo, ${pageCount}/${pageCount} stron zgodnych z kontraktem DOM, ${bajtowo}, ${genCount} plików generowanych). Manifest SHA-256: ${manifestSha}`);
}

if (require.main === module) {
  main();
} else {
  module.exports = { parseHtml, extractHtmlContract, pageComparison, collectFiles, sha256File };
}
