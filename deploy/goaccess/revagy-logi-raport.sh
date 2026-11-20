#!/bin/sh
# Buduje raport GoAccess z logów nginx strony revagy.pl (bieżący plik + archiwum z 90 dni).
# Instalacja: /usr/local/bin/revagy-logi-raport.sh, uruchamiany co 10 minut z /etc/cron.d/revagy-logi.
# Raport: /var/www/revagy-logi/index.html, dostępny za hasłem pod https://stats.revagy.pl/logi/
# Dodatkowo: /var/www/revagy-logi/boty-ai.txt — dzienna liczba żądań botów AI (pod tym samym hasłem).
# Boty AI nie wykonują JavaScriptu i nie widać ich w Matomo; logi serwera to jedyne źródło tego pomiaru.
set -eu

LOGS="${REVAGY_LOGS:-/var/log/nginx/revagy}"
OUT="${REVAGY_LOGI_OUT:-/var/www/revagy-logi}"
NEW="$OUT/.nowy.html"
NEW_BOTY="$OUT/.boty-ai.txt"
BOTY="$(mktemp "${TMPDIR:-/tmp}/revagy-boty-ai.XXXXXX")"
trap 'rm -f "$BOTY"' EXIT INT TERM

# Boty AI jako osobne pozycje w panelu „Browsers” GoAccess (kategoria Crawlers, więc nie zawyżają
# liczby odwiedzających). Format pliku GoAccess: fragment user agenta, TAB, kategoria.
# Google-Extended i Applebot-Extended to tylko tokeny w robots.txt, nie user agenty — ich tu nie ma.
for _bot in GPTBot OAI-SearchBot ChatGPT-User ClaudeBot Claude-User Claude-SearchBot anthropic-ai \
    PerplexityBot Perplexity-User Google-CloudVertexBot meta-externalagent Amazonbot Bytespider \
    CCBot DuckAssistBot MistralAI-User cohere-ai YouBot Diffbot; do
    printf '%s\tCrawlers\n' "$_bot"
done > "$BOTY"

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
    --browsers-file="$BOTY" \
    --html-report-title="revagy.pl: logi serwera" \
    --no-progress \
    -o "$NEW"

mv -f "$NEW" "$OUT/index.html"

# Dzienne zestawienie botów AI: data (z logu), bot, liczba żądań, liczba różnych adresów.
{
    for f in "$LOGS"/access.log.*.gz; do
        [ -f "$f" ] && zcat "$f"
    done
    [ -f "$LOGS/access.log.1" ] && cat "$LOGS/access.log.1"
    cat "$LOGS/access.log"
} | awk -v listfile="$BOTY" '
    BEGIN {
        FS = "\""
        while ((getline line < listfile) > 0) { split(line, p, "\t"); boty[++n] = p[1] }
        m["Jan"]="01"; m["Feb"]="02"; m["Mar"]="03"; m["Apr"]="04"; m["May"]="05"; m["Jun"]="06"
        m["Jul"]="07"; m["Aug"]="08"; m["Sep"]="09"; m["Oct"]="10"; m["Nov"]="11"; m["Dec"]="12"
    }
    {
        ua = $6
        for (i = 1; i <= n; i++) {
            if (index(ua, boty[i])) {
                # $1 = "IP - - [20/Nov/2026:17:40:00 +0000] ", $2 = "GET /oferta.html HTTP/1.1"
                d = substr($1, index($1, "[") + 1, 11)
                dzien = substr(d, 8, 4) "-" m[substr(d, 4, 3)] "-" substr(d, 1, 2)
                split($2, req, " ")
                k = dzien "\t" boty[i]
                zad[k]++
                if (!((k SUBSEP req[2]) in widz)) { widz[k SUBSEP req[2]] = 1; adr[k]++ }
                break
            }
        }
    }
    END { for (k in zad) print k "\t" zad[k] "\t" adr[k] }
' | LC_ALL=C sort -r > "$NEW_BOTY.dane"
{
    printf 'revagy.pl: boty AI w logach serwera (90 dni), stan %s\n\n' "$(date -u +%Y-%m-%dT%H:%MZ)"
    printf 'dzien\tbot\tzadania\tadresy\n'
    cat "$NEW_BOTY.dane"
} > "$NEW_BOTY"
rm -f "$NEW_BOTY.dane"
chmod 644 "$NEW_BOTY"
mv -f "$NEW_BOTY" "$OUT/boty-ai.txt"
