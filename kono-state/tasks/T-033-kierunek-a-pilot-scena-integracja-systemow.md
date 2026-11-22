---
id: T-033
title: Kierunek A, etap A1 — scena pierwszego ekranu na /integracja-systemow.html (pilot)
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-23
branch: skibiai/trusting-shannon-g9jhj1
base: main (da8d1ae), odświeżona merge z main (7b6fc4c) 22.11.2026
depends_on: T-026
pr: https://github.com/dskibickikono-lang/RevAGY/pull/38 (scalony do main, a653e8a; ten sam PR co T-026: moodboard, studium i pilot)
sha: ed443c9
decisions: [D-015, D-021, D-022, D-031, D-033, D-045, D-048]
---

# T-033 — Kierunek A, etap A1: scena pierwszego ekranu (pilot)

Wcześniej T-031, przenumerowana 22.11.2026 z powodu kolizji z T-031 z PR #40. W PR #38 i w commitach sprzed odświeżenia występuje jako T-031.

## Cel

Pierwszy ekran podstrony `/integracja-systemow.html` jako ciemna scena z poświatą w zaokrąglonym kontenerze:
tytuł, wstęp, dwa przyciski i linia autora po lewej, plakat filmu po prawej. Reszta strony bez zmian.
To pilot kierunku A wybranego przez właściciela (D-048); plan zatwierdzony odpowiedzią „tak” z 22.11.2026.

## Zakres

- A0: wpis D-048 w rejestrze decyzji.
- A1: nowy komponent sceny, układ w `podstrony.css`, zamiana pierwszej sekcji strony pilotażowej,
  wersja arkusza podstron, kontrakt DOM.

Poza zakresem: strona główna, `styles.css`, `BaseLayout.astro`, teksty strony, pozostałe podstrony (poza numerem wersji
arkusza w ich `<link>`), scena dowodu (A2), pozostałe strony (A3), pozycje P0 z audytu.

## Co zmieniłem

| Plik | Zmiana |
| --- | --- |
| `src/components/ScenaPodstrony.astro` | nowy: kontener `.cta` + poświata `.hero-shade` (obie klasy ze `styles.css`), slot na treść, plakat filmu z `filmy.mjs`, adres plakatu przez `zasob()` (skrót treści, T-030) |
| `public/assets/css/podstrony.css` | 9 wierszy układu sceny: odstęp jak w `.hero`, dwie kolumny, kolor linii autora `--on-night-2`, ramka plakatu; reguła łamania długich przycisków rozszerzona o scenę |
| `src/pages/integracja-systemow.astro` | pierwsza sekcja: `hero-outer` + `ScenaPodstrony`; przyciski `btn-light` i `btn-glass` (jak w hero strony głównej); teksty i adresy bez zmian |
| `src/layouts/PodstronaLayout.astro` | bez zmian po odświeżeniu: ręczne `podstrony.css?v=3` → `?v=4` usunięte, wersję w adresie daje skrót treści (T-030) |
| `tools/dom-contract.json` | odtworzony `update-contract.cjs`: suma arkusza, sumy 9 podstron (numer wersji arkusza), kontrakt strony pilotażowej |
| `kono-state/decisions/REJESTR_DECYZJI_BIZNESOWYCH.md` | D-048 |
| `kono-state/notes/kierunek-a-a1/` | zrzuty przed i po, pomiary |

## Dwie decyzje podjęte w trakcie, obie do Twojej oceny

1. **Poświata z hero zamiast poświaty paska końcowego.** Plan mówił „scena z poświatą”. Poświata paska końcowego
   (`.cta-glow`) ma pomarańcz w lewym dolnym rogu, czyli pod przyciskami i linią autora: zmierzony kontrast linii
   autora spadał do 2,86:1, a napisu na szklanym przycisku do 4,38:1. Z poświatą hero (`.hero-shade`: śliwka pod
   tekstem, pomarańcz niżej pośrodku) najgorszy kontrast to 7,5:1. Scena jest przez to spokojniejsza niż pasek końcowy.
   **Stan:** zaakceptowane przez właściciela 22.11.2026.
2. **Na telefonie (do 560 px) plakat nie jest pokazywany.** Plan mówił „w scenie cały plakat”. Na telefonie plakat ma
   ok. 318 px szerokości, jest nieczytelny, a jako największy element pierwszego ekranu wydłużał LCP z ok. 1,2 s do
   2,7 s i obniżał wydajność w Lighthouse ze 100 do 95. Po ukryciu wynik wraca do 100. Od 561 px plakat jest widoczny
   (pod tekstem do 1100 px, obok tekstu powyżej). Cofnięcie to jeden wiersz w `podstrony.css`.
   **Stan:** zaakceptowane przez właściciela 22.11.2026.

## Poprawka po czerwonym Lighthouse w CI (22.11.2026, po odświeżeniu do main)

- Po scaleniu PR #40 pomiar Lighthouse w CI objął stronę pilotażową. Wynik na 7debfcc: wydajność 88 przy progu 90
  (trzy przebiegi po 88), przyczyna: CLS 0,24 przypisany warstwie poświaty sceny (`.hero-shade`).
- Mechanizm: na maszynie CI krój zastępczy jest znacznie szerszy niż Onest. Do czasu doczytania kroju scena jest
  o ok. 60 px wyższa, potem się kurczy. Poświata miała górę liczoną w procentach wysokości sceny (`inset: -25%`
  ze `styles.css`), więc przesuwała się razem z nią, a że zakrywa całą scenę, przeglądarka liczyła to jako przesunięcie
  prawie całego ekranu.
- W piaskownicy sesji tego nie było widać, bo krój zastępczy to tam Inter o podobnych wymiarach (CLS 0,027).
  Odtworzyłem warunki CI lokalnie: krój zastępczy DejaVu Sans i krój docelowy opóźniony o 0,9 s.
- Poprawka: jeden wiersz w `podstrony.css` — `.scena .hero-shade { inset: 0 -25% -25%; }` (góra poświaty stała).

| Pomiar (krój zastępczy DejaVu Sans, krój docelowy opóźniony) | CLS |
| --- | --- |
| Scena przed poprawką | 0,271 |
| Scena po poprawce | 0,093 |
| „Finanse”, stary układ, dla porównania | 0,102 |
| „Kontakt”, dla porównania | 0,110 |

Dwie obserwacje poza zakresem tej karty: ta sama zależność dotyczy poświaty na stronie kontaktu (`.cta-glow`),
a podstrony nie wczytują kroju tytułów z wyprzedzeniem (strona główna to robi), stąd przesunięcie tekstu na każdej z nich.

## Wynik kryteriów odbioru

| # | Kryterium | Wynik |
| --- | --- | --- |
| 1 | `dist/index.html` identyczny bajtowo | tak: `cmp` bez różnic, suma `eb16834e…` przed i po |
| 2 | Zrzuty przed i po | `kono-state/notes/kierunek-a-a1/`: 1440, 390, 360 px |
| 3 | Tytuł i oba przyciski nad zgięciem na telefonie | tak: 390×844 — przyciski 381–505 px; 360×740 — 442–566 px |
| 4 | Kontrast na poświacie ≥ 4,5:1 | tak: najgorszy piksel tła w 6 fazach ruchu — tytuł 18,3:1, wstęp 13,3:1, linia autora 7,5:1, napis szklanego przycisku 10,4:1 |
| 5 | Fokus i ograniczony ruch | obrys `3px` `#ff5b14` na obu przyciskach sceny; przy `prefers-reduced-motion` 0 biegnących animacji, treść w pełni widoczna |
| 6 | `check-podstrony-css` | OK |
| 7 | Testy repo na Linuksie | patrz niżej |
| 8 | Lighthouse nie gorszy | lokalnie: wydajność 100 → 100, dostępność 96 → 96, SEO 100 → 100 (mediana z 3 przebiegów); LCP ok. 1,2 s przed i po; CLS 0–0,014 → 0,023–0,027. W CI przed poprawką poświaty: 88 (poniżej progu 90); wynik po poprawce — patrz „Stan” |

## Testy (Linux, piaskownica sesji, Node 22.23.5)

Build z publicznym kluczem witryny Turnstile z migawki `tools/baseline/index.html`, tak jak w CI.

| Polecenie | Przed zmianą | Po zmianie |
| --- | --- | --- |
| `npm run check:dist` | 6 z 6 kroków OK, 108 testów narzędzi | 6 z 6 kroków OK, 108 testów narzędzi |
| `npm run test:smoke -- --serve=dist` | 271 z 271 | 271 z 271 |
| `npm run test:deploy` | nie uruchamiałem | 16 z 16 |
| `node tools/lighthouse.cjs` (strona pilotażowa) | 100 / 96 / 100 | 100 / 96 / 100 |
| `npm run test:form` | błąd | błąd |

Zastrzeżenia:

- `test:form` nie przechodzi w tej piaskownicy także na niezmienionym `main` (ten sam błąd: zerwane połączenie przy
  bardzo długim adresie testowym). Pierwszy krok testu — osobny build z formularzem i pełny kontrakt wydania —
  przechodzi z tą zmianą. Wynik całego testu trzeba wziąć z CI.
- Testy przeglądarkowe uruchomiłem Playwrightem piaskownicy (1.63) zamiast wersji z repo (1.65.1), bo piaskownica ma
  przeglądarkę tylko dla tej pierwszej. Repo nie zostało w tym celu zmienione.
- Lighthouse to pomiar lokalny na symulowanym łączu, nie produkcja. Pomiar strony pilotażowej zrobiłem własnym plikiem
  konfiguracji; `tools/lighthouse.json` mierzy w CI tylko `finanse.html`.
- Dostępność 96 w Lighthouse wynika z zastanego stanu: sekcje z klasą `.reveal` mają przed wejściem w ekran 16% krycia
  i audyt kontrastu liczy je jako nieczytelne (62 elementy przed, 59 po). To nie jest skutek tej zmiany.

## Ryzyka przy scalaniu

- Otwarte PR #39 i #40 też odtwarzają `tools/dom-contract.json`; #40 zmienia sposób wersjonowania adresów zasobów
  w `PodstronaLayout.astro`. Kto scala drugi, musi odtworzyć kontrakt (`node tools/update-contract.cjs dist`).
- Rejestr decyzji: D-046 jest użyte w obu tamtych PR do różnych decyzji, D-047 w #40. Mój wpis to D-048.

## Stan

Obie decyzje zaakceptowane przez właściciela 22.11.2026. PR #38 scalony do main (commit a653e8a). Gotowe do wdrożenia na produkcję.
