---
id: T-026
title: Audyt designu i identyfikacji wizualnej REVAGY (tylko analiza)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/trusting-shannon-g9jhj1
base: main (43efbf5)
depends_on: —
pr: (uzupełniane po otwarciu PR)
sha: (uzupełniane po commicie)
decisions: [D-002, D-003, D-005, D-015, D-018, D-021, D-022, D-027, D-031, D-033]
---

# T-026 — Audyt designu i identyfikacji wizualnej REVAGY

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

## Kroki

1. Build lokalny (`npm ci`, `npm run build`, `astro preview`) i zrzuty wszystkich 12 stron na desktopie
   (1440×900) i telefonie (390×844).
2. Skill `product-discovery:extract-design-md` → `DESIGN.md` z materiałem dowodowym.
3. Skill `product-discovery:document-design-system-components` → dokumentacja komponentów.
4. Skill `product-discovery:visual-direction-research` → moodboard HTML z kierunkami; stop na wyborze kierunku.
5. Raport `kono-state/notes/audyt-design.md`.

## Pliki wynikowe

- `kono-state/notes/audyt-design.md` — raport główny.
- `kono-state/notes/audyt-design/DESIGN.md` — styl, tokeny, typografia, kolory, komponenty, z dowodami.
- `kono-state/notes/audyt-design/komponenty.md` — dokumentacja komponentów (v1, do oceny).
- `kono-state/notes/audyt-design/moodboard.html` — kierunki rozwoju na tle konkurencji.
- `kono-state/notes/audyt-design/zrzuty/` — zrzuty stron, klatki filmów.
- `kono-state/notes/audyt-design/design-evidence/` — migawki stylów, pomiary, manifest.
- `kono-state/notes/audyt-design/moodboard-evidence/` — zrzuty i pomiary stron referencyjnych.

## Stan

(uzupełniane na końcu pracy)
