#!/bin/sh
# Atomowy skrypt publikacji i rollbacku strony REVAGY (zgodny z POSIX sh / dash).
#
# Tryby użycia (na produkcji jako root; REVAGY_BASE wyłącznie dla izolowanych testów):
#   1. Publikacja nowego wydania:
#      sh deploy/wydanie.sh <dist> <sha-commita> <oczekiwany-biezacy-sha> <manifest> <sha256-manifestu>
#   2. Inicjalizacja i weryfikacja manifestu zastanego release (pod blokadą flock):
#      sh deploy/wydanie.sh --init-manifest <sha-istniejacego-release> <manifest-referencyjny> <sha256-manifestu>
#   3. Atomowy rollback do zweryfikowanego wydania:
#      sh deploy/wydanie.sh --rollback <sha-docelowy> <oczekiwany-biezacy-sha> [<manifest-referencyjny> <sha256-manifestu>]
set -eu
umask 022

BASE_INPUT="${REVAGY_BASE:-/var/www/revagy.pl}"

CLEANUP_STAGE=""
CLEANUP_TMP_LINK=""
CLEANUP_TMP_FILE1=""
CLEANUP_TMP_FILE2=""
CLEANUP_TMP_MAN=""

cleanup() {
    if [ -n "$CLEANUP_TMP_LINK" ] && [ -L "$CLEANUP_TMP_LINK" -o -e "$CLEANUP_TMP_LINK" ]; then
        rm -f -- "$CLEANUP_TMP_LINK" 2>/dev/null || true
    fi
    if [ -n "$CLEANUP_TMP_MAN" ] && [ -e "$CLEANUP_TMP_MAN" ]; then
        rm -f -- "$CLEANUP_TMP_MAN" 2>/dev/null || true
    fi
    if [ -n "$CLEANUP_TMP_FILE1" ] && [ -e "$CLEANUP_TMP_FILE1" ]; then
        rm -f -- "$CLEANUP_TMP_FILE1" 2>/dev/null || true
    fi
    if [ -n "$CLEANUP_TMP_FILE2" ] && [ -e "$CLEANUP_TMP_FILE2" ]; then
        rm -f -- "$CLEANUP_TMP_FILE2" 2>/dev/null || true
    fi
    if [ -n "$CLEANUP_STAGE" ] && [ -d "$CLEANUP_STAGE" ]; then
        rm -rf -- "$CLEANUP_STAGE" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM HUP

die() {
    printf 'BŁĄD: %s\n' "$1" >&2
    exit 1
}

validate_sha40() {
    case "$1" in
        *[!0-9a-f]*|"") die "Nieprawidłowy SHA-1 (oczekiwano 40 małych znaków hex): $1" ;;
    esac
    [ "${#1}" -eq 40 ] || die "Nieprawidłowa długość SHA-1 (wymagane 40 znaków): $1"
}

validate_sha256() {
    case "$1" in
        *[!0-9a-f]*|"") die "Nieprawidłowy SHA-256 (oczekiwano 64 małe znaki hex): $1" ;;
    esac
    [ "${#1}" -eq 64 ] || die "Nieprawidłowa długość SHA-256 (wymagane 64 znaki): $1"
}

check_safe_path_perms() {
    [ -e "$1" ] || die "Ścieżka nie istnieje: $1"
    [ ! -L "$1" ] || die "Ścieżka nie może być symlinkiem: $1"
    if [ -n "$(find "$1" -maxdepth 0 -perm /022 -print)" ]; then
        die "Ścieżka ma niedozwolone uprawnienia zapisu dla grupy/innych: $1"
    fi
}

validate_tree_safe() {
    _dir="$1"
    [ -d "$_dir" ] && [ ! -L "$_dir" ] || die "Katalog nie istnieje lub jest symlinkiem: $_dir"

    if [ -n "$(find "$_dir" -type l -print -quit)" ]; then
        die "Wykryto niedozwolony symlink w $_dir"
    fi
    if [ -n "$(find "$_dir" ! -type f ! -type d -print -quit)" ]; then
        die "Wykryto niedozwolony plik specjalny w $_dir"
    fi
    if [ -n "$(find "$_dir" -type f -links +1 -print -quit)" ]; then
        die "Wykryto niedozwolony hardlink (nlink > 1) w $_dir"
    fi
    if [ -n "$(find "$_dir" -perm /022 -print -quit)" ]; then
        die "Wykryto plik lub katalog zapisywalny przez grupę/innych w $_dir"
    fi

    for _req in \
        index.html \
        polityka-prywatnosci.html \
        404.html \
        robots.txt \
        sitemap.xml \
        site.webmanifest \
        favicon.ico
    do
        [ -f "$_dir/$_req" ] || die "Brak wymaganego pliku $_req w $_dir"
    done
}

verify_manifest_file() {
    _man="$1"
    _expected_sha="$2"
    [ -f "$_man" ] && [ ! -L "$_man" ] || die "Manifest nie istnieje lub jest symlinkiem: $_man"
    check_safe_path_perms "$_man"

    _got_sha="$(sha256sum -- "$_man" | awk '{print $1}')"
    [ "$_got_sha" = "$_expected_sha" ] || die "Suma SHA-256 manifestu niezgodna (oczekiwano $_expected_sha, jest $_got_sha)"

    [ -s "$_man" ] || die "Plik manifestu jest pusty: $_man"

    # Walidacja składni każdego wiersza i deterministycznej kolejności LC_ALL=C
    _tmp_check="$(mktemp "${TMPDIR:-/tmp}/revagy-mancheck.XXXXXX")"
    CLEANUP_TMP_FILE1="$_tmp_check"
    awk '
        BEGIN { ok = 1 }
        !/^[0-9a-f]{64}  [^\/].*$/ { ok = 0; exit 1 }
        /(^|\/)\.\.(\/|$)/ { ok = 0; exit 1 }
        { print substr($0, 67) }
        END { if (!ok || NR == 0) exit 1 }
    ' "$_man" > "$_tmp_check" || die "Nieprawidłowy format wpisów w manifeście: $_man"

    _tmp_sorted="$(mktemp "${TMPDIR:-/tmp}/revagy-mansort.XXXXXX")"
    CLEANUP_TMP_FILE2="$_tmp_sorted"
    LC_ALL=C sort -u "$_tmp_check" > "$_tmp_sorted"
    cmp -s "$_tmp_check" "$_tmp_sorted" || die "Wpisy manifestu nie są unikalne lub nie są posortowane wg LC_ALL=C: $_man"
    rm -f -- "$_tmp_check" "$_tmp_sorted"
    CLEANUP_TMP_FILE1=""
    CLEANUP_TMP_FILE2=""
}

generate_tree_manifest() {
    _dir="$1"
    _out="$2"
    (
        cd "$_dir"
        LC_ALL=C find . -type f | sed 's|^\./||' | LC_ALL=C sort | while IFS= read -r _rel; do
            sha256sum -- "$_rel"
        done
    ) > "$_out"
}

resolve_base() {
    [ -d "$BASE_INPUT" ] || die "Katalog bazowy nie istnieje: $BASE_INPUT"
    [ ! -L "$BASE_INPUT" ] || die "Katalog bazowy nie może być symlinkiem: $BASE_INPUT"
    BASE="$(readlink -f -- "$BASE_INPUT")"
    check_safe_path_perms "$BASE"
    mkdir -p "$BASE/releases" "$BASE/manifests" "$BASE/.staging"
    check_safe_path_perms "$BASE/releases"
    check_safe_path_perms "$BASE/manifests"
}

acquire_lock() {
    exec 9>"$BASE/.deploy.lock"
    flock -x 9
}

verify_expected_current() {
    _expected="$1"
    validate_sha40 "$_expected"
    [ -L "$BASE/current" ] || die "$BASE/current nie jest symlinkiem"
    _curr_target="$(readlink -f -- "$BASE/current")" || die "Nie można rozwiązać $BASE/current"
    _expected_target="$BASE/releases/$_expected"
    [ "$_curr_target" = "$_expected_target" ] || die "Bieżący release niezgodny (oczekiwano $_expected_target, jest $_curr_target)"
}

verify_release_matches_manifest() {
    _rel_sha="$1"
    _rel_dir="$BASE/releases/$_rel_sha"
    _rel_man="$BASE/manifests/$_rel_sha.sha256"

    validate_tree_safe "$_rel_dir"
    [ -f "$_rel_man" ] && [ ! -L "$_rel_man" ] || die "Brak zweryfikowanego manifestu rollbacku dla $_rel_sha: $_rel_man (uruchom najpierw --init-manifest)"
    check_safe_path_perms "$_rel_man"
    _rel_man_sha="$(sha256sum -- "$_rel_man" | awk '{print $1}')"
    verify_manifest_file "$_rel_man" "$_rel_man_sha"

    _tmp_rel_gen="$(mktemp "$BASE/manifests/.ver-$_rel_sha.XXXXXX")"
    CLEANUP_TMP_FILE1="$_tmp_rel_gen"
    generate_tree_manifest "$_rel_dir" "$_tmp_rel_gen"
    cmp -s "$_tmp_rel_gen" "$_rel_man" || die "Zawartość wydania $_rel_dir nie zgadza się z manifestem $_rel_man"
    rm -f -- "$_tmp_rel_gen"
    CLEANUP_TMP_FILE1=""
}

atomic_switch_current() {
    _target="$1"
    _tmp_link="$BASE/.current.tmp.$$"
    CLEANUP_TMP_LINK="$_tmp_link"
    ln -sfn "$_target" "$_tmp_link"
    mv -Tf "$_tmp_link" "$BASE/current"
    CLEANUP_TMP_LINK=""
    _final="$(readlink -f -- "$BASE/current")"
    [ "$_final" = "$_target" ] || die "Weryfikacja przełączenia current nie powiodła się ($_final != $_target)"
}

do_init_manifest() {
    [ "$#" -eq 3 ] || die "Użycie: $0 --init-manifest <sha> <manifest-referencyjny> <sha256-manifestu>"
    _sha="$1"
    _ref_man_raw="$2"
    _ref_sha="$3"

    validate_sha40 "$_sha"
    validate_sha256 "$_ref_sha"
    resolve_base
    _ref_man="$(readlink -f -- "$_ref_man_raw")"
    verify_manifest_file "$_ref_man" "$_ref_sha"

    acquire_lock

    _dest="$BASE/releases/$_sha"
    _dest_man="$BASE/manifests/$_sha.sha256"
    validate_tree_safe "$_dest"

    _tmp_gen="$(mktemp "$BASE/manifests/.gen-$_sha.XXXXXX")"
    CLEANUP_TMP_FILE1="$_tmp_gen"
    generate_tree_manifest "$_dest" "$_tmp_gen"
    cmp -s "$_tmp_gen" "$_ref_man" || die "Zawartość $_dest nie zgadza się z manifestem referencyjnym"
    rm -f -- "$_tmp_gen"
    CLEANUP_TMP_FILE1=""

    if [ -e "$_dest_man" ]; then
        [ -f "$_dest_man" ] && [ ! -L "$_dest_man" ] || die "Istniejący manifest nie jest zwykłym plikiem: $_dest_man"
        cmp -s "$_dest_man" "$_ref_man" || die "Istniejący manifest $_dest_man różni się od referencji"
        printf 'Manifest dla %s jest już zapisany i zweryfikowany: %s\n' "$_sha" "$_dest_man"
    else
        _tmp_man="$(mktemp "$BASE/manifests/.tmp-$_sha.XXXXXX")"
        CLEANUP_TMP_MAN="$_tmp_man"
        cp -- "$_ref_man" "$_tmp_man"
        chmod 644 "$_tmp_man"
        mv -Tf "$_tmp_man" "$_dest_man"
        CLEANUP_TMP_MAN=""
        printf 'Zainicjalizowano manifest dla %s: %s\n' "$_sha" "$_dest_man"
    fi
}

do_rollback() {
    if [ "$#" -ne 2 ] && [ "$#" -ne 4 ]; then
        die "Użycie: $0 --rollback <sha-docelowy> <oczekiwany-biezacy-sha> [<manifest-referencyjny> <sha256-manifestu>]"
    fi
    _target_sha="$1"
    _expected_curr="$2"
    _opt_man=""
    _opt_sha=""
    if [ "$#" -eq 4 ]; then
        _opt_man="$(readlink -f -- "$3")"
        _opt_sha="$4"
        validate_sha256 "$_opt_sha"
        verify_manifest_file "$_opt_man" "$_opt_sha"
    fi

    validate_sha40 "$_target_sha"
    validate_sha40 "$_expected_curr"
    resolve_base
    acquire_lock

    verify_expected_current "$_expected_curr"

    _target_dir="$BASE/releases/$_target_sha"
    _target_man="$BASE/manifests/$_target_sha.sha256"

    verify_release_matches_manifest "$_target_sha"

    if [ -n "$_opt_man" ]; then
        cmp -s "$_target_man" "$_opt_man" || die "Manifest w $_target_man nie zgadza się z przekazaną referencją"
    fi

    atomic_switch_current "$_target_dir"
    printf 'Rollback zakończony. Aktualne wydanie: %s\n' "$(readlink "$BASE/current")"
}

do_publish() {
    [ "$#" -eq 5 ] || die "Użycie: $0 <dist> <sha-commita> <oczekiwany-biezacy-sha> <manifest> <sha256-manifestu>"
    _src_raw="$1"
    _sha="$2"
    _expected_curr="$3"
    _man_raw="$4"
    _man_sha="$5"

    validate_sha40 "$_sha"
    validate_sha40 "$_expected_curr"
    validate_sha256 "$_man_sha"
    resolve_base

    # Kanonizacja ścieżek i blokada źródła wewnątrz current/releases
    [ -d "$_src_raw" ] || die "Źródło nie jest katalogiem: $_src_raw"
    check_safe_path_perms "$_src_raw"
    _src_real="$(readlink -f -- "$_src_raw")"
    check_safe_path_perms "$_src_real"

    case "$_src_raw" in
        "$BASE/current"|"$BASE/current/"*|"$BASE/releases"|"$BASE/releases/"*)
            die "Źródło nie może wskazywać na current ani releases: $_src_raw"
            ;;
    esac
    case "$_src_real" in
        "$BASE/current"|"$BASE/current/"*|"$BASE/releases"|"$BASE/releases/"*)
            die "Kanoniczna ścieżka źródła nie może być w current ani releases: $_src_real"
            ;;
    esac
    if [ -L "$BASE/current" ] || [ -e "$BASE/current" ]; then
        _curr_check="$(readlink -f -- "$BASE/current" || true)"
        if [ -n "$_curr_check" ]; then
            case "$_src_real" in
                "$_curr_check"|"$_curr_check/"*)
                    die "Źródło nie może znajdować się w aktywnym wydaniu current: $_src_real"
                    ;;
            esac
        fi
    fi

    _ref_man="$(readlink -f -- "$_man_raw")"
    verify_manifest_file "$_ref_man" "$_man_sha"
    validate_tree_safe "$_src_real"

    _tmp_src_gen="$(mktemp "${TMPDIR:-/tmp}/revagy-srcgen.XXXXXX")"
    CLEANUP_TMP_FILE1="$_tmp_src_gen"
    generate_tree_manifest "$_src_real" "$_tmp_src_gen"
    cmp -s "$_tmp_src_gen" "$_ref_man" || die "Zawartość źródła $_src_real (brak, zmiana lub plik nadmiarowy) nie zgadza się z manifestem $_ref_man"
    rm -f -- "$_tmp_src_gen"
    CLEANUP_TMP_FILE1=""

    acquire_lock

    verify_expected_current "$_expected_curr"
    verify_release_matches_manifest "$_expected_curr"

    _dest="$BASE/releases/$_sha"
    _dest_man="$BASE/manifests/$_sha.sha256"

    if [ -L "$_dest" ]; then
        die "Docelowa ścieżka wydania jest symlinkiem: $_dest"
    fi

    if [ -e "$_dest" ]; then
        # Katalog już istnieje: musi mieć zgodny manifest i 100% zgodną zawartość (bezpieczne retry po finalizacji)
        [ -d "$_dest" ] || die "Docelowa ścieżka istnieje i nie jest katalogiem: $_dest"
        [ -f "$_dest_man" ] && [ ! -L "$_dest_man" ] || die "Istniejący katalog $_dest nie ma manifestu $_dest_man — automatyczna publikacja zablokowana"
        check_safe_path_perms "$_dest_man"
        cmp -s "$_dest_man" "$_ref_man" || die "Istniejące wydanie $_sha ma inny manifest niż nowy artefakt"
        validate_tree_safe "$_dest"
        _tmp_dest_gen="$(mktemp "$BASE/manifests/.dest-$_sha.XXXXXX")"
        CLEANUP_TMP_FILE1="$_tmp_dest_gen"
        generate_tree_manifest "$_dest" "$_tmp_dest_gen"
        cmp -s "$_tmp_dest_gen" "$_dest_man" || die "Istniejące wydanie $_dest nie zgadza się z manifestem $_dest_man"
        rm -f -- "$_tmp_dest_gen"
        CLEANUP_TMP_FILE1=""
    else
        # Katalog docelowy nie istnieje; jeśli manifest już istnieje (przerwanie przed finalizacją), musi się zgadzać
        if [ -e "$_dest_man" ]; then
            [ -f "$_dest_man" ] && [ ! -L "$_dest_man" ] || die "Istniejący manifest nie jest zwykłym plikiem: $_dest_man"
            check_safe_path_perms "$_dest_man"
            cmp -s "$_dest_man" "$_ref_man" || die "Istniejący manifest $_dest_man różni się od referencyjnego (retry zablokowany)"
        fi

        _stage="$(mktemp -d "$BASE/.staging/release-$_sha.XXXXXX")"
        CLEANUP_STAGE="$_stage"

        cp -R "$_src_real/." "$_stage/"
        if [ "$(id -u)" -eq 0 ]; then
            chown -R root:root "$_stage"
        fi
        find "$_stage" -type d -exec chmod 755 {} +
        find "$_stage" -type f -exec chmod 644 {} +

        validate_tree_safe "$_stage"
        _tmp_stage_gen="$(mktemp "$BASE/.staging/gen-$_sha.XXXXXX")"
        CLEANUP_TMP_FILE1="$_tmp_stage_gen"
        generate_tree_manifest "$_stage" "$_tmp_stage_gen"
        cmp -s "$_tmp_stage_gen" "$_ref_man" || die "Staging $_stage nie zgadza się z manifestem referencyjnym"
        rm -f -- "$_tmp_stage_gen"
        CLEANUP_TMP_FILE1=""

        if [ ! -e "$_dest_man" ]; then
            _tmp_man="$(mktemp "$BASE/manifests/.tmp-$_sha.XXXXXX")"
            CLEANUP_TMP_MAN="$_tmp_man"
            cp -- "$_ref_man" "$_tmp_man"
            chmod 644 "$_tmp_man"
            mv -Tf "$_tmp_man" "$_dest_man"
            CLEANUP_TMP_MAN=""
        fi

        mv -T "$_stage" "$_dest"
        CLEANUP_STAGE=""

        validate_tree_safe "$_dest"
        _tmp_post_gen="$(mktemp "$BASE/manifests/.post-$_sha.XXXXXX")"
        CLEANUP_TMP_FILE1="$_tmp_post_gen"
        generate_tree_manifest "$_dest" "$_tmp_post_gen"
        cmp -s "$_tmp_post_gen" "$_dest_man" || die "Weryfikacja po finalizacji $_dest nie powiodła się"
        rm -f -- "$_tmp_post_gen"
        CLEANUP_TMP_FILE1=""
    fi

    verify_release_matches_manifest "$_expected_curr"
    atomic_switch_current "$_dest"
    printf 'Aktualne wydanie: %s\n' "$(readlink "$BASE/current")"
}

[ "$#" -ge 1 ] || die "Brak argumentów. Użycie: $0 <dist> <sha> <expected_curr_sha> <manifest> <manifest_sha256> | --init-manifest ... | --rollback ..."

case "$1" in
    --init-manifest)
        shift
        do_init_manifest "$@"
        ;;
    --rollback)
        shift
        do_rollback "$@"
        ;;
    --*)
        die "Nieznana opcja: $1"
        ;;
    *)
        do_publish "$@"
        ;;
esac
