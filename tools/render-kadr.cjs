#!/usr/bin/env node
/* Robi kadr miejsca na film, zanim powstanie film (plan 3.3, D-032).
   Otwiera scenę tools/scenes/<nazwa>.html, rysuje chwilę window.POSTER_AT i zapisuje
   public/assets/video/<nazwa>-kadr.jpg w wymiarach window.SIZE (1600×900).
   Użycie:  node tools/render-kadr.cjs <nazwa>      Wymaga: playwright (Chromium) i ffmpeg. */
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const SCENES = path.join(__dirname, 'scenes');
const OUT = path.join(ROOT, 'public', 'assets', 'video');
const SIZE = [1600, 900];
const LIMIT = 150000; // plan 3.5: limit kadru .jpg w bajtach
const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

(async () => {
  const name = process.argv[2];
  if (!name || process.argv.length > 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    console.error('Użycie: node tools/render-kadr.cjs <nazwa-sceny>   (np. integracja-systemow)');
    process.exit(2);
  }
  const scene = path.join(SCENES, `${name}.html`);
  if (!fs.existsSync(scene)) {
    console.error(`Brak sceny: ${path.relative(ROOT, scene)}`);
    process.exit(2);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `revagy-kadr-${name}-`));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: SIZE[0], height: SIZE[1] }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e));
    await page.goto(pathToFileURL(scene).href);
    await page.evaluate(() => window.ready);
    const info = await page.evaluate(() => ({ size: window.SIZE, posterAt: window.POSTER_AT, hasRender: typeof window.render === 'function' }));
    if (!info.hasRender) throw new Error(`${name}: scena nie wystawia window.render(t)`);
    if (!Array.isArray(info.size) || info.size[0] !== SIZE[0] || info.size[1] !== SIZE[1]) throw new Error(`${name}: window.SIZE musi być [${SIZE}] (jest: ${JSON.stringify(info.size)})`);
    if (typeof info.posterAt !== 'number') throw new Error(`${name}: scena nie wystawia window.POSTER_AT`);
    await page.evaluate((t) => window.render(t), info.posterAt);
    if (errors.length) throw errors[0];

    const png = path.join(tmp, 'kadr.png');
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: SIZE[0], height: SIZE[1] } });
    await page.close();

    fs.mkdirSync(OUT, { recursive: true });
    const out = path.join(OUT, `${name}-kadr.jpg`);
    ffmpeg(['-i', png, '-q:v', '4', out]);
    const bytes = fs.statSync(out).size;
    console.log(`${String(bytes).padStart(8)} B  assets/video/${name}-kadr.jpg  (kadr z t = ${info.posterAt} s, limit ${LIMIT} B)`);
    if (bytes > LIMIT) {
      console.error(`Kadr przekracza limit ${LIMIT} B. Uprość scenę albo podnieś -q:v.`);
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch((e) => { console.error(e); process.exit(1); });
