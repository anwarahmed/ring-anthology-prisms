// Contact sheets for a visual review: the bot plays each level and a screenshot is
// taken every few seconds. Writes test-results/sheets/<id>.png (needs ImageMagick).
// Usage: node tests/sheets.mjs [ids...] [--shots 8] [--every 15]
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { readdirSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? Number(argv.splice(i, 2)[1]) : def; };
const shots = opt('--shots', 8);
const every = opt('--every', 15);
const ids = argv.length ? argv : readdirSync('levels', { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name).sort();
const dir = 'test-results/sheets';
mkdirSync(dir, { recursive: true });

const server = await createServer({ server: { port: 0, hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const url = `http://localhost:${server.config.server.port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--use-angle=gl', '--ignore-gpu-blocklist'] });

for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  await page.goto(`${url}?level=${id}&bot=1&god=1`);
  try {
    await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 60000 });
  } catch {
    console.log(`${id} did not start`);
    await page.close();
    continue;
  }
  const files = [];
  for (let i = 0; i < shots; i++) {
    await page.waitForTimeout(every * 1000);
    const f = `${dir}/${id}-${i}.png`;
    await page.screenshot({ path: f });
    files.push(f);
    if (!(await page.evaluate(() => window.__game.scene.isActive('Level')))) break;
  }
  execFileSync('magick', ['montage', ...files, '-tile', '4x', '-geometry', '480x270+3+3', '-background', '#111', `${dir}/${id}.png`]);
  for (const f of files) rmSync(f);
  console.log(`${id} ${files.length} shots`);
  await page.close();
}
await browser.close();
await server.close();
