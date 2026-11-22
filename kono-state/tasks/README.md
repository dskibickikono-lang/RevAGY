# Karty zadań: numeracja

- Numer karty bierze się z `origin/main` tuż przed pierwszym commitem karty: `git fetch origin main`, potem kolejny
  wolny numer po najwyższym `T-…` w `kono-state/tasks/` na `main`.
- Przy kilku sesjach naraz dwie karty mogą dostać ten sam numer. Wtedy zmienia numer karta scalona później,
  a w jej treści zostaje zdanie, pod jakim numerem występuje w starszych PR i commitach.

## Stan na 22.11.2026

| Numer | Karty | Uwaga |
|---|---|---|
| T-024 | `T-024-baner-zgody-clarity.md`, `T-024-komunikacja-i-oferta-raport.md` | Numer zdublowany. Karta raportu o komunikacji należy do innej, czynnej sesji, a decyzje D-041 do D-045 powołują się na „T-024”, więc jej numeru nie zmieniałem. Do decyzji właściciela |
| T-025 | `T-025-audyt-seo-i-pozycjonowanie-marki.md` | Audyt kodu, który też miał T-025, ma teraz T-028 |
| T-028 | `T-028-audyt-kodu-strony.md` | W PR #35 i #37 oraz w commitach występuje jako T-025 |
| T-029, T-030 | etapy 2 i 3 po audycie kodu | |
