---
id: T-008
title: Etap 0 — prawda na stronie (korekta tekstów) i blokada strony głównej
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-21
updated: 2026-11-22
branch: feat/etap-0-prawda-na-stronie
base: main (9389fe6)
depends_on: —
pr: https://github.com/dskibickikono-lang/RevAGY/pull/9 (scalony do main)
sha: d4ef7cf82bd5c9e8169f4ba45a3d09eb0c03972b (zmiany); main po scaleniu PR #9: 9414a0b8bb113468372ec45b00cc0a46d5520622
decisions: [D-015, D-019, D-021, D-022, D-023, D-024, D-025, D-026, D-027, D-028]
---

# T-008 — Etap 0: prawda na stronie

## Cel

Teksty strony głównej, strony kontaktu i skróconych nagłówków zgodne z decyzjami właściciela z 21.11.2026
(wejście przez bezpłatną konsultację, warunek „14 dni roboczych”, stawka kalkulatora 65 zł, pasek liczb
i czasy reakcji bez liczb bez pokrycia). Wygląd, animacje, filmy i motyw bez zmian (D-015, D-021).
Przy okazji: blokada strony głównej, która od tego etapu odrzuca każdą niezapowiedzianą zmianę.

## Zakres

1. Narzędzia (commit bez zmiany strony):
   - `tools/baseline/index.html` — migawka zbudowanej strony głównej; walidator wymaga zgodności bajt po bajcie
     i przy różnicy podaje pierwszą inną linię. `tools/baseline/index.baza.html` — strona z wydania 9389fe6;
   - `tools/validate-dist.cjs`: egzekwowanie `htmlBaseline` dla wszystkich stron, mapa witryny równa adresom
     kanonicznym stron bez `noindex`, `mediaBudget`, skrypty podstron z `tools/podstrony.json`, eksport `parseHtml`;
   - `tools/update-contract.cjs` — odtwarza `pages`, `htmlBaseline`, `publicFiles`, `contactForm.htmlSha256`
     (opcja `--snapshot` zapisuje migawkę);
   - `tools/check-all.cjs` — walidator i narzędzia ochrony motywu po kolei; woła go `npm run check:dist`.
2. Teksty (`index.astro`, `BaseLayout.astro`, `kontakt.astro`): wyłącznie treść tekstów i wartości atrybutów
   (napisy przycisków, temat wiadomości, `data-track` przy przyciskach e-mail, opcja formularza, kalkulator,
   FAQ, kafel RODO, pasek liczb, punkty w pakietach). Znaczniki, klasy i kolejność bez zmian.
3. `tools/etapy/zmiana-strony-glownej.json` — lista dozwolonych zmian strony głównej i sekcji, których wysokość
   może się zmienić.

## Jak sprawdzone

- Build jest tylko w CI. Kontrakt i migawkę policzono z przewidzianego katalogu: kopia wydania 9389fe6
  z tymi samymi zamianami tekstu (jedna tabela, z kontrolą liczby wystąpień), `llms*.txt` wygenerowane
  funkcjami z `integrations/llms-txt.mjs`.
- `node tools/check-all.cjs` na wydaniu 9389fe6 (przed zmianą tekstu): OK, manifest `3cf4e5e7…55f7`.
- `node tools/check-all.cjs` na przewidzianym katalogu: OK, wszystkie 5 kroków (37 plików, 56 testów narzędzi).
- Próby negatywne: zmieniony znak w `index.html` → błąd migawki z numerem linii; zmieniona strona →
  błąd `htmlBaseline`; brak i nadmiar adresu w mapie witryny, przekroczony `mediaBudget`, brak migawki,
  zła lista skryptów w `tools/podstrony.json` → błąd.
- Kalkulator: przy wartościach domyślnych `app.js` wylicza 125 h, 208 h, 83 h, 0,8 etatu, 65 zł i 97 000 zł,
  czyli te same liczby co w HTML.

## Czeka na CI

- Bajtowa zgodność zbudowanego `index.html` z migawką i sum `htmlBaseline` czterech stron.
- Test dymny (zawijanie dłuższych napisów w 390 px, brak przewijania w poziomie).
- Pierwszy przebieg testu dymnego z porównaniem wysokości sekcji względem bazy i zrzutami (`podglad-<sha>`).

## Integracja (2026-11-21)

- Scalona gałąź `chore/narzedzia-ochrona-motywu` (compare-home, check-podstrony-css, check-tresc, testy,
  geometria i zrzuty w teście dymnym). `check:dist` uruchamia cały łańcuch: walidator, compare-home,
  check-podstrony-css, check-tresc, `node --test tools/tests/`.
- Przykładowy ekran: „POLPAK Sp. z o.o.” (D-027, pisownia potwierdzona przez właściciela).
- Plik etapu: `geometria.sekcje` jako `{ selektor, opis }`, selektory w kluczach pomiaru testu dymnego
  (`header`, `#id`, `main > section:nth-of-type(n)`, `footer`); test sprawdza je na migawce.
- `tools/podstrony.json`: `"film": null` oznacza stronę bez filmu (bez ramki i wideo); `skrypty` opcjonalne.
- Test formularza woła walidator z `--bez-blokad-bajtowych` (wyłącza tylko migawkę i `htmlBaseline`,
  bo testowy klucz Turnstile zmienia bajty stron z formularzem). Test nie jest w CI.
- CI: artefakt `podglad-<sha>` ze zrzutami (zawsze) i `dist-roboczy-<sha>` z `dist/` (przy błędzie).
- Przewidziany manifest wydania: `366038e6…99aa3`.

## Wynik CI (2026-11-21)

Pierwszy build tej gałęzi w CI, przebieg 44956996245 dla commita `d4ef7cf`: wszystkie kroki zakończone powodzeniem.

- Zbudowana strona główna jest bajtowo równa migawce. Manifest artefaktu: `366038e63177ae01c6be3d6e0423f2c8ba7fc4172b751206b94f050295499aa3`,
  czyli dokładnie wartość przewidziana przed buildem.
- `check:dist`: 37 plików, 36 zmian strony głównej, wszystkie na liście; 56 testów narzędzi.
- Test dymny: 60 z 61 sprawdzeń przeszło, 0 błędów, 1 pominięte (lista podstron jest jeszcze pusta).
  Wysokości sekcji w 1280 i 390 px równe bazie poza sekcjami z listy etapu.
- Testy `deploy/wydanie.sh`: 16 z 16.
- Artefakty: `podglad-<sha>` (zrzuty strony głównej 1280 i 390 px) oraz paczka wydania.

Scala właściciel. Wydanie wymaga osobnej zgody na konkretny SHA.

## Scalenie i wdrożenie (2026-11-22)

- PR #9 scalony do `main` commitem `9414a0b8bb113468372ec45b00cc0a46d5520622`.
- Wdrożone na produkcję w wydaniu `5fe5c29571e12cd4221d2a146b7d53fba3037816` (czubek `main` po scaleniu PR #9–#21),
  manifest `678ac82d4519d76c66cabae8b3ace6df5b0a3c1dc8ae1f99fbeb70a31b615488`.
