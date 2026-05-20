/**
 * Trial-chain registry — chain metadata for the timeline footer.
 *
 * One entry per audit-derived clinical chain (lineage of RCTs answering a
 * specific clinical question). Trial entries reference these via the
 * `chainMembership[]` field on TrialMetadata; successors are derived at
 * render time by scanning `chainMembership` across the catalog.
 *
 * Architect resolution: docs/reviews/arch-trial-chain-timeline-2026-05-20.md
 * Audit source:        docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md
 *                      §"Cross-trial timeline observations"
 *
 * Phase 1 (this commit): hemicraniectomy and basilar-EVT chains. Both have
 * every member trial already in the catalog. No predecessor stubs needed.
 *
 * Phase 2+ (future): antiplatelet-acute, evt-anterior, evt-mevo, evt-bridging,
 * carotid, ivt-tenecteplase, doac-after-af. Each gated on the predecessor
 * stubs queued in TASKS.md W7.0.
 */

export interface TrialChain {
  /** Stable id used in `chainMembership[].chainId`. kebab-case. */
  id: string;
  /** Short human-readable name shown in the timeline footer header. */
  name: string;
  /** One-paragraph clinical narrative explaining what this chain answers. */
  narrative: string;
  /** Year of the earliest trial in the chain (informational only). */
  startYear: number;
}

export const TRIAL_CHAINS: Record<string, TrialChain> = {
  hemicraniectomy: {
    id: 'hemicraniectomy',
    name: 'Hemicraniectomy for malignant MCA infarction',
    narrative:
      'Three near-simultaneous European RCTs (DECIMAL, DESTINY, HAMLET) established that decompressive hemicraniectomy reduces mortality in younger patients with space-occupying MCA infarction. The pooled analysis underpins the AHA/ASA Class I recommendation in patients up to 60 years. DESTINY II later extended the question to patients over 60, where survival is preserved but most survivors have moderate-to-severe disability.',
    startYear: 2007,
  },
  'basilar-evt': {
    id: 'basilar-evt',
    name: 'Endovascular therapy for basilar artery occlusion',
    narrative:
      'BEST and BASICS were the first two RCTs in basilar-artery occlusion and both failed their primary frame — driven by substantial crossover in BEST and a control arm in BASICS that frequently received alteplase. ATTENTION and BAOCHE, both in Chinese populations, established benefit in 0-12 h and 6-24 h windows respectively and shifted guideline support toward EVT for basilar LVO.',
    startYear: 2020,
  },
};

/** Type-only export: union of valid chain ids (string-literal narrowing). */
export type TrialChainId = keyof typeof TRIAL_CHAINS;
