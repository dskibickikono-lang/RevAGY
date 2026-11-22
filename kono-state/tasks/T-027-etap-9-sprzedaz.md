---
id: T-027
title: Etap 9 — podstrona działowa „Sprzedaż” (/sprzedaz.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-9-sprzedaz
base: main (5bac11d)
depends_on: T-021
decisions: [D-015, D-016, D-018, D-019, D-021, D-022, D-025, D-027, D-028, D-029, D-031, D-033, D-034, D-039]
---

# T-027 — Etap 9: Sprzedaż

## Cel

Podstrona działowa dla dyrektora sprzedaży, szefa zespołu handlowego i właściciela firmy 5–250 osób (D-016).
Pokazuje trzy procesy w kolejności z menu „Dla działów”: kwalifikację leadów, oferty i follow-upy. Przy każdym
procesie są trzy części: „Dziś”, „Po wdrożeniu” i „Co zostaje człowiekowi”. Budowa, ton i kolejność sekcji są takie
same jak na `/finanse.html` (T-021). Wejście jak na pozostałych podstronach: bezpłatna konsultacja, płatny audyt,
wdrożenie (D-019, D-025, D-028). Strona główna dostaje tylko dwa odnośniki „Sprzedaż” (D-015, D-021).

## Zakres

1. Nowe pliki:
   - `src/pages/sprzedaz.astro` na układzie `PodstronaLayout` (D-031). Sekcje: `wstep`, `film`, `kwalifikacja`,
     `oferty`, `follow-upy`, `kroki`, `wdrozenie`, `dane`, `pytania`, `wezwanie`;
   - scena kadru `tools/scenes/sprzedaz.html` (1600×900): zapytanie z formularza na stronie po odczycie i kontroli
     pól, ocena według kryteriów i propozycja przypisania handlowca czekają na akceptację człowieka, do klienta nic
     nie wyszło. Kadr `sprzedaz-kadr.jpg` renderuje CI (`render-media.yml`, D-032).
2. Miejsce na film w stanie „kadr” (D-022): wpis `sprzedaz` w `src/config/filmy.mjs`, bez `czasSekundy`
   i `dataPublikacji`.
3. Opis wdrożenia z innego działu: `kandydaci-zgloszenia` („Kandydat w systemie w 5 minut”), anonimowy, z treścią
   i liczbami jak na `/wdrozenia.html`, sekcja `#kandydaci` (D-034), z `<Ujawnienie />` pod opisem.
   Podpis: „Rekrutacja, nie dział sprzedaży.”
4. Pliki wspólne:
   - `src/layouts/PodstronaLayout.astro`: dwa odnośniki „Sprzedaż” (panel „Dla działów” w menu i kolumna
     „Dla działów” w stopce) z `./#zastosowania` na `sprzedaz.html`; komentarz nagłówkowy opisuje wyjątki
     „Sprzedaż” i „Finanse”;
   - `src/layouts/BaseLayout.astro`: te same dwa odnośniki z `#zastosowania` na `sprzedaz.html`. Komentarz stoi
     we frontmatterze, więc wypisany HTML zmienia się tylko o te dwa atrybuty;
   - `tools/podstrony.json` (te same skrypty co pozostałe podstrony), `public/sitemap.xml` (`lastmod` 2026-11-22),
     `tools/rejestr-twierdzen.json` (wiersze `sp-*` i `sprzedaz.html` w polu `strony` wierszy użytych ponownie),
     `tools/lighthouse.json` (progi jak dla `finanse.html`: 90, 95, 100), `README.md` (wiersz w tabeli struktury).
5. Strona główna: `tools/baseline/index.baza.html` to migawka z `main` (`5bac11d`). `tools/baseline/index.html`
   to ta baza z dwiema zmianami `href`. `tools/etapy/zmiana-strony-glownej.json` to etap „T-027” z jednym wpisem
   `atrybuty` (`razy: 2`).
6. `tools/dom-contract.json`: bez zmian w tym kroku. Kontrakt policzy PM z builda CI w rundzie 2.
7. Testy narzędzi bez zmian: żaden test ani narzędzie nie wylicza podstron na sztywno (listy idą z `tools/podstrony.json`).

## Ustalenia

- **Numer karty.** Zlecenie właściciela podaje T-024, ale ten numer mają już w `main` trzy inne karty, T-025 to audyt
  SEO, a T-025 i T-026 są w otwartych PR-ach #34 i #35. Dlatego ta karta ma numer T-027.
- **Opis z innego działu.** W danych o wdrożeniach nie ma wdrożenia z działu sprzedaży. Tak jak w T-021 strona
  pokazuje najbliższy mechanizmem opis z innego działu: `kandydaci-zgloszenia` (zgłoszenie z formularza trafia do
  systemu bez ręcznego przenoszenia). Lead sekcji mówi wprost, że opis nie pochodzi z działu sprzedaży, tylko
  z rekrutacji. Pole `rodzajFirmy` jest `null`, więc rodzaju firmy nie podajemy. Strona nie pisze, że REVAGY ma albo
  nie ma wdrożeń w sprzedaży.
- **Strona główna: różnica migawki względem bazy.** Dokładnie dwie wartości atrybutów:

  | Linia | Znacznik | Atrybut | Było | Jest |
  |---|---|---|---|---|
  | 60 | `a` „Sprzedaż” w panelu „Dla działów” menu | `href` | `#zastosowania` | `sprzedaz.html` |
  | 666 | `a` „Sprzedaż” w kolumnie „Dla działów” stopki | `href` | `#zastosowania` | `sprzedaz.html` |

  Teksty, znaczniki, kolejność i wygląd bez zmian. Kafel „Sprzedaż” w `#zastosowania` bez zmian.
- **Nowe klasy CSS: brak.** Strona używa wyłącznie klas z `finanse.astro`. `podstrony.css` i `styles.css` bez zmian,
  więc parametry `?v=` też.
- **Nazwy systemów.** Zero nazw własnych, także w pytaniach, tekście kadru i `alt` (D-018, D-033). Tylko kategorie:
  „CRM”, „poczta”, „formularz na stronie”, „arkusz”.
- **Modele AI i miejsce wdrożenia.** Ocena zapytania idzie „według Waszych kryteriów”. Strona nie rozstrzyga, czy dane
  klienta przetwarzają modele AI (`BEZPIECZENSTWO.aiNaDanychKlienta` jest `null`), i nie obiecuje wdrożenia u klienta
  ani w jego chmurze (`BEZPIECZENSTWO.wdrozenieUKlienta` jest `null`).
- **Wiadomości do klientów.** Domyślnie wiadomość powstaje jako szkic i wysyła ją handlowiec po akceptacji. Które
  wiadomości mogą wychodzić bez akceptacji, ustala klient w audycie. Wiadomości i przypomnienia dotyczą tylko osób,
  które same się zgłosiły albo już są w rozmowie. To propozycja do potwierdzenia przez właściciela.
- **Firma w kadrze.** Scena pokazuje firmę „POLPAK” (D-027) bez formy prawnej. Test narzędzi
  („bez nazw własnych systemów i firm w tekście sceny”) odrzuca formy prawne w scenach podstron, więc „Sp. z o.o.”
  nie trafia do sceny.
- **Film.** Strona ma miejsce na film w stanie „kadr”, bez przycisku filmu. Film powstanie w osobnym etapie. Scena ma
  stałe miejsca dla wszystkich elementów (każdy z własnym `id`), nieruchome tło i `window.render(t)`, który już woła
  `TL.apply(t)`. `POSTER_AT = 12`, `DURATION = 14`.
- **Nagłówki.** Jeden `h1`, `h2` w sekcjach, `h3 class="h4"` w kaflach, `h3` w opisie wdrożenia i pytaniach.

## Czego zabrakło z Dysku

PM przeczytał na Dysku foldery `01_Strona_i_SEO` i `Brand_sheet`. Brand sheet opisuje znak, kolory i kroje i jest
zgodny z tokenami w `styles.css` (nic do zmiany). Nie ma w nim opisu tonu. W `01_Strona_i_SEO` nie ma treści ani
wytycznych dla strony „Sprzedaż”. Treść opiera się na repozytorium; z Dysku nic nie przeniesiono.

## Decyzje do podjęcia przez właściciela

1. Treść kafli „Po wdrożeniu” we wszystkich trzech procesach to propozycja (jak na Finansach). Czy kontrola przed
   zapisem ma wychwytywać „firmę, która już jest w CRM” i „zapytanie bez danych do kontaktu”, a w ofertach
   „brakujące pole i pozycję spoza cennika”?
2. Przypisanie handlowca: zostaje propozycją do akceptacji człowieka (film, kadr, kafel, „Co zostaje człowiekowi”),
   czy ma się dziać samo według reguł, a akceptacji wymaga tylko ocena? Strona główna pisze „Lead z formularza
   zakwalifikowany, trafił do handlowca”.
3. Odpowiedź „Czy wysyłacie wiadomości do klientów za nas?”: potwierdzić brzmienie. Czy dopisać przykład wiadomości
   bez akceptacji (np. potwierdzenie otrzymania zapytania)? Strona główna i `/dla-firm.html` piszą „Follow-upy
   wysyłane na czas” / „follow-upy wychodzą na czas”: czy to zgodne z zasadą szkicu?
4. Czy kryteria oceny zapytania „spisujemy z Wami w audycie”?
5. Oferty: czy „Pozycje i ceny katalogowe są pobrane z Waszego cennika” i zapis w CRM „jej wersja, status i to, kto ją
   zaakceptował” mogą stać na stronie?
6. Lista pól zapytania („firma, osoba do kontaktu, czego dotyczy i oczekiwany termin”) jest propozycją, nie opisem
   z wdrożenia.
7. Kadr: akceptuje „szef zespołu handlowego” (propozycja). Etykiety „opiekun regionu” i „opakowania na zamówienie” są
   poglądowe. Czy w kadrze ma być firma z D-027 („POLPAK”, bez formy prawnej), skoro kadr finansów nie miał nazwy firmy
   i przepis etapów filmowych nie dopuszcza nazw firm w scenach? Druga możliwość: „Przykładowa firma”.
8. Czy sekcja „Ten sam mechanizm w innym dziale” z opisem z rekrutacji zostaje na stronie sprzedaży (jak na Finansach)?

## Do uzupełnienia przez właściciela

Ten etap nie dodaje nowych pól w danych strony. Strona korzysta z istniejących pól, które są dziś `null`:

- `src/data/dowody.mjs`, wpis `kandydaci-zgloszenia`: rodzaj firmy, nazwa, etykieta powiązania, skala,
  „jak mierzone”, cytat; `zdanieUjawnienia` (wspólne dla podstron).
- `tools/rejestr-twierdzen.json`: opis pomiaru (`jakMierzone`, dziś `null`) dla `wd-kandydaci-5-minut-naglowek`,
  `wd-kandydaci-48-godzin-przed`, `wd-kandydaci-5-minut-48-godzin` i `wd-kandydaci-30-procent`. Liczby mają źródło
  (materiały właściciela, D-020, D-034), ale brakuje opisu, jak je zmierzono.
- `src/data/bezpieczenstwo.mjs`: `aiNaDanychKlienta`, `wdrozenieUKlienta`. Strona sprzedaży ich nie pokazuje.
