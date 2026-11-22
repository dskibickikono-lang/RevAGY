#!/bin/sh
# Kopia zapasowa bazy Matomo (D-02 z audytu T-028).
# Instalacja: /usr/local/bin/revagy-matomo-kopia.sh, uruchamiany raz na dobę z /etc/cron.d/revagy-matomo-kopia (root).
# Robi zrzut bazy z kontenera `db` (mariadb-dump, spójny, bez blokowania zapisu), sprawdza go i kompresuje,
# zostawia kopie z ostatnich KEEP_DAYS dni. Hasło bazy czyta wyłącznie kontener ze swojego środowiska;
# skrypt go nie zna, nie wypisuje i nie zapisuje.
# Kopia leży na tym samym serwerze: żeby chroniła przed utratą dysku, katalog OUT trzeba dodatkowo
# kopiować poza serwer (krok właściciela, opis w deploy/matomo/README.md).
set -eu
umask 077

COMPOSE_DIR="${REVAGY_MATOMO_DIR:-/opt/revagy/matomo}"
OUT="${REVAGY_MATOMO_KOPIE:-/var/backups/revagy-matomo}"
KEEP_DAYS="${REVAGY_MATOMO_KEEP_DAYS:-14}"
MIN_BYTES="${REVAGY_MATOMO_MIN_BYTES:-10000}"

case "$KEEP_DAYS" in ''|*[!0-9]*) echo "BŁĄD: REVAGY_MATOMO_KEEP_DAYS musi być liczbą dni." >&2; exit 2 ;; esac
[ -f "$COMPOSE_DIR/docker-compose.yml" ] || { echo "BŁĄD: brak $COMPOSE_DIR/docker-compose.yml" >&2; exit 2; }

mkdir -p "$OUT"
exec 9>"$OUT/.kopia.lock"
flock -n 9 || { echo "BŁĄD: inna kopia jest w toku." >&2; exit 1; }

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TMP="$OUT/.matomo-$STAMP.sql.tmp"
DEST="$OUT/matomo-$STAMP.sql.gz"
trap 'rm -f "$TMP" "$TMP.gz"' EXIT
trap 'exit 130' INT TERM HUP

cd "$COMPOSE_DIR"
# Hasło i nazwa bazy pochodzą ze zmiennych kontenera (MARIADB_PASSWORD), nie z argumentów tego skryptu.
docker compose exec -T db sh -c 'exec mariadb-dump --single-transaction --quick --routines -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' > "$TMP"

BYTES="$(wc -c < "$TMP")"
[ "$BYTES" -ge "$MIN_BYTES" ] || { echo "BŁĄD: zrzut ma tylko $BYTES B (minimum $MIN_BYTES B)." >&2; exit 1; }
# mariadb-dump kończy poprawny zrzut wierszem „-- Dump completed”.
tail -n 5 "$TMP" | grep -q '^-- Dump completed' || { echo "BŁĄD: zrzut jest niepełny (brak wiersza „Dump completed”)." >&2; exit 1; }

gzip -9 "$TMP"
gzip -t "$TMP.gz"
mv -f "$TMP.gz" "$DEST"
chmod 600 "$DEST"

find "$OUT" -maxdepth 1 -type f -name 'matomo-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
printf 'Kopia Matomo: %s (%s B przed kompresją), w katalogu jest %s kopii.\n' "$DEST" "$BYTES" "$(find "$OUT" -maxdepth 1 -type f -name 'matomo-*.sql.gz' | wc -l)"
