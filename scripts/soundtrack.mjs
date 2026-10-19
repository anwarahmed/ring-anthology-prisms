// Downloads or updates the private home soundtrack (Halo music the user owns) into
// public/home-soundtrack/private/, which git ignores. Home play only: it is never
// committed to this public repository or deployed (docs/LEGAL.md).
//   npm run soundtrack
// Needs the GitHub CLI logged in to an account with access to the private repository.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const REPO = 'anwarahmed/ring-anthology-prisms-soundtrack';
const DIR = 'public/home-soundtrack/private';
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });

try {
  if (existsSync(`${DIR}/.git`)) run('git', ['-C', DIR, 'pull', '--ff-only']);
  else run('gh', ['repo', 'clone', REPO, DIR]);
  console.log(`Home soundtrack ready in ${DIR}. Restart \`npm start\` if it's running.`);
} catch {
  console.error(`Could not get ${REPO}. Is the GitHub CLI installed and logged in (gh auth login) with access to it?`);
  process.exit(1);
}
