'use strict';
/* Reguły walidatora dla nowych podstron z tools/podstrony.json (etap 1, plan 2.3 p. 2 i 3.7):
   - dokładnie jeden blok danych strukturalnych <script type="application/ld+json"> z samym atrybutem type,
     poprawny JSON z @context https://schema.org i węzłami WebPage oraz BreadcrumbList,
   - WebPage.url, <link rel="canonical"> i og:url równe https://revagy.pl/<plik>,
   - pytania i odpowiedzi FAQPage równe widocznym (.qa: przycisk i akapity .qa-body bez akapitu z samym
     odnośnikiem a.link-btn, który komponent Pytania dodaje pod odpowiedzią) po normalizacji białych znaków,
   - VideoObject wtedy i tylko wtedy, gdy strona ma <video>,
   - atrybut style wyłącznie w postaci --d:<liczba>ms (opóźnienie animacji, jak na stronie głównej). */

const { parse, find, findAll, hasClass, textOf } = require('./html.cjs');

const ADRES_BAZOWY = 'https://revagy.pl/';
const STYL_DOZWOLONY = /^\s*--d:\s*\d+ms\s*;?\s*$/;
const norm = (s) => String(s ?? '').replace(/\s+/gu, ' ').trim();
const typy = (n) => (n && n['@type'] !== undefined ? [].concat(n['@type']) : []);
const skr = (s, max = 90) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

function jestAkapitemOdnosnika(p) {
  const dzieci = (p.children || []).filter((c) => c.type === 'element' || (c.type === 'text' && c.text.trim()));
  return dzieci.length === 1 && dzieci[0].type === 'element' && dzieci[0].name === 'a' && hasClass(dzieci[0], 'link-btn');
}

function widocznePytania(doc) {
  return findAll(doc, (e) => hasClass(e, 'qa')).map((qa) => {
    const przycisk = find(qa, (e) => e.name === 'button');
    const cialo = find(qa, (e) => hasClass(e, 'qa-body'));
    let odpowiedz = '';
    if (cialo) {
      const akapity = findAll(cialo, (e) => e.name === 'p');
      // Akapit z samym odnośnikiem (jeden element a.link-btn i nic poza nim) nie jest częścią odpowiedzi.
      const tresc = akapity.filter((p) => !jestAkapitemOdnosnika(p));
      odpowiedz = akapity.length ? tresc.map((p) => textOf(p)).join(' ') : textOf(cialo);
    }
    return { pytanie: norm(przycisk ? textOf(przycisk) : ''), odpowiedz: norm(odpowiedz) };
  });
}

function porownajPytania(widoczne, zDanych) {
  const bledy = [];
  if (widoczne.length !== zDanych.length) {
    bledy.push(`FAQPage ma ${zDanych.length} pytań, a strona pokazuje ${widoczne.length}`);
  }
  const n = Math.min(widoczne.length, zDanych.length);
  for (let i = 0; i < n; i++) {
    const w = widoczne[i];
    const d = zDanych[i];
    if (w.pytanie !== d.pytanie) bledy.push(`FAQPage pytanie ${i + 1}: „${skr(d.pytanie)}”, na stronie „${skr(w.pytanie)}”`);
    if (w.odpowiedz !== d.odpowiedz) bledy.push(`FAQPage odpowiedź ${i + 1}: „${skr(d.odpowiedz)}”, na stronie „${skr(w.odpowiedz)}”`);
  }
  return bledy;
}

/**
 * @param {string} plik nazwa pliku podstrony, np. 'integracja-systemow.html'
 * @param {string} html zbudowany HTML
 * @returns {string[]} błędy (bez przedrostka z nazwą pliku)
 */
function sprawdzPodstrone(plik, html) {
  const bledy = [];
  const doc = parse(html);
  const adres = new URL(plik, ADRES_BAZOWY).href;

  // 1. blok danych strukturalnych
  const bloki = findAll(doc, (e) => e.name === 'script' && (e.attrs.type || '').trim().toLowerCase() === 'application/ld+json');
  let graf = [];
  if (bloki.length !== 1) {
    bledy.push(`oczekiwano dokładnie jednego bloku danych strukturalnych (application/ld+json), jest ${bloki.length}`);
  } else {
    const blok = bloki[0];
    const inne = blok.attrList.map(([k]) => k).filter((k) => k !== 'type');
    if (inne.length) bledy.push(`blok danych strukturalnych ma niedozwolone atrybuty: ${inne.join(', ')} (dozwolony tylko type)`);
    const surowy = blok.children.map((c) => c.text || '').join('').trim();
    if (/<\/|<!--/.test(surowy)) bledy.push('dane strukturalne zawierają niezakodowane „</” lub „<!--”');
    let dane = null;
    try {
      dane = JSON.parse(surowy);
    } catch (e) {
      bledy.push(`dane strukturalne nie są poprawnym JSON (${e.message})`);
    }
    if (dane) {
      if (dane['@context'] !== 'https://schema.org') bledy.push('dane strukturalne bez @context https://schema.org');
      graf = Array.isArray(dane['@graph']) ? dane['@graph'] : [dane];
    }
  }
  const wezel = (t) => graf.find((n) => typy(n).includes(t));
  const wszystkie = (t) => graf.filter((n) => typy(n).includes(t));
  if (bloki.length === 1 && graf.length) {
    for (const t of ['WebPage', 'BreadcrumbList']) if (!wezel(t)) bledy.push(`dane strukturalne bez węzła @type=${t}`);
  }

  // 2. jeden adres strony: WebPage.url, canonical i og:url
  const canonicalEl = find(doc, (e) => e.name === 'link' && (e.attrs.rel || '').toLowerCase().split(/\s+/).includes('canonical'));
  const ogEl = find(doc, (e) => e.name === 'meta' && (e.attrs.property || '').toLowerCase() === 'og:url');
  const adresy = [
    ['adres kanoniczny', canonicalEl ? canonicalEl.attrs.href : null],
    ['og:url', ogEl ? ogEl.attrs.content : null],
  ];
  const strona = wezel('WebPage');
  if (strona) adresy.push(['WebPage.url', strona.url ?? null]);
  for (const [co, wartosc] of adresy) {
    if (wartosc !== adres) bledy.push(`${co}: oczekiwano ${adres}, jest ${wartosc === null ? 'brak' : JSON.stringify(wartosc)}`);
  }

  // 3. FAQPage = widoczne pytania
  const widoczne = widocznePytania(doc);
  const faqi = wszystkie('FAQPage');
  if (faqi.length > 1) bledy.push(`dane strukturalne mają ${faqi.length} węzły FAQPage, dozwolony jeden`);
  if (faqi.length || widoczne.length) {
    if (!faqi.length) {
      if (graf.length) bledy.push(`strona pokazuje ${widoczne.length} pytań (.qa), a dane strukturalne nie mają FAQPage`);
    } else {
      const zDanych = (Array.isArray(faqi[0].mainEntity) ? faqi[0].mainEntity : []).map((q) => ({
        pytanie: norm(q && q.name),
        odpowiedz: norm(q && q.acceptedAnswer && q.acceptedAnswer.text),
      }));
      bledy.push(...porownajPytania(widoczne, zDanych));
    }
  }

  // 4. VideoObject tylko przy <video>
  const maWideo = findAll(doc, (e) => e.name === 'video').length > 0;
  const maVideoObject = wszystkie('VideoObject').length > 0;
  if (maVideoObject && !maWideo) bledy.push('dane strukturalne mają VideoObject, a strona nie ma <video> (stan „kadr”)');
  if (maWideo && !maVideoObject && graf.length) bledy.push('strona ma <video>, a dane strukturalne nie mają VideoObject');

  // 5. atrybut style
  for (const el of findAll(doc, (e) => Object.prototype.hasOwnProperty.call(e.attrs, 'style'))) {
    if (!STYL_DOZWOLONY.test(el.attrs.style)) {
      bledy.push(`linia ${el.line}: <${el.name} style="${skr(el.attrs.style, 60)}"> — dozwolone tylko style="--d:<liczba>ms"`);
    }
  }
  return bledy;
}

module.exports = { sprawdzPodstrone, widocznePytania, STYL_DOZWOLONY };
