# Prompt dla agenta na VPS: wdrożenie revagy.pl

Skopiuj całość poniżej (od „ZADANIE” do końca) i wklej agentowi działającemu na serwerze.

---

ZADANIE

Wdróż stronę firmy REVAGY na tym serwerze Ubuntu pod domeną `revagy.pl` razem z własną analityką:
Matomo pod `stats.revagy.pl` i raport z logów serwera pod `stats.revagy.pl/logi/`.
Właściciel serwera zlecił to osobiście i jest dostępny w tej rozmowie.

Wszystkie pliki konfiguracyjne są gotowe w repozytorium `dskibickikono-lang/RevAGY`, gałąź `main`,
katalog `deploy/`. Zostały sprawdzone na Ubuntu 24.04 z nginx 1.24, Matomo 5.14 i GoAccess 1.8.
Twoja praca to instalacja i weryfikacja, nie pisanie konfiguracji od nowa.

ZASADY, KTÓRYCH NIE ŁAMIESZ

1. Na serwerze mogą działać inne usługi. Niczego, co nie dotyczy `revagy.pl`, nie zmieniasz, nie
   restartujesz i nie usuwasz. Nginx przeładowujesz (`reload`), nie restartujesz.
2. Nie edytujesz plików repozytorium na serwerze i nie budujesz niczego z roboczej kopii. Pobierasz
   czystą kopię `main` do katalogu tymczasowego i instalujesz z niej pliki.
3. Żadnych haseł, kluczy ani tokenów w odpowiedziach i logach rozmowy. Hasła generujesz na serwerze
   i zapisujesz wyłącznie w `/root/revagy-dostepy.txt` (uprawnienia 600). W raporcie podajesz tylko ścieżkę.
4. Przed każdą fazą piszesz jednym zdaniem, co zrobisz. Po każdej fazie podajesz wynik kontroli.
5. Zatrzymujesz się i pytasz właściciela, zamiast improwizować, gdy:
   - port 80 lub 443 zajmuje coś innego niż nginx (Apache, Caddy, Traefik, kontener),
   - w nginx istnieje już konfiguracja z `revagy.pl` albo port 8090 jest zajęty,
   - DNS którejś z trzech nazw nie wskazuje na ten serwer albo domena stoi za pośrednikiem (np. Cloudflare),
   - wolnej pamięci jest mniej niż 1 GB albo wolnego dysku mniej niż 5 GB,
   - nie masz dostępu do repozytorium albo na `main` nie ma katalogu `deploy/` (PR nie został zmergowany),
   - `nginx -t` albo wydanie certyfikatu kończy się błędem, którego przyczyny nie rozumiesz.
6. Jeśli serwer nie ma IPv6, usuń z instalowanej kopii konfiguracji nginx wiersze `listen [::]:...`.
   To jedyna dozwolona zmiana w plikach konfiguracyjnych.

FAZA 0. ROZPOZNANIE (tylko odczyt)

```bash
lsb_release -ds; uname -m; free -m; df -h / /var
ss -ltnp | grep -E ':(80|443|8090)\b'
systemctl is-active nginx apache2 caddy 2>/dev/null
ls /etc/nginx/sites-enabled/ 2>/dev/null; grep -rl "revagy" /etc/nginx 2>/dev/null
docker --version 2>/dev/null; docker compose version 2>/dev/null; docker ps --format '{{.Names}}  {{.Ports}}' 2>/dev/null
ufw status 2>/dev/null
ip -4 -o addr show scope global; ip -6 -o addr show scope global
dig +short A revagy.pl; dig +short A www.revagy.pl; dig +short A stats.revagy.pl
dig +short AAAA revagy.pl; dig +short AAAA www.revagy.pl; dig +short AAAA stats.revagy.pl
dig +short MX revagy.pl
```

Ustal publiczny adres IPv4 serwera (jeśli serwer jest za NAT-em dostawcy, zapytaj właściciela).
Warunki przejścia dalej:
- rekordy A dla `revagy.pl`, `www.revagy.pl` i `stats.revagy.pl` wskazują na ten serwer,
- rekordy AAAA nie istnieją albo wskazują na IPv6 tego serwera,
- nie zachodzi żaden warunek zatrzymania z zasady 5.

Podaj właścicielowi krótkie podsumowanie rozpoznania. Brak rekordu MX zgłoś jako ostrzeżenie:
strona kieruje kontakt na `kontakt@revagy.pl`, więc bez poczty zapytania przepadną. To nie blokuje wdrożenia.

FAZA 1. PAKIETY

```bash
apt-get update
apt-get install -y nginx certbot goaccess apache2-utils git curl ca-certificates openssl
```

Docker instalujesz tylko, jeśli go nie ma: `apt-get install -y docker.io docker-compose-v2`.
Jeśli Docker już jest, niczego w nim nie zmieniasz. Sprawdź `docker compose version`.
Jeśli działa `ufw`, dopuść ruch: `ufw allow 80/tcp && ufw allow 443/tcp`.

FAZA 2. CZYSTA KOPIA REPOZYTORIUM

```bash
WORK=$(mktemp -d /tmp/revagy-wdrozenie.XXXXXX)
git clone --depth 1 --branch main https://github.com/dskibickikono-lang/RevAGY.git "$WORK/repo"
SHA=$(git -C "$WORK/repo" rev-parse HEAD); echo "$SHA"
test -f "$WORK/repo/site/index.html" && test -f "$WORK/repo/deploy/nginx/revagy.pl.conf" && echo "repo OK"
```

Repozytorium może być prywatne. Jeśli klonowanie wymaga dostępu, którego nie masz, zatrzymaj się.

FAZA 3. CERTYFIKAT

```bash
mkdir -p /var/www/certbot /var/log/nginx/revagy
install -m 644 "$WORK/repo/deploy/nginx/revagy.pl.bootstrap.conf" /etc/nginx/sites-available/revagy.pl.conf
ln -sfn /etc/nginx/sites-available/revagy.pl.conf /etc/nginx/sites-enabled/revagy.pl.conf
nginx -t && systemctl enable nginx && (systemctl is-active -q nginx && systemctl reload nginx || systemctl start nginx)
curl -s -o /dev/null -w '%{http_code}\n' http://revagy.pl/        # oczekiwane: 503
certbot certonly --webroot -w /var/www/certbot --cert-name revagy.pl \
  -d revagy.pl -d www.revagy.pl -d stats.revagy.pl \
  --non-interactive --agree-tos --register-unsafely-without-email \
  --deploy-hook "systemctl reload nginx"
ls /etc/letsencrypt/live/revagy.pl/
```

FAZA 4. STRONA

```bash
# hasło do raportu z logów i do tymczasowej blokady instalatora Matomo
umask 077
HASLO=$(openssl rand -base64 18)
htpasswd -bc /etc/nginx/revagy-logi.htpasswd wlasciciel "$HASLO"
chown root:www-data /etc/nginx/revagy-logi.htpasswd && chmod 640 /etc/nginx/revagy-logi.htpasswd
printf 'Raport z logów i instalator Matomo (stats.revagy.pl)\nlogin: wlasciciel\nhasło: %s\n' "$HASLO" > /root/revagy-dostepy.txt
chmod 600 /root/revagy-dostepy.txt; unset HASLO; umask 022

# blokada instalatora Matomo do czasu, aż właściciel założy konto
printf 'auth_basic "REVAGY instalacja";\nauth_basic_user_file /etc/nginx/revagy-logi.htpasswd;\n' > /etc/nginx/revagy-stats-blokada.conf

install -m 644 "$WORK/repo/deploy/nginx/revagy-naglowki.conf" /etc/nginx/snippets/revagy-naglowki.conf
install -m 644 "$WORK/repo/deploy/logrotate/revagy-nginx" /etc/logrotate.d/revagy-nginx
mkdir -p /var/www/revagy-logi
sh "$WORK/repo/deploy/wydanie.sh" "$WORK/repo/site" "$SHA"
install -m 644 "$WORK/repo/deploy/nginx/revagy.pl.conf" /etc/nginx/sites-available/revagy.pl.conf
nginx -t && systemctl reload nginx
```

Kontrola (wszystkie wartości muszą się zgadzać):

```bash
curl -sI http://www.revagy.pl/x | grep -iE '^HTTP|^location'          # 301 → https://revagy.pl/x
curl -sI https://www.revagy.pl/x | grep -iE '^HTTP|^location'         # 301 → https://revagy.pl/x
curl -sI https://revagy.pl/ | grep -iE '^HTTP|content-security|strict-transport|cache-control'   # 200, CSP, HSTS, no-cache
curl -s -o /dev/null -w '%{http_code}\n' https://revagy.pl/brak-strony                  # 404
curl -s https://revagy.pl/brak-strony | grep -c 'BŁĄD 404'                              # 1
curl -s -o /dev/null -w '%{http_code}\n' https://revagy.pl/.git/config                  # 403
curl -sI https://revagy.pl/assets/video/hero-flow.mp4 | grep -iE '^HTTP|content-type'   # 200, video/mp4
curl -sI https://revagy.pl/site.webmanifest | grep -i content-type                      # application/manifest+json
curl -s -o /dev/null -w '%{http_code}\n' https://stats.revagy.pl/logi/                  # 401
tail -n 3 /var/log/nginx/revagy/access.log    # pierwsze pole to prawdziwy adres IP klienta, nie 127.0.0.1
```

FAZA 5. MATOMO

```bash
mkdir -p /opt/revagy/matomo
install -m 644 "$WORK/repo/deploy/matomo/docker-compose.yml" /opt/revagy/matomo/docker-compose.yml
cd /opt/revagy/matomo
[ -f .env ] || ( umask 077; printf 'MATOMO_DB_PASSWORD=%s\nMATOMO_DB_ROOT_PASSWORD=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -hex 24)" > .env )
docker compose up -d
docker compose ps                                                   # db: healthy, app: running
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8090/     # 200
```

Teraz zatrzymaj się i poproś właściciela o wykonanie instalatora w przeglądarce. Przekaż mu dokładnie to:

> 1. Odczytaj hasło: `sudo cat /root/revagy-dostepy.txt`.
> 2. Otwórz `https://stats.revagy.pl` i zaloguj się w okienku przeglądarki (login `wlasciciel`).
> 3. Przejdź instalator przyciskiem „Next”: kontrola systemu, baza danych (pola są już wypełnione,
>    niczego nie zmieniaj), tworzenie tabel.
> 4. Załóż konto administratora: własny login, własne mocne hasło, własny e-mail.
> 5. Dodaj stronę: nazwa `revagy.pl`, adres `https://revagy.pl`, strefa czasowa „Poland - Warsaw”
>    (bez wybranej strefy instalator nie przejdzie dalej), „Not an Ecommerce site”.
> 6. Ekran z kodem śledzenia pomiń („Next”), kod jest już na stronie. Zakończ instalację.
> 7. Napisz mi: „Matomo zainstalowane”.

Po potwierdzeniu właściciela:

```bash
cd /opt/revagy/matomo
C="docker compose exec -T -u www-data app php /var/www/html/console"
$C config:get --section=General --key=proxy_client_headers     # oczekiwane: ["HTTP_X_FORWARDED_FOR"]
# jeśli puste: $C config:set 'General.proxy_client_headers=["HTTP_X_FORWARDED_FOR"]'
$C config:set --section=General --key=force_ssl --value=1
$C config:set --section=General --key=assume_secure_protocol --value=1
( . ./.env; docker compose exec -T db mariadb -umatomo -p"$MATOMO_DB_PASSWORD" matomo -e "SELECT idsite, name, main_url FROM matomo_site" )
```

Strona musi mieć `idsite = 1` i adres `https://revagy.pl`. Skrypt na stronie ma wpisany identyfikator 1.
Jeśli identyfikator jest inny, zatrzymaj się i zgłoś to, niczego nie poprawiaj.

Zdejmij blokadę instalatora i włącz archiwizację raportów:

```bash
unlink /etc/nginx/revagy-stats-blokada.conf
nginx -t && systemctl reload nginx
printf '7 * * * * root cd /opt/revagy/matomo && docker compose exec -T -u www-data app php /var/www/html/console core:archive --url=https://stats.revagy.pl > /var/log/revagy-matomo-archive.log 2>&1\n' > /etc/cron.d/revagy-matomo
curl -s -o /dev/null -w '%{http_code}\n' https://stats.revagy.pl/matomo.js      # 200
```

Kontrola zapisu adresu IP. Wyślij jedno próbne żądanie z zewnątrz (albo poproś właściciela o wejście
na `https://revagy.pl` i kliknięcie „Zgadzam się”), potem sprawdź ostatnią wizytę:

```bash
( . ./.env; docker compose exec -T db mariadb -umatomo -p"$MATOMO_DB_PASSWORD" matomo -e "SELECT idvisit, INET6_NTOA(location_ip) AS ip, visit_total_actions FROM matomo_log_visit ORDER BY idvisit DESC LIMIT 3" )
```

Adres nie może być z zakresu `172.x` ani `127.x` (to oznaczałoby, że Matomo widzi nginx zamiast klienta).
Świeża instalacja Matomo zeruje końcówkę adresu (np. `83.12.0.0`). To ustawienie zmienia właściciel, patrz raport.

FAZA 6. RAPORT Z LOGÓW SERWERA

```bash
install -m 755 "$WORK/repo/deploy/goaccess/revagy-logi-raport.sh" /usr/local/bin/revagy-logi-raport.sh
printf '*/10 * * * * root /usr/local/bin/revagy-logi-raport.sh >/dev/null 2>&1\n' > /etc/cron.d/revagy-logi
/usr/local/bin/revagy-logi-raport.sh && ls -la /var/www/revagy-logi/index.html
logrotate -d /etc/logrotate.d/revagy-nginx 2>&1 | grep -iE 'error|rotating pattern'    # bez błędów, 90 rotacji
```

FAZA 7. KONTROLA KOŃCOWA

```bash
certbot renew --dry-run 2>&1 | tail -n 3
systemctl is-enabled nginx docker
curl -s -o /dev/null -w '%{http_code} %{time_total}s\n' https://revagy.pl/
```

Jeśli na serwerze jest Node.js z Playwrightem, uruchom test dymny z kopii repozytorium:
`node "$WORK/repo/tools/smoke-test.cjs" https://revagy.pl` (oczekiwane: 0 błędów; test nie zapisuje
niczego w statystykach). Jeśli nie ma, pomiń i zaznacz to w raporcie. Nie instaluj ich w tym celu.

Na koniec usuń katalog tymczasowy z kopią repozytorium (`$WORK`). Wydanie strony zostaje w
`/var/www/revagy.pl/releases/`.

RAPORT DLA WŁAŚCICIELA

Krótko, w punktach:
- wdrożony commit (`SHA`) i ścieżka wydania,
- wynik każdej kontroli z faz 4–7 (wartość oczekiwana i faktyczna),
- co zostało zainstalowane lub zmienione poza katalogami `revagy` (pakiety, reguły zapory),
- ostrzeżenia z rozpoznania (np. brak MX),
- gdzie są dostępy: `/root/revagy-dostepy.txt`,
- czego nie udało się sprawdzić.

Dopisz właścicielowi trzy rzeczy do zrobienia w panelu Matomo (`https://stats.revagy.pl`):
1. Pełne adresy IP: ikona koła zębatego (Administration) → Privacy → Anonymize data → odznacz
   „Anonymize Visitors' IP addresses”. Bez tego Matomo zapisuje adresy z wyzerowaną końcówką.
   (Nazwy podane po angielsku; w polskiej wersji panelu to dział „Prywatność”.)
2. Przechowywanie: na tym samym ekranie włącz „Regularly delete old raw data” z progiem 395 dni
   (polityka prywatności strony deklaruje 13 miesięcy).
3. Raport z logów serwera (pełne IP i user agent każdego żądania, także botów):
   `https://stats.revagy.pl/logi/`, login i hasło w `/root/revagy-dostepy.txt`.

COFNIĘCIE ZMIAN

- Poprzednia wersja strony: `ln -sfn /var/www/revagy.pl/releases/<stary sha> /var/www/revagy.pl/current`.
- Wyłączenie strony: `unlink /etc/nginx/sites-enabled/revagy.pl.conf && nginx -t && systemctl reload nginx`.
- Zatrzymanie Matomo bez utraty danych: `cd /opt/revagy/matomo && docker compose stop`.
- Niczego nie usuwaj bez zgody właściciela, w szczególności wolumenów Dockera z danymi Matomo.

KOLEJNE WDROŻENIA

Po każdej zmianie strony na `main`: faza 2, potem
`sh "$WORK/repo/deploy/wydanie.sh" "$WORK/repo/site" "$SHA"` i kontrola `curl` z fazy 4.
Konfigurację nginx instalujesz ponownie tylko wtedy, gdy zmieniły się pliki w `deploy/nginx/`.
