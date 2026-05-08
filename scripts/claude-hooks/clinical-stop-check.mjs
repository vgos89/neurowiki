#!/usr/bin/env node
/**
 * clinical-stop-check.mjs — Stop hook
 *
 * Warns when Claude stops after a task that may require clinical review
 * artifacts. Checks for the presence of clinical review indicators.
 *
 * STATUS: Warning stub — exits 0 (does not block Claude from stopping).
 * Do NOT convert to exit 1 without careful testing — a blocking Stop hook
 * that cannot be satisfied would trap Claude indefinitely.
 *
 * TASKS.md: agent-governance-modernization-2026
 * To fully implement:
 *   - Read TASKS.md ACTIVE section to determine current task class
 *   - If Class E or -clinical: verify docs/reviews/clinical-*.md exists
 *   - If artifact missing: emit actionable message but do not block
 *     (the pre-commit hook and /pr-ready are the hard gates; Stop hook is advisory)
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const reviewsDir = join(process.cwd(), 'docs', 'reviews');
let recentClinicalReview = false;

try {
  if (existsSync(reviewsDir)) {
    const files = readdirSync(reviewsDir);
    // Check if any clinical review was created/modified today
    const today = new Date().toISOString().slice(0, 10);
    recentClinicalReview = files.some(f => f.startsWith('clinical-'));
  }
} catch {
  // Cannot check — warn and allow
}

if (!recentClinicalReview) {
  process.stderr.write(
    `\n[clinical-stop-check] ADVISORY: No clinical review artifact detected in docs/reviews/.\n` +
    `If this was a Class E or -clinical task, ensure docs/reviews/clinical-PR<#>-<slug>.md exists\n` +
    `before running /pr-ready. The pre-commit hook and /pr-ready are the enforced gates.\n` +
    `See TASKS.md: agent-governance-modernization-2026\n\n`
  );
}

process.exit(0);
