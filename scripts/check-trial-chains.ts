/**
 * scripts/check-trial-chains.ts — build-time drift check for chainMembership.
 *
 * Asserts:
 *   1. Every chainMembership[].chainId on a trial resolves in TRIAL_CHAINS.
 *   2. Every chain referenced in TRIAL_CHAINS has at least one member trial.
 *   3. No trial declares chainMembership[] without at least one entry.
 *
 * Architect resolution: docs/reviews/arch-trial-chain-timeline-2026-05-20.md
 *   "Required follow-up #6 — Build-time drift check."
 *
 * Module loading mirrors scripts/check-claims.ts (TypeScript transpile +
 * data-URL import).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TRIAL_DATA_FILE = path.resolve(ROOT, 'src/data/trialData.ts');
const REGISTRY_FILE = path.resolve(ROOT, 'src/data/trialChainRegistry.ts');

type DynamicModule = Record<string, unknown>;

async function loadTsModule(filePath: string): Promise<DynamicModule> {
  const source = fs.readFileSync(filePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
  return import(dataUrl) as Promise<DynamicModule>;
}

interface TrialEntry {
  id?: string;
  chainMembership?: Array<{ chainId: string; role: string }>;
}

async function main(): Promise<void> {
  const trialMod = await loadTsModule(TRIAL_DATA_FILE);
  const registryMod = await loadTsModule(REGISTRY_FILE);

  const TRIAL_DATA = trialMod['TRIAL_DATA'] as Record<string, TrialEntry> | undefined;
  const TRIAL_CHAINS = registryMod['TRIAL_CHAINS'] as Record<string, unknown> | undefined;

  if (!TRIAL_DATA || !TRIAL_CHAINS) {
    console.error('[check-trial-chains] FAIL: could not load TRIAL_DATA or TRIAL_CHAINS.');
    process.exit(2);
  }

  const errors: string[] = [];
  const chainMemberCounts: Record<string, number> = {};
  for (const id of Object.keys(TRIAL_CHAINS)) chainMemberCounts[id] = 0;

  for (const [trialId, trial] of Object.entries(TRIAL_DATA)) {
    const memberships = trial.chainMembership;
    if (memberships === undefined) continue;
    if (!Array.isArray(memberships) || memberships.length === 0) {
      errors.push(
        `Trial "${trialId}" declares chainMembership: [] (empty array). Remove the field or add a chain entry.`,
      );
      continue;
    }
    for (const m of memberships) {
      if (!(m.chainId in TRIAL_CHAINS)) {
        errors.push(
          `Trial "${trialId}" references unknown chainId "${m.chainId}". Add it to src/data/trialChainRegistry.ts or fix the reference.`,
        );
      } else {
        chainMemberCounts[m.chainId] = (chainMemberCounts[m.chainId] ?? 0) + 1;
      }
    }
  }

  for (const [chainId, count] of Object.entries(chainMemberCounts)) {
    if (count === 0) {
      errors.push(
        `Chain "${chainId}" is declared in TRIAL_CHAINS but has no member trials. Either tag at least one trial with chainMembership, or remove the chain.`,
      );
    }
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`[check-trial-chains] FAIL: ${e}`);
    console.error(`[check-trial-chains] ${errors.length} error(s).`);
    process.exit(1);
  }

  const totalMembers = Object.values(chainMemberCounts).reduce((a, b) => a + b, 0);
  console.log(
    `[check-trial-chains] PASS — ${Object.keys(TRIAL_CHAINS).length} chain(s), ${totalMembers} trial-chain memberships, all references resolved.`,
  );
}

main().catch((err) => {
  console.error('[check-trial-chains] Crash:', err);
  process.exit(2);
});
