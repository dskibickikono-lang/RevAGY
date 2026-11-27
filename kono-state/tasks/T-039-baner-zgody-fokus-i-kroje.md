---
id: T-039
title: Baner zgody nie zasłania przycisków ani fokusu; kroje z wyprzedzeniem na podstronach (PR 2 z 2)
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-26
updated: 2026-11-27
branch: skibiai/trusting-shannon-g9jhj1
base: main (2db89d4)
depends_on: T-038 (PR #50, scalony)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/51
sha: b748615, f1ebf31 (karta, D-056)
decisions: [D-015, D-021, D-040, D-047, D-056]
---

# T-039 — Baner zgody, fokus klawiatury, kroje z wyprzedzeniem

## Zakres (plan zaakceptowany 26.11.2026: „Robimy wszystko”, potem „Tak”)

1. Baner zgody (P0 z T-026, `public/assets/js/analytics.js`, `public/assets/css/styles.css`):
   - komputer (od 901 px): prawy dolny róg zamiast lewego; przyciski pierwszego ekranu są po lewej;
   - telefon i tablet (do 900 px): przy pierwszej wizycie dopiero po przewinięciu o 200 px;
   - zawsze dopiero po `document.fonts.ready`, żeby baner nie zmieniał wysokości na ekranie;
   - przy otwartym banerze: `scroll-padding-bottom` równy wysokości banera, przewinięcie elementu z fokusem nad baner
     (`focusin`) i pusty odstęp na końcu strony, żeby linki stopki dało się przewinąć nad baner (WCAG 2.4.11);
   - „Ustawienia prywatności” w stopce otwierają baner od razu; tekst banera bez zmian (D-040).
2. Kroje z wyprzedzeniem: Onest i Instrument Sans (latin, latin-ext) w `PodstronaLayout.astro` i dla wariantu
   podstrony w `BaseLayout.astro` (kontakt, polityka). Gałąź strony głównej bez zmian.
3. Strona główna: różni się tylko skrótami treści `styles.css` i `analytics.js` — `tools/etapy/zmiana-strony-glownej.json`
   (etap T-039), nowa baza `tools/baseline/index.baza.html` z main b4bef98, migawka odświeżona.
4. `tools/smoke-test.cjs`: sekcja 5 (telefon) przewija przed odrzuceniem banera; nowa sekcja 8d — baner po przewinięciu
   (strona główna, finanse, sprzedaż × 360/390), w prawej połowie okna na komputerze, fokus nie pod banerem (1280, 390).
5. D-056.

## Zmiany względem planu

- **Poświata strony kontaktu wycofana.** Zakotwiczenie `.cta-glow` u góry (klasa tylko na kontakcie) dokładało w Lighthouse
  150–210 ms blokowania wątku (wydajność 92–98 zamiast 100). Same kroje z wyprzedzeniem dają na kontakcie CLS 0 i 100.
  W teście najgorszego przypadku (DejaVu, krój opóźniony o 900 ms) CLS kontaktu zostaje 0,117 jak na main;
  z zakotwiczeniem było 0,068.
- **Oba kroje z wyprzedzeniem, nie tylko Onest.** Sam Onest dzielił przesunięcie na dwa (Instrument Sans dochodził
  ok. 80 ms później i przesuwał przyciski): integracja 0,093 → 0,145. Z oboma krojami: jak na main.
- **Baner po wczytaniu krojów** — dodane, bo z krojami z wyprzedzeniem baner zmieniał wysokość po doczytaniu kroju
  (przesunięcie 0,11–0,14, T-038).

## Testy (Linux, sandbox, build z publicznym kluczem Turnstile jak w CI)

| Sprawdzenie | Wynik |
|---|---|
| `npm run check:dist` | 6/6 OK (compare-home z listą etapu T-039) |
| `tools/smoke-test.cjs --serve=dist` | 340/340 (także po połączeniu z T-038 na main 2db89d4) |
| Lighthouse, 13 stron (repo + 6 stron A3 lokalnie) | progi spełnione; podstrony i kontakt 100, strona główna 82 (próg 65); dostępność 96–100 |
| Fokus zasłonięty przez baner, 60 Tabów | main: 8–31 na stronę; PR: 0 (strona główna, finanse, integracja × 1280/390) |
| CLS kontakt w Lighthouse | main 0,028 → PR 0 |

Lighthouse lokalnie dwa razy przerwał się na stronie kontaktu błędem Chrome „Session with given id not found” (to samo
co w CI na PR #50, po ponownym uruchomieniu przeszło). Trzeci przebieg przeszedł w całości.

## Stan

Do przeglądu. Merge robi właściciel. Bez wdrożenia na serwer.
