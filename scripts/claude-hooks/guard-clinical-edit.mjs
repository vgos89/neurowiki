#!/usr/bin/env node
/**
 * guard-clinical-edit.mjs — PreToolUse hook for Edit/Write
 *
 * Advisory clinical-surface gate. It NEVER blocks (always exit 0); it nudges.
 *
 *   - Non-clinical path                          → allowed silently.
 *   - Clinical path, a Class E or -clinical task
 *     is in TASKS.md ## ACTIVE                   → allowed silently (classified).
 *   - Clinical path, NO classified E/-clinical
 *     task active                                → warning to stderr (exit 0)
 *                                                  reminding of the §6/§19 gates.
 *
 * Task-class detection is best-effort: walk up from the edited file to find
 * TASKS.md, read its ## ACTIVE section, and look for "Class E" or "-clinical".
 * If TASKS.md cannot be found or read, fall back to the generic warning so the
 * operator is still reminded.
 *
 * TASKS.md: agent-governance-modernization-2026.
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const CLINICAL_PATTERNS = [
  /src\/data\/trialData/,
  /src\/data\/trialCatalogMeta/,
  /src\/data\/trials\//,
  /src\/lib\/citations\//,
  /src\/pages\/guide\//,
  /src\/pages\/calculators\//,
  /src\/components\/calculators\//,
  /src\/components\/article\//,
  /strokeClinicalPearls/,
];

function readStdin() {
  try {
    return readFileSync('/dev/stdin', 'utf8');
  } catch {
    return '';
  }
}

function findTasksMd(startDir) {
  let dir = startDir;
  for (let i = 0; i < 12 && dir; i++) {
    const candidate = join(dir, 'TASKS.md');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (existsSync('TASKS.md')) return 'TASKS.md';
  return null;
}

/** True if the TASKS.md ## ACTIVE section names a Class E or -clinical task. */
function activeTaskIsClinical(tasksPath) {
  try {
    const md = readFileSync(tasksPath, 'utf8');
    const start = md.indexOf('## ACTIVE');
    if (start === -1) return false;
    const rest = md.slice(start + '## ACTIVE'.length);
    const end = rest.indexOf('\n## ');
    const block = end === -1 ? rest : rest.slice(0, end);
    return /class\s+[c-e]-clinical/i.test(block) || /class\s+e\b/i.test(block) || /-clinical\b/i.test(block);
  } catch {
    return false;
  }
}

const input = readStdin();
if (!input) process.exit(0);

let toolInput;
try {
  const parsed = JSON.parse(input);
  toolInput = parsed.tool_input || parsed;
} catch {
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';
if (!filePath) process.exit(0);

const isClinical = CLINICAL_PATTERNS.some((p) => p.test(filePath));
if (!isClinical) process.exit(0);

const tasksPath = findTasksMd(dirname(filePath));
const classified = tasksPath ? activeTaskIsClinical(tasksPath) : false;

// A classified E/-clinical task is active — the edit is expected. Allow quietly.
if (classified) process.exit(0);

process.stderr.write(
  `\n[guard-clinical-edit] WARNING: clinical surface edit without a classified task.\n` +
  `  File: ${filePath}\n` +
  (tasksPath
    ? `  TASKS.md ## ACTIVE does not name a Class E or -clinical task.\n`
    : `  Could not locate TASKS.md to confirm the active task class.\n`) +
  `Before editing clinical surfaces (CLAUDE.md §6/§13/§19), confirm:\n` +
  `  1. The task is classified Class E or -clinical in TASKS.md ## ACTIVE\n` +
  `  2. Evidence-verifier packet present (docs/evidence-packets/) if trial data\n` +
  `  3. clinical-reviewer pre-execution gate satisfied\n` +
  `This is advisory — the edit proceeds. Classify the task to silence this.\n\n`
);
process.exit(0);
