#!/usr/bin/env node
/**
 * risky-bash-guard.mjs — PreToolUse hook for Bash
 *
 * Belt-and-suspenders audit log for high-risk Bash commands.
 * Primary enforcement is the deny list in .claude/settings.json.
 * This hook adds a secondary stderr warning for visibility.
 *
 * STATUS: Warning stub — exits 0. Settings.json deny list is the hard gate.
 * Convert individual patterns to exit 1 as needed for stricter enforcement.
 *
 * TASKS.md: agent-governance-modernization-2026
 */

import { readFileSync } from 'fs';

const RISKY_PATTERNS = [
  { pattern: /rm\s+-rf/, label: 'rm -rf (destructive delete)' },
  { pattern: /git\s+push\s+--force/, label: 'git push --force (destructive push)' },
  { pattern: /brew\s+install/, label: 'brew install (package manager)' },
  { pattern: /pip3?\s+install/, label: 'pip install (package manager)' },
  { pattern: /npm\s+install\b(?!\s*--)/, label: 'npm install (package manager)' },
  { pattern: /npm\s+uninstall/, label: 'npm uninstall (package manager)' },
  { pattern: /curl\s/, label: 'curl (network request)' },
  { pattern: /wget\s/, label: 'wget (network request)' },
  { pattern: /security\s+find/, label: 'security find (keychain access)' },
  { pattern: /cat\s+\.env/, label: 'cat .env (secrets file)' },
  { pattern: /npx\s+vercel\b/, label: 'npx vercel (deployment)' },
];

let input = '';
try {
  input = readFileSync('/dev/stdin', 'utf8');
} catch {
  process.exit(0);
}

let command = '';
try {
  const parsed = JSON.parse(input);
  command = parsed.tool_input?.command || '';
} catch {
  process.exit(0);
}

const matches = RISKY_PATTERNS.filter(({ pattern }) => pattern.test(command));

if (matches.length > 0) {
  const labels = matches.map(m => `  - ${m.label}`).join('\n');
  process.stderr.write(
    `\n[risky-bash-guard] WARNING: Potentially risky command pattern detected:\n` +
    `  Command: ${command.slice(0, 120)}\n` +
    `  Matched: \n${labels}\n` +
    `Primary enforcement is .claude/settings.json deny list.\n` +
    `If this command was denied by settings.json, it will not execute.\n\n`
  );
}

process.exit(0);
