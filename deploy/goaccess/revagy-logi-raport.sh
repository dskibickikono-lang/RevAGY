#!/bin/sh
# Buduje raport GoAccess z logów nginx strony revagy.pl (bieżący plik + archiwum z 90 dni).
# Instalacja: /usr/local/bin/revagy-logi-raport.sh, uruchamiany co 10 minut z /etc/cron.d/revagy-logi.
# Raport: /var/www/revagy-logi/index.html, dostępny za hasłem pod https://stats.revagy.pl/logi/
set -eu

LOGS=/var/log/nginx/revagy
OUT=/var/www/revagy-logi
NEW="$OUT/.nowy.html"

mkdir -p "$OUT"
[ -f "$LOGS/access.log" ] || exit 0

{
    for f in "$LOGS"/access.log.*.gz; do
        [ -f "$f" ] && zcat "$f"
    done
    [ -f "$LOGS/access.log.1" ] && cat "$LOGS/access.log.1"
    cat "$LOGS/access.log"
} | goaccess - \
    --log-format=COMBINED \
    --html-report-title="revagy.pl: logi serwera" \
    --no-progress \
    -o "$NEW"

mv -f "$NEW" "$OUT/index.html"
