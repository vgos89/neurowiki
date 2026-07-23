/**
 * scripts/check-trial-coverage.ts — build-time guardrail for question-featured trials.
 *
 * Any trial referenced by a question (TRIAL_QUESTIONS[].trialIds) is a
 * clinician-facing "featured" trial and must render the full trial-page design.
 * This check asserts, for every such trial:
 *
 *   1. It has a DEDICATED render block in src/pages/trials/TrialPageNew.tsx
 *      (`if (trialId === '<id>' ...)`). Without one, the page falls through to
 *      the generic fallback renderer, which drops the population /
 *      inclusion-exclusion, how-to-read-chart, how-to-interpret, safety, and
 *      trial-design sections. (This is the CASSISS/BASIS 2026-07-22 defect.)
 *   2. It has a `<loc>.../trials/<id></loc>` entry in public/sitemap.xml, or the
 *      detail page is never prerendered / crawler-discoverable.
 *
 * It also asserts each question's `trialCount` matches `trialIds.length`
 * (the field is a documented cross-check per trial-questions.ts).
 *
 * Fast, string-level checks only (no trialData.ts load). Runs in pre-commit.
 * Module loading mirrors scripts/check-trial-chains.ts.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const QUESTIONS_FILE = path.resolve(ROOT, 'src/data/trial-questions.ts');
const RENDER_FILE = path.resolve(ROOT, 'src/pages/trials/TrialPageNew.tsx');
const SITEMAP_FILE = path.resolve(ROOT, 'public/sitemap.xml');

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

interface TrialQuestion {
  id: string;
  trialCount: number;
  trialIds: string[];
}

function hasRenderBlock(source: string, id: string): boolean {
  // Matches `trialId === 'id'` or `trialId === "id"` (the per-trial block gate).
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`trialId\\s*===\\s*['"]${esc}['"]`).test(source);
}

function hasSitemapEntry(sitemap: string, id: string): boolean {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`/trials/${esc}\\s*</loc>`).test(sitemap);
}

async function main() {
  const mod = await loadTsModule(QUESTIONS_FILE);
  const questions = mod.TRIAL_QUESTIONS as TrialQuestion[] | undefined;
  if (!Array.isArray(questions)) {
    console.error('[check-trial-coverage] Could not load TRIAL_QUESTIONS.');
    process.exit(1);
  }

  const renderSrc = fs.readFileSync(RENDER_FILE, 'utf8');
  const sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');

  const missingBlock: string[] = [];
  const missingSitemap: string[] = [];
  const countMismatch: string[] = [];
  const featured = new Set<string>();

  for (const q of questions) {
    if (q.trialCount !== q.trialIds.length) {
      countMismatch.push(`${q.id}: trialCount ${q.trialCount} != trialIds.length ${q.trialIds.length}`);
    }
    for (const id of q.trialIds) {
      featured.add(id);
      if (!hasRenderBlock(renderSrc, id)) missingBlock.push(`${id} (in question "${q.id}")`);
      if (!hasSitemapEntry(sitemap, id)) missingSitemap.push(`${id} (in question "${q.id}")`);
    }
  }

  const errors: string[] = [];
  if (missingBlock.length) {
    errors.push(
      `Featured trial(s) with NO dedicated render block in src/pages/trials/TrialPageNew.tsx ` +
        `(they will render the stripped-down generic fallback, missing Population / How-to-read / ` +
        `How-to-interpret / Safety / Trial Design). Add a block mirroring SAMMPRIS or SOCRATES:\n` +
        [...new Set(missingBlock)].map((s) => `    - ${s}`).join('\n'),
    );
  }
  if (missingSitemap.length) {
    errors.push(
      `Featured trial(s) missing a public/sitemap.xml <loc> entry (the /trials/<id> page will ` +
        `not prerender or be crawlable). Add a <url> block mirroring sammpris-trial:\n` +
        [...new Set(missingSitemap)].map((s) => `    - ${s}`).join('\n'),
    );
  }
  if (countMismatch.length) {
    errors.push(`Question trialCount != trialIds.length:\n` + countMismatch.map((s) => `    - ${s}`).join('\n'));
  }

  if (errors.length) {
    console.error('[check-trial-coverage] FAIL\n\n' + errors.join('\n\n'));
    process.exit(1);
  }

  console.log(`[check-trial-coverage] OK — ${featured.size} question-featured trials all have a render block + sitemap entry.`);
}

main().catch((err) => {
  console.error('[check-trial-coverage] Unexpected error:', err);
  process.exit(1);
});
