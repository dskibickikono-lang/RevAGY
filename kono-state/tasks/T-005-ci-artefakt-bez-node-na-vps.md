---
id: T-005
title: Build w CI i artefakt wydania — VPS bez Node
channel: pm-local
requested_by: owner
status: do-przegladu
created: 2026-11-17
updated: 2026-11-17
branch: skibiai/kind-bell-p8w2vw
base: migration/astro-static (PR #2, a0346139a399c0410412a3ebeebc4dc61b4786cd)
depends_on: T-003
decisions: [D-006, D-010]
pr: (uzupełniane po utworzeniu)
sha: (uzupełniane po commicie)
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
- Workflow CI: składnia YAML OK; pierwszy realny przebieg w GitHub Actions — patrz PR.

## Nie zweryfikowano

- Produkcja (Faza F z T-003) — nadal wymaga osobnej zgody właściciela.
- Czy `/usr/bin/node` na VPS używa `sms-dlr.service` — nieistotne po tej zmianie, nie sprawdzane (brak SSH).
