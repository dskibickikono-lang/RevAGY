#!/bin/sh
# Test deploy/matomo/revagy-matomo-kopia.sh bez Dockera: polecenie `docker` jest atrapą, która wypisuje zrzut.
# Użycie: sh tools/test-matomo-kopia.sh
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
T="$(mktemp -d "${TMPDIR:-/tmp}/revagy-kopia.XXXXXX")"
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/compose" "$T/out"
: > "$T/compose/docker-compose.yml"
cat > "$T/bin/docker" <<'ATRAPA'
#!/bin/sh
# atrapa: `docker compose exec -T db sh -c ...`
case "${ATRAPA_TRYB:-ok}" in
  ok) i=0; while [ "$i" -lt 400 ]; do echo "INSERT INTO matomo_log_visit VALUES ($i,'x');"; i=$((i+1)); done; echo "-- Dump completed on 2026-11-22  3:17:00" ;;
  uciety) i=0; while [ "$i" -lt 400 ]; do echo "INSERT INTO matomo_log_visit VALUES ($i,'x');"; i=$((i+1)); done ;;
  pusty) echo "-- Dump completed" ;;
  blad) exit 1 ;;
esac
ATRAPA
chmod +x "$T/bin/docker"
N=0; BLEDY=0
ok() { N=$((N+1)); echo "OK   $1"; }
zle() { N=$((N+1)); BLEDY=$((BLEDY+1)); echo "BŁĄD $1"; }
uruchom() { PATH="$T/bin:$PATH" REVAGY_MATOMO_DIR="$T/compose" REVAGY_MATOMO_KOPIE="$T/out" ATRAPA_TRYB="$1" sh "$ROOT/deploy/matomo/revagy-matomo-kopia.sh" >"$T/log" 2>&1; }
ile() { find "$T/out" -maxdepth 1 -type f -name 'matomo-*.sql.gz' | wc -l | tr -d ' '; }

if uruchom ok && [ "$(ile)" = "1" ]; then ok "poprawny zrzut daje jedną kopię"; else zle "poprawny zrzut: $(cat "$T/log")"; fi
F="$(find "$T/out" -name 'matomo-*.sql.gz' | head -1)"
if [ -n "$F" ] && gunzip -c "$F" | tail -1 | grep -q 'Dump completed'; then ok "kopia rozpakowuje się i jest kompletna"; else zle "kopia nie jest kompletna"; fi
if [ -n "$F" ] && [ "$(stat -c %a "$F")" = "600" ]; then ok "kopia ma tryb 600"; else zle "kopia ma zły tryb"; fi
if uruchom uciety; then zle "ucięty zrzut został przyjęty"; else ok "ucięty zrzut odrzucony"; fi
if uruchom pusty; then zle "za mały zrzut został przyjęty"; else ok "za mały zrzut odrzucony"; fi
if uruchom blad; then zle "błąd mariadb-dump został przyjęty"; else ok "błąd mariadb-dump zatrzymuje skrypt"; fi
if [ "$(ile)" = "1" ] && [ -z "$(find "$T/out" -name '*.tmp*')" ]; then ok "po nieudanych przebiegach zostaje tylko dobra kopia, bez plików tymczasowych"; else zle "zostały śmieci po nieudanych przebiegach"; fi
touch -d '20 days ago' "$T/out/matomo-20260101T000000Z.sql.gz"
sleep 1
if uruchom ok && [ ! -e "$T/out/matomo-20260101T000000Z.sql.gz" ] && [ "$(ile)" = "2" ]; then ok "kopie starsze niż 14 dni są usuwane"; else zle "retencja: $(ls "$T/out")"; fi
if grep -rqE 'MARIADB_PASSWORD=|-p[a-zA-Z0-9]{4,}' "$ROOT/deploy/matomo/revagy-matomo-kopia.sh"; then zle "skrypt zawiera wpisane hasło"; else ok "skrypt nie zawiera hasła"; fi
echo
if [ "$BLEDY" -gt 0 ]; then echo "Test kopii Matomo: $BLEDY z $N nie przeszło."; exit 1; fi
echo "Test kopii Matomo: $N z $N przeszło."
