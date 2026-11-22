// Wartości oferty, które podaje wyłącznie właściciel (D-029). Brak kwoty: „Wycena po audycie”.
// Repozytorium jest publiczne: kwoty i warunki trafiają tu dopiero po decyzji właściciela.
// Zasada: pole bez wartości to null. Strona pokazuje wtedy wariant bez tego elementu:
//   - brak ceny pakietu: w kaflu „Wycena po audycie”; jest cena: „od <kwota>”,
//   - pozostałe pola: zdanie albo cała sekcja pojawia się dopiero, gdy pole ma wartość.
// Każda kwota i każda liczba wpisana tutaj wymaga wiersza w tools/rejestr-twierdzen.json
// z frazą dokładnie tak, jak stanie na stronie (np. „od X XXX zł”), inaczej CI zatrzyma wydanie.
// Plik .mjs bez zależności spoza repozytorium, żeby dało się go sprawdzić zwykłym `node`.

import { maWartosc } from './dowody.mjs';

export const OFERTA = {
  // ——— /dla-firm.html ———

  // Cena „od” pakietu Start (D-029): sama kwota z walutą, ze spacją tysięcy i dopiskiem netto albo brutto,
  // w postaci 'X XXX zł netto'. Strona dopisze przed nią „od”. Pokazuje się w kaflu Start i w pytaniu „Ile to kosztuje?”.
  cenaStartOd: null,

  // Cena „od” pakietu Scale (D-029), ta sama postać co cenaStartOd: 'X XXX zł netto'. Te same dwa miejsca.
  cenaScaleOd: null,

  // Warunki zakończenia wdrożenia w trakcie i wypowiedzenia opieki. Ciąg dalszy zdania po dwukropku
  // „Warunki zakończenia wdrożenia i opieki: …”, małą literą, bez kropki na końcu, np.
  // 'wdrożenie kończysz …, opiekę wypowiadasz z … wyprzedzeniem'. Bez wartości zdanie nie pokazuje się
  // w odpowiedzi „Co jeśli się rozmyślimy?”.
  warunkiZakonczeniaUmowy: null,
};

export { maWartosc };

// Kropka na końcu zdania złożonego z tekstu strony i wartości właściciela.
export const zKropka = (tekst) => (/[.!?]$/.test(tekst.trim()) ? tekst.trim() : `${tekst.trim()}.`);

// Napis w miejscu ceny w kaflu pakietu.
export const cenaPakietu = (kwota) => (maWartosc(kwota) ? `od ${kwota.trim()}` : 'Wycena po audycie');

// Kontrola przy imporcie (build zatrzyma się na błędzie): każde pole to null albo niepusty tekst bez {{…}}.
for (const [pole, wartosc] of Object.entries(OFERTA)) {
  if (wartosc === null) continue;
  if (typeof wartosc !== 'string' || !wartosc.trim()) {
    throw new Error(`src/data/oferta.mjs: pole „${pole}” musi być null albo niepustym tekstem.`);
  }
  if (/\{\{|\}\}/.test(wartosc)) {
    throw new Error(`src/data/oferta.mjs: pole „${pole}” zawiera miejsce {{…}}. Wpisz wartość albo zostaw null.`);
  }
}
