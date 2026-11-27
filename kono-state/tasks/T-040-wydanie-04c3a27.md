---
id: T-040
title: Wydanie main 04c3a27 na revagy.pl (T-036…T-039) i zapis wydania 9173c09
channel: pm-local
requested_by: owner
status: wdrozone
created: 2026-11-27
updated: 2026-11-27
branch: kono-state/t040-wydanie-04c3a27
base: main (04c3a27)
depends_on: T-036 (PR #48), T-037 (PR #49), T-038 (PR #50), T-039 (PR #51)
sha: 04c3a273561478f41b8f995a98a8ed280b82899e
decisions: []
---

# T-040 — Wydanie `04c3a27` na revagy.pl

Zgoda właściciela 27.11.2026: „wszystko Ty robisz, rób deploy”. Procedura według `deploy/PROMPT-AGENT-VPS.md`,
fazy 0–4, wykonana na VPS przez agenta.

## Wydanie poprzednie (dotąd bez karty)

- `current` wskazywał `releases/9173c09fb691ec66dd6177ea3fe49f3a362f4a15`, przełączony 23.11.2026 o 11:15.
- Między `9173c09` a `a74ab8c` zmieniły się tylko `ci.yml`, `package.json`, `package-lock.json` i README kart, więc
  wszystkie pliki produkcji były bajtowo równe buildowi `a74ab8c`. Jako bieżące wydanie skrypt zna jednak `9173c09`
  i ten SHA był oczekiwanym bieżącym SHA. Manifest `manifests/9173c09….sha256` był na serwerze, `--init-manifest` pominięte.

## Artefakt

- CI na `main`: [run 45905642012](https://github.com/dskibickikono-lang/RevAGY/actions/runs/45905642012),
  artefakt `revagy-dist-04c3a273561478f41b8f995a98a8ed280b82899e`.
- `sha256sum -c SHA256SUMS`: OK dla manifestu i paczki.
- Suma manifestu: `80086662d114181e1e87baa912a9cd407822381615bc771640ff0b8d4e3b6d6e` (zgodna z lokalnym buildem).
- Suma paczki: `9af79f7ad3fe522a9a969ea2f696a484b7b6f65306a3976f6e29f8812e594ed7`.

## Różnica manifestów `9173c09` → `04c3a27`

72 pliki w obu manifestach, 19 zmienionych, żadnych dodanych ani usuniętych:

- 14 stron: `index.html`, `404.html`, `kontakt.html`, `polityka-prywatnosci.html`, `dla-firm.html`, `finanse.html`,
  `kadry-i-place.html`, `produkcja-i-logistyka.html`, `sprzedaz.html`, `integracja-systemow.html`,
  `dane-i-bezpieczenstwo.html`, `wdrozenia.html`, `jak-wybrac-pierwszy-proces.html`, `porownanie-rozwiazan.html`;
- 3 zasoby: `assets/css/styles.css`, `assets/css/podstrony.css`, `assets/js/analytics.js`;
- 2 pliki tekstowe: `llms.txt`, `llms-full.txt`.

## Publikacja (27.11.2026)

```
sudo sh wydanie.sh <dist> 04c3a273561478f41b8f995a98a8ed280b82899e 9173c09fb691ec66dd6177ea3fe49f3a362f4a15 \
  <manifest> 80086662d114181e1e87baa912a9cd407822381615bc771640ff0b8d4e3b6d6e
```

- `wydanie.sh` z commita `04c3a27`. Wynik: „Aktualne wydanie: /var/www/revagy.pl/releases/04c3a27…”, potem `sync`.
- `diff -qr <dist> /var/www/revagy.pl/current`: brak różnic.
- Bez zmian w nginx, Caddy i CSP. Sumy `Caddyfile`, `revagy.pl.conf` i `revagy-naglowki.conf` przed i po są te same,
  usługi nie były przeładowywane.

## Kontrola po wydaniu

- Kontrole HTTP z fazy 0 identyczne przed i po: przekierowania `http://` i `www` (301), `/` 200 z tymi samymi
  nagłówkami CSP, HSTS, `nosniff`, `cache-control`; polityka 200, `/nie-istnieje` 404, `/.git/config` 403;
  `stats.revagy.pl`: `/matomo.js` 200, `/logi/` 401.
- Wszystkie 72 pliki pobrane z https://revagy.pl mają sumy z manifestu `04c3a27`.
- Domeny współdzielone (lista w prywatnej dokumentacji): te same kody HTTP i sumy treści przed i po; caddy, nginx
  i docker `active`.
- Workflow „Kontrola produkcji” z testem dymnym:
  [run 45911670377](https://github.com/dskibickikono-lang/RevAGY/actions/runs/45911670377), wynik `success`.

## Wycofanie

Nie było potrzebne. Gdyby było:
`sudo sh deploy/wydanie.sh --rollback 9173c09fb691ec66dd6177ea3fe49f3a362f4a15 04c3a273561478f41b8f995a98a8ed280b82899e`
(katalog `releases/9173c09…` i jego manifest są na serwerze).

## Poza zakresem

- `stats.revagy.pl/` zwraca 200 zamiast 401 z fazy 4 runbooka: vhost Matomo z T-029 nie jest jeszcze zainstalowany.
  To osobna zmiana na hoście.
