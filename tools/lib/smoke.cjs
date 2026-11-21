'use strict';
/* Logika testu dymnego, którą da się sprawdzić bez przeglądarki.
   Funkcje z przyrostkiem „WPrzegladarce” są przekazywane do page.evaluate(): muszą być samowystarczalne. */

/** Wysokości nagłówka, każdej sekcji `main > section` i stopki. Uruchamiane w przeglądarce. */
function zmierzWysokosciWPrzegladarce() {
  const out = [];
  const add = (klucz, el) => out.push({ klucz, wysokosc: Math.round(el.getBoundingClientRect().height * 100) / 100 });
  const header = document.querySelector('body > header');
  if (header) add('header', header);
  document.querySelectorAll('main > section').forEach((s, i) => add(s.id ? `#${s.id}` : `main > section:nth-of-type(${i + 1})`, s));
  const footer = document.querySelector('body > footer');
  if (footer) add('footer', footer);
  return out;
}

/**
 * Porównuje wysokości bazy i bieżącej strony.
 * @param {{klucz:string, wysokosc:number}[]} baza
 * @param {{klucz:string, wysokosc:number}[]} biezaca
 * @param {string[]} pominiete selektory z geometria.sekcje
 * @returns {{ problemy: string[], pominiete: string[] }}
 */
function porownajWysokosci(baza, biezaca, pominiete = []) {
  const problemy = [];
  const pom = [];
  const kb = baza.map((x) => x.klucz);
  const kc = biezaca.map((x) => x.klucz);
  if (kb.join('|') !== kc.join('|')) {
    problemy.push(`inna lista sekcji: baza [${kb.join(', ')}], teraz [${kc.join(', ')}]`);
  }
  const mapa = new Map(biezaca.map((x) => [x.klucz, x.wysokosc]));
  for (const { klucz, wysokosc } of baza) {
    if (!mapa.has(klucz)) continue;
    if (pominiete.includes(klucz)) { pom.push(klucz); continue; }
    const teraz = mapa.get(klucz);
    if (teraz !== wysokosc) problemy.push(`${klucz}: ${wysokosc} px w bazie, ${teraz} px teraz (różnica ${Math.round((teraz - wysokosc) * 100) / 100} px)`);
  }
  return { problemy, pominiete: pom };
}

/** Wyliczone kolory, kroje i rozmiary pisma na wyrenderowanych elementach. Uruchamiane w przeglądarce. */
function zbierzStyleWPrzegladarce() {
  const kolory = new Set();
  const kroje = new Set();
  const rozmiary = new Set();
  for (const el of document.querySelectorAll('body, body *')) {
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden') continue;
    kolory.add(cs.backgroundColor);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const w = parseFloat(cs[`border${side}Width`]);
      const st = cs[`border${side}Style`];
      if (w > 0 && st !== 'none' && st !== 'hidden') kolory.add(cs[`border${side}Color`]);
    }
    const maTekst = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (maTekst) {
      kolory.add(cs.color);
      kroje.add(cs.fontFamily);
      rozmiary.add(cs.fontSize);
    }
  }
  return { kolory: [...kolory], kroje: [...kroje], rozmiary: [...rozmiary] };
}

/** Czego ze stylów podstrony nie ma w żadnej stronie wzorcowej. */
function roznicaStylow(wzorce, strona) {
  const out = {};
  for (const k of ['kolory', 'kroje', 'rozmiary']) {
    const ref = new Set(wzorce.flatMap((w) => w[k] || []));
    out[k] = (strona[k] || []).filter((v) => !ref.has(v));
  }
  return out;
}

/** Odnośniki menu podstrony do sekcji muszą mieć postać ./#sekcja, a sekcja musi istnieć na stronie głównej. */
function sprawdzMenuHref(hrefs, idsStronyGlownej) {
  const problemy = [];
  const ids = new Set(idsStronyGlownej);
  let doSekcji = 0;
  for (const h of hrefs) {
    if (h === null || h === undefined) continue;
    if (!h.includes('#')) continue;
    const m = /^\.\/#([A-Za-z][\w-]*)$/.exec(h);
    if (!m) { problemy.push(`odnośnik „${h}” zamiast ./#sekcja`); continue; }
    doSekcji++;
    if (!ids.has(m[1])) problemy.push(`odnośnik „${h}” prowadzi do sekcji, której nie ma na stronie głównej`);
  }
  if (!doSekcji) problemy.push('menu nie ma żadnego odnośnika ./#sekcja');
  return problemy;
}

const proporcje16x9 = (w, h, tol = 1) => Number.isFinite(w) && Number.isFinite(h) && w > 0 && Math.abs((w * 9) / 16 - h) <= tol;

const nazwaZrzutu = (plik, szerokosc) => `${plik === '/' || plik === 'index.html' ? 'index' : plik.replace(/\.html$/, '')}-${szerokosc}.png`;

/** Kanoniczny adres podstrony. */
const adresKanoniczny = (plik) => `https://revagy.pl/${plik}`;

module.exports = {
  zmierzWysokosciWPrzegladarce,
  porownajWysokosci,
  zbierzStyleWPrzegladarce,
  roznicaStylow,
  sprawdzMenuHref,
  proporcje16x9,
  nazwaZrzutu,
  adresKanoniczny,
};
