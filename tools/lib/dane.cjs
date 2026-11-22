'use strict';
/* Wspólne pliki danych narzędzi: rejestr podstron i plik etapu dla strony głównej. */

const fs = require('node:fs');
const path = require('node:path');

/** tools/podstrony.json → [{ plik, film, skrypty }]. Brak pliku: pusta lista. Zły format: wyjątek. */
function wczytajPodstrony(plikJson) {
  if (!fs.existsSync(plikJson)) return [];
  let d;
  try { d = JSON.parse(fs.readFileSync(plikJson, 'utf8')); } catch (e) { throw new Error(`${plikJson}: niepoprawny JSON (${e.message})`); }
  if (!d || !Array.isArray(d.strony)) throw new Error(`${plikJson}: brak tablicy "strony"`);
  const widziane = new Set();
  d.strony.forEach((s, i) => {
    if (!s || typeof s.plik !== 'string' || !/^[a-z0-9][a-z0-9-]*\.html$/.test(s.plik)) {
      throw new Error(`${plikJson}: strony[${i}].plik musi być nazwą pliku .html w katalogu głównym (małe litery, cyfry, myślniki)`);
    }
    if (['index.html', '404.html'].includes(s.plik)) throw new Error(`${plikJson}: strony[${i}].plik nie może być ${s.plik}`);
    if (widziane.has(s.plik)) throw new Error(`${plikJson}: powtórzony plik ${s.plik}`);
    widziane.add(s.plik);
    if (s.film !== undefined && s.film !== null && !(typeof s.film === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(s.film))) {
      throw new Error(`${plikJson}: strony[${i}].film musi być nazwą pliku bez rozszerzenia`);
    }
    if (s.skrypty !== undefined && !(Array.isArray(s.skrypty) && s.skrypty.every((x) => typeof x === 'string'))) {
      throw new Error(`${plikJson}: strony[${i}].skrypty musi być tablicą tekstów`);
    }
  });
  return d.strony;
}

/** Sekcje strony głównej, których wysokość może się zmienić w tym etapie:
    geometria.sekcje = [{ selektor, opis }] (opis: jedno zdanie uzasadnienia). Zwraca same selektory. */
function wczytajGeometrie(repoRoot) {
  const p = path.join(repoRoot, 'tools/etapy/zmiana-strony-glownej.json');
  if (!fs.existsSync(p)) return [];
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const s = d && d.geometria && d.geometria.sekcje;
  if (s === undefined) return [];
  const ok = (x) => x && typeof x === 'object' && typeof x.selektor === 'string' && x.selektor.trim() && typeof x.opis === 'string' && x.opis.trim();
  if (!Array.isArray(s) || !s.every(ok)) throw new Error(`${p}: "geometria.sekcje" musi być tablicą obiektów { "selektor": "…", "opis": "…" } z niepustymi polami`);
  return s.map((x) => x.selektor);
}

module.exports = { wczytajPodstrony, wczytajGeometrie };
