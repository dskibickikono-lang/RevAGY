# Wzorce nginx REVAGY

## Formularz kontaktowy i forms-gateway

Przeglądarka wysyła JSON pod ten sam adres strony: `POST /api/kontakt` → nginx → `http://127.0.0.1:8095/v1/submit`. Bramka jest osobną usługą. Jej brak daje 502, a formularz pokazuje możliwość kontaktu e-mailem. Blok Matomo na `stats.revagy.pl` pozostaje bez zmian.

Formularz pojawia się dopiero po ustawieniu publicznego `PUBLIC_TURNSTILE_SITEKEY` podczas budowania strony (konfiguracja w `src/config/kontakt.ts`). Pusty klucz zachowuje dotychczasową sekcję z adresem e-mail. Klucz tajny Turnstile należy wyłącznie do bramki; nie umieszczaj go w repozytorium ani w plikach strony.

Zmiana aktywnego vhosta i CSP na produkcji wymaga osobnej zgody właściciela. Po przygotowaniu bramki i widżetu właściciel instaluje wzorce, sprawdza `nginx -t` i wykonuje `systemctl reload nginx`. Samo wydanie strony nie wprowadza zmian nginx. Przed włączeniem formularza należy sprawdzić prawdziwy Turnstile i przyjęcie zapytania przez bramkę.

CSP dopuszcza skrypt i ramkę Cloudflare; `connect-src` i `form-action` pozostają bez zmian. Regex statusu jest w cudzysłowie ze względu na `{32}` w składni nginx. Zwykły prefiks `location /api/` dopuszcza dopasowanie regexu statusu; blokada plików ukrytych nie pasuje do tej trasy. Caddy dopisuje adres klienta na końcu nagłówka, więc nie włączamy rekurencyjnego odczytu adresów IP.

Log `forms-gateway.access.log` nie zawiera parametrów adresu ani ciała żądania. Istniejący `deploy/logrotate/revagy-nginx` obejmuje `/var/log/nginx/revagy/*.log`, więc nowy log podlega dotychczasowej rotacji. Nie potrzeba zmian logrotate.

Rollback dla właściciela: przywrócenie poprzednich plików vhosta i nagłówków, następnie `nginx -t` i `systemctl reload nginx`. Wydanie strony cofa `deploy/wydanie.sh --rollback <docelowy-sha> <oczekiwany-biezacy-sha>` zgodnie z głównym README. Wyłączenie formularza w kolejnym wydaniu wymaga builda z pustym kluczem.

## Microsoft Clarity, Bing Webmaster Tools i IndexNow (T-022)

CSP w `revagy-naglowki.conf` dopuszcza Microsoft Clarity, które strona ładuje wyłącznie po zgodzie analitycznej: `script-src` `https://www.clarity.ms` (tag) i `https://scripts.clarity.ms` (właściwy skrypt ładowany przez tag), `connect-src` `https://*.clarity.ms` (wysyłka danych do `[a-z].clarity.ms`), `img-src` `https://*.clarity.ms` i `https://c.bing.com`. Lista według dokumentacji Microsoft „Clarity Content Security Policy”. Bez zmiany CSP na produkcji przeglądarka zablokuje Clarity także po zgodzie (reszta strony działa).

`/BingSiteAuth.xml` i `/<klucz IndexNow>.txt` leżą w korzeniu artefaktu i obsługuje je zwykłe `location /` (`try_files`, typ z `mime.types`: `text/xml` i `text/plain`). Vhost nie wymaga zmian.

Wdrożenie (właściciel): skopiować `revagy-naglowki.conf` do `/etc/nginx/snippets/revagy-naglowki.conf`, `nginx -t`, `systemctl reload nginx`, następnie `curl -sI https://revagy.pl/ | grep -i content-security-policy` (ma zawierać `clarity.ms`). Rollback: poprzedni plik nagłówków, `nginx -t`, `systemctl reload nginx`.

### Warunek wstępny wdrożenia: kontrakt idempotencji `forms-gateway`

Przed włączeniem formularza na produkcji usługa `forms-gateway` (`forms_gateway/validation.py` oraz `intake.py`) **MUSI** spełniać następujący kontrakt idempotencji:

1. Wartość `payload_sha256` jest liczona ze znormalizowanego JSON-a leada **z wyłączeniem pól technicznych** `cf-turnstile-response`, `t_ms` oraz `website`.
2. Dla żądania zawierającego `Idempotency-Key` bramka **PRZED** weryfikacją tokena Turnstile porównuje klucz oraz `payload_sha256` z zapisanym rekordem:
   - jeśli `Idempotency-Key` i `payload_sha256` są zgodne, zwraca zapisaną odpowiedź `202 Accepted` (idempotentny replay),
   - zwraca `409 idempotency_conflict` wyłącznie wtedy, gdy różni się biznesowa część ładunku (`payload_sha256`).

Dzięki temu ponowne próby po przekroczeniu czasu odpowiedzi bramki (gateway timeout) wysłane z odświeżonym tokenem Turnstile (i nowym `t_ms`) nigdy nie utworzą duplikatu leada.

## Panel Matomo za hasłem, HSTS na przekierowaniach, wersja nginx ukryta (T-029)

Zmiany w `revagy.pl.conf` (D-03, D-12, D-13 z audytu T-028), do instalacji przez właściciela:

- `stats.revagy.pl`: bez hasła dostępne są tylko `/matomo.js` i `/matomo.php` (tracker). Panel Matomo i wszystkie
  pozostałe adresy wymagają dodatkowego hasła z `/etc/nginx/revagy-logi.htpasswd` (to samo co do `/logi/`),
  a potem zwykłego logowania Matomo. Blokada instalatora (`revagy-stats-blokada*.conf`) nie jest już potrzebna.
- `Strict-Transport-Security` także na przekierowaniach i na hoście `www`.
- `server_tokens off`: nagłówek `Server` bez numeru wersji.

Wdrożenie: skopiować `revagy.pl.conf` do `/etc/nginx/sites-available/`, `nginx -t`, `systemctl reload nginx`.
Kontrola: `curl -s -o /dev/null -w '%{http_code}\n' https://stats.revagy.pl/` ma dać `401`,
`https://stats.revagy.pl/matomo.js` ma dać `200`, a statystyki po zgodzie mają dalej trafiać do Matomo.
Rollback: poprzedni plik vhosta, `nginx -t`, `systemctl reload nginx`.

Test wzorców bez serwera: `npm run test:nginx` (składnia i 28 żądań kontrolnych na lokalnym nginx; krok w CI).
