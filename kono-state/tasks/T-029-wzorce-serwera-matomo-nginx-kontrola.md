---
id: T-029
title: "Etap 2 po audycie kodu: panel Matomo za hasłem, kopia Matomo, runbook bez danych hosta, test nginx w CI, kontrola produkcji"
channel: pm-local
requested_by: owner
status: zmergowane
created: 2026-11-22
updated: 2026-11-22
branch: skibiai/magical-mccarthy-unmqyo
base: main (scalony do gałęzi bez rebase)
depends_on: T-028 (audyt kodu)
pr: https://github.com/dskibickikono-lang/RevAGY/pull/40 (scalony do main, 7b6fc4c)
sha: 08b4db50bded60a76f30e0ade40ec04e489a840e (kod; kolejne commity zmieniają tylko karty)
decisions: [D-047]
---

# T-029 — wzorce serwera i kontrole

Zgoda właściciela z 22.11.2026 („zgoda na etap 2 i 3”, D-047). Znaleziska z `kono-state/notes/audyt-kodu.md`:
D-02, D-03, D-04, D-06, D-12, D-13, D-17. Repo dostaje wzorce i testy. **Na serwerze nic nie zostało zmienione.**

## Zmiany

| Plik | Co |
|---|---|
| `deploy/nginx/revagy.pl.conf` | `stats.revagy.pl`: bez hasła tylko `/matomo.js` i `/matomo.php`, reszta za hasłem z `revagy-logi.htpasswd` (D-03); HSTS na przekierowaniach i `www` (D-12); `server_tokens off` (D-13) |
| `deploy/matomo/revagy-matomo-kopia.sh`, `deploy/matomo/README.md` | dobowy zrzut bazy z kontrolą kompletności i retencją 14 dni; instalacja, próba odtworzenia, odtworzenie po awarii (D-02) |
| `deploy/PROMPT-AGENT-VPS.md`, `README.md` | bez nazwy i adresu hosta, bez innych domen i usług na serwerze (D-04); test po wydaniu przez workflow (D-17) |
| `tools/test-nginx.sh`, `.github/workflows/ci.yml` | `nginx -t` i 28 żądań kontrolnych na lokalnym nginx, krok w CI (D-06) |
| `tools/test-matomo-kopia.sh` | 9 sprawdzeń skryptu kopii z atrapą Dockera, krok w CI |
| `tools/check-produkcja.cjs`, `tools/tests/check-produkcja.test.cjs`, `.github/workflows/kontrola-produkcji.yml` | porównanie nagłówków produkcji z `revagy-naglowki.conf`, uruchamiane ręcznie po wydaniu (D-01, D-17) |
| `package.json` | `test:nginx`, `test:kopia`, `check:prod` |

## Kroki właściciela na serwerze (osobna zgoda na każdy)

1. Vhost: `deploy/nginx/revagy.pl.conf` → `/etc/nginx/sites-available/`, `nginx -t`, `systemctl reload nginx`.
   Kontrola: `https://stats.revagy.pl/` → 401, `/matomo.js` → 200. Opis i rollback: `deploy/nginx/README.md`.
   **Zgoda właściciela (22.11.2026):** Zgoda na wdrożenie przy najbliższym deployu pod dwoma warunkami: 1) najpierw backup obecnego pliku, 2) weryfikacja, że plik `.htpasswd` dla `stats.revagy.pl` istnieje i ma poprawne uprawnienia przed `nginx -t` i `reload`.
2. Kopia Matomo: instalacja skryptu i wpisu cron, pierwsze uruchomienie, próba odtworzenia, kopia poza serwer
   (`deploy/matomo/README.md`). Wynik próby (liczba wizyt, data ostatniej) do tej karty.
   **Zgoda właściciela (22.11.2026):** Zgoda na instalację skryptu w `/usr/local/bin/` i dodanie crona podczas wdrożenia, pod warunkiem jednokrotnego ręcznego uruchomienia testowego po instalacji i potwierdzenia niezerowego rozmiaru pliku `.sql.gz`.

## Czego nie sprawdziłem

- Skrypt kopii i instrukcja odtworzenia nie były uruchomione na prawdziwym Dockerze i prawdziwej bazie
  (w kontenerze audytu nie ma demona Dockera); przetestowana jest logika skryptu z atrapą.
- Nowy vhost przetestowany na lokalnym nginx 1.24.0 bez Matomo i bez bramki (trasy proxy dają 502).
  Działania panelu Matomo za podwójnym logowaniem nie da się potwierdzić bez serwera.
- Dane hosta zostają w historii gita i w starszych kartach; usunąłem je tylko z bieżących plików `deploy/` i `README.md`.

## Wyniki testów (Linux, Node 22.23.5, nginx 1.24.0)

| Polecenie | Kod | Wynik |
|---|---|---|
| `npm run test:nginx` | 0 | 28 z 28 |
| `npm run test:kopia` | 0 | 9 z 9 |
| `npm run check:prod` | 0 | 33 sprawdzenia, nagłówki produkcji zgodne z repo (odczyt 22.11.2026) |
| `npm run test:tools` | 0 | 114 z 114 |
| pozostałe | 0 | jak w T-030 |

## Stan

Wszystkie zgody na kroki serwerowe udzielone przez właściciela 22.11.2026 z warunkami bezpieczeństwa. PR #40 scalony do main (commit 7b6fc4c). Karta zamknięta.
