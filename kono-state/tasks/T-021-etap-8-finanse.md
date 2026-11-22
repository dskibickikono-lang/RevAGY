---
id: T-021
title: Etap 8 — podstrona działowa „Finanse” (/finanse.html)
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-8-finanse
base: main (a3ce70d)
depends_on: T-014
pr: https://github.com/dskibickikono-lang/RevAGY/pull/24 (scalony do main)
sha: 15d0da1fbdc010c8634f06b26078bb42665f0265 (zmiany); main po scaleniu PR #24: 0e72e39d14418df7a88129c3ddebb2da0090dd85
decisions: [D-015, D-016, D-018, D-019, D-021, D-022, D-025, D-028, D-029, D-031, D-033, D-034]
---

# T-021 — Etap 8: Finanse

## Cel

Podstrona działowa dla dyrektora finansowego, głównej księgowej i właściciela firmy 5–250 osób (D-016).
Pokazuje trzy procesy w kolejności z menu „Dla działów”: faktury kosztowe, windykację i uzgodnienia.
Przy każdym procesie są trzy części: „Dziś”, „Po wdrożeniu” i „Co zostaje człowiekowi”. Wejście jak na pozostałych
podstronach: bezpłatna konsultacja, płatny audyt, wdrożenie (D-019, D-025, D-028). Strona główna dostaje tylko
zmiany zatwierdzone przez właściciela 22.11.2026: odnośniki „Finanse”, nagłówki stopki i nagłówek na 375 px.
Wygląd od 390 px wzwyż zostaje bez zmian (D-015, D-021).

## Zakres

1. Nowe pliki:
   - `src/pages/finanse.astro` na układzie `PodstronaLayout` (D-031);
   - scena kadru `tools/scenes/finanse.html`: faktura kosztowa po odczycie i kontroli czeka na akceptację człowieka.
2. Miejsce na film w stanie „kadr” (D-022): wpis `finanse` w `src/config/filmy.mjs`, bez `czasSekundy`
   i `dataPublikacji`. Kadr `finanse-kadr.jpg` renderuje CI (`render-media.yml`, D-032).
3. Opis wdrożenia z innego działu: `stan-zalogi` (raport zarządu z kilku źródeł), anonimowy, z treścią
   i liczbami jak na `/wdrozenia.html` (D-034), z `<Ujawnienie />` pod opisem. Podpis: „Grupa spółek. Raport dla
   zarządu, nie dział finansów.”
4. Pliki wspólne:
   - `src/layouts/PodstronaLayout.astro`: dwa odnośniki „Finanse” (panel „Dla działów” w menu i kolumna
     „Dla działów” w stopce) z `./#zastosowania` na `finanse.html`. Cztery nagłówki kolumn stopki (`h4`) dostają
     `aria-level="2"`, więc po ostatnim `h2` w `<main>` nie ma przeskoku poziomu. Znacznik `h4` i wygląd zostają
     (styl `.site-footer h4` w `styles.css`). Komentarz nagłówkowy układu opisuje wyjątek „Finanse”;
   - `src/layouts/BaseLayout.astro` (decyzje właściciela 1 i 5): dwa odnośniki „Finanse” na `finanse.html` oraz
     `aria-level="2"` na czterech `h4` stopki. Komentarz stoi we frontmatterze, żeby nie zmieniać wypisanego HTML;
   - `public/assets/css/styles.css` (`?v=5` w obu układach): reguła nagłówka dla `max-width: 389px` przeniesiona
     z `podstrony.css` (`?v=3`, reguła usunięta). Działa na wszystkich stronach z jednego miejsca;
   - `tools/podstrony.json` (każda strona z `clarity.js?v=1` po T-022), `public/sitemap.xml`,
     `tools/rejestr-twierdzen.json`.
5. Narzędzia:
   - `tools/nazwy-systemow.json`: „KSeF” przeniesiony z listy `nazwy` do udokumentowanej listy `wyjatki`;
   - `tools/check-tresc.cjs` sprawdza format wyjątków i to, że wyjątek nie stoi jednocześnie na liście nazw;
   - nowa reguła kontroli treści dla stron z `tools/podstrony.json`: jeden `h1`, który jest pierwszym nagłówkiem
     w `<main>`, a w całym dokumencie (razem ze stopką) bez przeskoku poziomu w dół o więcej niż jeden. Poziom to
     `aria-level`, gdy jest liczbą całkowitą ≥ 1, inaczej numer znacznika. Strona główna, kontakt, polityka i 404
     nie są objęte regułą. Na wydaniu sprzed etapu reguła zgłasza przeskok w stopce na 7 podstronach (bez
     `aria-level`). Po zmianie układu przeskok znika na wszystkich podstronach. Stopka strony głównej ma od tego
     etapu `aria-level="2"`, ale strona główna nadal nie jest objęta regułą;
   - `tools/smoke-test.cjs`: dwa wąskie widoki telefonu (393×852 i 375×667) dla strony głównej i podstron. Sprawdzają
     brak przewijania w poziomie, a przy błędzie wypisują do trzech elementów poza oknem. Z `--zrzuty` robią też
     pełny zrzut. Geometria strony głównej względem bazy zostaje dla 1280 i 390 px.
6. Strona główna: `tools/baseline/index.baza.html` to migawka z `main` (`a3ce70d`, po T-022). `tools/baseline/index.html`
   to ta baza z siedmioma zmianami atrybutów. `tools/etapy/zmiana-strony-glownej.json` to etap „8” z trzema wpisami
   `atrybuty`. Szczegóły w sekcji „Strona główna: różnice migawki względem bazy”.
7. `tools/dom-contract.json`: kontrakt policzony przez PM z builda CI (rundy niżej).
8. Pomiar Lighthouse w CI (w repozytorium nie było żadnego, a na VPS nie da się go uruchomić):
   - `tools/lighthouse.cjs` z testami i konfiguracją `tools/lighthouse.json` (strona, progi, wersja Lighthouse 13.6.0,
     3 przebiegi, mediana), skrypt `test:lighthouse` w `package.json`;
   - osobny workflow `.github/workflows/lighthouse.yml` dla PR. Próg niespełniony kończy go błędem, ale nie blokuje
     artefaktu wydania z `ci.yml`;
   - Lighthouse uruchamia się przez `npx` w dokładnej wersji. Nie jest zależnością w `package.json`, bo pliku
     `package-lock.json` nie da się odtworzyć na VPS;
   - build jest podawany lokalnie pod nazwą hosta produkcji (TLS z certyfikatem samopodpisanym, gzip), tak jak
     w teście dymnym. Dzięki temu audyt adresu kanonicznego ocenia stronę, a nie środowisko. To nie jest pomiar produkcji;
   - status nazywa się `Lighthouse podstron` i pojawia się w każdym PR. Gdy PR zmienia tylko `kono-state/` albo
     `README.md`, job kończy się sukcesem bez pomiaru, więc wymagany status nie blokuje PR-ów z samymi kartami.
9. Scalenie `origin/main` (PR #23, T-022) przez commit scalenia `3922b6c`. Kontrakt wzięty z `main` i przeliczony
   przez PM z builda CI (runda 4).

## Runda 1 — wynik CI (2026-11-22, przed dociągnięciem `main`)

- Przebieg dla `9312c78` (run 45023421165). Astro zbudowało 12 stron. Walidator zgłosił wyłącznie błędy zapowiedziane
  przy niezmienionym kontrakcie: nadmiarowy plik `finanse.html`, brak pliku kadru, inna suma `sitemap.xml`
  i niezgodność siedmiu podstron z kontraktem (odnośnik „Finanse” i `aria-level` w stopce). Pozostałe pięć kroków
  kontroli przeszło; kontrola treści objęła osiem podstron.
- Strona główna bez zmian: migawka identyczna z bazą.

## Runda 2 (2026-11-22, przed dociągnięciem `main`)

- Kadr `public/assets/video/finanse-kadr.jpg` z artefaktu `media-<sha>`: 120 982 B przy limicie 150 000 B,
  1600×900, sha256 `7f459331…89ba`.
- Kontrakt policzony z builda CI z dołożonym kadrem (`tools/update-contract.cjs`). Zmienione wpisy: siedem
  wcześniejszych podstron i `sitemap.xml`; nowe: `finanse.html` i kadr. `index.html`, `kontakt.html`,
  `polityka-prywatnosci.html` i `404.html` bez zmian.
- Przebieg dla `350e25d` (run 45023639319): `check:dist` zielone, ale test dymny pokazał 2 px przewijania w poziomie
  na 375 px na wszystkich ośmiu podstronach (opis w „Ustaleniach”, punkt „Nagłówek na wąskich telefonach”).

## Runda 3 — poprawka nagłówka (2026-11-22, przed dociągnięciem `main`)

- Reguła w `podstrony.css` i wersja `?v=2`. Kontrakt policzony z builda rundy 2 z naniesioną tą samą zmianą
  (nowy plik stylu i `?v=2` w ośmiu podstronach). Zmienione wpisy: osiem podstron i `assets/css/podstrony.css`.
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach: 63 pliki, 12/12 stron, testy narzędzi 104/104.
- Manifest tej rundy: `04337bcbad4bed774ddba78c8b09b089846ff8087bc309b2d712cfc8c0a84854`, potwierdzony przez CI dla
  `cbeae8a` (run 45024310484). Zastąpiony manifestem z rundy 4.

## Runda 4 — po dociągnięciu `main` i decyzjach właściciela (2026-11-22)

- Przebieg dla `6958d09` (run 45027819814) przy kontrakcie z `main`. Walidator zgłosił wyłącznie zapowiedziane
  różnice: nadmiarowe `finanse.html` i kadr, inne sumy `styles.css` i `sitemap.xml` oraz niezgodność wszystkich
  11 stron z kontraktem. Powody: `styles.css?v=5` na każdej stronie; na podstronach także `podstrony.css?v=3`,
  odnośnik „Finanse” i `aria-level`; na stronie głównej siedem atrybutów. Pozostałe pięć kroków przeszło,
  w tym porównanie strony głównej z bazą.
- Zbudowany `index.html` jest bajtowo równy migawce `tools/baseline/index.html`. Kadr z ponownego renderu ma tę samą
  sumę co plik w repozytorium.
- Kontrakt policzony z tego builda (`tools/update-contract.cjs`): 12 stron, 52 pliki publiczne. Lokalnie `check-all`
  przechodzi we wszystkich 6 krokach, testy narzędzi 108/108.
- Przewidziany manifest wydania: `84317a14dcadbec3151d2e8c1813f024d8b0ec105d621cc3e1df135a619eb2e5`.

## Wynik CI (2026-11-22)

Przebieg dla `15d0da1` (run 45028068177), zielony:

- `check:dist`: 6 z 6 kroków, 66 plików, 12/12 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `84317a14dcadbec3151d2e8c1813f024d8b0ec105d621cc3e1df135a619eb2e5`, ten sam co przewidziany.
- Strona główna względem `main`: siedem zmian atrybutów (sekcja „Strona główna: różnice migawki względem bazy”).
  Wysokości nagłówka, sekcji i stopki na 1280 i 390 px równe bazie.
- Test dymny: 261 z 261, 0 błędów, 0 pominiętych. Strona główna i wszystkie osiem podstron bez przewijania
  w poziomie na 393 i 375 px.
- Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 108 z 108.
- Zrzuty 1280, 390, 393 i 375 px w artefakcie `podglad-<sha>`.

## Lighthouse (2026-11-22)

Przebieg dla `15d0da1` (run 45028068221), Lighthouse 13.6.0, telefon, symulowane łącze, mediana z 3 przebiegów:

| Kategoria | Wynik | Próg | Przebiegi |
|---|---|---|---|
| Wydajność | 97 | 90 | 97, 96, 97 |
| Dostępność | 96 | 95 | 96, 96, 96 |
| SEO | 100 | 100 | 100, 100, 100 |

- Pomiar dotyczy builda z CI podawanego lokalnie, a nie produkcji. W pięciu przebiegach workflow w tym PR mediana
  wydajności wynosiła 96 albo 97, dostępność 96, SEO 100.
- Jedyny niezaliczony audyt to `color-contrast`. Dotyczy 58 elementów w sekcjach poniżej pierwszego ekranu, które
  w chwili pomiaru czekają na animację wejścia (`.js-motion .reveal` w `styles.css` ma `opacity: .16`). Zmierzone
  barwy `#d9d9d9` i `#e6e5e6` to kolory tekstu `--ink` i `--ink-2` przy tej przezroczystości, a nie kolory po
  wejściu sekcji. Animacja jest wspólna ze stroną główną, więc zostaje bez zmian.
- Audyt kolejności nagłówków przechodzi.
- Przesunięcie układu (CLS) 0,10–0,11 w trzech przebiegach: `h1` przestawia się po wczytaniu kroju pisma. Kroje
  i ich wczytywanie są wspólne dla całego serwisu.

## Ustalenia

- **KSeF.** To nazwa systemu państwowego, a nie dostawcy. Dlatego właściciel dopuścił ją na podstronach
  (zlecenie etapu 8 z 22.11.2026). Reguła D-033 dla nazw dostawców zostaje bez zmian. Pozostałe nazwy z listy
  dalej są błędem.
- **KSeF w treści.** Strona nie podaje dat ani progów z przepisów i nie obiecuje konkretnej drogi pobierania faktur.
  Mówi tylko tyle, że faktura z KSeF ma ustaloną strukturę, więc jej pól nie trzeba odczytywać z obrazu.
  Drogę przekazania faktur do programu księgowego i postępowanie z fakturami spoza KSeF ustala audyt.
- **Modele AI i miejsce wdrożenia.** Strona nie rozstrzyga, czy dane klienta przetwarzają modele AI
  (`BEZPIECZENSTWO.aiNaDanychKlienta` jest `null`). Nie obiecuje też wdrożenia u klienta ani w jego chmurze
  (`BEZPIECZENSTWO.wdrozenieUKlienta` jest `null`).
- **Wdrożenia.** W `src/data/dowody.mjs` nie ma wdrożenia z działu finansów. Strona pokazuje opis z innego działu
  i nazywa to wprost: inny dział, ten sam mechanizm. Nie pisze, że REVAGY ma albo nie ma wdrożeń w finansach.
- **Film.** Strona ma miejsce na film w stanie „kadr”. Film powstanie w osobnym etapie. Scena ma stałe miejsca
  dla wszystkich elementów, nieruchome tło i `window.render(t)`, który już woła `TL.apply(t)`.
- **Przycisk filmu (otwarty punkt dla etapu filmowego).** W stanie „kadr” strona nie ma przycisku filmu.
  Wniosek z review: przycisk ma zmieniać tylko `aria-pressed`, bez równoległej zmiany `aria-label`. Przycisk z samymi
  ikonami musi zachować stałą nazwę dostępną (na przykład „Wstrzymaj film”). Dotyczy to
  `src/components/MiejsceNaFilm.astro` i `public/assets/js/app.js:110-111`. `app.js` jest wspólny ze stroną główną.
  Właściciel przypisał tę zmianę do etapu filmowego T-023 (decyzja 4).
- **Nagłówki.** W `<main>` ostatni nagłówek to `h2` w sekcji `#wezwanie`, a po nim stoją nagłówki kolumn stopki.
  Przeskok jest usunięty na podstronach i na stronie głównej: stopki w `PodstronaLayout.astro` i `BaseLayout.astro`
  mają `h4` z `aria-level="2"`. Kontakt, polityka i 404 nie mają stopki z nagłówkami. Reguła kontroli obejmuje cały
  dokument podstrony.

- **Nagłówek na wąskich telefonach.** Nowy test wąskich telefonów w CI pokazał 2 px przewijania w poziomie na
  wszystkich 8 podstronach przy szerokości 375 px. Na 390 i 393 px było bez przewijania. Przyczyna: elementy wiersza
  `.header-row` mają `flex: none` i się nie kurczą. Logo (ok. 121 px), odstęp 24 px i `.header-actions`
  („Umów konsultację” 163 px + 8 px + przycisk menu 44 px) przy lewym marginesie 16 px kończą się na ok. 377 px.
  To błąd zastany we wspólnych stylach (`styles.css`, linie 142, 167, 185–191). Najpierw (runda 3) poprawka objęła
  tylko podstrony, w `podstrony.css?v=2`. Po decyzji właściciela 5 reguła jest w `styles.css` (`?v=5`), przy stylach
  nagłówka: przy `max-width: 389px` jest `gap: 8px` w `.header-row` i `padding: 0 12px` dla
  `.header-actions .btn-dark`. Obie wartości już były w `styles.css`. Działa teraz także na stronie głównej,
  a z `podstrony.css` (`?v=3`) zniknęła. Prawy brzeg wypada na ok. 353 px, więc nagłówek mieści się też na 360 px.
  Test wąskich telefonów obejmuje stronę główną i przy błędzie wypisuje do trzech elementów wychodzących poza okno.

## Decyzje właściciela (2026-11-22)

1. **Menu strony głównej:** tak, tylko dwa odnośniki „Finanse” w `BaseLayout.astro` (panel „Dla działów” w menu
   i kolumna „Dla działów” w stopce) na `finanse.html`. Kafel w `#zastosowania` bez zmian.
2. **Treść „Po wdrożeniu” i odpowiedzi w pytaniach (w tym KSeF):** zostają jako propozycje. Właściciel poprawi je
   w przeglądzie PR. Lista do odhaczenia jest w opisie PR.
3. **Opis wdrożenia z innego działu:** zostaje, z podpisem „Grupa spółek. Raport dla zarządu, nie dział finansów.”
   W rejestrze `is-stan-zalogi-568-539.jakMierzone` to „Odczyt stanu załogi z dwóch systemów. Data odczytu do
   uzupełnienia przez właściciela.” `wd-raport-6-godzin-do-zera.jakMierzone` zostaje `null`. Liczba ma źródło
   (materiały właściciela, D-020, D-034), ale brakuje opisu pomiaru.
   Brakuje: daty odczytu stanu załogi i opisu pomiaru dla „ok. 6 godzin tygodniowo”.
4. **Film:** następny etap. Karta T-023 `film-6-finanse`, gałąź `feat/film-6-finanse` od `main` po scaleniu PR #24,
   tym samym procesem co T-015–T-020. W tamtym etapie także przycisk filmu w `app.js`: zmienia się tylko
   `aria-pressed`, a nazwa dostępna jest stała. Dotyczy też strony głównej.
5. **Strona główna na 375 px i stopka:** tak, tym samym kodem co na podstronach (reguła nagłówka w `styles.css`,
   `aria-level="2"` w stopce `BaseLayout.astro`).
6. **PR #23:** scalony. `main` (`a3ce70d`) dociągnięty do tej gałęzi przez commit scalenia.
7. **Lighthouse:** zostaje jako workflow. Ochronę gałęzi ustawia właściciel. Nazwa statusu: `Lighthouse podstron`.

## Strona główna: różnice migawki względem bazy

Baza `tools/baseline/index.baza.html` to `tools/baseline/index.html` z `main` (`a3ce70d`). Migawka
`tools/baseline/index.html` różni się od niej wyłącznie siedmioma wartościami atrybutów:

| Linia | Znacznik | Atrybut | Było | Jest |
|---|---|---|---|---|
| 30 | `link` (arkusz stylów) | `href` | `assets/css/styles.css?v=4` | `assets/css/styles.css?v=5` |
| 61 | `a` „Finanse” w panelu „Dla działów” menu | `href` | `#zastosowania` | `finanse.html` |
| 661 | `h4` „Rozwiązania” w stopce | `aria-level` | brak | `2` |
| 665 | `h4` „Dla działów” w stopce | `aria-level` | brak | `2` |
| 666 | `a` „Finanse” w kolumnie „Dla działów” stopki | `href` | `#zastosowania` | `finanse.html` |
| 669 | `h4` „Firma” w stopce | `aria-level` | brak | `2` |
| 673 | `h4` „Kontakt” w stopce | `aria-level` | brak | `2` |

Teksty, znaczniki i ich kolejność zostają bez zmian. Wygląd od 390 px wzwyż się nie zmienia. Poniżej 390 px nagłówek
ma mniejszy odstęp (8 px zamiast 24 px) i węższy przycisk „Umów konsultację” (padding 12 px zamiast 16 px).

## Do uzupełnienia przez właściciela

Ten etap nie dodaje nowych pól w danych strony. Strona korzysta z istniejących pól, które są dziś `null`:

- `src/data/dowody.mjs`, wpis `stan-zalogi`: nazwa, etykieta powiązania, skala, „jak mierzone”, cytat;
  `zdanieUjawnienia` (wspólne dla podstron).
- `src/data/bezpieczenstwo.mjs`: `aiNaDanychKlienta`, `wdrozenieUKlienta`. Strona finansów ich nie pokazuje.
- `tools/rejestr-twierdzen.json`: data odczytu stanu załogi (`is-stan-zalogi-568-539.jakMierzone`) i opis pomiaru
  „ok. 6 godzin tygodniowo” (`wd-raport-6-godzin-do-zera.jakMierzone`, dziś `null`).

## Scalenie (2026-11-22)

- PR #24 scalony do `main` commitem `0e72e39d14418df7a88129c3ddebb2da0090dd85`. Scalony został czubek `15d0da1`;
  commit z uzupełnieniem tej karty powstał chwilę po scaleniu i wchodzi do `main` razem z PR etapu T-023.
- CI na `main` dla `0e72e39` (run 45028365694): zielone, manifest wydania
  `84317a14dcadbec3151d2e8c1813f024d8b0ec105d621cc3e1df135a619eb2e5`, ten sam co przewidziany. Test dymny 261 z 261.
- Niewdrożone. Wydanie na serwer wymaga osobnej zgody właściciela dla konkretnej wersji.
- Gałąź pomocniczą `podglad/etap-8-finanse` (zrzuty do opisu PR) usuwa właściciel.

## Wdrożenie (2026-11-22)

- Wdrożone na produkcję w wydaniu `43efbf5f8a246d33a9c4f68f3552616c2665fc7a` (czubek `main` po scaleniu PR #23–#26),
  manifest `f1754f7d53b323fccf58058de6541a0aeb1e89955602658c23b407c4d6dcf097`. Poprzednie wydanie: `5fe5c29571e12cd4221d2a146b7d53fba3037816`.
- Po wydaniu: `/finanse.html` odpowiada 200 i jest bajtowo równa plikowi z CI, „Finanse” na stronie głównej prowadzi
  do `finanse.html`, strony współdzielone i konfiguracja serwera bez zmian.
