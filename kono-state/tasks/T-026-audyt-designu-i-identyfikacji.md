---
id: T-026
title: Audyt designu i identyfikacji wizualnej REVAGY (tylko analiza)
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/trusting-shannon-g9jhj1
base: main (43efbf5 — stan badany; gałąź odświeżana po każdym scaleniu)
depends_on: —
pr: https://github.com/dskibickikono-lang/RevAGY/pull/38 (moodboard i studium kierunku A; wcześniejsze części scalone w #32 i #34)
sha: 204ac02 (studium kierunku A i plan), fb1a746 (moodboard i rozdziały 7–8 raportu); wcześniej 2bd7b4c (#32), d554004 (#34)
decisions: [D-002, D-003, D-005, D-015, D-018, D-021, D-022, D-027, D-031, D-033, D-034, D-040, D-044, D-045]
---

# T-026 — Audyt designu i identyfikacji wizualnej REVAGY

Karta założona 22.11.2026 jako T-024. Numer zmieniony na T-026, bo w tym samym czasie T-024 dostały dwie inne karty
(`T-024-baner-zgody-clarity`, `T-024-komunikacja-i-oferta-raport`), a T-025 — dwie kolejne. Tamtych kart nie ruszałem.

## Cel

Ocena obecnego designu i identyfikacji wizualnej strony: w jakim stylu jest strona, co działa, co nie,
jak spójna jest marka (logo, kolor, typografia, ton wizualny, filmy), oraz lista zmian i braków z priorytetem.
Do tego trzy materiały robocze: `DESIGN.md`, dokumentacja komponentów i moodboard z kierunkami rozwoju
na tle konkurencji. Wybór kierunku należy do właściciela.

## Zakres i granice

- TYLKO analiza. Zero zmian w kodzie strony (`src/`, `public/`, `tools/`, `deploy/`, `integrations/`).
- Zgoda właściciela z góry obejmuje wyłącznie tę kartę i pliki raportu w `kono-state/notes/`.
- Decyzji z rejestru nie podważam. Tam, gdzie obserwacja dotyka zapisanej decyzji (np. D-015 „strona główna
  zostaje w 100%”), raport opisuje stan i zostawia wybór właścicielowi.
- Bez wdrożeń, SSH i zmian na hostach. Bez merge.

## Co zrobiono

1. Build lokalny (`npm ci`, `npm run build`, `astro preview`) i zrzuty wszystkich 12 stron na komputerze
   (1440×900) i telefonie (390×844): 24 widoki, 0 błędów skryptów, 0 przepełnień poziomych.
2. Skill `product-discovery:extract-design-md` → `DESIGN.md`: 12 migawek stylów (6 stron × 2 szerokości),
   pomiary dodatkowe dla 12 stron × 2 szerokości, walidator skilla przeszedł.
3. Skill `product-discovery:document-design-system-components` → `komponenty.md` v1: 22 rodziny komponentów,
   10 niespójności, wspólna tabela dostępności. Etap „pakiet dla agenta” niewykonany — wymaga osobnej zgody.
4. Skill `product-discovery:visual-direction-research` → `moodboard.html`: 16 stron referencyjnych (80 zrzutów),
   cztery kierunki. **Zatrzymane na wyborze kierunku.**
5. Raport `kono-state/notes/audyt-design.md`.

## Wybór właściciela i pogłębienie (22.11.2026)

- Właściciel wybrał kierunek **A — Scena wszędzie** (odpowiedź „A”).
- Krok 6 skilla `visual-direction-research`: `kierunek-a-studium.html` — 10 dodatkowych stron Automation House i Mercury
  (po pięć typów stron), sceny REVAGY z lokalnego buildu (`main` da8d1ae), 51 zrzutów, pomiar rytmu jasnych i ciemnych
  ekranów, trzy wzory pierwszego ekranu, scena dowodu, brief, plan etapów A0–A3.
- Kodu strony nie zmieniałem. Plan czeka na akceptację (reguła: plan, potem stop).
- Wpisu do rejestru decyzji nie zrobiłem: zgoda z góry obejmowała kartę i pliki raportu. Wpis jest etapem A0 planu.

## Pliki wynikowe

- `kono-state/notes/audyt-design.md` — raport główny (8 rozdziałów, 24 pozycje listy zmian).
- `kono-state/notes/audyt-design/DESIGN.md` — styl, tokeny, typografia, kolory, komponenty, z dowodami.
- `kono-state/notes/audyt-design/komponenty.md` — dokumentacja komponentów (v1, do oceny).
- `kono-state/notes/audyt-design/moodboard.html` — kierunki rozwoju na tle konkurencji.
- `kono-state/notes/audyt-design/zrzuty/` — zrzuty stron, klatki filmów (8 MB).
- `kono-state/notes/audyt-design/design-evidence/` — migawki stylów, pomiary, manifest (4,5 MB).
- `kono-state/notes/audyt-design/moodboard-evidence/` — zrzuty i pomiary stron referencyjnych (3,3 MB).
- `kono-state/notes/audyt-design/kierunek-a-studium.html` — pogłębione studium kierunku A z planem zmian.
- `kono-state/notes/audyt-design/kierunek-a-evidence/` — zrzuty i pomiary do studium (1,8 MB).
- `kono-state/notes/audyt-design/moodboard-src/` — skrypty do odtworzenia moodboardu i studium.

## Wynik w skrócie

- Styl: „scena produktu” — jasna baza, ciemne zaokrąglone sceny z poświatą, jeden akcent `#ff5b14`, animowany
  interfejs zamiast zdjęć. Zgodny z D-002 i D-005.
- Strona główna spójna. Podstrony mają te same tokeny, inną kompozycję: ciemne sceny to 37% wysokości strony
  głównej i 6–16% podstron.
- Do poprawy niezależnie od kierunku (P0): film „agent-demo” z nazwą „Stalmet” wbrew D-027; baner zgody
  zasłania główny przycisk hero w 100% (komputer i telefon, pomiar po D-040); menu nie prowadzi do 8 z 9 podstron;
  taśma nazw systemów wobec D-018 / D-033 do rozstrzygnięcia.
- Marka: kolor, kroje i filmy spójne; brak plików logo i zasad jego użycia, brak zdjęć, twarzy i znaków klientów.
- Kierunki: A Scena wszędzie, B Dowód na papierze, C Schemat przepływu, D Twarz i podpis. Rekomendacja
  niezatwierdzona: B + C.

## Testy

- Kodu strony nie zmieniałem, więc testów strony (`pytest`, testy dymne) nie uruchamiałem i nie deklaruję ich wyniku.
- Build lokalny: 12 stron, bez błędów (na 43efbf5 i ponownie na 5bac11d).
- CI na PR #34: „Lighthouse podstron” — sukces. Zmiany w `kono-state/` są wyłączone z głównego CI (`paths-ignore`).
- Moodboard: wyrenderowany przy 1440 i 390 px, 40 obrazów wczytanych, brak przepełnień, 8 tabel bez nieregularnych wierszy.
- Studium kierunku A: wyrenderowane przy 1440 i 390 px, 23 obrazy wczytane, brak przepełnień, 10 tabel bez nieregularnych wierszy.

## Ograniczenia

- Build lokalny, nie produkcja; Chromium; dwie szerokości.
- Formularz kontaktowy nie renderuje się lokalnie (brak klucza Turnstile) — nieoceniony.
- Revolut Business (wzorzec z D-002) i Make zablokowały robota — brak w próbie.
- Zgodności z WCAG nie stwierdzam; czytnik ekranu, powiększenie 400% i szerokość 320 px niesprawdzone.

## Otwarte, do właściciela

1. ~~Akceptacja etapu A1 i wpisu A0.~~ Zaakceptowane 22.11.2026 („tak”); wykonanie w karcie T-033 (D-048, pilot na `integracja-systemow`). Kolejne etapy A2 i A3 wymagają osobnej zgody.
2. Zgoda na pozycje P0, które dotykają strony głównej (baner zgody, menu, taśma nazw); film „agent-demo” to wykonanie D-027.
3. Ocena `komponenty.md` v1; po niej pytanie o pakiet dla agenta.
4. Kolizja numerów: dwie karty T-024 i dwie T-025 w `kono-state/tasks/` z innych sesji.
