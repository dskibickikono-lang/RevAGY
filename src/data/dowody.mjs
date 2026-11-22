// Dane do opisów wdrożeń, które wprowadza wyłącznie właściciel (D-020, D-034).
// Repozytorium jest publiczne: nic tu nie trafia bez pisemnej zgody spółki.
// Zasada: pole bez wartości to null (albo false). Strona pokazuje wtedy wariant anonimowy,
// bez tego elementu. Komponent src/components/OpisWdrozenia.astro wyświetla element
// tylko wtedy, gdy pole ma wartość.

export const DOWODY = {
  wdrozenia: {
    // Podstrona /integracja-systemow.html, sekcja „Jak to działa w praktyce”.
    'agencja-pracy-umowy': {
      // Nazwa spółki, np. 'Przykład Sp. z o.o.'. Tylko po pisemnej zgodzie spółki na nazwę i liczby.
      nazwaSpolki: null,
      // Etykieta powiązania z grupą, np. 'firma współpracująca z grupą'. Tekst wpisuje właściciel.
      etykietaPowiazania: null,
      // Skala firmy, w postaci 'ok. N pracowników, ok. M umów tygodniowo'. Każda liczba wymaga wiersza w tools/rejestr-twierdzen.json.
      skala: null,
      // Jak mierzone: okres i próba, w postaci 'porównanie N tygodni przed i N tygodni po wdrożeniu, próba: …'.
      jakMierzone: null,
      // Cytat osoby z kadr albo operacji. Obiekt { tresc, osoba, rola } albo null.
      // Tylko prawdziwa wypowiedź z pisemną zgodą osoby. Nigdy nie wpisuj cytatu wymyślonego.
      cytat: null,
      // Szczegóły techniczne: kategoria systemu (bez nazw własnych, D-033), droga łączenia, kierunek danych.
      // Tabela pojawia się na stronie dopiero wtedy, gdy każdy wiersz ma uzupełnioną drogę łączenia.
      // Kategorie i kierunki wynikają z opisu wdrożenia; drogę łączenia
      // ('Interfejs API', 'Wymiana plików' albo 'Dostęp do bazy danych, tylko odczyt') wpisuje właściciel.
      szczegolyTechniczne: [
        { kategoria: 'Aplikacja do podpisu umów na tablecie', droga: null, kierunek: 'Wysyła dane z podpisanej umowy' },
        { kategoria: 'System HR', droga: null, kierunek: 'Przyjmuje dane z podpisanej umowy' },
        { kategoria: 'Program kadrowo-płacowy', droga: null, kierunek: 'Przyjmuje dane z podpisanej umowy' },
      ],
    },
    // Podstrona /integracja-systemow.html, kafel „Raport sklejany z trzech eksportów” (stan załogi 568 i 539).
    'stan-zalogi': {
      // Etykieta powiązania (np. nazwa grupy), pokazywana w nawiasie po zdaniu z liczbami.
      etykietaPowiazania: null,
    },
    // Odpowiedź FAQ o ERP i systemie magazynowym (jeden pilotaż w produkcji).
    'pilotaz-produkcja': {
      // Etykieta powiązania spółki, w której był pilotaż, np. 'w spółce powiązanej z grupą'.
      etykietaPowiazania: null,
    },
  },

  // Zdanie ujawnienia pod opisami wdrożeń. Tekst wpisuje właściciel.
  zdanieUjawnienia: null,

  // Czy wolno pisać „Wdrażamy także poza nią” w nagłówku sekcji dowodów. Ustawia właściciel.
  takzePozaGrupa: false,
};

// Pomocnik: dane jednego wdrożenia albo błąd builda przy literówce w identyfikatorze.
export function wdrozenie(id) {
  const w = DOWODY.wdrozenia[id];
  if (!w) throw new Error(`Opis wdrożenia: brak wpisu „${id}” w src/data/dowody.mjs.`);
  return w;
}

// Pomocnik: czy pole ma wartość, którą wolno pokazać.
export const maWartosc = (v) => v !== null && v !== undefined && v !== false && !(typeof v === 'string' && !v.trim());
