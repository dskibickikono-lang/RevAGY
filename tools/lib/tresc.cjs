'use strict';
/* Reguły treści podstron: nazwy własne systemów (D-033), zakazane frazy, niewypełnione {{…}},
   pokrycie liczb rejestrem twierdzeń oraz miejsce na film (plan 3.8, reguła filmSlots). */

const { parse, find, findAll, hasClass, has, textOf, collapse } = require('./html.cjs');

const RODZAJE = new Set(['warunek-oferty', 'wynik-wdrozenia', 'fakt']);
const STATUSY = new Set(['potwierdzone', 'do-potwierdzenia']);
const ATRYBUTY_TRESCI = ['alt', 'aria-label', 'title', 'placeholder'];
const BLOK = '\u2029';

/** Twarde i wąskie spacje traktujemy jak zwykłą spację przy wyszukiwaniu fraz i liczb. */
const spacje = (s) => String(s).replace(/[      ]/g, ' ');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const frazaRe = (fraza, { slowo = false } = {}) => {
  const body = collapse(spacje(fraza)).split(' ').map(escapeRe).join(' +');
  return new RegExp(slowo ? `(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])` : body, 'giu');
};

function atrybutyTresci(node) {
  const out = [];
  for (const el of findAll(node, () => true)) {
    for (const a of ATRYBUTY_TRESCI) if (has(el, a) && el.attrs[a].trim()) out.push(collapse(el.attrs[a]));
  }
  return out;
}

function meta(doc, attr, value) {
  const el = find(doc, (e) => e.name === 'meta' && (e.attrs[attr] || '').toLowerCase() === value);
  return el ? el.attrs.content || '' : null;
}

function sprawdzRejestr(rejestr) {
  const bledy = [];
  const ostrzezenia = [];
  if (!rejestr || !Array.isArray(rejestr.twierdzenia)) return { bledy: ['rejestr twierdzeń: brak tablicy "twierdzenia"'], ostrzezenia };
  const ids = new Set();
  rejestr.twierdzenia.forEach((t, i) => {
    const gdzie = `rejestr twierdzeń [${i}]${t && t.id ? ` (${t.id})` : ''}`;
    if (!t || typeof t !== 'object') { bledy.push(`${gdzie}: wpis nie jest obiektem`); return; }
    if (typeof t.id !== 'string' || !t.id) bledy.push(`${gdzie}: brak "id"`);
    else if (ids.has(t.id)) bledy.push(`${gdzie}: powtórzone "id"`);
    else ids.add(t.id);
    if (typeof t.fraza !== 'string' || !t.fraza.trim()) bledy.push(`${gdzie}: brak "fraza"`);
    if (!Array.isArray(t.strony) || !t.strony.length) bledy.push(`${gdzie}: "strony" musi być niepustą tablicą (np. ["*"])`);
    if (!RODZAJE.has(t.rodzaj)) bledy.push(`${gdzie}: "rodzaj" musi być jednym z: ${[...RODZAJE].join(', ')}`);
    if (!STATUSY.has(t.status)) bledy.push(`${gdzie}: "status" musi być jednym z: ${[...STATUSY].join(', ')}`);
    if (!('zrodlo' in t)) bledy.push(`${gdzie}: brak pola "zrodlo"`);
    if (t.rodzaj === 'wynik-wdrozenia' && !t.jakMierzone) ostrzezenia.push(`${gdzie}: wynik wdrożenia bez opisu „jak mierzone” (jakMierzone)`);
  });
  return { bledy, ostrzezenia };
}

function sprawdzFilm(doc, film) {
  const bledy = [];
  // "film": null = strona świadomie bez filmu (np. treści decyzyjne etapu 6): wtedy nie może mieć ramki ani wideo
  if (film === null) {
    const ramkiBez = findAll(doc, (e) => hasClass(e, 'film') || e.name === 'video' || has(e, 'data-video-toggle'));
    return ramkiBez.length ? [`"film": null w tools/podstrony.json, a strona ma ${ramkiBez.length} element(y) filmu (.film, <video>, data-video-toggle)`] : [];
  }
  if (!film) return ['brak pola "film" w tools/podstrony.json (każda nowa podstrona ma miejsce na film, D-022; strona bez filmu: "film": null)'];
  const ramki = findAll(doc, (e) => hasClass(e, 'film'));
  if (ramki.length !== 1) return [`miejsce na film: oczekiwana dokładnie jedna ramka .film, jest ${ramki.length}`];
  const r = ramki[0];
  if (!has(r, 'data-scale')) bledy.push('miejsce na film: ramka .film nie ma atrybutu data-scale');
  const img = findAll(r, (e) => e.name === 'img');
  const video = findAll(r, (e) => e.name === 'video');
  const przyciski = findAll(r, (e) => has(e, 'data-video-toggle'));
  const pozaRamka = findAll(doc, (e) => (e.name === 'video' || has(e, 'data-video-toggle') || has(e, 'data-main-video'))).filter((e) => !findAll(r, (x) => x === e).length);
  if (pozaRamka.length) bledy.push(`miejsce na film: ${pozaRamka.length} element(y) wideo lub przycisk filmu poza ramką .film`);

  if (video.length === 0) {
    // stan „kadr”
    if (img.length !== 1) bledy.push(`stan „kadr”: w ramce oczekiwany dokładnie jeden <img>, jest ${img.length}`);
    if (przyciski.length) bledy.push('stan „kadr”: przycisk data-video-toggle bez filmu');
    const i = img[0];
    if (i) {
      if (i.attrs.width !== '1600' || i.attrs.height !== '900') bledy.push(`stan „kadr”: <img> musi mieć width="1600" height="900" (jest ${i.attrs.width}×${i.attrs.height})`);
      if (!(i.attrs.alt || '').trim()) bledy.push('stan „kadr”: <img> bez niepustego alt');
      const src = (i.attrs.src || '').split('?')[0];
      if (src !== `assets/video/${film}-kadr.jpg`) bledy.push(`stan „kadr”: src="${i.attrs.src}", oczekiwano assets/video/${film}-kadr.jpg`);
    }
    return bledy;
  }
  // stan „film”
  if (video.length !== 1) bledy.push(`stan „film”: oczekiwany dokładnie jeden <video>, jest ${video.length}`);
  if (img.length) bledy.push(`stan „film”: w ramce jest ${img.length} <img> obok filmu`);
  if (przyciski.length !== 1) bledy.push(`stan „film”: oczekiwany dokładnie jeden przycisk data-video-toggle, jest ${przyciski.length}`);
  const v = video[0];
  if (!has(v, 'data-main-video')) bledy.push('stan „film”: <video> bez data-main-video');
  if (!has(v, 'data-autoplay')) bledy.push('stan „film”: <video> bez data-autoplay');
  if (has(v, 'autoplay')) bledy.push('stan „film”: <video> nie może mieć atrybutu autoplay (odtwarzanie włącza app.js)');
  if ((v.attrs.poster || '').split('?')[0] !== `assets/video/${film}.jpg`) bledy.push(`stan „film”: poster="${v.attrs.poster || ''}", oczekiwano assets/video/${film}.jpg`);
  const zrodla = findAll(v, (e) => e.name === 'source').map((s) => `${(s.attrs.src || '').split('?')[0]}|${s.attrs.type || ''}`);
  const oczek = [`assets/video/${film}.webm|video/webm`, `assets/video/${film}.mp4|video/mp4`];
  if (zrodla.join(',') !== oczek.join(',')) bledy.push(`stan „film”: źródła ${JSON.stringify(zrodla)}, oczekiwano ${JSON.stringify(oczek)} (najpierw webm)`);
  return bledy;
}

/** Pokrycie liczb frazami z rejestru. Zwraca błędy dla liczb bez potwierdzonego wpisu. */
function sprawdzLiczby(segmenty, wpisy, plik) {
  const bledy = [];
  const dotyczy = wpisy.filter((t) => t && typeof t.fraza === 'string' && t.fraza.trim()
    && Array.isArray(t.strony) && (t.strony.includes('*') || t.strony.includes(plik)));
  for (const seg of segmenty) {
    const tekst = spacje(seg);
    const zakresy = [];
    for (const t of dotyczy) {
      for (const m of tekst.matchAll(frazaRe(t.fraza))) zakresy.push({ od: m.index, do: m.index + m[0].length, t });
    }
    for (const m of tekst.matchAll(/(?<![\p{L}\p{N}])\d+(?: \d{3}(?!\d))*(?:[.,]\d+)?/gu)) {
      const od = m.index;
      const doo = od + m[0].length;
      const pokr = zakresy.filter((z) => z.od <= od && z.do >= doo);
      const kontekst = tekst.slice(Math.max(0, od - 30), Math.min(tekst.length, doo + 30)).trim().split(BLOK).join(' ¶ ');
      if (!pokr.length) bledy.push(`liczba „${m[0]}” bez wpisu w rejestrze twierdzeń: „…${kontekst}…”`);
      else if (!pokr.some((z) => z.t.status === 'potwierdzone')) {
        bledy.push(`liczba „${m[0]}” pokryta tylko wpisem do potwierdzenia (${[...new Set(pokr.map((z) => z.t.id))].join(', ')}): „…${kontekst}…”`);
      }
    }
  }
  return bledy;
}

/**
 * @param {{ plik: string, html: string, strona: object, nazwy: string[], frazy: string[], rejestr: object }} a
 * @returns {string[]} błędy
 */
function sprawdzStrone({ plik, html, strona = {}, nazwy = [], frazy = [], rejestr = { twierdzenia: [] } }) {
  const bledy = [];
  const doc = parse(html);
  const main = findAll(doc, (e) => e.name === 'main');
  if (main.length !== 1) bledy.push(`oczekiwany dokładnie jeden <main>, jest ${main.length}`);

  // 1. nazwy własne systemów: tytuł, opis, treść i atrybuty <main>
  const titleEl = find(doc, (e) => e.name === 'title');
  const naglowkowe = [
    ['tytuł', titleEl ? textOf(titleEl, { skip: [] }) : ''],
    ['opis', meta(doc, 'name', 'description')],
    ['og:title', meta(doc, 'property', 'og:title')],
    ['og:description', meta(doc, 'property', 'og:description')],
    ['twitter:title', meta(doc, 'name', 'twitter:title')],
    ['twitter:description', meta(doc, 'name', 'twitter:description')],
  ].filter(([, t]) => t).map(([g, t]) => [g, collapse(t)]);
  // Granice bloków jako U+2029, żeby frazy i liczby nie łączyły się ponad akapitami i pozycjami list.
  const tresciMain = main.length ? [textOf(main[0], { blok: BLOK }), ...atrybutyTresci(main[0])] : [];
  const miejscaNazw = [...naglowkowe, ...tresciMain.map((t) => ['treść <main>', t])];
  for (const nazwa of nazwy) {
    const re = frazaRe(nazwa, { slowo: true });
    for (const [gdzie, t] of miejscaNazw) {
      const m = spacje(t).match(re);
      if (m) bledy.push(`nazwa własna systemu „${m[0]}” w: ${gdzie} (D-033: tylko kategorie, np. „system ERP”)`);
    }
  }

  // 2. zakazane frazy w całym dokumencie (teksty, atrybuty treści, meta, adresy mailto) i niewypełnione {{…}}
  const calosc = textOf(doc, { skip: ['style'], blok: BLOK }).split(BLOK);
  for (const el of findAll(doc, () => true)) {
    for (const a of [...ATRYBUTY_TRESCI, 'content', 'value', 'href']) {
      if (!has(el, a)) continue;
      let v = el.attrs[a];
      if (a === 'href') { try { v = decodeURIComponent(v); } catch { /* zostaje surowy */ } }
      calosc.push(v);
    }
  }
  for (const fraza of frazy) {
    const re = frazaRe(fraza);
    const traf = calosc.map((t) => spacje(t).match(re)).find(Boolean);
    if (traf) bledy.push(`zakazana fraza „${traf[0]}”`);
  }
  for (const m of html.matchAll(/\{\{[\s\S]*?\}\}/g)) bledy.push(`niewypełnione miejsce ${m[0].slice(0, 60)}`);

  // 3. liczby w <main>
  if (main.length) bledy.push(...sprawdzLiczby(tresciMain, (rejestr && rejestr.twierdzenia) || [], plik));

  // 4. miejsce na film
  bledy.push(...sprawdzFilm(doc, strona.film));
  return bledy;
}

module.exports = { sprawdzStrone, sprawdzRejestr, sprawdzFilm, sprawdzLiczby, frazaRe, spacje };
