// Dane strony /dane-i-bezpieczenstwo.html (etap 4), które wprowadza wyłącznie właściciel.
// Zasada jak w src/data/dowody.mjs: pole bez wartości to null. Pytanie albo zdanie, które
// zależy od pola, pokazuje się na stronie dopiero wtedy, gdy pole ma wartość
// (sprawdza to maWartosc z src/data/dowody.mjs).
// Data „stanu na dzień” nie ma osobnego pola: strona bierze ją z daty aktualizacji
// (stała `aktualizacja` w src/pages/dane-i-bezpieczenstwo.astro).
// Każda liczba wpisana w pole wymaga wiersza w tools/rejestr-twierdzen.json.

export const BEZPIECZENSTWO = {
  // Odpowiedź w pytaniach na stronie: „Czy integracja korzysta z modeli AI na naszych danych?” (D-035).
  // Wpisz pełną odpowiedź: czy integracje i automatyzacje
  // przetwarzają dane klienta modelami AI, a jeśli tak, w jakim zakresie i na jakiej podstawie.
  // Jeśli przenoszenie pól działa bez modeli, odpowiedź ma to mówić wprost.
  // null: pytania nie ma na stronie ani w danych strukturalnych FAQPage.
  aiNaDanychKlienta: null,

  // Zdanie po „Jeśli Wasza firma ma własną ankietę, przyślijcie ją.” w sekcji „Czego jeszcze nie publikujemy”.
  // Propozycja brzmienia: 'Odpowiemy na konsultacji albo w dokumentach do umowy.'
  // Wpisz je (albo własne) tylko wtedy, gdy to zobowiązanie obowiązuje. null: zdania nie ma.
  odpowiedzNaAnkiete: null,

  // Wdrożenie w infrastrukturze klienta (np. pakiet Enterprise w chmurze albo na serwerach klienta).
  // Pełne zdanie, np. 'W pakiecie Enterprise wdrażamy rozwiązanie w Waszej chmurze albo na Waszych serwerach.'
  // Pokazuje się w odpowiedzi „Gdzie będą przetwarzane nasze dane?” i jako wiersz „Wdrożenie u Was”
  // w tabeli „Co obowiązuje dziś”. null: ani zdania, ani wiersza.
  wdrozenieUKlienta: null,
};
