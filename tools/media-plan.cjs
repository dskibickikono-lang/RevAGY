#!/usr/bin/env node
/* Plan renderu mediów dla .github/workflows/render-media.yml (D-032).
   Dla każdej sceny wybiera tryb:
     film — wpis sceny w src/config/filmy.mjs ma ustawiony czas (czasSekundy); render-videos.cjs: .webm, .mp4, .jpg,
     kadr — w przeciwnym razie; render-kadr.cjs: <scena>-kadr.jpg.
   Scenę w trybie „film” pomija, gdy trzy pliki filmu są już w repozytorium, a scena i wspólne pliki renderu
   nie zmieniły się od poprzedniego wypchnięcia gałęzi (wtedy render dałby te same pliki).

   Użycie:
     node tools/media-plan.cjs --zmienione=<plik z listą ścieżek> [--zmienione-od-poprzedniego=<plik z listą ścieżek>]
     node tools/media-plan.cjs --scena=<nazwa> --tryb=kadr|film        (uruchomienie ręczne)
   Wynik na stdout: jedna linia na scenę, „<scena> <tryb>”; pominięte sceny z powodem na stderr.
   --zmienione-od-poprzedniego: ścieżki zmienione od poprzedniego wypchnięcia; brak opcji = nie wiadomo, nic nie pomijamy. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.join(__dirname, '..');
const NAZWA = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WSPOLNE = /^(tools\/scenes\/(engine\.js|scene\.css)|tools\/render-(kadr|videos)\.cjs|\.github\/workflows\/render-media\.yml)$/;
const WSPOLNE_FILMU = /^(tools\/scenes\/(engine\.js|scene\.css)|tools\/render-videos\.cjs)$/;

/**
 * @param {object} a
 * @param {string[]} a.zmienione ścieżki zmienione w PR względem gałęzi bazowej
 * @param {string[]|null} a.zmienioneOdPoprzedniego ścieżki zmienione od poprzedniego wypchnięcia (null = nieznane)
 * @param {Record<string, {czasSekundy?: number|null}>} a.filmy obiekt FILMY z src/config/filmy.mjs
 * @param {string[]} a.filmyPodstron nazwy filmów z tools/podstrony.json (pole "film" jako tekst)
 * @param {(rel: string) => boolean} a.istnieje czy plik istnieje w repozytorium (ścieżka względna)
 * @returns {{ plan: {scena: string, tryb: 'kadr'|'film'}[], pominiete: {scena: string, powod: string}[] }}
 */
function planuj({ zmienione, zmienioneOdPoprzedniego = null, filmy, filmyPodstron, istnieje }) {
  const sceny = new Set();
  for (const p of zmienione) {
    const m = /^tools\/scenes\/([a-z0-9-]+)\.html$/.exec(p);
    if (m && m[1] !== 'og-image') sceny.add(m[1]);
  }
  if (zmienione.some((p) => WSPOLNE.test(p))) for (const f of filmyPodstron) sceny.add(f);
  // Zmiana src/config/filmy.mjs: filmy z ustawionym czasem, których plików jeszcze nie ma (np. wpisany czas bez zmiany sceny).
  if (zmienione.includes('src/config/filmy.mjs')) {
    for (const [nazwa, wpis] of Object.entries(filmy)) {
      const film = wpis && Number.isInteger(wpis.czasSekundy) && wpis.czasSekundy > 0;
      const sa = ['webm', 'mp4', 'jpg'].every((e) => istnieje(`public/assets/video/${nazwa}.${e}`));
      if (film && !sa) sceny.add(nazwa);
    }
  }
  const plan = [];
  const pominiete = [];
  for (const scena of [...sceny].sort()) {
    if (!NAZWA.test(scena)) throw new Error(`Zła nazwa sceny: ${scena}`);
    if (!istnieje(`tools/scenes/${scena}.html`)) { pominiete.push({ scena, powod: 'scena usunięta' }); continue; }
    const wpis = filmy[scena];
    const tryb = wpis && Number.isInteger(wpis.czasSekundy) && wpis.czasSekundy > 0 ? 'film' : 'kadr';
    if (tryb === 'film' && zmienioneOdPoprzedniego) {
      const sa = ['webm', 'mp4', 'jpg'].every((e) => istnieje(`public/assets/video/${scena}.${e}`));
      const scenaZmieniona = zmienioneOdPoprzedniego.some((p) => p === `tools/scenes/${scena}.html` || WSPOLNE_FILMU.test(p));
      if (sa && !scenaZmieniona) {
        pominiete.push({ scena, powod: 'pliki filmu są w repozytorium, a scena i pliki renderu nie zmieniły się od poprzedniego wypchnięcia' });
        continue;
      }
    }
    plan.push({ scena, tryb });
  }
  return { plan, pominiete };
}

const czytajListe = (p) => fs.readFileSync(p, 'utf8').split('\n').map((x) => x.trim()).filter(Boolean);

async function main(argv = process.argv.slice(2), root = ROOT) {
  const opt = (n) => { const a = argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : null; };
  const scena = opt('scena');
  if (scena !== null) {
    const tryb = opt('tryb');
    if (!NAZWA.test(scena) || !['kadr', 'film'].includes(tryb)) { console.error('Użycie: --scena=<nazwa> --tryb=kadr|film'); return 2; }
    if (!fs.existsSync(path.join(root, 'tools/scenes', `${scena}.html`))) { console.error(`Brak sceny: tools/scenes/${scena}.html`); return 1; }
    console.log(`${scena} ${tryb}`);
    return 0;
  }
  const zm = opt('zmienione');
  if (!zm) { console.error('Użycie: node tools/media-plan.cjs --zmienione=<plik> [--zmienione-od-poprzedniego=<plik>]'); return 2; }
  const odPop = opt('zmienione-od-poprzedniego');
  const { FILMY } = await import(pathToFileURL(path.join(root, 'src/config/filmy.mjs')).href);
  const pod = JSON.parse(fs.readFileSync(path.join(root, 'tools/podstrony.json'), 'utf8'));
  const { plan, pominiete } = planuj({
    zmienione: czytajListe(zm),
    zmienioneOdPoprzedniego: odPop ? czytajListe(odPop) : null,
    filmy: FILMY,
    filmyPodstron: (pod.strony || []).map((s) => s.film).filter((f) => typeof f === 'string'),
    istnieje: (rel) => fs.existsSync(path.join(root, rel)),
  });
  for (const p of pominiete) console.error(`pominięta: ${p.scena} (${p.powod})`);
  for (const p of plan) console.log(`${p.scena} ${p.tryb}`);
  return 0;
}

if (require.main === module) main().then((k) => process.exit(k), (e) => { console.error(e.message); process.exit(1); });

module.exports = { planuj, main };
