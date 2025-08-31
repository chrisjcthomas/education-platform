#!/usr/bin/env node
const { spawnSync } = require('child_process');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
  if (res.status !== 0) {
    console.error(`\n✖ Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

console.log('Running pre-push checks...');

// 1) Run MVP tests
run('npm', ['run', 'test:mvp']);

// 2) Run production build
run('npm', ['run', 'build']);

// 3) Validate critical files exist
const fs = require('fs');
const critical = ['package.json', 'README.md', 'src/app/page.tsx'];
const missing = critical.filter(p => !fs.existsSync(p));
if (missing.length) {
  console.error(`\n✖ Missing critical files: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('\n✔ Pre-push checks passed.');

