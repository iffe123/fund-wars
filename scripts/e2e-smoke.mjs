import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = process.argv[2] ?? '4173';
const host = '127.0.0.1';
const url = `http://${host}:${port}`;
const logDir = mkdtempSync(join(tmpdir(), 'fundwars-e2e-'));
const logPath = join(logDir, 'dev.log');

const devServerCommand =
  process.platform === 'win32'
    ? {
        command: 'cmd.exe',
        args: ['/d', '/s', '/c', `npm run dev -- --host ${host} --port ${port}`],
      }
    : {
        command: 'npm',
        args: ['run', 'dev', '--', '--host', host, '--port', port],
      };

const devServer = spawn(devServerCommand.command, devServerCommand.args, {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
});

let logBuffer = '';

const appendLog = (chunk) => {
  if (!chunk) {
    return;
  }

  logBuffer += chunk.toString();
  writeFileSync(logPath, logBuffer);
};

devServer.stdout.on('data', appendLog);
devServer.stderr.on('data', appendLog);

const cleanup = () => {
  if (!devServer.killed) {
    if (process.platform === 'win32') {
      spawnSync('taskkill.exe', ['/pid', String(devServer.pid), '/t', '/f'], {
        stdio: 'ignore',
      });
    } else {
      devServer.kill();
    }
  }
};

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(143);
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApp() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      let response;
      try {
        response = await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.ok) {
        return response.text();
      }
    } catch {
      // Keep polling until the dev server is ready.
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for ${url}. Logs: ${logPath}`);
}

try {
  const html = await waitForApp();

  if (!/Fund Wars/i.test(html)) {
    throw new Error(`E2E smoke failed: title content missing. Logs: ${logPath}`);
  }

  if (!/id="root"/i.test(html)) {
    throw new Error(`E2E smoke failed: root mount element missing. Logs: ${logPath}`);
  }

  console.log(`E2E smoke passed at ${url}`);
} finally {
  cleanup();
}
