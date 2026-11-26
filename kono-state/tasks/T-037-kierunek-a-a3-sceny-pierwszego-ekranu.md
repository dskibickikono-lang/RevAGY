---
id: T-037
title: Kierunek A, etap A3 — scena pierwszego ekranu na 9 podstronach
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-26
updated: 2026-11-26
branch: skibiai/trusting-shannon-g9jhj1
base: main (682e99d)
depends_on: T-033 (A1), T-036 (A2)
pr: —
sha: 1e23375 (sceny), następny commit: dowody i karta
decisions: [D-015, D-021, D-031, D-048]
---

# T-037 — Etap A3: sceny pierwszego ekranu

## Zakres (plan zaakceptowany 26.11.2026: „tak”)

- Scena z plakatem filmu: dla-firm, dane-i-bezpieczenstwo, produkcja-i-logistyka.
- Scena tytułowa bez plakatu: finanse, kadry-i-place, sprzedaz (film zaraz pod pierwszym ekranem),
  porownanie-rozwiazan, jak-wybrac-pierwszy-proces (poradniki bez filmu).
- Scena z 4 liczbami: wdrozenia („ok. 12 h”, „0 h”, „30 dni”, „5 min”; 6 wierszy rejestru twierdzeń).
- Teksty i adresy przycisków bez zmian; przyciski jasny i szklany jak w A1.
- Kontakt, 404, polityka prywatności i strona główna bez zmian.

## Zmiany w kodzie

- 9 plików w `src/pages/`: pierwsza sekcja `#wstep` jako `<section class="hero-outer">` z `ScenaPodstrony`;
  `.reveal` zastąpione `.load-in` z opóźnieniami jak w A1; `btn-dark` → `btn-light`, `btn-outline` → `btn-glass`.
- `ScenaPodstrony.astro`: bez propu `film` klasa `scena-uklad-tekst` (jedna kolumna). Integracja systemów bez zmian w HTML.
- Liczby „Wdrożeń” wpisane wprost na stronie (lista `.scena-liczby.scena-liczby-4`), bez nowego propu komponentu.
- `podstrony.css`: 7 reguł (jedna kolumna, tytuł do 880 px, kolor akapitu pomocniczego, siatka 4/2/1 dla liczb).
- `tools/rejestr-twierdzen.json`: 6 wierszy `wd-a3-*`; `tools/dom-contract.json` przegenerowany.

## Testy (Linux, sandbox, build z publicznym kluczem Turnstile jak w CI)

| Sprawdzenie | Wynik |
|---|---|
| `npm run check:dist` | 6/6 OK |
| `dist/index.html` vs wzorzec | identyczny bajt w bajt |
| `npm run test:smoke -- --serve=dist` | 319/319 |
| Lighthouse, 12 stron (konfiguracja repo + 6 stron A3 dodanych tylko lokalnie, progi 90/95/100) | wszystkie progi spełnione; wydajność 98–100 na podstronach, strona główna 79 (próg 65); dostępność 96–97 (audyt color-contrast od `.reveal`, przed zmianą) |
| Kontrast pierwszego ekranu, najgorszy piksel tła, 4 fazy poświaty, 9 stron × 1440/390/360 | autor ≥7,49:1; opisy liczb ≥7,96:1; przycisk szklany ≥10,17:1; akapit pomocniczy ≥8,46:1; wstęp ≥17,88:1; tytuł ≥18,5:1 |
| Przepełnienie poziome, błędy skryptów | brak, 0 |

## Przyciski na telefonie: dolna krawędź drugiego przycisku (px, ekran 844)

| Strona | 390: przed → po | 360: przed → po |
|---|---|---|
| dla-firm | 695 → 718 | 695 → 754 |
| dane-i-bezpieczenstwo | 511 → 479 | 511 → 505 |
| produkcja-i-logistyka | 633 → 605 | 633 → 656 |
| finanse | 878 → 905 | 878 → 967 |
| kadry-i-place | 694 → 731 | 755 → 782 |
| sprzedaz | 868 → 931 | 904 → 956 |
| wdrozenia | 618 → 616 | 618 → 677 |
| porownanie-rozwiazan | 624 → 617 | 649 → 643 |
| jak-wybrac-pierwszy-proces | 511 → 505 | 537 → 505 |

Kryterium „tytuł i oba przyciski nad zgięciem” niespełnione na finanse i sprzedaz — było niespełnione także przed zmianą
(trzy akapity nad przyciskami); scena dodaje 27–89 px. Na 7 stronach spełnione. Bez zmiany treści nie da się tego naprawić.

## Dowody

`kono-state/notes/kierunek-a-a3/`: pierwszy ekran przed (main 682e99d) i po, 9 stron × 1440/390/360 (54 zrzuty),
`pomiary.json`, `kontrast-najgorszy-piksel.json`.

## Ryzyka i otwarte

- Baner zgody zasłania przyciski pierwszego ekranu (P0 z audytu T-026), bez zmian w tym etapie.
- Lighthouse w CI mierzy 4 z 9 stron; w A1 CI pokazało przesunięcie układu, którego lokalny pomiar nie widział.
- Poza A3: sceny dowodu na kadry-i-place i produkcja-i-logistyka; poświata strony kontaktu; wczytywanie kroju tytułów z wyprzedzeniem.
