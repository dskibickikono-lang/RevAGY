---
id: T-003
title: Migracja 1:1 strony REVAGY do Astro (static) i bezpieczne wydanie
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-17
updated: 2026-11-17
branch: migration/astro-static
base_sha: dc8221716605a74aa71657a531a120f618f0975b
depends_on: T-002
decisions: [D-001, D-002, D-003, D-004, D-005, D-006, D-007, D-008, D-009]
---

# T-003 — Migracja 1:1 strony REVAGY do Astro (static) i przygotowanie wydania

Przejmuję T-003 (kanał `pm-local`, `requested_by: owner`).

## Cel

Przenieść istniejącą statyczną stronę `revagy.pl` (`site/`) do Astro w trybie `static`
(`build.format: 'file'`, `trailingSlash: 'never'`, `compressHTML: false`) z zachowaniem 1:1
adresów URL, drzewa DOM, CSS, zewnętrznych skryptów JS (`is:inline` z `defer`), filmów,
banera zgody, integracji Matomo i sposobu serwowania plików w Wariancie A (Caddy → lokalny
nginx `127.0.0.1:8092`), bez zmiany konfiguracji współdzielonego hosta.

Przełączenie produkcji (`/var/www/revagy.pl/current`) jest osobną bramką (Faza F) i nie
zostało wykonane w tym zadaniu.

## Bramka A0 (wyjaśnienie różnic bajtowych)

Bezpośrednie porównanie surowych blobów Git (`dc8221716605a74aa71657a531a120f618f0975b`)
katalogu `site/` z aktywnym wydaniem produkcyjnym
`/var/www/revagy.pl/releases/dc8221716605a74aa71657a531a120f618f0975b` na hoście `skibiai`
potwierdziło **33/33 identyczne sumy SHA-256** (`cr_lines=0` we wszystkich 13 plikach
tekstowych — zarówno Git blob, jak i produkcja używają `LF`). Wcześniej zgłaszane 13 różnic
wynikało wyłącznie z porównania checkoutu Windows z `core.autocrlf=true` (`CRLF`) przeciwko
Linux `LF`.

Utworzono obie referencje poza repozytorium (`/home/kono/revagy-deploy/evidence-20261117/`):
- `manifest-git-source-dc82217.sha256` (SHA-256: `1cba51d8ef13bc4b4a2c6d291383d23c9d07b94b8f99f6bef653b1f0cb3c7774`)
- `manifest-release-rollback-dc82217.sha256` (SHA-256: `1cba51d8ef13bc4b4a2c6d291383d23c9d07b94b8f99f6bef653b1f0cb3c7774`)

## Zakres wykonany na gałęzi `migration/astro-static`

1. `chore(baseline/tests)` (`78cea4aa441b04113827d6e21f487d56a94bad77`):
   - Dodano `.gitignore`, `.nvmrc`, `.node-version` (`22.23.4`), `package.json` i `package-lock.json` z przypiętym `playwright@1.65.1`.
   - Dodano `tools/dom-contract.json` i `tools/validate-dist.cjs`.
   - Rozszerzono `tools/smoke-test.cjs` o lokalny serwer TLS (`--serve=`), `serviceWorkers: 'block'`, izolację zewnętrzną, weryfikację markera `X-Revagy-Local-Harness`, pełne scenariusze zgody/wycofania (`deleteCookies`, `_pk_*`), blokadę poza domeną produkcyjną, obsługę klawiatury i kontrole SEO/403/Range.
2. `feat(migration/astro-static)` (`512805d331bfd9d947f9891e4a010153cf1cb4bd`):
   - Dodano `astro@7.4.12` i `astro.config.mjs`.
   - Utworzono `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/polityka-prywatnosci.astro` oraz `src/pages/404.astro` bez wrapperów DOM i bez `/_astro/` ani inline JS/CSS.
   - Przeniesiono zasoby z `site/` do `public/` (30/30 plików publicznych zachowało identyczne SHA-256), usunięto `site/`, zaktualizowano ścieżki w `tools/render-videos.cjs`, `tools/render-images.cjs`, `tools/scenes/scene.css` i `tools/scenes/hero-flow.html`.
3. `fix(deploy/hardening)` (`3f1a80ac574e1be6234e8ab051839238ac52d6b5`):
   - Przebudowano `deploy/wydanie.sh` (czysty POSIX `sh` / `dash`, `flock`, `umask 022`, staging na tym samym FS, odrzucanie symlinków/hardlinków/plików specjalnych/zapisu przez grupę lub innych, pełne porównanie manifestu, bezpieczne retry, `--init-manifest`, atomowy `--rollback` przez `mv -Tf`).
   - Dodano izolowane testy `tools/test-wydanie.cjs` (`npm run test:deploy`).
4. `docs(runbook)`:
   - Zaktualizowano `README.md`, zastąpiono `deploy/PROMPT-AGENT-VPS.md` aktualnym runbookiem Wariantu A, dostosowano `deploy/nginx/revagy.pl.conf` do Wariantu A (`127.0.0.1:8092`), oznaczono `deploy/nginx/revagy.pl.bootstrap.conf` jako archiwalny i zapisano tę kartę `kono-state/tasks/T-003-migracja-astro-static.md`.

## Wynik weryfikacji

- Środowisko builda: izolowane Node `v22.23.4` (zweryfikowane z oficjalnym `SHASUMS256.txt`), npm `10.9.9`, Astro `7.4.12`, Playwright `1.65.1` (Chromium v1255).
- `npm ci` + `npm run build` + `npm run check:dist`: OK (`33` pliki, `30/30` assetów bajtowo zgodnych, `3/3` strony zgodne z kontraktem DOM, 0 `/_astro/`, 0 inline JS/CSS).
- `node tools/smoke-test.cjs --serve=dist`: `53/53` OK (w tym scenariusze zgody/odmowy/wycofania z atrapą Matomo).
- Porównanie baseline (`site/`) vs kandydat (`dist/`): identyczny snapshot DOM/CSS/requestów oraz identyczne bajtowo zrzuty ekranu 1440×900 i 390×844.
- Izolowany `nginx` na niepublicznym porcie `127.0.0.1:18443 -> 127.0.0.1:18092`: `nginx -t` OK, `51/51` w `smoke-test.cjs` oraz poprawne odpowiedzi `/`, `/polityka-prywatnosci.html`, 404, `.git/config` 403, `site.webmanifest` (`application/manifest+json`), CSP/HSTS, Range 206 MP4.
- `npm run test:deploy`: `14/14` + `dash -n` OK.

## Status wdrożenia

- **Status gotowości:** `gotowe do zatwierdzonego wdrożenia` (Faza E).
- **Produkcja:** NIE przełączona (`/var/www/revagy.pl/current` nadal wskazuje `dc8221716605a74aa71657a531a120f618f0975b`).
- **Merge:** wyłącznie właściciel po przeglądzie PR.
