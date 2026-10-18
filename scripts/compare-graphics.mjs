// Comparison screenshots of art styles and CRT presets, for choosing a look.
//   node scripts/compare-graphics.mjs [--level 2a] [--out test-results/compare]
// Writes one PNG per combination; join them with `montage` for a side-by-side sheet.

import { createServer } from 'vite';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? dflt : args[i + 1];
};
const level = opt('level', '2a');
const out = opt('out', 'test-results/compare');
const styles = opt('styles', 'prerendered,hybrid,pixel').split(',');
const presets = opt('presets', 'off,subtle,arcade,tv').split(',');
mkdirSync(out, { recursive: true });

const server = await createServer({ server: { port: 0, hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0];
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader'] });

async function shot(file, url, settings, wait) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', (e) => console.error(`${file}: ${e.message}`));
  await page.addInitScript((s) => {
    localStorage.setItem('ring-anthology-prisms.graphics', JSON.stringify(s));
    navigator.getGamepads = () => [];
  }, settings);
  await page.goto(base + url);
  await page.waitForFunction(() => window.__game?.isBooted, null, { timeout: 30000 });
  await wait(page);
  await page.screenshot({ path: `${out}/${file}.png` });
  await page.close();
  console.log(`${out}/${file}.png`);
}

const { CRT_PRESETS } = await server.ssrLoadModule('/src/engine/graphics.js');
const settings = (style, preset) => ({ style, preset, ...CRT_PRESETS[preset], fps: true });
const inLevel = async (page) => {
  await page.waitForFunction(() => window.__game.scene.isActive('Level'), null, { timeout: 60000 });
  // Same moment in every shot: the fade-in finished (slow in headless), then 3 s of play.
  await page.waitForFunction(() => !window.__game.scene.getScene('Level').cameras.main.fadeEffect.isRunning, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
};

for (const style of styles) await shot(`style-${style}`, `?level=${level}&bot=1&god=1`, settings(style, 'off'), inLevel);
for (const preset of presets) await shot(`crt-${preset}`, `?level=${level}&bot=1&god=1`, settings('prerendered', preset), inLevel);
await shot('title-arcade', '', settings('prerendered', 'arcade'), (p) => p.waitForTimeout(3000));
await shot('graphics-menu', '', settings('prerendered', 'subtle'), async (p) => {
  await p.waitForFunction(() => window.__game.scene.isActive('Title'), null, { timeout: 30000 });
  await p.evaluate(() => window.__game.scene.getScene('Title').scene.start('Graphics', { returnTo: 'Title' }));
  await p.waitForTimeout(1500);
});

await browser.close();
await server.close();
