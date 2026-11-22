#!/bin/sh
# Test wzorców nginx z deploy/nginx/ (D-06 z audytu T-028): składnia (nginx -t) i kilkanaście żądań kontrolnych
# na lokalnym nginx bez uprawnień roota. Ścieżki /var/log, /var/www i /etc/nginx z wzorca są na czas testu
# podmienione na katalog tymczasowy; reszta pliku jest testowana bez zmian. Bramki formularza i Matomo nie ma,
# więc trasy proxy odpowiadają 502: test sprawdza, że żądanie do nich dochodzi albo jest zatrzymane wcześniej.
# Użycie: sh tools/test-nginx.sh      Wymaga: nginx, curl. Brak nginx = kod 2.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
command -v nginx >/dev/null 2>&1 || { echo "Brak nginx w PATH (apt-get install nginx)." >&2; exit 2; }
command -v curl >/dev/null 2>&1 || { echo "Brak curl w PATH." >&2; exit 2; }

T="$(mktemp -d "${TMPDIR:-/tmp}/revagy-nginx.XXXXXX")"
PORT=18092
cleanup() {
    if [ -s "$T/nginx.pid" ]; then kill "$(cat "$T/nginx.pid")" 2>/dev/null || true; fi
    rm -rf "$T"
}
trap cleanup EXIT
trap 'exit 130' INT TERM HUP

mkdir -p "$T/conf/snippets" "$T/log" "$T/www/assets/css" "$T/www/.git" "$T/logi" "$T/tmp"
cp "$ROOT/deploy/nginx/revagy-naglowki.conf" "$T/conf/snippets/revagy-naglowki.conf"
sed -e "s|/var/log/nginx/revagy|$T/log|g" \
    -e "s|/var/www/revagy.pl/current|$T/www|g" \
    -e "s|/var/www/revagy-logi/|$T/logi/|g" \
    -e "s|/etc/nginx/revagy-logi.htpasswd|$T/conf/htpasswd|g" \
    -e "s|127.0.0.1:8092|127.0.0.1:$PORT|g" \
    "$ROOT/deploy/nginx/revagy.pl.conf" > "$T/conf/revagy.pl.conf"
# Trasy proxy celują w porty, na których w teście nic nie słucha (502).
sed -i -e "s|127.0.0.1:8095|127.0.0.1:18095|g" -e "s|127.0.0.1:8090|127.0.0.1:18090|g" "$T/conf/revagy.pl.conf"
printf 'test:$apr1$abcdefgh$0000000000000000000000\n' > "$T/conf/htpasswd"
printf '<!doctype html><title>t</title>ok\n' > "$T/www/index.html"
printf '<!doctype html><title>404</title>nie ma\n' > "$T/www/404.html"
printf 'body{}\n' > "$T/www/assets/css/styles.css"
printf '[core]\n' > "$T/www/.git/config"
printf 'raport\n' > "$T/logi/index.html"
# Gdy test działa jako root, procesy robocze nginx czytają pliki jako inny użytkownik.
chmod -R a+rX "$T"
chmod a+rwx "$T/tmp" "$T/log"
MIME="/etc/nginx/mime.types"
[ -f "$MIME" ] || { echo "Brak $MIME" >&2; exit 2; }
cat > "$T/conf/nginx.conf" <<CONF
pid $T/nginx.pid;
error_log $T/log/error-main.log warn;
events { worker_connections 64; }
http {
    include $MIME;
    access_log off;
    client_body_temp_path $T/tmp/body;
    proxy_temp_path $T/tmp/proxy;
    fastcgi_temp_path $T/tmp/fastcgi;
    uwsgi_temp_path $T/tmp/uwsgi;
    scgi_temp_path $T/tmp/scgi;
    include $T/conf/revagy.pl.conf;
}
CONF

echo "== nginx -t"
nginx -t -p "$T/conf" -c "$T/conf/nginx.conf" 2>&1 | sed "s|$T|<tmp>|g"
nginx -p "$T/conf" -c "$T/conf/nginx.conf"

BLEDY=0
N=0
ok() { N=$((N + 1)); echo "OK   $1"; }
zle() { N=$((N + 1)); BLEDY=$((BLEDY + 1)); echo "BŁĄD $1"; }
# kod <host> <metoda> <ścieżka> -> kod HTTP (000 = połączenie zamknięte)
kod() { curl -s -o /dev/null -m 10 -X "$2" -H "Host: $1" -w '%{http_code}' "http://127.0.0.1:$PORT$3" || true; }
naglowki() { curl -s -o /dev/null -m 10 -D - -H "Host: $1" "http://127.0.0.1:$PORT$2" || true; }
oczekuj() { # opis oczekiwany faktyczny
    if [ "$2" = "$3" ]; then ok "$1 ($3)"; else zle "$1: oczekiwano $2, jest $3"; fi
}
ma() { # opis tekst-nagłówków wzorzec
    if printf '%s' "$2" | grep -qi -- "$3"; then ok "$1"; else zle "$1: brak „$3”"; fi
}
nie_ma() {
    if printf '%s' "$2" | grep -qi -- "$3"; then zle "$1: jest „$3”"; else ok "$1"; fi
}

echo "== żądania kontrolne"
oczekuj "strona główna" 200 "$(kod revagy.pl GET /)"
H="$(naglowki revagy.pl /)"
ma "strona główna: CSP" "$H" "^content-security-policy: default-src 'self'"
ma "strona główna: HSTS" "$H" "^strict-transport-security: max-age=31536000"
ma "strona główna: Cache-Control no-cache" "$H" "^cache-control: no-cache"
nie_ma "strona główna: bez wersji nginx w nagłówku Server" "$H" "^server: nginx/"
[ "$(printf '%s' "$H" | grep -ci '^strict-transport-security')" = "1" ] && ok "strona główna: HSTS dokładnie raz" || zle "strona główna: HSTS powtórzony"
oczekuj "nieistniejący adres" 404 "$(kod revagy.pl GET /nie-ma.html)"
ma "404: nagłówki bezpieczeństwa" "$(naglowki revagy.pl /nie-ma.html)" "^x-content-type-options: nosniff"
oczekuj "bezpośrednio /404.html" 404 "$(kod revagy.pl GET /404.html)"
oczekuj "plik ukryty /.git/config" 403 "$(kod revagy.pl GET /.git/config)"
ma "style: pamięć podręczna 1 dzień" "$(naglowki revagy.pl /assets/css/styles.css)" "^cache-control: public, max-age=86400"
H="$(naglowki revagy.pl /oferta.html)"
ma "stary adres /oferta.html → /dla-firm.html" "$H" "^location: /dla-firm.html"
ma "przekierowanie: HSTS" "$H" "^strict-transport-security"
H="$(naglowki www.revagy.pl /x?a=1)"
ma "www → domena główna" "$H" "^location: https://revagy.pl/x?a=1"
ma "www: HSTS" "$H" "^strict-transport-security"
oczekuj "nieznana nazwa hosta: połączenie zamknięte" 000 "$(kod obcy.example GET /)"
oczekuj "GET /api/kontakt" 403 "$(kod revagy.pl GET /api/kontakt)"
oczekuj "POST /api/kontakt bez bramki" 502 "$(kod revagy.pl POST /api/kontakt)"
oczekuj "nieznana trasa /api/" 404 "$(kod revagy.pl GET /api/inne)"
oczekuj "status zapytania bez bramki" 502 "$(kod revagy.pl GET /api/kontakt/status/ld_00000000000000000000000000000000)"
oczekuj "status z błędnym identyfikatorem" 404 "$(kod revagy.pl GET /api/kontakt/status/abc)"
# Limit 10 żądań na minutę z zapasem 5: przy 20 szybkich żądaniach część musi dostać 429.
i=0; L429=0
while [ "$i" -lt 20 ]; do
    [ "$(kod revagy.pl POST /api/kontakt)" = "429" ] && L429=$((L429 + 1))
    i=$((i + 1))
done
if [ "$L429" -ge 10 ]; then ok "limit wysyłek formularza: $L429 z 20 żądań dostało 429"; else zle "limit wysyłek formularza: tylko $L429 z 20 żądań dostało 429"; fi
oczekuj "statystyki: panel bez hasła" 401 "$(kod stats.revagy.pl GET /)"
oczekuj "statystyki: index.php bez hasła" 401 "$(kod stats.revagy.pl GET '/index.php?module=Login')"
oczekuj "statystyki: tracker matomo.js bez hasła dochodzi do Matomo" 502 "$(kod stats.revagy.pl GET /matomo.js)"
oczekuj "statystyki: tracker matomo.php bez hasła dochodzi do Matomo" 502 "$(kod stats.revagy.pl POST /matomo.php)"
oczekuj "statystyki: raport z logów bez hasła" 401 "$(kod stats.revagy.pl GET /logi/)"
ma "statystyki: noindex" "$(naglowki stats.revagy.pl /)" "^x-robots-tag: noindex"

echo
if [ "$BLEDY" -gt 0 ]; then echo "Test nginx: $BLEDY z $N sprawdzeń nie przeszło."; exit 1; fi
echo "Test nginx: $N z $N przeszło."
