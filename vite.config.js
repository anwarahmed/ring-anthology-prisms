import { defineConfig } from 'vite';
import { rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Home music (public/home-soundtrack/, including the private soundtrack clone) is for
// playing on this computer only; a build must never contain it (docs/LEGAL.md).
// Vite copies public/ wholesale, so strip it from the output after the build.
const noHomeSoundtrack = {
  name: 'no-home-soundtrack',
  apply: 'build',
  closeBundle() {
    const dir = join('dist', 'home-soundtrack');
    let names = [];
    try { names = readdirSync(dir); } catch { return; }
    for (const name of names) if (name !== 'README.md') rmSync(join(dir, name), { recursive: true, force: true });
  },
};

// base './' lets the same build run from GitHub Pages or any folder.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [noHomeSoundtrack],
});
