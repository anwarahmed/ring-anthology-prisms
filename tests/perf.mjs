// Performance scan: the bot plays each level for a while on the real GPU, and every
// frame slower than 50 ms is logged, with any art generated mid-level (a common cause).
// Usage: node tests/perf.mjs [ids...] [--seconds 90]   Report: test-results/perf.txt
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { readdirSync, appendFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const si = argv.indexOf('--seconds');
const seconds = si >= 0 ? Number(argv.splice(si, 2)[1]) : 90;
const ids = argv.length ? argv : readdirSync('levels', { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name).sort();
const out = 'test-results/perf.txt';
writeFileSync(out, `perf scan, ${seconds} s per level, frames > 50 ms\n`);

const server = await createServer({ server: { port: 0, hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const url = `http://localhost:${server.config.server.port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--use-angle=gl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });

for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${url}?level=${id}&bot=1&god=1`);
  try {
    await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 60000 });
  } catch {
    appendFileSync(out, `${id}  did not start ${errors.join(' | ')}\n`);
    await page.close();
    continue;
  }
  const r = await page.evaluate((ms) => new Promise((done) => {
    const g = window.__game;
    const known = new Set(g.textures.getTextureKeys());
    const slow = [];
    const made = [];
    let frames = 0;
    let last = performance.now();
    const t0 = last;
    const tick = (now) => {
      frames++;
      const dt = now - last;
      last = now;
      // Text labels get UUID-named textures; those are cheap and not art.
      const fresh = g.textures.getTextureKeys().filter((k) => !known.has(k) && !/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(k));
      for (const k of fresh) known.add(k);
      if (fresh.length) made.push(`${((now - t0) / 1000).toFixed(1)}s ${fresh.slice(0, 4).join(',')}${fresh.length > 4 ? ` +${fresh.length - 4}` : ''}`);
      if (dt > 50 && now - t0 > 500) slow.push(`${((now - t0) / 1000).toFixed(1)}s ${Math.round(dt)}ms${fresh.length ? ' (new art)' : ''}`);
      if (now - t0 < ms && g.scene.isActive('Level')) requestAnimationFrame(tick);
      else done({ fps: Math.round(frames / ((now - t0) / 1000)), slow, made, ended: !g.scene.isActive('Level') });
    };
    requestAnimationFrame(tick);
  }), seconds * 1000);
  const line = `${id}  ${r.fps} fps  ${r.slow.length} slow${r.ended ? ' (level ended)' : ''}${r.slow.length ? `: ${r.slow.slice(0, 8).join('; ')}` : ''}${r.made.length ? `\n    art made mid-level: ${r.made.slice(0, 6).join('; ')}` : ''}${errors.length ? `\n    errors: ${[...new Set(errors)].join(' | ')}` : ''}`;
  appendFileSync(out, line + '\n');
  console.log(line);
  await page.close();
}
await browser.close();
await server.close();
