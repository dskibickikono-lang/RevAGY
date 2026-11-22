---
id: T-031
title: "Etap 5 po audycie kodu: przycisk wstrzymania filmu w hero, fokus banera zgody, komunikat formularza, Lighthouse dla 4 stron, testy negatywne walidatora"
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (scalony do gałęzi bez rebase)
depends_on: T-028 (audyt kodu), T-030 (ten sam PR)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/40 (scalony do main, 7b6fc4c)
sha: bebf799119e48daedaa60111711306ca0581abab (kod, migawka i kontrakt; kolejny commit zmienia tylko kartę)
decisions: [D-015, D-021, D-046]
---

# T-031 — etap 5

Zgoda właściciela z 22.11.2026 („zatwierdzam etap 5”) i decyzja D-046 („filmy hero dostają przycisk wstrzymania”).
Znaleziska z `kono-state/notes/audyt-kodu.md`: S-03, S-08, S-11, T-02, T-04.

## Zmiany

| Znalezisko | Co | Pliki |
|---|---|---|
| S-03 | Film w hero ma przycisk wstrzymania w wyglądzie istniejącego przycisku filmu. Komputer: prawy górny róg hero. Telefon i tablet: pod filmem, na wysokości etykiety nad nagłówkiem (44 px). Nazwa stała „Wstrzymaj film w tle”, zmienia się `aria-pressed` | `src/pages/index.astro`, `public/assets/css/styles.css`, `public/assets/js/app.js` |
| S-11 | Baner zgody otwarty z „Ustawień prywatności” przejmuje fokus, Escape go zamyka bez zmiany decyzji, fokus wraca do przycisku. Przy pierwszej wizycie baner nie zabiera fokusu | `public/assets/js/analytics.js` |
| S-08 | Gdy ochrona przed spamem nie załaduje się przed wysyłką, formularz nie pisze już „Nie udało się wysłać”, tylko: „Ochrona przed spamem nie załadowała się, więc formularz może nie zadziałać. Możesz też napisać: kontakt@revagy.pl”. Tekst nie jest wpisywany ponownie przy każdym polu | `public/assets/js/kontakt.js` |
| T-04 | Lighthouse mierzy 4 strony zamiast 1: stronę główną, kontakt, integrację systemów i finanse | `tools/lighthouse.json` |
| T-02 | 14 testów walidatora wydania, w tym 13 negatywnych (brak pliku, nadmiarowy plik, symlink, plik wykonywalny, zmieniony zasób, skrypt w stronie, zmieniona strona, zła wersja zasobu, martwy odnośnik, mapa witryny, zdublowany adres kanoniczny, `_astro`) | `tools/tests/validate-dist.test.cjs` |
| testy | test dymny: przycisk hero i fokus banera (2 nowe sprawdzenia); test formularza: 3 nowe asercje tekstu przed wysyłką i po niej | `tools/smoke-test.cjs`, `tools/test-formularz.cjs` |

## Do akceptacji właściciela

1. **Wygląd i miejsce przycisku w hero** (jedyna zmiana wyglądu strony głównej): zaakceptowane przez właściciela 22.11.2026 („akceptuję”, po obejrzeniu zrzutów).
2. **Nowy tekst formularza** przy niezaładowanej ochronie przed spamem (cytat wyżej): zaakceptowany przez właściciela 22.11.2026 („akceptuję tekst formularza”).
3. **Film pulpitu** (sekcja „Możliwości”) dalej gra w pętli bez przycisku: D-046 mówi o hero, więc go nie ruszałem.
   WCAG 2.2.2 pozostaje dla niego niespełnione.

## Nowe ustalenie

Lighthouse dla strony głównej (telefon, symulowane wolne łącze): **wydajność 73–75** (przebiegi 72–82), przy 100 dla
pozostałych trzech stron. LCP 4,1 s, czas blokowania 560 ms, FCP 0,9 s, CLS 0. Próg ustawiłem na 65, żeby pomiar
pilnował regresji, a nie blokował dzisiejszego stanu. Poprawa to osobne zadanie (do planu).

## Wyniki testów (Linux, Node 22.23.5, konfiguracja jak w CI)

Uwaga: testy przeglądarkowe na Chromium build 1243 zamiast przypiętego 1255; pełny przebieg robi CI i KONO Boss.

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run build` | 0 | 12 stron |
| `npm run check:dist` | 0 | 6 z 6 kroków, 68 plików |
| `npm run test:tools` | 0 | 128 z 128, 0 pominiętych |
| `npm run test:smoke -- --serve=dist` | 0 | 273 z 273 (geometria strony głównej równa bazie) |
| `npm run test:form` | 0 | 14 grup |
| `npm run test:deploy` | 0 | 16 z 16 |
| `npm run test:lighthouse` | 0 | główna 75 / 97 / 100; kontakt 100 / 100 / 100; integracja 100 / 96 / 100; finanse 100 / 96 / 100 |
| `npm run test:nginx`, `npm run test:kopia` | 0 | 28 z 28, 9 z 9 |
