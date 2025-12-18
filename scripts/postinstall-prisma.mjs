import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function hasPrismaCli() {
  const bin = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
  return (
    existsSync(new URL(`../node_modules/.bin/${bin}`, import.meta.url)) ||
    existsSync(new URL('../node_modules/prisma/build/index.js', import.meta.url))
  );
}

if (!hasPrismaCli()) {
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'generate', '--workspace=apps/api'], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);

