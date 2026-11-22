// Wspólne ustawienia podstron (D-031). Czyta je src/layouts/PodstronaLayout.astro
// i komponenty z src/components/. Plik .mjs, żeby dało się go sprawdzić zwykłym `node`.

import { MARKA } from './marka.mjs';

// Autor widoczny na podstronach i w danych strukturalnych (WebPage.author).
export const AUTOR = {
  imie: MARKA.wlasciciel,
  rola: 'założyciel REVAGY',
  // schema.org Person.jobTitle — bez nazwy marki, bo organizację wskazuje worksFor.
  stanowisko: 'założyciel',
};

const PLIK = /^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

// Pełny adres podstrony z nazwy pliku, np. 'integracja-systemow.html'
// → 'https://revagy.pl/integracja-systemow.html'. Z niego powstają adres kanoniczny i og:url.
export function adresStrony(plik) {
  if (typeof plik !== 'string' || !PLIK.test(plik)) {
    throw new Error(`Podstrona: nieprawidłowa nazwa pliku „${plik}”. Oczekiwano np. „integracja-systemow.html”.`);
  }
  return new URL(plik, MARKA.url).href;
}

// Data w formacie RRRR-MM-DD; błąd builda przy złym zapisie.
export function sprawdzDate(data, pole) {
  if (typeof data !== 'string' || !DATA.test(data) || Number.isNaN(Date.parse(`${data}T00:00:00Z`))) {
    throw new Error(`Podstrona: pole „${pole}” musi mieć postać RRRR-MM-DD (jest: ${JSON.stringify(data)}).`);
  }
  return data;
}

const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

// '2026-11-21' → '21 listopada 2026'
export function dataSlownie(data) {
  const [r, m, d] = sprawdzDate(data, 'data').split('-').map(Number);
  return `${d} ${MIESIACE[m - 1]} ${r}`;
}
