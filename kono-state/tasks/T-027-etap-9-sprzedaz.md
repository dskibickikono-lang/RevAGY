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
wdrożenie (D-019, D-025, D-028). Sekcja `#wdrozenie` pokazuje trzy anonimowe opisy wdrożeń sprzedażowych (D-034),
a to, co działa w pilotażu, jest tak oznaczone. Strona główna dostaje tylko dwa odnośniki „Sprzedaż” (D-015, D-021).

## Zakres

1. Nowe pliki:
   - `src/pages/sprzedaz.astro` na układzie `PodstronaLayout` (D-031). Sekcje: `wstep`, `film`, `kwalifikacja`,
     `oferty`, `follow-upy`, `kroki`, `wdrozenie` (nagłówek) z opisami w sekcjach `wdrozenie-zapytania`,
     `wdrozenie-oferty`, `wdrozenie-crm`, potem `dane`, `pytania`, `wezwanie`;
   - scena kadru `tools/scenes/sprzedaz.html` (1600×900): zapytanie z formularza na stronie po odczycie i kontroli
     pól, wynik zapisany w CRM (ocena według kryteriów, handlowiec przypisany według regionu, zadanie dla handlowca,
     wysłane powiadomienie), znacznik osi na „CRM”. Kadr `sprzedaz-kadr.jpg` renderuje CI (`render-media.yml`, D-032).
2. Miejsce na film w stanie „kadr” (D-022): wpis `sprzedaz` w `src/config/filmy.mjs`, bez `czasSekundy`
   i `dataPublikacji`.
3. Trzy opisy wdrożeń sprzedażowych (`OpisWdrozenia`, układ jak na `/wdrozenia.html`, `<Ujawnienie />` po ostatnim):
   `sprzedaz-zapytania` („Zapytanie ze strony u handlowca z regionu”), `sprzedaz-oferty` („Oferta z kalkulatora
   i z rozmowy zespołu”), `sprzedaz-crm` („Nowy lead i CRM w komunikatorze zespołu”). Nowe wpisy w
   `src/data/dowody.mjs`, wszystkie pola `null`; linia rodzaju firmy pokazuje się dopiero, gdy `rodzajFirmy` ma wartość.
   Opisy nie mają liczb.
4. Pliki wspólne:
   - `src/layouts/PodstronaLayout.astro`: dwa odnośniki „Sprzedaż” (panel „Dla działów” w menu i kolumna
     „Dla działów” w stopce) z `./#zastosowania` na `sprzedaz.html`; komentarz nagłówkowy opisuje wyjątki
     „Sprzedaż” i „Finanse”;
   - `src/layouts/BaseLayout.astro`: te same dwa odnośniki z `#zastosowania` na `sprzedaz.html`. Komentarz stoi
     we frontmatterze, więc wypisany HTML zmienia się tylko o te dwa atrybuty;
   - `tools/podstrony.json` (te same skrypty co pozostałe podstrony), `public/sitemap.xml` (`lastmod` 2026-11-22),
     `tools/rejestr-twierdzen.json` (wiersze `sp-*` i `sp-wd-*` oraz `sprzedaz.html` w polu `strony` wierszy użytych
     ponownie),
     `tools/lighthouse.json` (progi jak dla `finanse.html`: 90, 95, 100), `README.md` (wiersz w tabeli struktury).
5. Strona główna: `tools/baseline/index.baza.html` to migawka z `main` (`5bac11d`). `tools/baseline/index.html`
   to ta baza z dwiema zmianami `href`. `tools/etapy/zmiana-strony-glownej.json` to etap „T-027” z jednym wpisem
   `atrybuty` (`razy: 2`).
6. `tools/dom-contract.json`: bez zmian w tym kroku. Kontrakt policzy PM z builda CI w rundzie 2.
7. Testy narzędzi bez zmian: żaden test ani narzędzie nie wylicza podstron na sztywno (listy idą z `tools/podstrony.json`).

## Ustalenia

- **Numer karty.** Zlecenie właściciela podaje T-024, ale ten numer mają już w `main` trzy inne karty, T-025 to audyt
  SEO, a T-025 i T-026 są w otwartych PR-ach #34 i #35. Dlatego ta karta ma numer T-027.
- **Korekta właściciela z 22.11.2026 (poprawka 1).** Pierwsza wersja strony przyjęła ustalenie PM, że wdrożeń
  w sprzedaży nie ma, i pokazywała opis z rekrutacji (`kandydaci-zgloszenia`). Właściciel poprawił to ustalenie:
  wdrożenia sprzedażowe istnieją. Opis z rekrutacji zniknął ze strony sprzedaży (zostaje na `/wdrozenia.html`,
  a z pola `strony` wierszy `wd-kandydaci-*` usunięto `sprzedaz.html`). W jego miejsce weszły trzy opisy wdrożeń
  sprzedażowych.
- **Skąd są dowody.** PM sprawdził je w prywatnych repozytoriach właściciela, na serwerze i na Dysku, tylko do odczytu,
  i zweryfikował dwoma niezależnymi przeglądami. Mapa dowodów jest poza repozytorium. Do repo trafiły tylko brzmienia
  strony, bez nazw spółek, repozytoriów, systemów i osób.
- **Stan każdego opisu.**
  - Przydział zapytań („Zapytanie ze strony u handlowca z regionu”): produkcja.
  - Kalkulator ofertowy z mapą: produkcja. Agent ofert w komunikatorze: działająca usługa, ale brak dowodu regularnego
    użycia, więc na stronie „w pilotażu”.
  - Agent CRM w komunikatorze: działająca usługa, brak dowodu regularnego użycia, więc „w pilotażu”. Powiadomienie
    o nowym leadzie: produkcja; ostatni odczyt działania 04.11.2026 (dokumentacja utrzymania), pomiar czasu
    dostarczenia tylko w audycie z 04.09.2026.
  - Pulpit czasu reakcji: produkcja. Po przeglądzie poprawki 1 ze zdania o pulpicie usunięto „a co miesiąc powstaje
    z niego raport”: w materiałach jest jeden raport zgodności (12.10.2026), robi go osobne narzędzie wprost z CRM,
    a rytm miesięczny to plan bez harmonogramu. Patrz „Decyzje do podjęcia przez właściciela”, punkt 10.
- **Czego nie ma na stronie i dlaczego.** Patrz „Decyzje do podjęcia przez właściciela”, punkty 2, 3, 4 i 6: liczby
  z małej próby bez zgody na publikację, silnik leadów z ofert pracy, stawki z arkusza, czas przygotowania oferty
  i premie handlowców.
- **Wyrównanie do strony głównej.** Strona główna i `/dla-firm.html` mówią: „Lead z formularza (…) trafia do CRM
  z uzupełnionymi danymi firmy, oceną i zadaniem dla handlowca”, „Kwalifikacja i wzbogacanie leadów”, „Oferty
  generowane z cennika”, „Follow-upy wysyłane na czas”. Pierwsza wersja strony sprzedaży mówiła, że ocena
  i przypisanie czekają na akceptację, a wiadomości są domyślnie szkicami (zbyt ostrożne wytyczne PM). Po poprawce
  automat działa według kryteriów i reguł klienta, a do człowieka trafiają wyjątki i decyzje. Zmieniły się lead `#wstep`,
  `#film`, `#kwalifikacja`, `#follow-upy`, `#wdrozenie` (trzy opisy zamiast opisu z rekrutacji), dwa pytania,
  `usluga.opis`, kadr i wpis w `src/config/filmy.mjs`.
- **Usunięte reguły.** Znikają dwie reguły ze zlecenia etapu 9: „lead to zapytanie firmy, która sama się zgłosiła”
  i zdanie „Wiadomości dotyczą tylko osób, które same się zgłosiły…”. Strona nie składa takiej obietnicy i dalej nie
  obiecuje wysyłki do osób, które się nie zgłosiły: po prostu o tym nie mówi.
- **Strona główna: różnica migawki względem bazy.** Dokładnie dwie wartości atrybutów:

  | Linia | Znacznik | Atrybut | Było | Jest |
  |---|---|---|---|---|
  | 60 | `a` „Sprzedaż” w panelu „Dla działów” menu | `href` | `#zastosowania` | `sprzedaz.html` |
  | 666 | `a` „Sprzedaż” w kolumnie „Dla działów” stopki | `href` | `#zastosowania` | `sprzedaz.html` |

  Teksty, znaczniki, kolejność i wygląd bez zmian. Kafel „Sprzedaż” w `#zastosowania` bez zmian.
- **Nowe klasy CSS: brak.** Strona używa wyłącznie istniejących klas z `finanse.astro`
  i `wdrozenia.astro` (`section-tight` w sekcjach opisów wdrożeń, jak na `/wdrozenia.html`). `podstrony.css` i `styles.css` bez zmian,
  więc parametry `?v=` też.
- **Nazwy systemów.** Zero nazw własnych, także w pytaniach, tekście kadru i `alt` (D-018, D-033). Tylko kategorie:
  „CRM”, „poczta”, „formularz na stronie”, „arkusz”.
- **Modele AI i miejsce wdrożenia.** Ocena zapytania idzie „według Waszych kryteriów”. Strona nie rozstrzyga, czy dane
  klienta przetwarzają modele AI (`BEZPIECZENSTWO.aiNaDanychKlienta` jest `null`), i nie obiecuje wdrożenia u klienta
  ani w jego chmurze (`BEZPIECZENSTWO.wdrozenieUKlienta` jest `null`).
- **Wiadomości do klientów.** Same wychodzą tylko wiadomości ustalone z klientem w audycie (na przykład potwierdzenie
  otrzymania zapytania albo przypomnienie o ofercie), z ustaloną treścią i terminami. Pozostałe powstają jako szkic,
  a wysyła je handlowiec. To propozycja do potwierdzenia przez właściciela.
- **Firma w kadrze.** Scena pokazuje firmę „POLPAK” (D-027) bez formy prawnej. Test narzędzi
  („bez nazw własnych systemów i firm w tekście sceny”) odrzuca formy prawne w scenach podstron, więc „Sp. z o.o.”
  nie trafia do sceny.
- **Film.** Strona ma miejsce na film w stanie „kadr”, bez przycisku filmu. Film powstanie w osobnym etapie. Scena ma
  stałe miejsca dla wszystkich elementów (każdy z własnym `id`), nieruchome tło i `window.render(t)`, który już woła
  `TL.apply(t)`. `POSTER_AT = 12`, `DURATION = 14`. Po poprawce 1 prawy panel to `#p-crm` („Zapisane w CRM”:
  `#r-ocena`, `#r-handlowiec`, `#r-zadanie`, `#sent` z wysłanym powiadomieniem) zamiast panelu „Do akceptacji”,
  a kroki osi to „Odbiór”, „Odczyt”, „Ocena”, „Przypisanie”, „CRM”.
- **Nagłówki.** Jeden `h1`, `h2` w sekcjach, `h3 class="h4"` w kaflach, `h3` w opisie wdrożenia i pytaniach.

## Czego zabrakło z Dysku

PM przeczytał na Dysku foldery `01_Strona_i_SEO` i `Brand_sheet`. Brand sheet opisuje znak, kolory i kroje i jest
zgodny z tokenami w `styles.css` (nic do zmiany). Nie ma w nim opisu tonu. W `01_Strona_i_SEO` nie ma treści ani
wytycznych dla strony „Sprzedaż”. Treść opiera się na repozytorium; z Dysku nic nie przeniesiono.

## Decyzje do podjęcia przez właściciela

1. Trzy opisy wdrożeń sprzedażowych: zgoda na brzmienie. Pola właściciela w `src/data/dowody.mjs` są puste
   (`rodzajFirmy`, etykieta powiązania, skala, cytat), a zdanie ujawnienia (`zdanieUjawnienia`) dalej jest `null`.
2. Liczby, które mają źródło i opis pomiaru, ale nie weszły na stronę, bo nie ma zapisanej zgody na ich publikację
   i dotyczą małej próby: „12 z 12 zapytań z formularza we wrześniu 2026 miało w CRM handlowca zgodnego z podziałem
   regionów” (odczyt właściciela i etykiety przydziału z CRM, raport z 12.10.2026) oraz „wiadomość o nowym leadzie
   wyszła najpóźniej 53 s po jego utworzeniu” (audyt 4 pierwszych leadów, 31.08–03.09.2026).
3. Silnik leadów z ofert pracy (rejestr publiczny i portal ogłoszeń) nie jest opisany na stronie: pobiera dane
   z portalu, a ostatni dowód działania jest z 12.10.2026. Czy i jak go pokazać, decyduje właściciel.
4. „Stawki ładowane z arkusza”: w kodzie kalkulatora z arkusza ładuje się bieżące zapotrzebowanie klientów na mapę,
   a stawkę wpisuje handlowiec. Strona mówi więc o mapie z podziałem terenu i zapotrzebowaniem z arkusza, bez zdania
   o stawkach. Do potwierdzenia. Samego podziału terenu, stawek i marż strona nie pokazuje.
5. Agent ofert i agent CRM są oznaczone „w pilotażu”. Jeśli zespół używa ich na co dzień, oznaczenie trzeba zdjąć.
6. Czas przygotowania oferty przed i po oraz premie handlowców: w materiałach są szacunki bez opisu pomiaru, więc
   nie weszły na stronę.
7. Wiadomości do klientów: brzmienie odpowiedzi „Tylko te, które ustalicie…” to propozycja.
8. Treść kafli „Po wdrożeniu” w trzech procesach to propozycje, jak na Finansach.
9. Kadr: firma „POLPAK” bez formy prawnej (test sceny odrzuca formy prawne) i etykiety poglądowe.
10. Raport zgodności z celem czasu reakcji: czy powstaje regularnie co miesiąc? Jeśli tak, zdanie o raporcie może
    wrócić do opisu „Nowy lead i CRM w komunikatorze zespołu”.

## Do uzupełnienia przez właściciela

Strona korzysta z pól, które są dziś `null`:

- `src/data/dowody.mjs`, wpisy `sprzedaz-zapytania`, `sprzedaz-oferty`, `sprzedaz-crm` (nowe w poprawce 1): rodzaj
  firmy, nazwa, etykieta powiązania, skala, „jak mierzone”, cytat; `zdanieUjawnienia` (wspólne dla podstron).
- `src/data/bezpieczenstwo.mjs`: `aiNaDanychKlienta`, `wdrozenieUKlienta`. Strona sprzedaży ich nie pokazuje.
