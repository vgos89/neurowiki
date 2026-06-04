/**
 * scripts/gen-trial-card-meta.ts — generator for the lightweight trial-card
 * metadata projection.
 *
 * WHY: src/data/trialData.ts (TRIAL_DATA) builds as a ~928 KB async chunk of full
 * clinical write-up prose. The /trials hub (TrialsPage) and the /trials/q/* pages
 * (QuestionDetailPage) statically imported it only to read each trial's short
 * `legend` chip plus a few small catalog fields — eagerly pulling the whole chunk.
 * This generator emits a tiny projection (whitelisted fields only) into
 * src/data/trialListData.cardmeta.generated.ts so those two pages can read the
 * small file and never import the heavy one.
 *
 * SINGLE SOURCE OF TRUTH: src/data/trialData.ts. This generated file is derived,
 * never hand-edited. scripts/check-card-meta.ts is a pre-commit drift guard that
 * regenerates in-memory and fails the commit on any diff (architect condition,
 * docs/reviews/arch-PR-trial-card-meta-split.md).
 *
 * WHITELIST: legend, title, subtitle, source, trialDesign.timeline, listCategory,
 * listDescription, bottomLineSummary, doi. Pinned below so a new heavy field on
 * TrialMetadata can never silently leak into the light chunk.
 *
 * Usage:
 *   npx tsx scripts/gen-trial-card-meta.ts        (write the file)
 *   imported by scripts/check-card-meta.ts         (drift guard, no write)
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TRIAL_DATA, type TrialMetadata } from '../src/data/trialData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
export const GENERATED_FILE = path.resolve(ROOT, 'src/data/trialListData.cardmeta.generated.ts');

interface TrialCardMetaProjection {
  legend?: { finding?: string; bottomLineTag?: string; keyStat?: string };
  title: string;
  subtitle?: string;
  source?: string;
  timeline?: string;
  listCategory?: 'thrombolysis' | 'thrombectomy' | 'antiplatelets' | 'carotid' | 'acute';
  listDescription?: string;
  bottomLineSummary?: string;
  doi?: string;
}

function project(meta: TrialMetadata): TrialCardMetaProjection {
  const out: TrialCardMetaProjection = { title: meta.title };
  if (meta.legend) {
    const l: { finding?: string; bottomLineTag?: string; keyStat?: string } = {};
    if (meta.legend.finding !== undefined) l.finding = meta.legend.finding;
    if (meta.legend.bottomLineTag !== undefined) l.bottomLineTag = meta.legend.bottomLineTag;
    if (meta.legend.keyStat !== undefined) l.keyStat = meta.legend.keyStat;
    out.legend = l;
  }
  if (meta.subtitle !== undefined) out.subtitle = meta.subtitle;
  if (meta.source !== undefined) out.source = meta.source;
  if (meta.trialDesign?.timeline !== undefined) out.timeline = meta.trialDesign.timeline;
  if (meta.listCategory !== undefined) out.listCategory = meta.listCategory;
  if (meta.listDescription !== undefined) out.listDescription = meta.listDescription;
  if (meta.bottomLineSummary !== undefined) out.bottomLineSummary = meta.bottomLineSummary;
  if (meta.doi !== undefined) out.doi = meta.doi;
  return out;
}

/** Deterministic TS source for the generated projection (sorted by trial id). */
export function renderCardMeta(): string {
  const ids = Object.keys(TRIAL_DATA).sort();
  const map: Record<string, TrialCardMetaProjection> = {};
  for (const id of ids) map[id] = project(TRIAL_DATA[id]);
  const body = JSON.stringify(map, null, 2);
  return `// GENERATED FILE — DO NOT EDIT BY HAND.
// Source of truth: src/data/trialData.ts (TRIAL_DATA).
// Regenerate:  npx tsx scripts/gen-trial-card-meta.ts
// Drift guard: scripts/check-card-meta.ts (runs in pre-commit; fails on any diff).
//
// This lightweight projection lets TrialsPage and QuestionDetailPage render trial
// legend chips + stub-trial rows WITHOUT importing the ~928 KB trialData.ts chunk.

export interface TrialCardMeta {
  legend?: { finding?: string; bottomLineTag?: string; keyStat?: string };
  title: string;
  subtitle?: string;
  source?: string;
  /** TrialMetadata.trialDesign.timeline (flattened). */
  timeline?: string;
  listCategory?: 'thrombolysis' | 'thrombectomy' | 'antiplatelets' | 'carotid' | 'acute';
  listDescription?: string;
  bottomLineSummary?: string;
  doi?: string;
}

export const TRIAL_CARD_META: Record<string, TrialCardMeta> = ${body};
`;
}

const invokedDirectly =
  !!process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (invokedDirectly) {
  writeFileSync(GENERATED_FILE, renderCardMeta(), 'utf8');
  const count = Object.keys(TRIAL_DATA).length;
  console.log(`[gen-trial-card-meta] wrote ${count} entries → ${path.relative(ROOT, GENERATED_FILE)}`);
}
