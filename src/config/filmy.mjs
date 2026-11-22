// Miejsca na filmy na podstronach (D-022, plan rozdział 3.1).
// Stan wybiera build po obecności plików w public/assets/video/:
//   „film” — są wszystkie trzy: <nazwa>.webm, <nazwa>.mp4 i kadr startowy <nazwa>.jpg,
//   „kadr” — nie ma żadnego z nich; strona pokazuje obraz <nazwa>-kadr.jpg (1600×900).
// Niekompletny zestaw (jeden albo dwa z trzech plików) to błąd builda.
// Ścieżki liczone od process.cwd(), czyli od katalogu repozytorium, w którym działa `astro build`.

import fs from 'node:fs';
import path from 'node:path';

export const FILMY = {
  'integracja-systemow': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Poglądowy ekran: rekord pracownika przeniesiony z systemu HR do kadr i płac, każde pole po kontroli, wpis w dzienniku zapisów',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: rekord pracownika przechodzi z systemu HR do kadr i płac',
    // VideoObject.name i VideoObject.description.
    tytul: 'Rekord pracownika z systemu HR w kadrach i płacach, wpisany raz',
    opis: 'Pięć pól przechodzi z systemu HR do programu kadrowo-płacowego. Każde mija swoją kontrolę, stawka poza zakresem czeka na decyzję człowieka, a zapis trafia do dziennika. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy (F1): czas w sekundach i data publikacji RRRR-MM-DD.
    czasSekundy: 14,
    dataPublikacji: '2026-11-22',
  },
  'wdrozenia': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Cztery kafle obok siebie: umowa w dwóch systemach, raport z trzech źródeł, alert o kończącym się zezwoleniu i zgłoszenie kandydata w systemie. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: cztery procesy przed i po połączeniu systemów',
    // VideoObject.name i VideoObject.description.
    tytul: 'Cztery procesy przed i po połączeniu systemów',
    opis: 'Umowa trafia z dokumentu do systemu HR oraz do kadr i płac, trzy źródła składają się w jeden raport zarządu, alert o kończącym się zezwoleniu przychodzi 30 dni przed końcem ważności, a zgłoszenie kandydata trafia do systemu rekrutacyjnego. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy: czas w sekundach i data publikacji RRRR-MM-DD.
    czasSekundy: 14,
    dataPublikacji: '2026-11-22',
  },
  'dla-firm': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Cztery szczeble obok siebie: karta procesu, raport z audytu, działający przepływ między systemami i raport z opieki. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: od konsultacji do opieki, cztery kroki współpracy',
    // VideoObject.name i VideoObject.description.
    tytul: 'Cztery kroki współpracy: od konsultacji do opieki',
    opis: 'Konsultacja kończy się kartą procesu, audyt raportem z zakresem wdrożenia, wdrożenie działającym przepływem między systemami, a opieka monitoringiem i raportem okresowym. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy: czas w sekundach i data publikacji RRRR-MM-DD.
    czasSekundy: 12,
    dataPublikacji: '2026-11-22',
  },
  'dane-i-bezpieczenstwo': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Schemat: dwa systemy firmy połączone integracją z oznaczonym zakresem dostępu, pod nimi dziennik z wpisem zawierającym poprzednią wartość i etykieta „miejsce przetwarzania wskazane w umowie powierzenia”. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: dane przechodzą przez integrację z minimalnym zakresem dostępu i dziennikiem',
    // VideoObject.name i VideoObject.description.
    tytul: 'Dostęp tylko do potrzebnych pól, wyjątek u człowieka',
    opis: 'Rekord przechodzi z systemu źródłowego do docelowego przez integrację, która widzi tylko uzgodnione pola. Wartość powyżej progu czeka na decyzję osoby po stronie klienta, a zapis trafia do dziennika z poprzednią wartością. Miejsce przetwarzania wskazuje umowa powierzenia. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy (F4): czas w sekundach i data publikacji RRRR-MM-DD.
    czasSekundy: 12,
    dataPublikacji: '2026-11-22',
  },
  'produkcja-i-logistyka': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Oś czasu pilota od dnia 1 do dnia 14. Na końcu osi karta „Kryterium sukcesu” z zaznaczonym wynikiem i dwoma przyciskami decyzji: „Pakiet” i „Koniec pilota”. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: 14 dni pilota na jednej linii produkcyjnej',
    // VideoObject.name i VideoObject.description.
    tytul: 'Pilot na jednej linii produkcyjnej, od dnia 1 do dnia 14',
    opis: 'Na początku pilota dostęp do systemów i kryterium sukcesu zapisane w umowie. Dane z hali trafiają do raportu zmianowego bez przepisywania, rozbieżność zatwierdza kierownik zmiany, a na końcu wynik jest porównany z kryterium i zapada decyzja. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy: czas w sekundach i data publikacji RRRR-MM-DD.
    czasSekundy: 14,
    dataPublikacji: '2026-11-22',
  },
  'finanse': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Poglądowy ekran: faktura kosztowa po odczycie i kontroli pól, z propozycją opisu i dekretacji, czeka na akceptację osoby z działu finansów. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: faktura kosztowa od odbioru do akceptacji człowieka',
    // VideoObject.name i VideoObject.description.
    tytul: 'Faktura kosztowa od odbioru do akceptacji',
    opis: 'Faktura kosztowa trafia do jednej kolejki, jej pola są odczytane i sprawdzone, a propozycja opisu i dekretacji czeka na akceptację osoby po stronie klienta. Po akceptacji faktura trafia do programu księgowego. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy: czas w sekundach i data publikacji RRRR-MM-DD.
    czasSekundy: 14,
    dataPublikacji: '2026-11-22',
  },
  'kadry-i-place': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Poglądowy ekran: arkusz godzin po odczycie i kontroli pól, jedna pozycja poza zakresem nie została zapisana i czeka na decyzję osoby z kadr i płac. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: godziny z arkusza trafiają do kadr i płac, wyjątek czeka na decyzję człowieka',
    // VideoObject.name i VideoObject.description.
    tytul: 'Godziny z arkusza w kadrach i płacach, wpisane raz',
    opis: 'Arkusz godzin trafia do jednej kolejki, jego pola są odczytane i sprawdzone przed zapisem. Pozycja poza zakresem nie jest zapisywana i czeka na decyzję osoby po stronie klienta, a pozostałe trafiają do programu kadrowo-płacowego. Dane na ekranach są poglądowe.',
    // Uzupełni etap filmowy: czas w sekundach i data publikacji RRRR-MM-DD.
  },
  'sprzedaz': {
    // Tekst zastępczy obrazu w stanie „kadr”.
    alt: 'Poglądowy ekran: zapytanie z formularza na stronie po odczycie i kontroli pól, zapisane w CRM z oceną według kryteriów, handlowcem przypisanym według regionu i zadaniem dla handlowca; powiadomienie do handlowca wysłane. Dane poglądowe.',
    // aria-label znacznika wideo w stanie „film”.
    etykieta: 'Animacja: zapytanie od odbioru do przypisania handlowca',
    // VideoObject.name i VideoObject.description.
    tytul: 'Zapytanie od odbioru do przypisania handlowca',
    opis: 'Zapytanie trafia do jednej kolejki, jego pola są odczytane i sprawdzone, a zapytanie trafia do CRM z oceną według kryteriów zespołu sprzedaży, handlowcem przypisanym według jego reguł i zadaniem dla handlowca. Handlowiec dostaje powiadomienie. Dane na ekranach są poglądowe.',
    // Uzupełnia etap filmowy: czas w sekundach i data publikacji RRRR-MM-DD.
  },
};

const NAZWA = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

export const WYMIARY_KADRU = { szerokosc: 1600, wysokosc: 900 };

export function katalogFilmow() {
  return path.join(process.cwd(), 'public', 'assets', 'video');
}

// Zwraca opis miejsca na film: stan, metadane i ścieżki względne (bez ukośnika na początku).
export function stanFilmu(nazwa, katalog = katalogFilmow()) {
  if (typeof nazwa !== 'string' || !NAZWA.test(nazwa)) {
    throw new Error(`Miejsce na film: nieprawidłowa nazwa „${nazwa}”.`);
  }
  const meta = FILMY[nazwa];
  if (!meta) {
    throw new Error(`Miejsce na film „${nazwa}”: brak wpisu w src/config/filmy.mjs.`);
  }
  for (const pole of ['alt', 'etykieta', 'tytul', 'opis']) {
    if (typeof meta[pole] !== 'string' || !meta[pole].trim()) {
      throw new Error(`Miejsce na film „${nazwa}”: puste pole „${pole}” w src/config/filmy.mjs.`);
    }
  }

  const pliki = {
    webm: `assets/video/${nazwa}.webm`,
    mp4: `assets/video/${nazwa}.mp4`,
    poster: `assets/video/${nazwa}.jpg`,
    kadr: `assets/video/${nazwa}-kadr.jpg`,
  };
  const jest = (rel) => fs.existsSync(path.join(katalog, path.basename(rel)));
  const filmowe = ['webm', 'mp4', 'poster'];
  const obecne = filmowe.filter((k) => jest(pliki[k]));

  if (obecne.length > 0 && obecne.length < filmowe.length) {
    const brak = filmowe.filter((k) => !obecne.includes(k)).map((k) => path.basename(pliki[k]));
    throw new Error(`Miejsce na film „${nazwa}”: niekompletny zestaw plików w public/assets/video/. Brakuje: ${brak.join(', ')}. Dodaj komplet (.webm, .mp4, .jpg) albo usuń wszystkie trzy.`);
  }

  if (obecne.length === filmowe.length) {
    if (!Number.isInteger(meta.czasSekundy) || meta.czasSekundy <= 0) {
      throw new Error(`Miejsce na film „${nazwa}”: pliki filmu są w public/assets/video/, ale w src/config/filmy.mjs brakuje „czasSekundy” (liczba całkowita sekund).`);
    }
    if (typeof meta.dataPublikacji !== 'string' || !DATA.test(meta.dataPublikacji) || Number.isNaN(Date.parse(`${meta.dataPublikacji}T00:00:00Z`))) {
      throw new Error(`Miejsce na film „${nazwa}”: pliki filmu są w public/assets/video/, ale w src/config/filmy.mjs brakuje „dataPublikacji” w postaci RRRR-MM-DD.`);
    }
    return { nazwa, stan: 'film', ...meta, ...pliki };
  }

  if (!jest(pliki.kadr)) {
    // Nie zatrzymujemy builda: kadr powstaje w osobnym kroku (tools/render-kadr.cjs, D-032).
    // Brak pliku i tak zatrzyma walidator odwołań lokalnych (tools/validate-dist.cjs).
    console.warn(`[filmy] Miejsce na film „${nazwa}”: brak ${path.basename(pliki.kadr)} w public/assets/video/. Uruchom: node tools/render-kadr.cjs ${nazwa}`);
  }
  return { nazwa, stan: 'kadr', ...meta, ...pliki };
}

// Węzeł VideoObject do grafu danych strukturalnych — tylko w stanie „film”, inaczej null.
// adresBazowy: MARKA.url, np. 'https://revagy.pl/'.
export function videoObject(film, adresBazowy, adresStrony) {
  if (!film || film.stan !== 'film') return null;
  const abs = (rel) => new URL(rel, adresBazowy).href;
  return {
    '@type': 'VideoObject',
    '@id': `${adresStrony}#film`,
    name: film.tytul,
    description: film.opis,
    thumbnailUrl: abs(film.poster),
    contentUrl: abs(film.mp4),
    uploadDate: film.dataPublikacji,
    duration: `PT${film.czasSekundy}S`,
    width: WYMIARY_KADRU.szerokosc,
    height: WYMIARY_KADRU.wysokosc,
    inLanguage: 'pl-PL',
    isPartOf: { '@id': `${adresStrony}#strona` },
  };
}
