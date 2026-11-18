# Runbook wdrożenia i aktualizacji `revagy.pl` (Wariant A: Caddy → lokalny nginx)

Ten dokument zastępuje archiwalny prompt pierwszej instalacji serwera (nginx/certbot).
Obecna produkcja na hoście `skibiai` (`65.108.208.163`) działa w **Wariancie A**:

- Publiczne porty `:80` / `:443` obsługuje **Caddy** (`/etc/caddy/Caddyfile`), który realizuje TLS (Let's Encrypt) i przekierowania `http://` → `https://`.
- Ruch dla `revagy.pl`, `www.revagy.pl` i `stats.revagy.pl` trafia z Caddy przez `reverse_proxy` do lokalnego **nginx** na `127.0.0.1:8092` (`/etc/nginx/sites-available/revagy.pl.conf` + `/etc/nginx/snippets/revagy-naglowki.conf`).
- Matomo działa w kontenerze Docker `revagy-matomo-app-1` na `127.0.0.1:8090` (MariaDB 11.4).
- Na tym samym hoście działają niezależne domeny: `skoben.pl` (nginx `127.0.0.1:8093`), `skibilabs.pl` (nginx `127.0.0.1:8094`) oraz `sms-dlr.skibilabs.pl` (`127.0.0.1:8091`, `sms-dlr.service`). Domena `skobel.pl` wskazuje inny serwer (`185.253.212.22`) i jest poza zakresem operacji.

## Zasady nadrzędne

1. **Osobna zgoda właściciela:** przełączenie `/var/www/revagy.pl/current` wymaga jawnej zgody właściciela dla konkretnego SHA commita i manifestu.
2. **Brak zmian w usługach współdzielonych:** nie zmieniaj DNS, `/etc/caddy/Caddyfile`, vhostów `/etc/nginx/`, Dockera, Matomo ani `skoben.pl`/`skibilabs.pl`/`sms-dlr.skibilabs.pl` przy aktualizacji plików statycznych. Samo przełączenie symlinka `current` nie wymaga reloadu ani restartu Caddy/nginx.
3. **Na VPS nie ma builda ani Node:** artefakt `dist/` buduje wyłącznie GitHub Actions (`.github/workflows/ci.yml`, Node 22 z `.nvmrc`) — tak samo jak `web-skoben` i `web-skibilabs`. Na hoście nie uruchamiaj `npm`/`astro`, nie instaluj ani nie aktualizuj Node; wersja `/usr/bin/node` na VPS nie ma znaczenia dla tej strony. Nie buduj w `/var/www/revagy.pl/current` i nie przebudowuj artefaktu po wygenerowaniu manifestu.
4. **Bezpieczeństwo ścieżek:** katalogi wejściowe przekazane procesowi `root` (`dist`, plik manifestu) umieszczaj w obszarze operatora z prawami bez zapisu dla grupy i innych (`chmod -R go-w`, katalogi `755`, pliki `644`).

---

## Faza 0. Kontrola stanu przed wydaniem (tylko odczyt)

Potwierdź bieżący stan przed przekazaniem artefaktu lub przełączeniem `current`:

```bash
readlink -f /var/www/revagy.pl/current
find /var/www/revagy.pl/releases -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
sudo nginx -t
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl is-active caddy nginx docker sms-dlr.service
sudo docker ps --format '{{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
sha256sum /etc/caddy/Caddyfile /etc/nginx/sites-available/revagy.pl.conf /etc/nginx/snippets/revagy-naglowki.conf /etc/nginx/sites-available/skoben /etc/nginx/sites-available/skibilabs.pl
```

Zarejestruj baseline HTTP przed przełączeniem:

```bash
curl -sI "http://revagy.pl/test?a=1" | grep -iE '^HTTP|^location'
curl -sI "https://www.revagy.pl/test?a=1" | grep -iE '^HTTP|^location'
curl -sI "https://revagy.pl/" | grep -iE '^HTTP|content-security|strict-transport|x-content-type|cache-control'
curl -s -o /dev/null -w 'polityka=%{http_code}\n' https://revagy.pl/polityka-prywatnosci.html
curl -s -o /dev/null -w '404=%{http_code}\n' https://revagy.pl/nie-istnieje
curl -s -o /dev/null -w 'git=%{http_code}\n' https://revagy.pl/.git/config
curl -s -o /dev/null -w 'stats=%{http_code}\n' https://stats.revagy.pl/
curl -s -o /dev/null -w 'skoben=%{http_code}\n' https://skoben.pl/
curl -s --compressed https://skoben.pl/ | sha256sum
curl -s -o /dev/null -w 'skibilabs=%{http_code}\n' https://skibilabs.pl/
curl -s --compressed https://skibilabs.pl/ | sha256sum
curl -s -o /dev/null -w 'sms-dlr=%{http_code}\n' https://sms-dlr.skibilabs.pl/
```

---

## Faza 1. Artefakt z CI i weryfikacja sum

Artefakt powstaje w GitHub Actions dla zatwierdzonego commita (`NEW_SHA`): job `Build, testy i artefakt wydania` wykonuje `npm ci`, `build`, `check:dist` (manifest SHA-256), `test:smoke --serve=dist` i `test:deploy`, a następnie publikuje artefakt `revagy-dist-<NEW_SHA>` z trzema plikami:

- `revagy-dist-<NEW_SHA>.tar.gz` — zawartość `dist/`,
- `revagy-dist-<NEW_SHA>.manifest.sha256` — manifest plików dla `deploy/wydanie.sh`,
- `SHA256SUMS` — sumy obu plików (widoczne też w podsumowaniu joba).

Właściciel zatwierdza wydanie dla konkretnego `NEW_SHA` i sumy SHA-256 manifestu z `SHA256SUMS`. Operator pobiera artefakt (np. z zakładki Actions) do katalogu operatora na VPS i rozpakowuje go bez przebudowy:

```bash
umask 022
NEW_SHA="<PELNY_SHA_ZATWIERDZONEGO_COMMITA>"
WORK="$HOME/revagy-release/$NEW_SHA"
mkdir -p "$WORK/dist" && cd "$WORK"
# tu: revagy-dist-$NEW_SHA.tar.gz, revagy-dist-$NEW_SHA.manifest.sha256, SHA256SUMS
sha256sum -c SHA256SUMS
tar -xzf "revagy-dist-$NEW_SHA.tar.gz" -C dist
chmod -R go-w "$WORK"
sha256sum "revagy-dist-$NEW_SHA.manifest.sha256"   # musi się zgadzać z zatwierdzeniem
```

`deploy/wydanie.sh` w Fazie 3 sprawdza ponownie każdy plik `dist/` względem manifestu.

---

## Faza 2. Inicjalizacja manifestu bazowego (jednorazowo dla starego wydania)

Pierwsze wydanie zastane (`dc8221716605a74aa71657a531a120f618f0975b`) zostało wdrożone starym skryptem bez pliku manifestu w `/var/www/revagy.pl/manifests/`.
Skrypt `deploy/wydanie.sh` wymusza pod blokadą `flock`, aby bieżące aktywne wydanie miało zapisany manifest rollbacku i było z nim w 100% zgodne jeszcze przed utworzeniem stagingu i przełączeniem `current`.
Przed pierwszą publikacją uzgodnij zawartość `releases/<OLD_SHA>` z surowymi blobami Git (`Bramka A0`) i zainicjalizuj zaufany manifest bazowy pod blokadą `flock` (używając jawnego `OLD_SHA` z zatwierdzenia wydania):

```bash
OLD_SHA="<OCZEKIWANY_BIEZACY_SHA_Z_ZATWIERDZENIA>"
sudo sh deploy/wydanie.sh --init-manifest \
  "$OLD_SHA" \
  "<sciezka-do-manifestu-rollbacku>" \
  "<sha256-manifestu-rollbacku>"
```

---

## Faza 3. Atomowe wydanie (dopiero po zgodzie na konkretny SHA)

1. Użyj jawnie zatwierdzonych wartości z decyzji właściciela (nie pobieraj `OLD_SHA` dynamicznie z aktualnego symlinka `current`, bo mogłoby to zaakceptować nieautoryzowaną zmianę od czasu review):
   - `OLD_SHA` = oczekiwany SHA bieżącego wydania z zatwierdzenia,
   - `NEW_SHA` = pełny SHA zatwierdzonego commita,
   - `MANIFEST_SHA256` = zatwierdzona suma SHA-256 manifestu artefaktu `dist`.
2. Przenieś zweryfikowany katalog `dist/` i manifest do zabezpieczonego katalogu operatora (`root:root` lub `go-w`) na tym samym hoście. Nie przebudowuj po wygenerowaniu manifestu.
3. Uruchom publikację (skrypt sprawdzi pod blokadą `flock` zarówno wskazanie `current` na `OLD_SHA`, jak i pełną zgodność `/var/www/revagy.pl/releases/$OLD_SHA` z `/var/www/revagy.pl/manifests/$OLD_SHA.sha256`):

```bash
OLD_SHA="<OCZEKIWANY_BIEZACY_SHA_Z_ZATWIERDZENIA>"
NEW_SHA="<PELNY_SHA_ZATWIERDZONEGO_COMMITA>"
sudo sh deploy/wydanie.sh \
  "<sciezka-do-dist>" \
  "$NEW_SHA" \
  "$OLD_SHA" \
  "<sciezka-do-manifestu-dist>" \
  "<sha256-manifestu-dist>"
```

Uwaga dotycząca trwałości: zmiana symlinka `mv -Tf` daje atomową widoczność w POSIX na tym samym systemie plików. Dla pełnej trwałości po awarii zasilania wykonaj opcjonalnie `sync /var/www/revagy.pl /var/www/revagy.pl/releases/"$NEW_SHA" /var/www/revagy.pl/manifests/"$NEW_SHA.sha256"`.

4. Zweryfikuj stan na dysku:

```bash
readlink -f /var/www/revagy.pl/current
diff -qr "<sciezka-do-dist>" /var/www/revagy.pl/current
```

---

## Faza 4. Kontrola po publikacji i hosty współdzielone

1. Powtórz wszystkie kontrole HTTP z Fazy 0 dla `revagy.pl`, `www.revagy.pl`, `stats.revagy.pl`.
2. Uruchom test dymny (z atrapą Matomo) przeciwko produkcji:

```bash
node tools/smoke-test.cjs https://revagy.pl
```

3. Potwierdź brak wpływu na domeny współdzielone:
   - `skoben.pl`: `200` i identyczny hash zdekompresowanej treści jak w baseline,
   - `skibilabs.pl`: `200` i identyczny hash zdekompresowanej treści jak w baseline,
   - `sms-dlr.skibilabs.pl`: `GET /` nadal `404`, `systemctl is-active sms-dlr.service` = `active`,
   - `stats.revagy.pl`: `200` dla `/` i `/matomo.js`, `401` dla `/logi/`.

---

## Faza 5. Procedura natychmiastowego rollbacku

Jeśli zawiedzie jakakolwiek kontrola krytyczna (CTA, kalkulator, menu, zgoda, assety, CSP, 404), nie naprawiaj na żywym katalogu — wykonaj natychmiastowy rollback:

```bash
sudo sh deploy/wydanie.sh --rollback \
  "<OLD_SHA>" \
  "<NEW_SHA>" \
  "<sciezka-do-manifestu-rollbacku>" \
  "<sha256-manifestu-rollbacku>"
```

Po rollbacku sprawdź `readlink -f /var/www/revagy.pl/current` oraz powtórz kontrole HTTP i `node tools/smoke-test.cjs https://revagy.pl`.
Rollback HTML cofa wyłącznie wskazanie `/var/www/revagy.pl/current` i nie cofa ewentualnych zmian w Caddy/nginx ani trwających sesji otwartych w przeglądarkach.
