#!/bin/sh
# Publikuje nowe wydanie strony: kopiuje katalog site/ do /var/www/revagy.pl/releases/<sha>
# i przełącza dowiązanie /var/www/revagy.pl/current. Poprzednie wydania zostają (szybki powrót).
#
# Użycie (jako root):  sh deploy/wydanie.sh <ścieżka do katalogu site> <sha commita>
# Powrót do poprzedniego wydania:  ln -sfn /var/www/revagy.pl/releases/<stary sha> /var/www/revagy.pl/current
set -eu

SRC="${1:?podaj ścieżkę do katalogu site}"
SHA="${2:?podaj sha commita}"
BASE=/var/www/revagy.pl
DEST="$BASE/releases/$SHA"

[ -f "$SRC/index.html" ] || { echo "Brak $SRC/index.html. To nie jest katalog site." >&2; exit 1; }
case "$SHA" in *[!0-9a-f]*|"") echo "Nieprawidłowe sha: $SHA" >&2; exit 1 ;; esac

mkdir -p "$BASE/releases"
if [ -e "$DEST" ]; then
    echo "Wydanie $SHA już istnieje, przełączam tylko dowiązanie."
else
    cp -R "$SRC" "$DEST"
    chown -R root:root "$DEST"
    find "$DEST" -type d -exec chmod 755 {} +
    find "$DEST" -type f -exec chmod 644 {} +
fi

ln -sfn "$DEST" "$BASE/current"
echo "Aktualne wydanie: $(readlink "$BASE/current")"
