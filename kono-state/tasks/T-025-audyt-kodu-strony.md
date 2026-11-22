---
id: T-025
title: Pełny audyt kodu strony RevAGY (fundamenty przed dalszą budową) — tylko raport
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (43efbf5)
pr: —
sha: —
decisions: [D-010, D-015, D-021, D-031, D-036, D-039]
---

# T-025 — Audyt kodu strony RevAGY

## Cel

Pełny audyt kodu przed dalszą budową. Wynik to wyłącznie raport `kono-state/notes/audyt-kodu.md`.
Zero zmian w kodzie, bez `--fix`, bez wdrożeń, bez SSH. Zgoda właściciela z góry obejmuje tylko tę kartę
i plik raportu.

## Zakres

1. Przegląd kodu (`/code-review xhigh --max-findings all`) kolejno: `src/`, `tools/`, `integrations/`,
   `deploy/`, `astro.config.mjs`.
2. Przegląd bezpieczeństwa (`/security-review`) i ręczne sprawdzenie: formularz, nagłówki, sekrety w repo,
   skrypty deploy.
3. Gotowość produkcyjna całej strony (skill `product-discovery:production-readiness`, checklista HTML).
4. Faktyczne przebiegi: `npm run build`, `test:smoke`, `test:form`, `test:tools`, `check:dist`,
   `test:lighthouse`.

## Wynik

W toku.
