#!/usr/bin/env node

import { spawn } from 'child_process';

const server = spawn('npx', ['live-server', '--port=8080', '--host=127.0.0.1', '--open=/', '--no-browser', '--cors'], { stdio: 'inherit' });

process.on('SIGINT', () => {
  server.kill('SIGTERM');
  setTimeout(() => {
    server.kill('SIGKILL');
    process.exit(0);
  }, 2000);
});

server.on('exit', () => {
  process.exit(0);
});

server.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
