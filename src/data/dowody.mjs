// Dane do opisów wdrożeń, które wprowadza wyłącznie właściciel (D-020, D-034).
// Repozytorium jest publiczne: nic tu nie trafia bez pisemnej zgody spółki.
// Zasada: pole bez wartości to null (albo false). Strona pokazuje wtedy wariant anonimowy,
// bez tego elementu. Komponent src/components/OpisWdrozenia.astro wyświetla element
// tylko wtedy, gdy pole ma wartość.

export const DOWODY = {
  wdrozenia: {
    // Agencja pracy: umowy bez przepisywania. Jedno wdrożenie, dwie strony:
    // /integracja-systemow.html (sekcja „Jak to działa w praktyce”) i /wdrozenia.html (sekcja #umowy).
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
    // Grupa spółek: jeden raport zarządu z kilku źródeł (stan załogi 568 i 539). Jedno wdrożenie, dwie strony:
    // /integracja-systemow.html (kafel „Raport sklejany z trzech eksportów”, tylko etykieta w nawiasie)
    // i /wdrozenia.html (sekcja #raport, pełny opis).
    'stan-zalogi': {
      // Nazwa spółki albo grupy. Tylko po pisemnej zgodzie na nazwę i liczby.
      nazwaSpolki: null,
      // Etykieta powiązania (np. nazwa grupy), pokazywana w nawiasie po zdaniu z liczbami i w podpisie opisu.
      etykietaPowiazania: null,
      // Skala, np. liczba spółek i osób. Każda liczba wymaga wiersza w tools/rejestr-twierdzen.json.
      skala: null,
      // Jak mierzone: data odczytu obu systemów i okres pomiaru godzin przygotowania raportu.
      jakMierzone: null,
      // Cytat: { tresc, osoba, rola } albo null. Tylko prawdziwa wypowiedź z pisemną zgodą.
      cytat: null,
      // Bez tabeli szczegółów technicznych (drogi łączenia do uzupełnienia przez właściciela).
      szczegolyTechniczne: null,
    },
    // Odpowiedź FAQ o ERP i systemie magazynowym (jeden pilotaż w produkcji).
    // Jedyny pilotaż w produkcji (zakład produkcyjny). Jedno wdrożenie, dwie strony:
    // /integracja-systemow.html (odpowiedź FAQ o ERP i systemie magazynowym, tylko etykieta)
    // i /produkcja-i-logistyka.html (sekcja #dowod, opis przez OpisWdrozenia).
    'pilotaz-produkcja': {
      // Etykieta powiązania spółki, w której był pilotaż, np. 'w spółce powiązanej z grupą'.
      etykietaPowiazania: null,
      // Nazwa zakładu. Tylko po pisemnej zgodzie spółki na nazwę i liczby.
      nazwaSpolki: null,
      // Skala zakładu, np. 'ok. N pracowników'. Każda liczba wymaga wiersza w tools/rejestr-twierdzen.json.
      skala: null,
      // Jak mierzone: okres, liczba zmian w próbie i kto mierzył. Dotyczy wyniku „z ok. 6 godzin do ok. 10 minut”.
      jakMierzone: null,
      // true dopiero po pisemnej zgodzie na publikację liczby z pilotażu (D-034). Do tego czasu linia „Wynik”
      // nie pokazuje się. Razem z true zmień status wiersza 'pl-pilotaz-wynik' w tools/rejestr-twierdzen.json
      // na "potwierdzone".
      zgodaNaWynik: null,
      // Cytat: { tresc, osoba, rola } albo null. Tylko prawdziwa wypowiedź z pisemną zgodą.
      cytat: null,
      // Bez tabeli szczegółów technicznych (kategorie systemów pilotażu: OFERTA.kategorieSystemowPilotazu).
      szczegolyTechniczne: null,
    },
    // Podstrona /wdrozenia.html, sekcja #zezwolenia („Alert o kończącym się zezwoleniu 30 dni wcześniej”).
    'alert-zezwolenia': {
      // Rodzaj firmy, np. 'Agencja pracy'. Do potwierdzenia przez właściciela; bez wartości linia się nie pokazuje.
      rodzajFirmy: null,
      // Nazwa spółki. Tylko po pisemnej zgodzie spółki na nazwę i liczby.
      nazwaSpolki: null,
      // Etykieta powiązania z grupą. Tekst wpisuje właściciel.
      etykietaPowiazania: null,
      // Skala firmy. Każda liczba wymaga wiersza w tools/rejestr-twierdzen.json.
      skala: null,
      // Jak mierzone: okres i próba.
      jakMierzone: null,
      // Cytat: { tresc, osoba, rola } albo null. Tylko prawdziwa wypowiedź z pisemną zgodą.
      cytat: null,
      // Bez tabeli szczegółów technicznych (drogi łączenia do uzupełnienia przez właściciela).
      szczegolyTechniczne: null,
    },
    // Podstrona /wdrozenia.html, sekcja #kandydaci („Kandydat w systemie w 5 minut”).
    'kandydaci-zgloszenia': {
      // Rodzaj firmy, np. 'Agencja pracy'. Do potwierdzenia przez właściciela; bez wartości linia się nie pokazuje.
      rodzajFirmy: null,
      nazwaSpolki: null,
      etykietaPowiazania: null,
      skala: null,
      jakMierzone: null,
      cytat: null,
      szczegolyTechniczne: null,
    },
    // Podstrona /sprzedaz.html, sekcja #wdrozenie-zapytania („Zapytanie ze strony u handlowca z regionu”).
    'sprzedaz-zapytania': {
      // Rodzaj firmy, np. 'Firma usługowa'. Do potwierdzenia przez właściciela; bez wartości linia się nie pokazuje.
      rodzajFirmy: null,
      // Pozostałe pola wpisuje właściciel, tylko po pisemnej zgodzie spółki (D-034). Każda liczba wymaga
      // wiersza w tools/rejestr-twierdzen.json; cytat tylko prawdziwy, z pisemną zgodą osoby.
      nazwaSpolki: null,
      etykietaPowiazania: null,
      skala: null,
      jakMierzone: null,
      cytat: null,
      szczegolyTechniczne: null,
    },
    // Podstrona /sprzedaz.html, sekcja #wdrozenie-oferty („Oferta z kalkulatora i z rozmowy zespołu”).
    'sprzedaz-oferty': {
      // Rodzaj firmy, np. 'Firma usługowa'. Do potwierdzenia przez właściciela; bez wartości linia się nie pokazuje.
      rodzajFirmy: null,
      // Pozostałe pola wpisuje właściciel, tylko po pisemnej zgodzie spółki (D-034). Każda liczba wymaga
      // wiersza w tools/rejestr-twierdzen.json; cytat tylko prawdziwy, z pisemną zgodą osoby.
      nazwaSpolki: null,
      etykietaPowiazania: null,
      skala: null,
      jakMierzone: null,
      cytat: null,
      szczegolyTechniczne: null,
    },
    // Podstrona /sprzedaz.html, sekcja #wdrozenie-crm („Nowy lead i CRM w komunikatorze zespołu”).
    'sprzedaz-crm': {
      // Rodzaj firmy, np. 'Firma usługowa'. Do potwierdzenia przez właściciela; bez wartości linia się nie pokazuje.
      rodzajFirmy: null,
      // Pozostałe pola wpisuje właściciel, tylko po pisemnej zgodzie spółki (D-034). Każda liczba wymaga
      // wiersza w tools/rejestr-twierdzen.json; cytat tylko prawdziwy, z pisemną zgodą osoby.
      nazwaSpolki: null,
      etykietaPowiazania: null,
      skala: null,
      jakMierzone: null,
      cytat: null,
      szczegolyTechniczne: null,
    },
  },

  // Zdanie ujawnienia pod opisami wdrożeń (raz na stronę, komponent Ujawnienie). Tekst wpisuje właściciel.
  zdanieUjawnienia: null,

  // Nagłówek sekcji dowodów na stronie /wdrozenia.html: zdanie o tym, gdzie te wdrożenia były sprawdzone.
  // Mówi o powiązaniu firm, więc tekst wpisuje właściciel, razem ze zdaniem ujawnienia (zdanieUjawnienia).
  // Każda liczba w nagłówku wymaga wiersza w tools/rejestr-twierdzen.json.
  // Bez wartości strona pokazuje nagłówek „Jak czytać te opisy”.
  naglowekDowodow: null,

  // Czy do nagłówka sekcji dowodów wolno dopisać „Wdrażamy także poza nią.”. Ustawia właściciel.
  // Działa tylko razem z naglowekDowodow.
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
