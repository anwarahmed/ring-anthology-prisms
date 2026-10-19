// Co-op difficulty scan: two bots play each level without god mode, on the real GPU,
// and the scan reports what a family playtest would feel: finish time, how often a
// player went down, checkpoint retries, the longest stretch between checkpoints, and
// how often a player was off screen.
// Usage: node tests/coop.mjs [ids...] [--difficulty normal] [--parallel 3] [--minutes 15]
// Report: test-results/coop-<difficulty>.txt
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { readdirSync, appendFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv.splice(i, 2)[1] : def; };
const difficulty = opt('--difficulty', 'normal');
const parallel = Number(opt('--parallel', 3));
const minutes = Number(opt('--minutes', 15));
const ids = argv.length ? argv : readdirSync('levels', { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name).sort();
const out = `test-results/coop-${difficulty}.txt`;
writeFileSync(out, `co-op scan, 2 bots, ${difficulty}, no god mode, ${minutes} min limit\n`);

const server = await createServer({ server: { port: 0, hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const url = `http://localhost:${server.config.server.port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--use-angle=gl', '--ignore-gpu-blocklist'] });

async function scan(id) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { navigator.getGamepads = () => []; });
  await page.goto(`${url}?level=${id}&bot=1&p2=kb2&difficulty=${difficulty}`);
  try {
    await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 60000 });
  } catch {
    return `${id}  did not start ${errors.join(' | ')}`;
  }
  // Count announcements and sample who is on screen, in game time.
  await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    const log = (window.__coop = { downs: 0, retries: 0, where: [], checkpoints: [L.time.now], samples: 0, off: 0, t0: L.time.now });
    const hud = L.hud;
    const announce = hud.announce.bind(hud);
    hud.announce = (text, ...rest) => {
      if (/DOWN$/.test(text)) { log.downs++; log.where.push(Math.round(L.players[Number(text[1]) - 1]?.x ?? 0)); }
      if (text === 'RETRY FROM CHECKPOINT') log.retries++;
      if (text === 'CHECKPOINT') log.checkpoints.push(L.time.now);
      return announce(text, ...rest);
    };
    L.time.addEvent({ delay: 1000, loop: true, callback: () => {
      const v = L.cameras.main.worldView;
      log.samples++;
      if (L.players.some((p) => p.alive && !p.vehicle && (p.x < v.x - 4 || p.x > v.right + 4 || p.y > v.bottom + 8))) log.off++;
    } });
  });
  const wall = Date.now() + (minutes + 5) * 60 * 1000;
  let done = false;
  while (Date.now() < wall) {
    await page.waitForTimeout(5000);
    const s = await page.evaluate((m) => ({
      results: window.__game.scene.isActive('Results'),
      t: (window.__game.scene.getScene('Level').time.now - window.__coop.t0) / 1000,
    }), minutes);
    if (s.results) { done = true; break; }
    if (s.t > minutes * 60) break;
  }
  const r = await page.evaluate(() => {
    const c = window.__coop;
    const L = window.__game.scene.getScene('Level');
    const end = c.endAt ?? L.time.now;
    const cps = [...c.checkpoints, end];
    let gap = 0;
    for (let i = 1; i < cps.length; i++) gap = Math.max(gap, cps[i] - cps[i - 1]);
    return { where: c.where, t: Math.round((end - c.t0) / 1000), downs: c.downs, retries: c.retries, gap: Math.round(gap / 1000), off: c.samples ? Math.round((100 * c.off) / c.samples) : 0 };
  });
  await page.close();
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${id}  ${done ? 'finished' : 'NOT FINISHED'} ${fmt(r.t)}  downs ${r.downs}  retries ${r.retries}  longest without checkpoint ${fmt(r.gap)}  off-screen ${r.off}%${r.downs >= 4 ? `\n    downs at x: ${r.where.slice(0, 30).join(' ')}` : ''}${errors.length ? `\n    errors: ${[...new Set(errors)].join(' | ')}` : ''}`;
}

const queue = [...ids];
await Promise.all(Array.from({ length: parallel }, async () => {
  for (let id; (id = queue.shift());) {
    const line = await scan(id);
    appendFileSync(out, `${line}\n`);
    console.log(line);
  }
}));
await browser.close();
await server.close();
