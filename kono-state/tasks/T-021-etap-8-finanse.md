---
id: T-021
title: Etap 8 — podstrona działowa „Finanse” (/finanse.html)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: feat/etap-8-finanse
base: main (e10cab9)
depends_on: T-014
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
     „Dla działów” w stopce) z `./#zastosowania` na `finanse.html`;
   - `tools/podstrony.json`, `public/sitemap.xml`, `tools/rejestr-twierdzen.json`.
5. Narzędzia:
   - `tools/nazwy-systemow.json`: „KSeF” przeniesiony z listy `nazwy` do udokumentowanej listy `wyjatki`;
   - `tools/check-tresc.cjs` sprawdza format wyjątków i to, że wyjątek nie stoi jednocześnie na liście nazw;
   - nowa reguła kontroli treści: w `<main>` pierwszy i jedyny `h1`, bez przeskoku poziomu nagłówka.
     Przechodzą ją wszystkie strony obecnego wydania;
   - `tools/smoke-test.cjs`: dwa wąskie widoki telefonu dla podstron (393×852 i 375×667). Sprawdzają brak
     przewijania w poziomie, a z `--zrzuty` robią też pełny zrzut.
6. Strona główna bez zmian: `tools/etapy/zmiana-strony-glownej.json` z pustymi listami, `index.baza.html`
   równe `index.html`.
7. `tools/dom-contract.json` bez zmian. Kontrakt policzy PM w rundzie 2.

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
- **Nagłówki.** W `<main>` ostatni nagłówek to `h2` w sekcji `#wezwanie`, a po nim w stopce układu stoją `h4`.
  To przeskok `h2 → h4` w całym dokumencie, taki sam na wszystkich podstronach i na stronie głównej. Poprawka wymaga
  zmiany stopki w `PodstronaLayout.astro` i `BaseLayout.astro`, więc w tym etapie zostaje bez zmian. Nowa reguła
  sprawdza tylko `<main>`.

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
3. **Kolejność nagłówków w stopce** (`h4` po `h2`): czy poprawiamy stopkę w obu układach. Zmiana dotyka strony głównej.

## Do uzupełnienia przez właściciela

Ten etap nie dodaje nowych pól. Strona korzysta z istniejących pól, które są dziś `null`:

- `src/data/dowody.mjs`, wpis `stan-zalogi`: nazwa, etykieta powiązania, skala, „jak mierzone”, cytat;
  `zdanieUjawnienia` (wspólne dla podstron).
- `src/data/bezpieczenstwo.mjs`: `aiNaDanychKlienta`, `wdrozenieUKlienta`. Strona finansów ich nie pokazuje.
