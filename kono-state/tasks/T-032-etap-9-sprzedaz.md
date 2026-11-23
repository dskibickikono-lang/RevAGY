---
id: T-032
title: Etap 9 — podstrona działowa „Sprzedaż” (/sprzedaz.html)
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-23
branch: feat/etap-9-sprzedaz
base: main (5bac11d), odświeżona scaleniem z main (ca9b92b)
depends_on: T-021
pr: https://github.com/dskibickikono-lang/RevAGY/pull/41 (scalony do main, 6a2efde)
decisions: [D-015, D-016, D-018, D-019, D-021, D-022, D-025, D-027, D-028, D-029, D-031, D-033, D-034, D-039]
---

# T-032 — Etap 9: Sprzedaż

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
   i z komunikatora zespołu”), `sprzedaz-crm` („Nowy lead i obsługa CRM z komunikatora zespołu”). Nowe wpisy w
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
   to ta baza z dwiema zmianami `href`. `tools/etapy/zmiana-strony-glownej.json` to etap „T-032” z jednym wpisem
   `atrybuty` (`razy: 2`).
6. `tools/dom-contract.json`: bez zmian w tym kroku. Kontrakt policzy PM z builda CI w rundzie 2.
7. Testy narzędzi bez zmian: żaden test ani narzędzie nie wylicza podstron na sztywno (listy idą z `tools/podstrony.json`).

## Ustalenia

- **Numer karty.** Zlecenie właściciela podaje T-024, ale ten numer mają już w `main` inne karty. W trakcie prac
  karta miała numer T-027; zanim PR był gotowy, numer T-027 trafił do `main` z inną kartą, a otwarte PR-y #38, #39
  i #40 zajmują numery T-028–T-031. Dlatego ta karta ma numer T-032. W opisach wcześniejszych commitów tej gałęzi
  stoi jeszcze T-027.
- **Korekta właściciela z 22.11.2026 (poprawka 1).** Pierwsza wersja strony przyjęła ustalenie PM, że wdrożeń
  w sprzedaży nie ma, i pokazywała opis z rekrutacji (`kandydaci-zgloszenia`). Właściciel poprawił to ustalenie:
  wdrożenia sprzedażowe istnieją. Opis z rekrutacji zniknął ze strony sprzedaży (zostaje na `/wdrozenia.html`,
  a z pola `strony` wierszy `wd-kandydaci-*` usunięto `sprzedaz.html`). W jego miejsce weszły trzy opisy wdrożeń
  sprzedażowych.
- **Decyzja właściciela z 22.11.2026 („zatwierdzam”, po raporcie PM z badania wdrożeń).** Zatwierdzone: trzy anonimowe
  opisy wdrożeń sprzedażowych zamiast opisu z rekrutacji, wyrównanie treści do strony głównej, opis mapy bez zdania
  o stawkach, silnik leadów poza stroną. Decyzja nie rozstrzygała wprost liczb (punkt 2 niżej) ani oznaczenia
  „w pilotażu” (punkt 5), więc oba punkty zostają otwarte. Ostateczne brzmienie właściciel ogląda w PR.
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
  z małej próby bez zgody na publikację, silnik leadów, stawki z arkusza i czas przygotowania oferty.
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
- **Nowa klasa CSS: jedna.** `.bez-lamania { white-space: nowrap; }` w `public/assets/css/podstrony.css`, użyta raz,
  w `h1` strony sprzedaży. Powód: nagłówki mają `text-wrap: balance`, które dopuszcza podział wyrazu na łączniku.
  Poza tym strona używa wyłącznie istniejących klas z `finanse.astro` i `wdrozenia.astro` (`section-tight`
  w sekcjach opisów wdrożeń, jak na `/wdrozenia.html`). Po zmianie pliku stylów zmienia się skrót treści
  w jego adresie (`zasob()`, T-030), więc HTML wszystkich podstron zmienia się o ten jeden atrybut. `styles.css` bez zmian.
- **Nagłówek strony na telefonie.** Na zrzutach 393 i 375 px słowo „follow-upy” w `h1` łamało się na łączniku.
  W `h1` to słowo stoi teraz w `<span class="bez-lamania">`. Tekst nagłówka się nie zmienił. Atrybutu `style` użyć
  nie wolno: walidator dopuszcza na podstronach tylko `style="--d:<liczba>ms"`.
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

1. Trzy opisy wdrożeń sprzedażowych: **zaakceptowane przez właściciela 23.11.2026** („Tak akceptuję”; forma anonimowa, brzmienie bez liczb, pola w `src/data/dowody.mjs` jako `null`).
2. Dwie liczby mają źródło i opis pomiaru (zgodność przydziału handlowca z regionem oraz czas od utworzenia leada do powiadomienia):
   **Decyzja właściciela (23.11.2026):** Ujawnić w części wyniku wdrożenia, ale informacja o małej próbie ma zostać poza stroną (wpisanie na stronę nastąpi po wskazaniu/zatwierdzeniu dokładnych wartości w rejestrze twierdzeń).
3. Silnik leadów (Lead Engine):
   **Decyzja właściciela (23.11.2026, D-053):** Ma wejść na stronę sprzedaży jako jeden z kluczowych produktów oferty B2B. Zgodnie z briefem produkcyjnym system działa codziennie na produkcji i automatyzuje drogę od świeżego ogłoszenia rekrutacyjnego (źródło sygnału popytu), przez identyfikację NIP/firmy w rejestrach publicznych i wzbogacenie z REGON/KRS, po kwalifikację i routing terytorialny leada do CRM i komunikatora handlowca. Oświadczenie sprzedażowe opiera się na potwierdzonym fakcie produkcyjnym: *„System pracuje codziennie na produkcji i automatyzuje drogę od ogłoszenia rekrutacyjnego do przekazania zakwalifikowanej firmy handlowcowi.”* (Szczegółowe dodanie sekcji na stronie w ramach osobnego etapu/zadania, aby nie blokować wdrożenia etapu 9).
4. Kalkulator ofertowy (mapa i zapotrzebowanie z arkusza):
   **Potwierdzone przez właściciela (23.11.2026):** Zgodnie z briefem produkcyjnym `HR-KONO-OFERTA-APT` aplikacja działa na produkcji (React 19, TypeScript, 461 testów, korzysta 3 handlowców), kalkulator generuje osobno ofertę klienta i wewnętrzną kalkulację (koszt własny i marża kwotowa pozostają poufne), a mapa D3-geo pobiera zapotrzebowanie z arkusza (`/api/demand`). Ujęcie na stronie (prezentacja mapy i zapotrzebowania z arkusza bez ujawniania stawek i marż) jest w 100% zatwierdzone.
5. Agent ofert i agent CRM:
   **Decyzja właściciela (23.11.2026):** Zdejmujemy oznaczenie „w pilotażu”. Właściciel przedstawił niepodważalny dowód z komunikatora zespołu: boty produkcyjne (`Czarek` do generowania ofert PDF z marżą i notatką w CRM oraz `Marysia` do weryfikacji NIP i masowego dodawania aktywności/kontaktów w CRM) działają codziennie na produkcji w zespole handlowym razem z LeadEngine. Opisujemy je na stronie jako w pełni produkcyjne rozwiązanie.
6. Czas przygotowania oferty przed i po:
   **Decyzja właściciela (23.11.2026):** Celowo ma wspierać sprzedaż i docelowo pojawić się z konkretną liczbą, jednak na ten moment brak pod ręką dokładnego źródła pomiaru. Aby nie blokować wydania etapu 9, opis pozostaje mocno ujęty jakościowo (gotowy PDF od ręki w wątku zespołu), a twarde dane liczbowe zostaną odszukane i uzupełnione w osobnym zadaniu.
7. Wiadomości do klientów (FAQ):
   **Brzmienie ustalone przez właściciela (23.11.2026):** *„Tylko te, które chcecie. W audycie mapujemy z Wami, które wiadomości wychodzą same, z jaką treścią i w jakich terminach. Pozostałe powstają jako draft/szkic na skrzynce handlowca, który dostaje gotowy insight dla działań sprzedażowych.”*
8. Treść kafli „Po wdrożeniu” w trzech procesach (kwalifikacja leadów, oferty, follow-upy): **zaakceptowane przez właściciela 23.11.2026** („Tak”).
9. Kadr wideo (firma „POLPAK” bez formy prawnej i etykiety poglądowe): **zaakceptowane przez właściciela 23.11.2026** („Tak”).
10. Raport zgodności z celem czasu reakcji:
    **Decyzja właściciela (23.11.2026):** Przywrócić wzmiankę o comiesięcznym raporcie do opisu wdrożenia (u klienta powstaje raz w miesiącu, a częstotliwość raportu jest w pełni konfigurowalna).

11. Lighthouse (91/90) i preload fontów:
    **Decyzja właściciela (23.11.2026):** Zatwierdzono próg 90 w CI oraz zaplanowanie preloadu fontów nagłówkowych na podstronach w osobnym zadaniu optymalizacyjnym. Karta T-032 zamknięta.

## Runda 1 — wynik CI (2026-11-22)

- Czubek `2920e8d` (run 45047188053). Walidator zgłosił wyłącznie zapowiedziane różnice przy niezmienionym kontrakcie:
  nadmiarowy plik `sprzedaz.html`, inna suma `sitemap.xml`, niezgodność `index.html` i ośmiu podstron z kontraktem
  (po dwa odnośniki „Sprzedaż”), brak pliku kadru. Pozostałe pięć kroków kontroli przeszło: zbudowana strona główna
  jest równa migawce, a jej różnica względem bazy to dwa dozwolone atrybuty; kontrola treści, kontrola filmów
  i testy narzędzi bez błędów.
- Kadr `sprzedaz-kadr.jpg` z `render-media` (run 45047188141): 1600×900, 128 511 B (limit 150 000 B).

## Runda 2 (2026-11-22)

- Kontrakt policzony z builda CI (`tools/update-contract.cjs`). Zmienione wpisy: `index.html` i osiem podstron
  (odnośniki „Sprzedaż”), `sitemap.xml`; nowe: `sprzedaz.html` i `assets/video/sprzedaz-kadr.jpg`.
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach: 70 plików, 13/13 stron, testy narzędzi 108/108.
- Przewidziany manifest wydania: `3c72134406b7ee98ef47324bc856564405e5e083a715fde2153d2b82349763ca`.

## Wynik CI (2026-11-22)

Przebieg dla `175973f` (run 45047468420), zielony:

- `check:dist`: 6 z 6 kroków, 70 plików, 13/13 stron zgodnych z kontraktem i z zapisanym HTML. Manifest ten sam co
  przewidziany.
- Test dymny: 294 z 294, 0 błędów, 0 pominiętych, w tym brak poziomego przewijania na 393×852 i 375×667.
  Testy `wydanie.sh`: 16 z 16.
- Zrzuty 1280, 393, 390 i 375 px w artefakcie `podglad-<sha>`.

## Lighthouse (2026-11-22)

Przebieg dla `175973f` (run 45047468431), telefon, mediana z 3 przebiegów:

| Strona | Wydajność | Dostępność | SEO |
|---|---|---|---|
| `sprzedaz.html` | 91 (próg 90) | 96 (próg 95) | 100 (próg 100) |
| `finanse.html` | 97 | 96 | 100 |

Jedyny niezaliczony audyt dostępności to `color-contrast`: stan wejściowy animacji `.reveal`, jak na Finansach.
Wydajność obniża przesunięcie układu (CLS 0,19) przy podmianie kroju pisma we wstępie. Patrz decyzja 11.

## Po rundzie 2: nagłówek na telefonie

Poprawka `h1` (opis w „Ustaleniach”) zmienia `sprzedaz.html`, plik `assets/css/podstrony.css` i parametr `?v=` stylów
podstron na wszystkich podstronach (po odświeżeniu: skrót treści z `zasob()`). Kontrakt jest policzony z builda CI z naniesionymi tymi samymi zmianami.
Wynik CI i Lighthouse dla czubka gałęzi jest w opisie PR #41.

## Odświeżenie do main (2026-11-22)

Gałąź scalona z `origin/main` (`ca9b92b`, po PR #38, #39 i #40) zwykłym `git merge`, bez rebase i bez force-push.
Treści merytoryczne strony (opisy wdrożeń, dowody, teksty) bez zmian.

- **Konflikty (11 plików), rozwiązane z zachowaniem obu podstron, „Kadry i płace” (T-034) i „Sprzedaż”:**
  - `src/layouts/BaseLayout.astro`, `src/layouts/PodstronaLayout.astro`: kolejność z main (Sprzedaż, Finanse,
    Kadry i płace, Obsługa klienta, …); „Sprzedaż” w panelu menu i w stopce prowadzi do `sprzedaz.html`. Arkusze
    stylów podstron przez `zasob()` z main zamiast `styles.css?v=5` i `podstrony.css?v=4`. Komentarze o wyjątkach
    w menu wymieniają obie podstrony.
  - `public/sitemap.xml`: `kadry-i-place.html`, potem `sprzedaz.html`.
  - `src/config/filmy.mjs`: wpis `kadry-i-place`, potem `sprzedaz`.
  - `public/assets/css/podstrony.css`: style sceny z main (D-048, T-033), po nich `.bez-lamania`.
  - `tools/podstrony.json`: wpis `sprzedaz.html` dopisany po `kadry-i-place.html`, skrypty bez ręcznych `?v=N`.
  - `tools/lighthouse.json`: format i lista z main (strona główna, kontakt, integracja, finanse, kadry i płace)
    oraz `sprzedaz.html` z tymi samymi progami (90/95/100).
  - `tools/etapy/zmiana-strony-glownej.json`: etap T-032, dwie zmiany `href` „Sprzedaż” (`#zastosowania` →
    `sprzedaz.html`) względem nowej bazy.
  - Pliki generowane nie scalane ręcznie: `tools/baseline/index.baza.html` = migawka `tools/baseline/index.html`
    z main `ca9b92b`; `tools/baseline/index.html` i `tools/dom-contract.json` odtworzone z builda
    (`node tools/update-contract.cjs dist --snapshot`). Migawka różni się od bazy tylko dwoma odnośnikami „Sprzedaż”.
  - Bez konfliktu scaliły się `README.md` i `tools/rejestr-twierdzen.json`.
- **Ręczne `?v=N`:** usunięte (layout podstron, `tools/podstrony.json`, migawki). Plakat i źródła filmu idą przez
  `zasob()` w `MiejsceNaFilm.astro` z main. Obraz kadru `sprzedaz-kadr.jpg` jest bez parametru, jak kadry innych
  podstron: T-030 wyłącza `*-kadr.jpg` z wersjonowania.
- **Decyzje:** gałąź nie dodaje wpisów do rejestru decyzji, więc numerów po D-049 nie nadawałem.
- **Numer karty:** T-032 jest wolny na main; tabela w `kono-state/tasks/README.md` wskazuje tę kartę i PR #41.
- **Wynik lokalny (build jak CI):** `check:dist` 6 z 6 kroków: 72 pliki, 14/14 stron zgodnych z kontraktem
  i z `htmlBaseline`; `compare-home` także z bazą `origin/main`; testy narzędzi 128/128; test dymny 319 z 319,
  0 błędów, 0 pominiętych. Lighthouse dla czubka gałęzi trzeba odczytać z CI.

## Do uzupełnienia przez właściciela

Strona korzysta z pól, które są dziś `null`:

- `src/data/dowody.mjs`, wpisy `sprzedaz-zapytania`, `sprzedaz-oferty`, `sprzedaz-crm` (nowe w poprawce 1): rodzaj
  firmy, nazwa, etykieta powiązania, skala, „jak mierzone”, cytat; `zdanieUjawnienia` (wspólne dla podstron).
- `src/data/bezpieczenstwo.mjs`: `aiNaDanychKlienta`, `wdrozenieUKlienta`. Strona sprzedaży ich nie pokazuje.

## Stan

Wszystkie 11 decyzji właściciela podjęte 23.11.2026. Zdjęto etykiety „w pilotażu”, zaktualizowano treść FAQ i przywrócono raport czasu reakcji. PR #41 scalony do main (merge 6a2efde). Karta zamknięta.
