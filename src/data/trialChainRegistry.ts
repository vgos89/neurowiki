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
      'BEST and BASICS were the first two RCTs in basilar-artery occlusion and both failed their primary frame, driven by substantial crossover in BEST and a control arm in BASICS that frequently received alteplase. ATTENTION and BAOCHE, both in Chinese populations, established benefit in 0-12 h and 6-24 h windows respectively and shifted guideline support toward EVT for basilar LVO.',
    startYear: 2020,
  },
  // ─── Phase 2 first wave (2026-05-21) ──────────────────────────────────────
  'pfo-closure': {
    id: 'pfo-closure',
    name: 'PFO closure for cryptogenic stroke',
    narrative:
      'After a decade of ambiguous evidence (CLOSURE I 2012 negative, original RESPECT 2013 marginal), three trials published together in NEJM September 2017 (CLOSE, RESPECT long-term, and REDUCE) independently confirmed that device closure of patent foramen ovale reduces recurrent stroke in patients under 60 with cryptogenic stroke and a PFO. The trade-off across all three was an increased incidence of atrial fibrillation, mostly transient and periprocedural. Supports AHA/ASA 2021 Class IIa, Level B-R when high-risk PFO features are present.',
    startYear: 2017,
  },
  carotid: {
    id: 'carotid',
    name: 'Asymptomatic carotid stenosis: revascularize or medical?',
    narrative:
      'CREST 2010 established that CAS and CEA produce equivalent 4-year composite stroke/MI/death outcomes in average-risk symptomatic + asymptomatic disease, with a well-known signal split (CAS doubles periprocedural stroke; CEA doubles periprocedural MI and cranial nerve palsy) and an age × treatment interaction crossing near 70 years. CREST-2 in 2025 closed the asymptomatic question against modern intensive medical management: stenting still reduced the 4-year composite (P=0.02) but CEA did not (P=0.24), suggesting modern medical management has narrowed the surgical case.',
    startYear: 2010,
  },
  'evt-mevo': {
    id: 'evt-mevo',
    name: 'Endovascular therapy for medium-vessel and distal occlusions',
    narrative:
      'ESCAPE-MeVO and DISTAL, both published in 2024, were the first RCTs in medium-vessel and distal occlusions (M2/M3, ACA, PCA). Neither met its primary functional endpoint. Together they define the negative boundary of LVO-EVT: the closer a patient is to a non-large-vessel target, the less benefit EVT confers. Practice has shifted toward selective EVT for MeVOs only with severe deficit and accessible anatomy.',
    startYear: 2024,
  },
};

/** Type-only export: union of valid chain ids (string-literal narrowing). */
export type TrialChainId = keyof typeof TRIAL_CHAINS;
