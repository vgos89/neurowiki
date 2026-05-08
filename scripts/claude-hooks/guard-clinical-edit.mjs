#!/usr/bin/env node
/**
 * guard-clinical-edit.mjs — PreToolUse hook for Edit/Write
 *
 * Blocks edits to clinical surface files (trialData, citations, calculator
 * pages, guide pages) until this hook is fully implemented with task-class
 * detection. Non-clinical file paths exit 0 (allowed).
 *
 * STATUS: Functional stub.
 * - Clinical paths: exit 1 (BLOCKED — implement to unblock)
 * - Non-clinical paths: exit 0 (allowed)
 *
 * TASKS.md: agent-governance-modernization-2026
 * To fully implement: add task-class detection from TASKS.md ACTIVE section
 * and evidence-verifier packet presence check.
 */

import { readFileSync } from 'fs';

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

let input = '';
try {
  input = readFileSync('/dev/stdin', 'utf8');
} catch {
  // Cannot read stdin — allow by default
  process.exit(0);
}

let toolInput;
try {
  const parsed = JSON.parse(input);
  toolInput = parsed.tool_input || parsed;
} catch {
  // Cannot parse input — allow by default
  process.exit(0);
}

const filePath = toolInput.file_path || toolInput.path || '';

const isClinical = CLINICAL_PATTERNS.some(p => p.test(filePath));

if (isClinical) {
  process.stderr.write(
    `\n[guard-clinical-edit] BLOCKED: ${filePath}\n` +
    `This file is a clinical surface. Full class-detection not yet implemented.\n` +
    `To proceed with clinical edits:\n` +
    `  1. Confirm active task is Class E or -clinical in TASKS.md\n` +
    `  2. Implement full task-class detection in this hook\n` +
    `  3. Or temporarily disable this hook in .claude/settings.json with V approval\n` +
    `See TASKS.md: agent-governance-modernization-2026\n\n`
  );
  process.exit(1);
}

process.exit(0);
