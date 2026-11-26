// Dane do opisów wdrożeń, które wprowadza wyłącznie właściciel (D-020, D-034).
// Repozytorium jest publiczne: nic tu nie trafia bez pisemnej zgody spółki.
// Zasada: pole bez wartości to null (albo false). Strona pokazuje wtedy wariant anonimowy,
// bez tego elementu. Komponent src/components/OpisWdrozenia.astro wyświetla element
// tylko wtedy, gdy pole ma wartość.

export const DOWODY = {
  wdrozenia: {
    // Agencja pracy: umowy bez przepisywania. Jedno wdrożenie, trzy strony:
    // /integracja-systemow.html (scena dowodu w sekcji „Jak to działa w praktyce”), /wdrozenia.html (sekcja #umowy)
    // i /kadry-i-place.html (sekcja #wdrozenie).
    // Dane właściciela z 25.11.2026, pisemne zgody spółki i osoby cytowanej (D-034, T-036).
    'agencja-pracy-umowy': {
      nazwaSpolki: 'HR KADRA Sp. z o.o.',
      // Podmiot niezależny, poza grupą KONO: bez etykiety powiązania (D-054, wyjątek od D-020).
      etykietaPowiazania: null,
      // Każda liczba ma wiersz w tools/rejestr-twierdzen.json.
      skala: 'ok. 2 200 pracowników, ok. 340 umów tygodniowo',
      jakMierzone: 'Porównanie 4 pełnych tygodni przed wdrożeniem (4–31 maja 2026) i 4 po (8 czerwca–5 lipca 2026), z wyłączeniem tygodnia przejściowego (1–7 czerwca 2026). Próba: 1 280 umów przed i 1 360 po. Koordynator kadr rejestrował czas pracy, a analityk operacyjny weryfikował korekty i znaczniki czasu.',
      // Tylko prawdziwa wypowiedź z pisemną zgodą osoby. Nigdy nie wpisuj cytatu wymyślonego.
      cytat: {
        tresc: 'Po podpisie umowy nie czekamy już na kolejną paczkę do przepisania. W kadrach sprawdzamy wyjątki zamiast ręcznie wprowadzać te same dane drugi raz.',
        osoba: 'Weronika Głód',
        rola: 'Kierownik Działu Kadr',
      },
      // Kategorie systemów bez nazw własnych (D-033).
      szczegolyTechniczne: [
        { kategoria: 'Aplikacja do podpisu umów na tablecie', droga: 'Interfejs API', kierunek: 'Wysyła dane z podpisanej umowy' },
        { kategoria: 'System HR', droga: 'Interfejs API', kierunek: 'Przyjmuje dane z podpisanej umowy' },
        { kategoria: 'Program kadrowo-płacowy', droga: 'Wymiana plików', kierunek: 'Przyjmuje dane z podpisanej umowy' },
      ],
    },
    // Grupa spółek: jeden raport zarządu z kilku źródeł (raport dzienny 1 370 z 8.07.2026, arkusz operacyjny 1 300 z 10.07.2026: odczyty z różnych dni). Jedno wdrożenie, trzy strony:
    // /integracja-systemow.html (kafel „Raport sklejany z trzech eksportów”, tylko etykieta w nawiasie),
    // /wdrozenia.html (sekcja #raport) i /finanse.html (sekcja #wdrozenie).
    // Dane właściciela z 25.11.2026, pisemne zgody (D-034, T-036).
    'stan-zalogi': {
      nazwaSpolki: 'HR KONO',
      // Pokazywana w podpisie opisu i w nawiasie po zdaniu z liczbami.
      etykietaPowiazania: 'Grupa KONO',
      skala: '3 spółki, łącznie 1 370 pracowników według raportu dziennego',
      jakMierzone: 'Na starcie projektu zestawiono raport dzienny z 8 lipca 2026 (1 370 pracowników) z arkuszem operacyjnym według stanu na 10 lipca 2026 (1 300 osób). Aktywny czas przygotowania raportu mierzono w 10 cyklach przed automatyzacją (13–24 lipca 2026) i 10 po (3–14 sierpnia 2026); analityk operacyjny rejestrował czas od rozpoczęcia pobierania danych do zapisania gotowego raportu, bez przerw i oczekiwania.',
      cytat: {
        tresc: 'Kiedy dwa źródła pokazują różne liczby, od razu widzimy datę i zakres każdego odczytu. Nie musimy już zgadywać, czy porównujemy ten sam stan załogi.',
        osoba: 'Pavlo Tsyhanyk',
        rola: 'Analityk operacyjny',
      },
      // Bez tabeli szczegółów technicznych.
      szczegolyTechniczne: null,
    },
    // Jedyny pilotaż w produkcji (zakład produkcyjny). Jedno wdrożenie, dwie strony:
    // /integracja-systemow.html (odpowiedź FAQ o ERP i systemie magazynowym: nazwa spółki i etykieta)
    // i /produkcja-i-logistyka.html (sekcja #dowod, opis przez OpisWdrozenia).
    // Dane właściciela z 25.11.2026, pisemne zgody (D-034, T-036).
    'pilotaz-produkcja': {
      etykietaPowiazania: 'Grupa KONO',
      nazwaSpolki: 'HR KONO',
      skala: 'ok. 180 pracowników w zakładzie pilotażowym',
      // Dotyczy wyniku „z ok. 6 godzin do ok. 20 minut”.
      jakMierzone: 'Porównano 10 zmian dziennych przed pilotażem (7–18 września 2026) i 10 zmian dziennych w trakcie pilotażu (21 września–2 października 2026), po jednej zmianie na dzień roboczy, na tej samej linii i dla tego samego zakresu raportu. Mierzono czas od udostępnienia danych za zmianę do zapisania gotowego raportu produkcyjno-magazynowego. Pomiar prowadził koordynator produkcji, znaczniki czasu weryfikował analityk wdrożenia.',
      // Pisemna zgoda na publikację liczby z pilotażu (D-034); wiersz 'pl-pilotaz-wynik' ma status "potwierdzone".
      zgodaNaWynik: true,
      cytat: {
        tresc: 'Po zmianie otwieramy gotowe zestawienie zamiast składać raport z kilku arkuszy. Ręcznie sprawdzamy tylko rozbieżności.',
        osoba: 'Andrii Voitenko',
        rola: 'Koordynator produkcji',
      },
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
    // Podstrona /wdrozenia.html, sekcja #kandydaci („Kandydat w systemie w ok. 5 minut”).
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
    // Podstrona /sprzedaz.html, sekcja #wdrozenie-oferty („Oferta z kalkulatora i z komunikatora zespołu”).
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
    // Podstrona /sprzedaz.html, sekcja #wdrozenie-crm („Nowy lead i obsługa CRM z komunikatora zespołu”).
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
