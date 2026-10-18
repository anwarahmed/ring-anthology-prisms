// Screenshots of every menu screen, for reviewing the menu art.
//   node scripts/screens.mjs [--out test-results/screens]
// Writes title, players, timeline, archive, results, pause, controls and graphics PNGs
// plus sheet.png (needs ImageMagick's montage) side by side.

import { createServer } from 'vite';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const i = args.indexOf('--out');
const out = i < 0 ? 'test-results/screens' : args[i + 1];
mkdirSync(out, { recursive: true });

const server = await createServer({ server: { port: 0, hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0];
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader'] });

const results = { levelId: '1a', result: 'history', stats: { start: Date.now() - 412000, kills: [37, 21], medals: [['DOUBLE KILL', 'TRIPLE KILL'], ['DOUBLE KILL']] } };
const shots = [
  ['title', ''],
  ['players', '', (g) => g.scene.getScene('Title').scene.start('Players', { first: 'kb1' })],
  ['timeline', '?all=1', (g) => g.scene.getScene('Title').scene.start('Timeline', { after: '1f' })],
  ['archive', '', (g) => g.scene.getScene('Title').scene.start('Archive', { levelId: '1b', which: 'before' })],
  ['results', '?p2=kb2', (g, d) => g.scene.getScene('Title').scene.start('Results', d), results],
  ['controls', '', (g) => g.scene.getScene('Title').scene.start('Controls', { returnTo: 'Title' })],
  ['graphics', '', (g) => g.scene.getScene('Title').scene.start('Graphics', { returnTo: 'Title' })],
];

for (const [name, url, go, data] of shots) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', (e) => console.error(`${name}: ${e.message}`));
  await page.addInitScript(() => { navigator.getGamepads = () => []; });
  await page.goto(base + url);
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 30000 });
  if (go) await page.evaluate(`(${go})(window.__game, ${JSON.stringify(data ?? null)})`);
  // The title's intro flash runs slowly in headless Chromium.
  await page.waitForTimeout(name === 'title' ? 6000 : 2500);
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
}

// Pause, over a running level.
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
await page.addInitScript(() => { navigator.getGamepads = () => []; });
await page.goto(`${base}?level=1c&god=1`);
await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 30000 });
await page.waitForTimeout(3000);
await page.evaluate(() => window.__game.scene.getScene('Level').pause());
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/pause.png` });
await browser.close();
await server.close();

const names = ['title', 'players', 'timeline', 'archive', 'results', 'pause', 'controls', 'graphics'];
try {
  execFileSync('montage', [...names.map((n) => `${out}/${n}.png`), '-tile', '2x4', '-geometry', '640x360+4+4', '-background', '#222', `${out}/sheet.png`]);
  console.log(`${out}/sheet.png`);
} catch {
  console.log(`${out}/*.png`);
}
