---
id: T-005
title: Build w CI i artefakt wydania — VPS bez Node
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-17
updated: 2026-11-18
branch: skibiai/kind-bell-p8w2vw
base: migration/astro-static (PR #2, a0346139a399c0410412a3ebeebc4dc61b4786cd)
depends_on: T-003
decisions: [D-006, D-010]
pr: https://github.com/dskibickikono-lang/RevAGY/pull/3
sha: 2039adb (zmiany T-005); main po merge PR #3 → #2: 9f8c86f65abe1a44f2eb6bdb0ed0e1ad72f1648f
---

# T-005 — Build w CI i artefakt wydania, VPS bez Node

## Cel

Usunąć ryzyko z PR #2 „Node v22.23.3 na VPS < wymagane przez Astro >=22.23.4” przez to,
że VPS w ogóle nie buduje strony. Ten sam wzorzec co `web-skoben` i `web-skibilabs`
(Astro `^7.4.12`, build w GitHub Actions na Node 22).

## Zakres

1. `.github/workflows/ci.yml`: `npm ci` → `build` → `check:dist` (manifest) → `test:smoke --serve=dist`
   → `test:deploy` → artefakt `revagy-dist-<sha>` (`.tar.gz` deterministyczny, manifest, `SHA256SUMS`).
2. `package.json`: `astro` `7.4.12` → `^7.4.12` (lockfile nadal rozwiązuje `7.4.12`); `.nvmrc`/`.node-version` → `22`.
   `engines.node` zostaje `>=22.23.4`, bo tyle wymaga sam `astro@7.4.12` (w `web-skibilabs` `>=22.18`,
   a w `web-skoben` `>=20` są zaniżone — nie ruszane, to inne repo).
3. `deploy/PROMPT-AGENT-VPS.md` (zasada 3 + Faza 1) i `README.md`: na VPS brak builda i Node, wdrożenie z artefaktu CI + `sha256sum -c`.
4. Rejestr: D-010 (Astro zostaje, build tylko w CI).

`deploy/wydanie.sh` bez zmian. Bez SSH, bez zmian na hostach.

## Wynik testów (Linux, kontener sesji, Node v22.23.5, Astro 7.4.12, Playwright 1.65.1 / Chromium 1255)

- `npm ci` (czysto) + `build` + `check:dist`: OK, 33 pliki; manifest `eb1c0cfa…bcc69b8f82` identyczny przed i po zmianach.
- `test:smoke -- --serve=dist`: 53/53.
- `test:deploy`: 16/16 + `dash -n`.
- Symulacja nowego przepływu (izolowany `REVAGY_BASE`): pakowanie jak w CI → `sha256sum -c` → rozpakowanie →
  `--init-manifest` → publikacja → `diff -qr` OK → `--rollback` OK. Tarball deterministyczny (2 przebiegi, ten sam SHA-256).
- GitHub Actions (PR #3, job „Build, testy i artefakt wydania”, run 44203384460): success, 60 s; artefakt `revagy-dist-<sha>` opublikowany.

## Nie zweryfikowano

- Produkcja (Faza F z T-003) — nadal wymaga osobnej zgody właściciela.
- Czy `/usr/bin/node` na VPS używa `sms-dlr.service` — nieistotne po tej zmianie, nie sprawdzane (brak SSH).

## Merge

- PR #3 → `migration/astro-static` (899e85f), PR #2 → `main` (9f8c86f65abe1a44f2eb6bdb0ed0e1ad72f1648f), 2026-11-18, właściciel.
- CI PR #2 na 899e85f: success (run 44204123751). Lokalny build `main` 9f8c86f: manifest `dist` SHA-256 `eb1c0cfa3d1b1728d0059c5d8243d2d30b23525d20190a8c4eb320bcc69b8f82`.
- Następny krok: zgoda właściciela na Fazę F (przełączenie produkcji) — osobna karta.
