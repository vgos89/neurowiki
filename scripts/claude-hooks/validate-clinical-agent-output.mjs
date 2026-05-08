#!/usr/bin/env node
/**
 * validate-clinical-agent-output.mjs — SubagentStop hook
 *
 * Warns when a clinical subagent (medical-scientist, evidence-verifier,
 * trial-statistician, clinical-reviewer) stops without producing a
 * structured artifact in the expected location.
 *
 * STATUS: Warning stub — exits 0 (does not block subagent completion).
 * Implement artifact-presence detection before converting to exit 1.
 *
 * TASKS.md: agent-governance-modernization-2026
 * To fully implement:
 *   - Parse subagent name from hook input
 *   - For evidence-verifier: check docs/evidence-packets/ for a packet
 *   - For trial-statistician: check for a recommendation report in output
 *   - For clinical-reviewer: check docs/reviews/clinical-*.md exists
 *   - For medical-scientist: check citation registry was updated
 */

import { readFileSync } from 'fs';

let input = '';
try {
  input = readFileSync('/dev/stdin', 'utf8');
} catch {
  process.exit(0);
}

let agentName = 'unknown';
try {
  const parsed = JSON.parse(input);
  agentName = parsed.agent_name || parsed.subagent_name || 'unknown';
} catch {
  // Cannot parse — warn and allow
}

const CLINICAL_AGENTS = [
  'medical-scientist',
  'evidence-verifier',
  'trial-statistician',
  'clinical-reviewer',
];

if (CLINICAL_AGENTS.some(a => agentName.includes(a))) {
  process.stderr.write(
    `\n[validate-clinical-agent-output] WARNING: ${agentName} stopped.\n` +
    `Artifact validation not yet fully implemented.\n` +
    `Manually verify the following before proceeding:\n` +
    `  - evidence-verifier: docs/evidence-packets/YYYY-MM-DD-<slug>.md exists\n` +
    `  - trial-statistician: recommendation report included in output\n` +
    `  - clinical-reviewer: docs/reviews/clinical-PR<#>-<slug>.md exists\n` +
    `  - medical-scientist: citation registry updated if clinical content changed\n` +
    `See TASKS.md: agent-governance-modernization-2026\n\n`
  );
}

process.exit(0);
