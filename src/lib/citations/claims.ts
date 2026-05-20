/**
 * Claim registry — Wave 5.2 initial population (2026-05-19).
 *
 * Maps `claimId` tags (in src/data/strokeClinicalPearls.ts and elsewhere)
 * to one or more Citation IDs in CITATION_REGISTRY plus the surface type
 * where each claim appears. The pre-commit scanner (scripts/check-claims.ts)
 * verifies bidirectional integrity.
 *
 * Initial population: the 11 new trial pearls from Stroke Code Batch 3B
 * (commit 7f4d1cb) + 6 quick pearls from Batch 5 (commit 9674ab3). These
 * 17 claims received full dual sign-off during their respective E-clinical
 * pre-merge gates.
 *
 * Backfill of the remaining ~140 pre-existing stroke pearls is a separate
 * W5.2 task tracked under TASKS.md.
 *
 * See:
 *  - CLAUDE.md §13 (clinical safety governance)
 *  - .claude/rules/clinical-surfaces.md (§13.3 + §13.4)
 *  - ADR-002 (citation-registry phasing)
 */

import type { ClaimRegistry } from './schema';

// Every Stroke Code pearl is a 'data' surface — claimId is an adjacent
// field on the ClinicalPearl object in src/data/strokeClinicalPearls.ts.
const DATA_SURFACE = { type: 'data' as const, field: 'claimId' as const };

export const CLAIM_REGISTRY: ClaimRegistry = {
  // ─── Batch 3B deep pearls (step-2 LVO/EVT) ───────────────────────────────
  'select2-large-core-evt': {
    id: 'select2-large-core-evt',
    citation_ids: ['select2-trial-2023', 'aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'SELECT-2 trial: large-core EVT (ASPECTS 3–5) is beneficial; supports AHA/ASA 2026 Class I recommendation in §4.7.2.',
  },
  'angel-aspect-large-core-evt': {
    id: 'angel-aspect-large-core-evt',
    citation_ids: ['angel-aspect-trial-2023', 'aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'ANGEL-ASPECT trial: large-core EVT in Chinese population (ASPECTS 3–5 or core 70–100 mL); Class I per AHA/ASA 2026 §4.7.2.',
  },
  'laste-unrestricted-large-core-evt': {
    id: 'laste-unrestricted-large-core-evt',
    citation_ids: ['laste-trial-2024', 'aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'LASTE trial: EVT for unrestricted-size large infarct; ASPECTS 0–2 stratum supports Class IIa, Level B-R per AHA/ASA 2026 §4.7.2 Rec 4.',
  },
  'tension-nct-only-evt': {
    id: 'tension-nct-only-evt',
    citation_ids: ['tension-trial-2023', 'aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'TENSION trial: NCT-only patient selection for large-core EVT (no advanced perfusion imaging required); supports AHA/ASA 2026 §4.7.2.',
  },
  'baoche-posterior-evt': {
    id: 'baoche-posterior-evt',
    citation_ids: ['baoche-trial-2022', 'aha-asa-2026-4.7.3'],
    surfaces: [DATA_SURFACE],
    description: 'BAOCHE trial: basilar artery EVT in 6–24h window; Class I per AHA/ASA 2026 §4.7.3.',
  },
  'attention-posterior-evt': {
    id: 'attention-posterior-evt',
    citation_ids: ['attention-trial-2022', 'aha-asa-2026-4.7.3'],
    surfaces: [DATA_SURFACE],
    description: 'ATTENTION trial: basilar artery EVT within 12h; Class I per AHA/ASA 2026 §4.7.3.',
  },

  // ─── Batch 3B deep pearls (step-1 extended-window IVT + agent selection) ──
  'trace-iii-late-window-tnk': {
    id: 'trace-iii-late-window-tnk',
    citation_ids: ['trace-iii-trial-2024', 'aha-asa-2026-4.6.3'],
    surfaces: [DATA_SURFACE],
    description: 'TRACE-III trial: TNK 4.5–24h in LVO patients without EVT access; Class IIb, Level B-R per AHA/ASA 2026 §4.6.3.',
  },
  'timeless-late-window-negative': {
    id: 'timeless-late-window-negative',
    citation_ids: ['timeless-trial-2024', 'aha-asa-2026-4.6.3'],
    surfaces: [DATA_SURFACE],
    description: 'TIMELESS trial: negative/limiting trial — late-window TNK does not benefit when EVT is available; constrains TRACE-III recommendation to no-EVT-access populations.',
  },
  'act-tnk-class-i': {
    id: 'act-tnk-class-i',
    citation_ids: ['act-trial-2022', 'aha-asa-2026-4.6.2'],
    surfaces: [DATA_SURFACE],
    description: 'AcT trial: tenecteplase 0.25 mg/kg noninferior to alteplase; supports AHA/ASA 2026 §4.6.2 Class I elevation of TNK.',
  },

  // ─── Batch 3B deep pearls (step-5 post-treatment orders / BP harm) ───────
  'optimal-bp-post-evt-harm': {
    id: 'optimal-bp-post-evt-harm',
    citation_ids: ['optimal-bp-trial-2023', 'aha-asa-2026-4.3'],
    surfaces: [DATA_SURFACE],
    description: 'OPTIMAL-BP trial: intensive SBP <140 mmHg after successful EVT is harmful; Class III: Harm per AHA/ASA 2026 §4.3.',
  },
  'enchanted2-mt-sbp-under-120-harm': {
    id: 'enchanted2-mt-sbp-under-120-harm',
    citation_ids: ['enchanted2-mt-trial-2022', 'aha-asa-2026-4.3'],
    surfaces: [DATA_SURFACE],
    description: 'ENCHANTED2/MT trial: intensive SBP <120 mmHg post-EVT increased major disability; Class III per AHA/ASA 2026 §4.3.',
  },

  // ─── Batch 5 quick pearls (one-line scannable surfaces) ──────────────────
  // Each quick pearl anchors to the same citations as its companion deep pearl.
  'tnk-class-i-quick-claim': {
    id: 'tnk-class-i-quick-claim',
    citation_ids: ['act-trial-2022', 'aha-asa-2026-4.6.2'],
    surfaces: [DATA_SURFACE],
    description: 'Quick-pearl mirror of AcT: TNK 0.25 mg/kg is Class I, equivalent to alteplase.',
  },
  'late-window-tnk-quick-claim': {
    id: 'late-window-tnk-quick-claim',
    citation_ids: ['trace-iii-trial-2024', 'timeless-trial-2024', 'aha-asa-2026-4.6.3'],
    surfaces: [DATA_SURFACE],
    description: 'Quick-pearl mirror combining TRACE-III + TIMELESS: late-window TNK benefits only when EVT is not available.',
  },
  'large-core-evt-quick-claim': {
    id: 'large-core-evt-quick-claim',
    citation_ids: ['select2-trial-2023', 'angel-aspect-trial-2023', 'tension-trial-2023', 'laste-trial-2024', 'aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'Quick-pearl mirror combining the 4 large-core EVT trials: ASPECTS 3–5 Class I; LASTE extends to ASPECTS 0–2 Class IIa.',
  },
  'posterior-circulation-evt-quick-claim': {
    id: 'posterior-circulation-evt-quick-claim',
    citation_ids: ['baoche-trial-2022', 'attention-trial-2022', 'aha-asa-2026-4.7.3'],
    surfaces: [DATA_SURFACE],
    description: 'Quick-pearl mirror combining BAOCHE + ATTENTION: basilar AO EVT Class I within respective time windows.',
  },
  'post-evt-bp-avoid-intensive-quick-claim': {
    id: 'post-evt-bp-avoid-intensive-quick-claim',
    citation_ids: ['optimal-bp-trial-2023', 'aha-asa-2026-4.3'],
    surfaces: [DATA_SURFACE],
    description: 'Quick-pearl mirror of OPTIMAL-BP: avoid SBP <140 mmHg after successful EVT — Class III: Harm.',
  },
  'post-evt-bp-under-120-quick-claim': {
    id: 'post-evt-bp-under-120-quick-claim',
    citation_ids: ['enchanted2-mt-trial-2022', 'aha-asa-2026-4.3'],
    surfaces: [DATA_SURFACE],
    description: 'Quick-pearl mirror of ENCHANTED2/MT: SBP <120 mmHg post-EVT increased major disability.',
  },

  // ─── PRoFESS (2008) — long-term antiplatelet monotherapy head-to-head ────
  'profess-clopidogrel-vs-asa-erdp-ni-2008': {
    id: 'profess-clopidogrel-vs-asa-erdp-ni-2008',
    citation_ids: ['profess-sacco-2008'],
    surfaces: [DATA_SURFACE],
    description: 'PRoFESS trial: head-to-head noninferiority comparison of ASA + ER-dipyridamole vs clopidogrel for long-term secondary prevention after non-cardioembolic ischemic stroke. Recurrence rates similar (9.0% vs 8.8%, HR 1.01, 95% CI 0.92–1.11) but the upper CI bound crossed the prespecified NI margin of 1.075; noninferiority was not formally established. Intracranial hemorrhage was significantly higher with ASA–ERDP (1.4% vs 1.0%, HR 1.42).',
  },
};
