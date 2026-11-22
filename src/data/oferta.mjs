// Wartości oferty, które podaje wyłącznie właściciel (D-029, D-030). Brak kwoty: „Wycena po audycie”, „Cena pilota po rozmowie”.
// Repozytorium jest publiczne: kwoty i warunki trafiają tu dopiero po decyzji właściciela.
// Zasada: pole bez wartości to null. Strona pokazuje wtedy wariant bez tego elementu:
//   - brak ceny pakietu: w kaflu „Wycena po audycie”; jest cena: „od <kwota>”,
//   - brak ceny pilota: „Cena pilota po rozmowie”; jest cena: kwota jako stała cena pilota,
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

  // ——— /produkcja-i-logistyka.html ———

  // Stała cena pilota Enterprise (D-030). Kwotę wpisuje wyłącznie właściciel.
  // Sama kwota w postaci 'X XXX zł netto'. Bez wartości strona pisze „Cena pilota po rozmowie”.
  // Pokazuje się w tabeli „Co obejmuje pilot” i w pytaniu „Ile kosztuje pilot?”.
  cenaPilota: null,

  // Co się dzieje, gdy kryterium sukcesu nie zostanie osiągnięte (czy klient płaci pełną cenę, część czy nic,
  // czy pilot można przedłużyć). Ciąg dalszy zdania po dwukropku „Jeśli kryterium nie zostanie osiągnięte: …”,
  // małą literą, bez kropki na końcu. Bez wartości zdanie pod tabelą kryteriów nie pokazuje się.
  skutekNieosiagnieciaKryterium: null,

  // Kto przejmuje pilot, gdy osoba prowadząca jest niedostępna. Pełna odpowiedź, jedno albo dwa zdania
  // z kropką, np. 'Pilot przejmuje …'. Bez wartości pytanie „Co, jeśli osoba prowadząca pilot będzie niedostępna?” nie pokazuje się.
  zastepstwoWPilocie: null,

  // Kategorie systemów połączonych w jedynym pilotażu w produkcji, bez nazw własnych (D-033).
  // Ciąg dalszy po „Co połączyliśmy: ”, małą literą, bez kropki, np. 'system ERP i arkusz zmianowy'.
  // Bez wartości linia nie pokazuje się w opisie pilotażu.
  kategorieSystemowPilotazu: null,

  // Zdanie o tym, kto ma dostęp do danych klienta z pilota i wdrożenia: czy tylko REVAGY i jak to jest
  // zapisane (umowa powierzenia, osobne konta i dostępy). Pełne zdania z kropką. Bez wartości cała sekcja
  // „Wasze dane zostają w REVAGY” nie pokazuje się, razem z nagłówkiem.
  zdanieRozdzialDanych: null,
};

export { maWartosc };

// Kropka na końcu zdania złożonego z tekstu strony i wartości właściciela.
export const zKropka = (tekst) => (/[.!?]$/.test(tekst.trim()) ? tekst.trim() : `${tekst.trim()}.`);

// Napis w miejscu ceny w kaflu pakietu.
export const cenaPakietu = (kwota) => (maWartosc(kwota) ? `od ${kwota.trim()}` : 'Wycena po audycie');

// Napis w miejscu ceny pilota, gdy kwoty nie ma.
export const BEZ_CENY_PILOTA = 'Cena pilota po rozmowie';

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
