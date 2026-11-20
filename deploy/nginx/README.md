# Wzorce nginx REVAGY

## Formularz kontaktowy i forms-gateway

Przeglądarka wysyła JSON pod ten sam adres strony: `POST /api/kontakt` → nginx → `http://127.0.0.1:8095/v1/submit`. Bramka jest osobną usługą. Jej brak daje 502, a formularz pokazuje możliwość kontaktu e-mailem. Blok Matomo na `stats.revagy.pl` pozostaje bez zmian.

Formularz pojawia się dopiero po ustawieniu publicznego `PUBLIC_TURNSTILE_SITEKEY` podczas budowania strony (konfiguracja w `src/config/kontakt.ts`). Pusty klucz zachowuje dotychczasową sekcję z adresem e-mail. Klucz tajny Turnstile należy wyłącznie do bramki; nie umieszczaj go w repozytorium ani w plikach strony.

Zmiana aktywnego vhosta i CSP na produkcji wymaga osobnej zgody właściciela. Po przygotowaniu bramki i widżetu właściciel instaluje wzorce, sprawdza `nginx -t` i wykonuje `systemctl reload nginx`. Samo wydanie strony nie wprowadza zmian nginx. Przed włączeniem formularza należy sprawdzić prawdziwy Turnstile i przyjęcie zapytania przez bramkę.

CSP dopuszcza skrypt i ramkę Cloudflare; `connect-src` i `form-action` pozostają bez zmian. Regex statusu jest w cudzysłowie ze względu na `{32}` w składni nginx. Zwykły prefiks `location /api/` dopuszcza dopasowanie regexu statusu; blokada plików ukrytych nie pasuje do tej trasy. Caddy dopisuje adres klienta na końcu nagłówka, więc nie włączamy rekurencyjnego odczytu adresów IP.

Log `forms-gateway.access.log` nie zawiera parametrów adresu ani ciała żądania. Istniejący `deploy/logrotate/revagy-nginx` obejmuje `/var/log/nginx/revagy/*.log`, więc nowy log podlega dotychczasowej rotacji. Nie potrzeba zmian logrotate.

Rollback dla właściciela: przywrócenie poprzednich plików vhosta i nagłówków, następnie `nginx -t` i `systemctl reload nginx`. Wydanie strony cofa `deploy/wydanie.sh --rollback <docelowy-sha> <oczekiwany-biezacy-sha>` zgodnie z głównym README. Wyłączenie formularza w kolejnym wydaniu wymaga builda z pustym kluczem.

### Warunek wstępny wdrożenia: kontrakt idempotencji `forms-gateway`

Przed włączeniem formularza na produkcji usługa `forms-gateway` (`forms_gateway/validation.py` oraz `intake.py`) **MUSI** spełniać następujący kontrakt idempotencji:

1. Wartość `payload_sha256` jest liczona ze znormalizowanego JSON-a leada **z wyłączeniem pól technicznych** `cf-turnstile-response`, `t_ms` oraz `website`.
2. Dla żądania zawierającego `Idempotency-Key` bramka **PRZED** weryfikacją tokena Turnstile porównuje klucz oraz `payload_sha256` z zapisanym rekordem:
   - jeśli `Idempotency-Key` i `payload_sha256` są zgodne, zwraca zapisaną odpowiedź `202 Accepted` (idempotentny replay),
   - zwraca `409 idempotency_conflict` wyłącznie wtedy, gdy różni się biznesowa część ładunku (`payload_sha256`).

Dzięki temu ponowne próby po przekroczeniu czasu odpowiedzi bramki (gateway timeout) wysłane z odświeżonym tokenem Turnstile (i nowym `t_ms`) nigdy nie utworzą duplikatu leada.
