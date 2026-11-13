#!/usr/bin/env node
/* Nagrywa filmy strony z własnych scen HTML (tools/scenes/*.html).
   Każda scena wystawia window.render(t), window.DURATION i window.SIZE; skrypt renderuje
   klatka po klatce w Chromium (Playwright) i składa mp4 + webm + plakat przez ffmpeg.

   Użycie:  node tools/render-videos.cjs [nazwa-sceny ...]
   Wymaga:  playwright (z Chromium) oraz ffmpeg w PATH. */
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const SCENES = path.join(__dirname, 'scenes');
const OUT = path.join(ROOT, 'site', 'assets', 'video');
const FPS = 30;
const ALL = ['hero-flow', 'agent-demo', 'dashboard'];

const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const name of names) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => { throw e; });
    await page.goto(pathToFileURL(path.join(SCENES, `${name}.html`)).href);
    await page.evaluate(() => window.ready);
    const { duration, size, posterAt } = await page.evaluate(() => ({ duration: window.DURATION, size: window.SIZE, posterAt: window.POSTER_AT }));
    await page.setViewportSize({ width: size[0], height: size[1] });

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `revagy-${name}-`));
    const frames = Math.round(duration * FPS);
    const posterFrame = Math.round((posterAt ?? duration / 2) * FPS);
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.render(t), i / FPS);
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, '0')}.png`), clip: { x: 0, y: 0, width: size[0], height: size[1] } });
      if (i % 60 === 0) process.stdout.write(`\r${name}: ${i}/${frames}`);
    }
    await page.close();
    process.stdout.write(`\r${name}: ${frames}/${frames} klatek, kodowanie…\n`);

    const input = ['-framerate', String(FPS), '-i', path.join(dir, 'f%05d.png')];
    ffmpeg([...input, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(OUT, `${name}.mp4`)]);
    ffmpeg([...input, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', path.join(OUT, `${name}.webm`)]);
    ffmpeg(['-i', path.join(dir, `f${String(posterFrame).padStart(5, '0')}.png`), '-q:v', '4', path.join(OUT, `${name}.jpg`)]);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  await browser.close();
  for (const f of fs.readdirSync(OUT).sort()) console.log(`${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0).padStart(6)} kB  ${f}`);
})().catch((e) => { console.error(e); process.exit(1); });
