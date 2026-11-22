---
id: T-004
title: Poprawka hardeningu wydania po review PR #2 (manifest rollbacku bieżącego wydania)
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-18
updated: 2026-11-23
branch: migration/astro-static
depends_on: T-003
pr: https://github.com/dskibickikono-lang/RevAGY/pull/2 (scalony do main 18.11.2026, 9f8c86f)
sha: a0346139a399c0410412a3ebeebc4dc61b4786cd
decisions: []
---

# T-004 — Poprawka hardeningu wydania po review PR #2

Karta założona wstecz 23.11.2026 na podstawie `git log` i `gh pr view 2`. Numer T-004 występował dotąd tylko
w karcie T-003 (punkt 5 zakresu); osobnej karty nie było.

## Zakres (commit a034613, 18.11.2026)

- `deploy/wydanie.sh`: `do_publish` pod blokadą `flock` sprawdza, czy bieżące wydanie ma manifest rollbacku
  w `$BASE/manifests/<sha>.sha256` i czy jest z nim w pełni zgodne. Sprawdzenie przed stagingiem i przed
  przełączeniem `current`.
- `tools/test-wydanie.cjs`: testy braku manifestu rollbacku i zmodyfikowanego pliku w bieżącym wydaniu.
- `deploy/PROMPT-AGENT-VPS.md`: `OLD_SHA` przekazywany jawnie z zatwierdzenia wydania, nie odczytywany z symlinka.

## Wynik testów (z karty T-003)

`npm run test:deploy`: 16/16 + `dash -n` OK.

## Stan

Commit wszedł do gałęzi `migration/astro-static` i razem z PR #2 do main 18.11.2026 (merge 9f8c86f).
Karta nie zawiera dowodu wdrożenia na produkcję.
