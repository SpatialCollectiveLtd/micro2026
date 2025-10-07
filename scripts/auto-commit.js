#!/usr/bin/env node
const { execSync } = require('node:child_process')

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit', windowsHide: true })
}

try {
  // Stage all changes
  run('git add -A')
  // Create a concise commit message with timestamp
  const msg = `chore:auto-commit ${new Date().toISOString()}`
  run(`git commit -m "${msg}" || echo Skipped commit (no changes)`)
  // Push to current branch
  run('git push')
} catch (err) {
  console.error('Auto-commit failed:', err.message || err)
  process.exitCode = 1
}
