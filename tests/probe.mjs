// Playtest probe: plays a level with the bot and prints the game state every few
// seconds (players, arena, live units, script progress). For debugging levels.
//
//   node tests/probe.mjs --level 1a [--seconds 120] [--every 5] [--solo] [--difficulty easy]

import { createServer } from 'vite';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i < 0 ? d : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
const level = opt('level', '1a');
const seconds = Number(opt('seconds', 120));
const every = Number(opt('every', 5));
const p2 = opt('solo', false) ? '' : '&p2=kb2';

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type().toUpperCase(), m.text()); });
await page.goto(`${server.resolvedUrls.local[0]}?level=${level}&bot=1&god=1${p2}&difficulty=${opt('difficulty', 'normal')}`);
for (let t = 0; t < seconds; t += every) {
  await page.waitForTimeout(every * 1000);
  const s = await page.evaluate(() => {
    const g = window.__game;
    if (g.scene.isActive('Results')) return 'RESULTS';
    const L = g.scene.getScene('Level');
    if (!L?.players) return 'no level';
    const fired = L.runner?.triggers.filter((x) => x.fired).map((x) => x.on).join('') ?? '';
    return `t=${Math.round(L.time.now / 1000)}s arena=${L.arena ? `${L.arena.x0}-${L.arena.x1}` : '-'} fired=${fired} ` +
      `players=${L.players.map((p) => `(${Math.round(p.x)},${Math.round(p.y)} ${p.alive ? 'up' : 'down'} vy${Math.round(p.body.velocity.y)})`).join(' ')} ` +
      `enemies=${L.units.filter((u) => u.alive && u.team === 'enemies').length} allies=${L.units.filter((u) => u.alive && u.team === 'players').length}`;
  });
  console.log(s);
  if (s === 'RESULTS') break;
}
await browser.close();
await server.close();
