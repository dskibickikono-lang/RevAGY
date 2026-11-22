---
id: T-007
title: "CI: przekazanie PUBLIC_TURNSTILE_SITEKEY do builda"
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-21
updated: 2026-11-23
branch: ci/turnstile-sitekey
depends_on: PR #5
pr: https://github.com/dskibickikono-lang/RevAGY/pull/7 (scalony do main 21.11.2026, dc984b6)
sha: a238fc7035f4a43b85fddb68f5fee01346ae8215 (CI), 25602ab8787c24b400dac4ac5153b9b342e2a287 (test dymny)
decisions: []
---

# T-007 — CI: przekazanie PUBLIC_TURNSTILE_SITEKEY do builda

Karta założona wstecz 23.11.2026 na podstawie `git log` i `gh pr view 7`; wcześniej PR #7 nie miał karty.

## Cel

Formularz kontaktowy (forms-gateway z PR #5) renderuje się tylko z kluczem witryny Turnstile. Bez klucza
w buildzie CI na revagy.pl zostaje sama sekcja z e-mailem.

## Zakres

- `.github/workflows/ci.yml` (a238fc7): krok „Build” dostaje `PUBLIC_TURNSTILE_SITEKEY` ze zmiennej repo
  (`vars`, klucz publiczny, nie sekret); pusta wartość = formularz ukryty.
- `tools/smoke-test.cjs` (25602ab): atrapa Turnstile w teście dymnym.

Opis PR: bramka forms-gateway działała już na hoście (test syntetyczny `/api/kontakt`: HTTP 202), vhost nginx
miał `/api/kontakt` i CSP z `challenges.cloudflare.com`. Tego nie sprawdzano przy zakładaniu karty.

## Stan

PR #7 scalony do main 21.11.2026 (merge dc984b6). Status `zmergowane`; karta nie zawiera dowodu wdrożenia.
