---
id: T-021
title: Etap 8 — podstrona działowa „Finanse” (/finanse.html)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-8-finanse
base: main (e10cab9)
depends_on: T-014
pr: https://github.com/dskibickikono-lang/RevAGY/pull/24
sha: cbeae8a8d0bf7dbc8463cedd7740dc59016d69c9 (zmiany)
decisions: [D-015, D-016, D-018, D-019, D-021, D-022, D-025, D-028, D-029, D-031, D-033, D-034]
---

# T-021 — Etap 8: Finanse

## Cel

Podstrona działowa dla dyrektora finansowego, głównej księgowej i właściciela firmy 5–250 osób (D-016).
Pokazuje trzy procesy w kolejności z menu „Dla działów”: faktury kosztowe, windykację i uzgodnienia.
Przy każdym procesie są trzy części: „Dziś”, „Po wdrożeniu” i „Co zostaje człowiekowi”. Wejście jak na pozostałych
podstronach: bezpłatna konsultacja, płatny audyt, wdrożenie (D-019, D-025, D-028). Strona główna zostaje
bez zmian (D-015, D-021).

## Zakres

1. Nowe pliki:
   - `src/pages/finanse.astro` na układzie `PodstronaLayout` (D-031);
   - scena kadru `tools/scenes/finanse.html`: faktura kosztowa po odczycie i kontroli czeka na akceptację człowieka.
2. Miejsce na film w stanie „kadr” (D-022): wpis `finanse` w `src/config/filmy.mjs`, bez `czasSekundy`
   i `dataPublikacji`. Kadr `finanse-kadr.jpg` renderuje CI (`render-media.yml`, D-032).
3. Opis wdrożenia z innego działu: `stan-zalogi` (raport zarządu z kilku źródeł), anonimowy, z treścią
   i liczbami jak na `/wdrozenia.html` (D-034), z `<Ujawnienie />` pod opisem.
4. Pliki wspólne:
   - `src/layouts/PodstronaLayout.astro`: dwa odnośniki „Finanse” (panel „Dla działów” w menu i kolumna
     „Dla działów” w stopce) z `./#zastosowania` na `finanse.html`. Cztery nagłówki kolumn stopki (`h4`) dostają
     `aria-level="2"`, więc po ostatnim `h2` w `<main>` nie ma przeskoku poziomu. Znacznik `h4` i wygląd zostają
     (styl `.site-footer h4` w `styles.css`). Komentarz nagłówkowy układu opisuje wyjątek „Finanse”;
   - `tools/podstrony.json`, `public/sitemap.xml`, `tools/rejestr-twierdzen.json`.
5. Narzędzia:
   - `tools/nazwy-systemow.json`: „KSeF” przeniesiony z listy `nazwy` do udokumentowanej listy `wyjatki`;
   - `tools/check-tresc.cjs` sprawdza format wyjątków i to, że wyjątek nie stoi jednocześnie na liście nazw;
   - nowa reguła kontroli treści dla stron z `tools/podstrony.json`: jeden `h1`, który jest pierwszym nagłówkiem
     w `<main>`, a w całym dokumencie (razem ze stopką) bez przeskoku poziomu w dół o więcej niż jeden. Poziom to
     `aria-level`, gdy jest liczbą całkowitą ≥ 1, inaczej numer znacznika. Strona główna, kontakt, polityka i 404
     nie są objęte regułą. Na obecnym wydaniu reguła zgłasza przeskok w stopce na 7 podstronach (bez `aria-level`).
     Po zmianie układu znika on na wszystkich podstronach;
   - `tools/smoke-test.cjs`: dwa wąskie widoki telefonu dla podstron (393×852 i 375×667). Sprawdzają brak
     przewijania w poziomie, a z `--zrzuty` robią też pełny zrzut.
6. Strona główna bez zmian: `tools/etapy/zmiana-strony-glownej.json` z pustymi listami, `index.baza.html`
   równe `index.html`.
7. `tools/dom-contract.json`: kontrakt policzony przez PM z builda CI (rundy niżej).
8. Pomiar Lighthouse w CI (w repozytorium nie było żadnego, a na VPS nie da się go uruchomić):
   - `tools/lighthouse.cjs` z testami i konfiguracją `tools/lighthouse.json` (strona, progi, wersja Lighthouse 13.6.0,
     3 przebiegi, mediana), skrypt `test:lighthouse` w `package.json`;
   - osobny workflow `.github/workflows/lighthouse.yml` dla PR. Próg niespełniony kończy go błędem, ale nie blokuje
     artefaktu wydania z `ci.yml`;
   - Lighthouse uruchamia się przez `npx` w dokładnej wersji. Nie jest zależnością w `package.json`, bo pliku
     `package-lock.json` nie da się odtworzyć na VPS;
   - build jest podawany lokalnie pod nazwą hosta produkcji (TLS z certyfikatem samopodpisanym, gzip), tak jak
     w teście dymnym. Dzięki temu audyt adresu kanonicznego ocenia stronę, a nie środowisko. To nie jest pomiar produkcji.

## Runda 1 — wynik CI (2026-11-22)

- Przebieg dla `9312c78` (run 45023421165). Astro zbudowało 12 stron. Walidator zgłosił wyłącznie błędy zapowiedziane
  przy niezmienionym kontrakcie: nadmiarowy plik `finanse.html`, brak pliku kadru, inna suma `sitemap.xml`
  i niezgodność siedmiu podstron z kontraktem (odnośnik „Finanse” i `aria-level` w stopce). Pozostałe pięć kroków
  kontroli przeszło; kontrola treści objęła osiem podstron.
- Strona główna bez zmian: migawka identyczna z bazą.

## Runda 2 (2026-11-22)

- Kadr `public/assets/video/finanse-kadr.jpg` z artefaktu `media-<sha>`: 120 982 B przy limicie 150 000 B,
  1600×900, sha256 `7f459331…89ba`.
- Kontrakt policzony z builda CI z dołożonym kadrem (`tools/update-contract.cjs`). Zmienione wpisy: siedem
  wcześniejszych podstron i `sitemap.xml`; nowe: `finanse.html` i kadr. `index.html`, `kontakt.html`,
  `polityka-prywatnosci.html` i `404.html` bez zmian.
- Przebieg dla `350e25d` (run 45023639319): `check:dist` zielone, ale test dymny pokazał 2 px przewijania w poziomie
  na 375 px na wszystkich ośmiu podstronach (opis w „Ustaleniach”, punkt „Nagłówek na wąskich telefonach”).

## Runda 3 — poprawka nagłówka (2026-11-22)

- Reguła w `podstrony.css` i wersja `?v=2`. Kontrakt policzony z builda rundy 2 z naniesioną tą samą zmianą
  (nowy plik stylu i `?v=2` w ośmiu podstronach). Zmienione wpisy: osiem podstron i `assets/css/podstrony.css`.
- Lokalnie `check-all` przechodzi we wszystkich 6 krokach: 63 pliki, 12/12 stron, testy narzędzi 104/104.
- Przewidziany manifest wydania: `04337bcbad4bed774ddba78c8b09b089846ff8087bc309b2d712cfc8c0a84854`.

## Wynik CI (2026-11-22)

Przebieg dla `cbeae8a` (run 45024310484), zielony:

- `check:dist`: 6 z 6 kroków, 63 pliki, 12/12 stron zgodnych z kontraktem i z zapisanym HTML.
  Manifest `04337bcbad4bed774ddba78c8b09b089846ff8087bc309b2d712cfc8c0a84854`, ten sam co przewidziany.
- Strona główna bez zmian względem `main`.
- Test dymny: 232 z 233, 0 błędów, 1 pominięte (geometria strony głównej względem bazy, bo strona główna jest
  identyczna z bazą). `finanse.html` bez przewijania w poziomie na 1280, 390, 393 i 375 px.
  Testy `wydanie.sh`: 16 z 16. Testy narzędzi: 104 z 104.
- Zrzuty 1280, 390, 393 i 375 px w artefakcie `podglad-<sha>`.

## Lighthouse (2026-11-22)

Przebieg dla `cbeae8a` (run 45024310523), Lighthouse 13.6.0, telefon, symulowane łącze, mediana z 3 przebiegów:

| Kategoria | Wynik | Próg | Przebiegi |
|---|---|---|---|
| Wydajność | 97 | 90 | 97, 96, 97 |
| Dostępność | 96 | 95 | 96, 96, 96 |
| SEO | 100 | 100 | 100, 100, 100 |

- Pomiar dotyczy builda z CI podawanego lokalnie, a nie produkcji.
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
  `src/components/MiejsceNaFilm.astro` i `public/assets/js/app.js:110-111`. `app.js` jest wspólny ze stroną główną,
  więc zmiana wymaga osobnej decyzji właściciela.
- **Nagłówki.** W `<main>` ostatni nagłówek to `h2` w sekcji `#wezwanie`, a po nim stoją nagłówki kolumn stopki.
  Na podstronach przeskok jest usunięty: stopka w `PodstronaLayout.astro` ma `h4` z `aria-level="2"`, a reguła
  kontroli obejmuje cały dokument podstrony. Stopka w `BaseLayout.astro` (strona główna, kontakt, polityka, 404) ma
  dalej zwykłe `h4`. Na stronie głównej zostaje przeskok `h2 → h4`.

- **Nagłówek na wąskich telefonach.** Nowy test wąskich telefonów w CI pokazał 2 px przewijania w poziomie na
  wszystkich 8 podstronach przy szerokości 375 px. Na 390 i 393 px było bez przewijania. Przyczyna: elementy wiersza
  `.header-row` mają `flex: none` i się nie kurczą. Logo (ok. 121 px), odstęp 24 px i `.header-actions`
  („Umów konsultację” 163 px + 8 px + przycisk menu 44 px) przy lewym marginesie 16 px kończą się na ok. 377 px.
  To błąd zastany we wspólnych stylach (`styles.css`, linie 142, 167, 185–191). Poprawka dotyczy tylko podstron:
  w `podstrony.css` przy `max-width: 389px` jest `gap: 8px` w `.header-row` i `padding: 0 12px` dla
  `.header-actions .btn-dark`. Obie wartości już są w `styles.css`. Prawy brzeg wypada wtedy na ok. 353 px, więc
  nagłówek mieści się też na 360 px. Wersja stylu podbita do `podstrony.css?v=2`. Test wąskich telefonów wypisuje
  teraz przy błędzie do trzech elementów wychodzących poza okno.

## Decyzje do podjęcia przez właściciela

1. **„Finanse” z menu i stopki strony głównej.** Na stronie głównej pozycja „Finanse” dalej prowadzi do
   `#zastosowania`. Podpięcie jej pod `finanse.html` wymaga zmiany `src/layouts/BaseLayout.astro`, czyli strony
   głównej. W tym etapie strona główna jest bez zmian. Gdyby właściciel się zgodził, trzeba by zmienić:
   - w `BaseLayout.astro`: `href` w panelu „Dla działów” menu (`<a href="#zastosowania"><strong>Finanse</strong>…`)
     i w kolumnie „Dla działów” stopki (`<a href="#zastosowania">Finanse</a>`) na `finanse.html`;
   - migawkę `tools/baseline/index.html`, bazę `tools/baseline/index.baza.html` i plik etapu
     `tools/etapy/zmiana-strony-glownej.json` z dwoma wpisami w `atrybuty`;
   - opcjonalnie odnośnik w kaflu „Finanse” w sekcji `#zastosowania` w `src/pages/index.astro`;
   - kontrakt `index.html` w rundzie 2.
   Zmienia się tylko atrybut `href`, więc układ i geometria sekcji zostają bez zmian. Te dwa odnośniki są tylko
   w `index.html`. `kontakt.html`, `polityka-prywatnosci.html` i `404.html` też używają `BaseLayout.astro`, ale mają
   skrócony nagłówek bez tych pozycji (sprawdzone na obecnym wydaniu).
2. **Przycisk filmu** (punkt w „Ustaleniach”): czy zmieniamy `MiejsceNaFilm.astro` i `app.js:110-111` tak, żeby
   przycisk zmieniał tylko `aria-pressed`, przy stałej nazwie dostępnej. Zmiana dotyczy także filmów strony głównej.
3. **Kolejność nagłówków w stopce `BaseLayout.astro`** (strona główna, kontakt, polityka, 404): czy dodajemy tam
   `aria-level="2"` tak samo jak na podstronach. To zmiana strony głównej (migawka, plik etapu, kontrakt).
   Na podstronach jest już poprawione.
4. **Treść „Po wdrożeniu” i odpowiedzi w pytaniach.** Część „Po wdrożeniu” w trzech procesach przygotował agent
   na podstawie opisu procesów w zleceniu. Dotyczy to zakresu automatyzacji, na przykład kontroli duplikatu
   i zmienionego rachunku dostawcy, harmonogramu przypomnień i raportu różnic. Tak samo powstały odpowiedzi
   w pytaniach, w tym brzmienie odpowiedzi o KSeF. Właściciel potwierdza je w przeglądzie PR albo wskazuje,
   co skreślić.
5. **Sekcja „Ten sam mechanizm w innym dziale”.** Czy zostaje opis `stan-zalogi`, czy sekcja znika do czasu
   opisu wdrożenia z działu finansów. Taki opis wprowadza właściciel (D-034).
6. **Nagłówek strony głównej na 375 px.** Strona główna ma ten sam nagłówek ze wspólnego `styles.css`, więc na 375 px
   najpewniej też wychodzi ok. 2 px poza ekran. Tego nie mierzyliśmy, bo test wąskich telefonów obejmuje tylko
   podstrony. Poprawka dla strony głównej wymaga zmiany `styles.css` i podbicia jego wersji, czyli zmiany
   strony głównej (migawka, plik etapu, kontrakt).
7. **Kolejność scalania z PR #23** (Bing, IndexNow, Clarity, T-022). Oba PR-y zmieniają te same pliki:
   `PodstronaLayout.astro`, `tools/dom-contract.json`, `tools/podstrony.json`, `tools/smoke-test.cjs`,
   `public/sitemap.xml`, `tools/etapy/zmiana-strony-glownej.json` i `README.md`. Drugi w kolejności wymaga
   dociągnięcia `main` i ponownego policzenia kontraktu.
8. **Pomiar Lighthouse jako wymagany status.** Workflow działa przy każdym PR. Żeby blokował scalenie, właściciel
   musi dodać go jako wymagany status w ochronie gałęzi `main`.

## Do uzupełnienia przez właściciela

Ten etap nie dodaje nowych pól. Strona korzysta z istniejących pól, które są dziś `null`:

- `src/data/dowody.mjs`, wpis `stan-zalogi`: nazwa, etykieta powiązania, skala, „jak mierzone”, cytat;
  `zdanieUjawnienia` (wspólne dla podstron).
- `src/data/bezpieczenstwo.mjs`: `aiNaDanychKlienta`, `wdrozenieUKlienta`. Strona finansów ich nie pokazuje.
