// Adres zasobu z public/ z parametrem wersji liczonym z treści pliku: 'assets/js/app.js' → 'assets/js/app.js?v=1a2b3c4d'.
// Parametr to pierwsze 8 znaków SHA-256 pliku, więc zmienia się sam przy każdej zmianie treści
// i nie trzeba go podbijać ręcznie (S-05, D-05, K-03 z audytu T-028). Ten sam skrót liczy tools/validate-dist.cjs.
// Ścieżki liczone od process.cwd(), czyli od katalogu repozytorium, w którym działa `astro build`.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const WZOR = /^assets\/[a-z0-9]+(?:[/.-][a-z0-9]+)*$/;
const pamiec = new Map();

export function skrotPliku(plik) {
  return crypto.createHash('sha256').update(fs.readFileSync(plik)).digest('hex').slice(0, 8);
}

// rel: ścieżka względem public/, bez ukośnika na początku. Brak pliku to błąd builda.
export function zasob(rel, katalog = path.join(process.cwd(), 'public')) {
  if (typeof rel !== 'string' || !WZOR.test(rel)) throw new Error(`zasob: nieprawidłowa ścieżka „${rel}”.`);
  const klucz = `${katalog}\0${rel}`;
  if (!pamiec.has(klucz)) {
    const plik = path.join(katalog, rel);
    if (!fs.existsSync(plik)) throw new Error(`zasob: brak pliku public/${rel}.`);
    pamiec.set(klucz, `${rel}?v=${skrotPliku(plik)}`);
  }
  return pamiec.get(klucz);
}
