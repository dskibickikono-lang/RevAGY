---
id: T-031
title: Kierunek A, etap A1 — scena pierwszego ekranu na /integracja-systemow.html (pilot)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/trusting-shannon-g9jhj1
base: main (da8d1ae)
depends_on: T-026
pr: https://github.com/dskibickikono-lang/RevAGY/pull/38 (ten sam PR co T-026: moodboard, studium i pilot)
sha: (uzupełniane po commicie)
decisions: [D-015, D-021, D-022, D-031, D-033, D-045, D-048]
---

# T-031 — Kierunek A, etap A1: scena pierwszego ekranu (pilot)

Numer T-031, bo T-028, T-029 i T-030 są zajęte w otwartych PR innych kart (#39, #40).

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
| `src/components/ScenaPodstrony.astro` | nowy: kontener `.cta` + poświata `.hero-shade` (obie klasy ze `styles.css`), slot na treść, plakat filmu z `filmy.mjs` |
| `public/assets/css/podstrony.css` | 9 wierszy układu sceny: odstęp jak w `.hero`, dwie kolumny, kolor linii autora `--on-night-2`, ramka plakatu; reguła łamania długich przycisków rozszerzona o scenę |
| `src/pages/integracja-systemow.astro` | pierwsza sekcja: `hero-outer` + `ScenaPodstrony`; przyciski `btn-light` i `btn-glass` (jak w hero strony głównej); teksty i adresy bez zmian |
| `src/layouts/PodstronaLayout.astro` | `podstrony.css?v=3` → `?v=4` |
| `tools/dom-contract.json` | odtworzony `update-contract.cjs`: suma arkusza, sumy 9 podstron (numer wersji arkusza), kontrakt strony pilotażowej |
| `kono-state/decisions/REJESTR_DECYZJI_BIZNESOWYCH.md` | D-048 |
| `kono-state/notes/kierunek-a-a1/` | zrzuty przed i po, pomiary |

## Dwie decyzje podjęte w trakcie, obie do Twojej oceny

1. **Poświata z hero zamiast poświaty paska końcowego.** Plan mówił „scena z poświatą”. Poświata paska końcowego
   (`.cta-glow`) ma pomarańcz w lewym dolnym rogu, czyli pod przyciskami i linią autora: zmierzony kontrast linii
   autora spadał do 2,86:1, a napisu na szklanym przycisku do 4,38:1. Z poświatą hero (`.hero-shade`: śliwka pod
   tekstem, pomarańcz niżej pośrodku) najgorszy kontrast to 7,5:1. Scena jest przez to spokojniejsza niż pasek końcowy.
2. **Na telefonie (do 560 px) plakat nie jest pokazywany.** Plan mówił „w scenie cały plakat”. Na telefonie plakat ma
   ok. 318 px szerokości, jest nieczytelny, a jako największy element pierwszego ekranu wydłużał LCP z ok. 1,2 s do
   2,7 s i obniżał wydajność w Lighthouse ze 100 do 95. Po ukryciu wynik wraca do 100. Od 561 px plakat jest widoczny
   (pod tekstem do 1100 px, obok tekstu powyżej). Cofnięcie to jeden wiersz w `podstrony.css`.

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
| 8 | Lighthouse nie gorszy | wydajność 100 → 100, dostępność 96 → 96, SEO 100 → 100 (mediana z 3 przebiegów); LCP ok. 1,2 s przed i po; CLS 0–0,014 → 0,023–0,027 |

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

Do przeglądu właściciela. Bez merge, bez wdrożenia.
