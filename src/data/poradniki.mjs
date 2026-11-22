// Dane stron-poradników etapu 6, które wprowadza wyłącznie właściciel.
// Zasada jak w src/data/dowody.mjs: pole bez wartości to null. Pytanie, które zależy od pola,
// pokazuje się na stronie dopiero wtedy, gdy pole ma wartość (sprawdza to maWartosc z src/data/dowody.mjs).
// Każda liczba wpisana w pole wymaga wiersza w tools/rejestr-twierdzen.json.

export const PORADNIKI = {
  // Strona /porownanie-rozwiazan.html, sekcja „Pytania”.
  'porownanie-rozwiazan': {
    // Odpowiedź na pytanie „Czy budujecie automaty klikające po ekranie?”: czy REVAGY buduje takie
    // automaty (i w jakich warunkach), czy tylko połączenia przez interfejs API, wymianę plików
    // i dostęp do bazy danych. Pełne zdania, zwrot „Ty” jak na reszcie strony.
    // Jeśli REVAGY buduje takie automaty, sprawdź też ton sekcji „Droga 2. Automat klikający po ekranie”.
    // null: pytania nie ma na stronie ani w danych strukturalnych FAQPage.
    odpowiedzAutomatEkranowy: null,
  },
};

// Pomocnik: dane jednej strony albo błąd builda przy literówce w kluczu.
export function poradnik(klucz) {
  const p = PORADNIKI[klucz];
  if (!p) throw new Error(`Poradnik: brak wpisu „${klucz}” w src/data/poradniki.mjs.`);
  return p;
}
