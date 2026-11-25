---
id: T-036
title: Dane rzeczywiste opisów wdrożeń i scena dowodu „Agencja pracy” (kierunek A, etap A2)
channel: pm-local
requested_by: owner
status: w-toku
created: 2026-11-25
updated: 2026-11-25
branch: skibiai/trusting-shannon-g9jhj1
base: main (a74ab8c)
depends_on: T-033 (pilot A1, scalony w #38)
pr: —
sha: —
decisions: [D-015, D-020, D-021, D-033, D-034, D-048, D-054]
---

# T-036 — Dane rzeczywiste opisów wdrożeń i scena dowodu A2

## Zakres (plan zaakceptowany 25.11.2026: „tak”)

1. `src/data/dowody.mjs`: dane właściciela 1:1 dla `agencja-pracy-umowy` (HR KADRA Sp. z o.o.), `stan-zalogi`
   i `pilotaz-produkcja` (HR KONO, Grupa KONO) — skala, „Jak mierzone”, cytaty, tabela techniczna, `zgodaNaWynik: true`.
2. `tools/rejestr-twierdzen.json`: wiersze dla skal, metod pomiaru i nowych zdań o stanie załogi; usunięty
   `is-stan-zalogi-568-539`; `pl-pilotaz-wynik` → „z ok. 6 godzin do ok. 20 minut”, potwierdzone; `jakMierzone`
   dla wyników agencji i `wd-raport-6-godzin-do-zera`.
3. Zdania „568 i 539” zastąpione odczytem 1 370 / 1 300 (integracja-systemow, wdrozenia, finanse); odpowiedź FAQ
   o pilotażu: „…jeden pilotaż, w spółce HR KONO (Grupa KONO).”; wynik pilotażu „ok. 20 minut”.
4. Rejestr decyzji: D-054.
5. Etap A2: scena dowodu z 3 liczbami („ok. 12 h”, „ok. 90%”, „ok. 10 min”) na `/integracja-systemow.html`.

## Stan

W toku.
