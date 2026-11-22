# Matomo: kopia zapasowa i odtworzenie

Dotyczy danych statystyk z `stats.revagy.pl` (wolumeny `db` i `matomo` z `docker-compose.yml`).
Wszystkie kroki na serwerze wykonuje właściciel albo operator za jego osobną zgodą.

## Co jest w repozytorium

- `revagy-matomo-kopia.sh`: dobowy zrzut bazy do `/var/backups/revagy-matomo/` z kontrolą kompletności,
  kompresją i usuwaniem kopii starszych niż 14 dni. Hasła bazy skrypt nie zna: używa go wyłącznie kontener.
- Test skryptu bez Dockera: `sh tools/test-matomo-kopia.sh` (atrapa polecenia `docker`).

## Instalacja (jednorazowo)

1. Skopiuj skrypt: `/usr/local/bin/revagy-matomo-kopia.sh`, właściciel root, tryb `750`.
2. Dodaj plik `/etc/cron.d/revagy-matomo-kopia` z jednym wierszem:
   `17 3 * * * root /usr/local/bin/revagy-matomo-kopia.sh >> /var/log/revagy-matomo-kopia.log 2>&1`
3. Uruchom raz ręcznie i sprawdź, że w `/var/backups/revagy-matomo/` powstał plik `matomo-<data>.sql.gz`.
4. Kopia poza serwerem: katalog `/var/backups/revagy-matomo/` trzeba kopiować w drugie miejsce
   (inny serwer albo magazyn plików). Bez tego kopia nie chroni przed utratą dysku. Miejsce wybiera właściciel.

## Próba odtworzenia (raz po instalacji, potem co kwartał)

Próba idzie do osobnego, tymczasowego kontenera. Nie dotyka działającej bazy.

```bash
KOPIA="$(ls -1t /var/backups/revagy-matomo/matomo-*.sql.gz | head -1)"
docker run -d --name revagy-matomo-proba -e MARIADB_RANDOM_ROOT_PASSWORD=1 \
  -e MARIADB_DATABASE=matomo -e MARIADB_USER=proba -e MARIADB_PASSWORD=proba mariadb:11.4
sleep 30
gunzip -c "$KOPIA" | docker exec -i revagy-matomo-proba mariadb -uproba -pproba matomo
docker exec revagy-matomo-proba mariadb -uproba -pproba matomo -N -e \
  "SELECT COUNT(*) FROM matomo_log_visit; SELECT MAX(visit_last_action_time) FROM matomo_log_visit;"
docker rm -f revagy-matomo-proba
```

Wynik próby to dwie liczby: liczba wizyt i data ostatniej wizyty w kopii. Zapisz je z datą próby w karcie zadania.
Hasło `proba` dotyczy wyłącznie kontenera tymczasowego, który po próbie znika.

## Odtworzenie po awarii

1. Postaw kontenery z `docker-compose.yml` (plik `.env` z hasłami jest tylko na serwerze).
2. Wczytaj ostatnią kopię: `gunzip -c <kopia> | docker compose exec -T db sh -c 'exec mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"'`.
3. Pliki Matomo (wolumen `matomo`) odtwarza obraz; plik `config/config.ini.php` trzeba odtworzyć z kopii
   albo przejść instalator za blokadą z `deploy/nginx/revagy.pl.conf`. Kopia tego pliku zawiera hasło bazy,
   więc nie trafia do repozytorium.

## Czego ta kopia nie obejmuje

- Danych bramki formularza (osobna usługa, poza tym repozytorium).
- Logów nginx (rotacja 90 dni, bez kopii).
