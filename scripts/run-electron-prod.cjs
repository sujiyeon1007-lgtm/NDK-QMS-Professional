// Launch Electron against dist/ (production preview). Sets ELECTRON_PROD=1.
const { spawn } = require('node:child_process');
const electron = require('electron');

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_PROD: '1' },
  shell: process.platform === 'win32',
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});