// Archive scene review: for each level, every Archive card (before and after) is shown
// and photographed when its scene has finished playing. Writes
// test-results/archive/<id>.png (one row per card). Needs ImageMagick.
//   node scripts/archive-sheet.mjs [ids...]   (or --saga for the prologue and epilogue)
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { readdirSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const saga = args.includes('--saga');
const ids = args.filter((a) => a !== '--saga');
const levels = ids.length || saga ? ids : readdirSync('levels', { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name).sort();
const dir = 'test-results/archive';
mkdirSync(dir, { recursive: true });

const server = await createServer({ server: { port: 0, hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const url = `http://localhost:${server.config.server.port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--use-angle=gl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(() => { navigator.getGamepads = () => []; });

// Waits until the card's scene has played out (or 14 s), then a beat more.
const settle = () => page.evaluate(() => new Promise((done) => {
  const t0 = performance.now();
  const tick = () => {
    const s = window.__game.scene.getScenes(true).find((x) => x.vignette)?.vignette?.stage;
    if (!s || s.done || performance.now() - t0 > 14000) setTimeout(done, 700);
    else requestAnimationFrame(tick);
  };
  tick();
}));

// Shows card i of a level's Archive (or saga beat i) and photographs it once played.
async function shoot(name, count, open) {
  const files = [];
  for (let i = 0; i < count; i++) {
    await page.goto(url);
    await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 30000 });
    await page.evaluate(open, i);
    await page.waitForTimeout(1200);
    await settle();
    const f = `${dir}/${name}-${i}.png`;
    await page.screenshot({ path: f });
    files.push(f);
  }
  if (!files.length) return;
  execFileSync('magick', ['montage', ...files, '-tile', '4x', '-geometry', '480x270+3+3', '-background', '#111', `${dir}/${name}.png`]);
  for (const f of files) rmSync(f);
  console.log(`${dir}/${name}.png ${files.length}${errors.length ? `  ERRORS: ${[...new Set(errors)].join(' | ')}` : ''}`);
  errors.length = 0;
}

for (const id of levels) {
  const { default: L } = await import(`../levels/${id}/level.js`);
  for (const which of ['before', 'after']) {
    const n = L.archive?.[which]?.length ?? 0;
    await shoot(`${id}-${which}`, n, new Function('i', `
      const t = window.__game.scene.getScene('Title');
      t.scene.start('Archive', { levelId: '${id}', which: '${which}' });
      const go = () => { const a = window.__game.scene.getScene('Archive'); if (!a.vignette && !a.body) return setTimeout(go, 50); if (i) { a.i = i; a.show(); } };
      setTimeout(go, 300);`));
  }
}
if (saga) {
  const { SAGA } = await import('../src/content/saga.js');
  for (const which of ['prologue', 'epilogue']) {
    await shoot(which, SAGA[which].length, new Function('i', `window.__game.scene.getScene('Title').scene.start('Saga', { which: '${which}', i, then: ['Title'] });`));
  }
}
await browser.close();
await server.close();
