import { spawnSync } from 'node:child_process';

const result = spawnSync('rg', ['--line-number', '^<<<<<<<|^=======|^>>>>>>>'], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Unable to run conflict marker check: ${result.error.message}`);
  process.exit(2);
}

if (result.status === 0) {
  console.error('Conflict markers found.');
  process.exit(1);
}

if (result.status === 1) {
  process.exit(0);
}

process.exit(result.status ?? 2);
