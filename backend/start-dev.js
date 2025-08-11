#!/usr/bin/env node
const { spawn } = require('child_process');

// Start server with ts-node ignoring type errors
const server = spawn('npx', ['ts-node', '--transpile-only', '-r', 'tsconfig-paths/register', 'src/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});