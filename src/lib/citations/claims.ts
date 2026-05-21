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
  // ─── 2022 index large-core EVT trial (Japan) ─────────────────────────────
  'rescue-japan-limit-evt-large-core-2022': {
    id: 'rescue-japan-limit-evt-large-core-2022',
    citation_ids: ['yoshimura-rescue-japan-limit-2022', 'aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'RESCUE-Japan LIMIT trial: EVT for ASPECTS 3–5 within 6h (or 6–24h without FLAIR signal change) improved 90-day mRS 0–3 (31.0% vs 12.7%, RR 2.43, P=0.002). First positive RCT for large-core EVT; opened the question confirmed by SELECT2/ANGEL-ASPECT/TENSION/LASTE. Supports AHA/ASA 2026 §4.7.2.',
  },
  // ICH safety claim removed 2026-05-20 — TrialMetadata supports a single
  // typed claimId per entry; the safety narrative is bound under the primary
  // efficacy claim (rescue-japan-limit-evt-large-core-2022) whose description
  // already cites the ICH trade-off. Re-introducing a separate safety claim
  // would need a multi-claimId schema extension (deferred).

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

  // ─── CREST (2010) — carotid revascularization head-to-head (CAS vs CEA) ──
  'crest-cas-vs-cea-superiority-not-met-2010': {
    id: 'crest-cas-vs-cea-superiority-not-met-2010',
    citation_ids: ['crest-brott-2010'],
    surfaces: [DATA_SURFACE],
    description: 'CREST trial: superiority comparison of carotid artery stenting vs carotid endarterectomy in average-surgical-risk symptomatic and asymptomatic patients. Primary 4-year composite of periprocedural stroke/MI/death plus ipsilateral stroke showed no significant difference (7.2% CAS vs 6.8% CEA, HR 1.11, 95% CI 0.81–1.51, P=0.51); superiority not demonstrated. Periprocedural component split: CAS roughly doubles stroke (4.1% vs 2.3%, HR 1.79, P=0.01), CEA roughly doubles MI (2.3% vs 1.1%, HR 0.50, P=0.03), and cranial nerve palsy is essentially CEA-only (4.7% vs 0.3%, HR 0.07, P<0.001). Treatment × age interaction P=0.02 with crossover near 70 years.',
  },

  // ─── PRoFESS (2008) — long-term antiplatelet monotherapy head-to-head ────
  'profess-clopidogrel-vs-asa-erdp-ni-2008': {
    id: 'profess-clopidogrel-vs-asa-erdp-ni-2008',
    citation_ids: ['profess-sacco-2008'],
    surfaces: [DATA_SURFACE],
    description: 'PRoFESS trial: head-to-head noninferiority comparison of ASA + ER-dipyridamole vs clopidogrel for long-term secondary prevention after non-cardioembolic ischemic stroke. Recurrence rates similar (9.0% vs 8.8%, HR 1.01, 95% CI 0.92–1.11) but the upper CI bound crossed the prespecified NI margin of 1.075; noninferiority was not formally established. Intracranial hemorrhage was significantly higher with ASA–ERDP (1.4% vs 1.0%, HR 1.42).',
  },

  // ─── ANNEXA-I (2024) — andexanet alfa for FXa-inhibitor-associated acute ICH ──
  'annexa-i-andexanet-fxa-ich-2024': {
    id: 'annexa-i-andexanet-fxa-ich-2024',
    citation_ids: ['connolly-annexa-i-2024'],
    surfaces: [DATA_SURFACE],
    description: 'ANNEXA-I trial: in 452 patients with acute intracerebral hemorrhage on a factor Xa inhibitor (apixaban, rivaroxaban, or edoxaban) within 15 hours of last dose, andexanet alfa improved hemostatic efficacy (composite of ≤35% hematoma expansion, NIHSS rise <7, and no rescue therapy at 12 h) compared with usual care (67.0% vs 53.1%; adjusted difference +13.4 pp, 95% CI 4.6–22.2; P=0.003). The trial was halted early for efficacy at a pre-specified interim analysis by the DSMB. Anti-FXa activity fell by a median of 94.5% with andexanet vs 26.9% with usual care (P<0.001). Thrombotic events were significantly increased with andexanet (10.3% vs 5.6%; +4.6 pp, 95% CI 0.1–9.2, P=0.048), driven primarily by ischemic stroke (6.5% vs 1.5%; +5.0 pp, 95% CI 1.5–8.8). Exploratory 30-day mRS 0–3 did not differ (28.0% vs 31.0%); 30-day mortality did not differ (27.8% vs 25.5%, P=0.51). The trial established andexanet as a hemostatic — but not functional — therapy for FXa-ICH and clarified the ischemic-stroke trade-off that informs the AHA/ASA 2022 ICH guideline Class IIa, Level B recommendation for FXa-inhibitor reversal. Stopped-early-for-efficacy caveat applies: effect size may be overestimated.',
  },

  // ─── EXTEND-IA TNK (2018) — foundational TNK-vs-alteplase in the LVO-EVT pathway ─
  'extend-ia-tnk-tnk-vs-alteplase-2018': {
    id: 'extend-ia-tnk-tnk-vs-alteplase-2018',
    citation_ids: ['campbell-extend-ia-tnk-2018', 'aha-asa-2026-4.6.2'],
    surfaces: [DATA_SURFACE],
    description: 'EXTEND-IA TNK trial: in EVT-eligible LVO patients within 4.5 hours, tenecteplase 0.25 mg/kg (single bolus, max 25 mg) achieved substantial reperfusion at initial angiographic assessment in 22% vs 10% with alteplase 0.9 mg/kg (difference 12 pp, 95% CI 2–21; P=0.002 for noninferiority and P=0.03 for superiority). Sequential gatekeeping: noninferiority established first (margin −2.3 pp), then superiority. Ordinal mRS shift at 90 days favored TNK (common OR 1.7, 95% CI 1.0–2.8, P=0.04); mRS 0–2 binary 64% vs 51% (aOR 1.8, P=0.06, not significant). Symptomatic ICH 1% in both arms. Established TNK 0.25 mg/kg as the IVT agent of first choice in the LVO-EVT pathway and seeded the broader TNK-vs-alteplase literature (NOR-TEST, AcT, ATTEST-2, TRACE-2, ORIGINAL) and AHA/ASA 2026 §4.6.2 Class I Level A recommendation.',
  },

  // ─── CREST-2 (2026) — revascularization vs modern intensive medical management ─
  //     for asymptomatic high-grade carotid stenosis (two parallel RCTs) ──────────
  'crest-2-asymptomatic-2025': {
    id: 'crest-2-asymptomatic-2025',
    citation_ids: ['brott-crest-2-2025'],
    surfaces: [DATA_SURFACE],
    description: 'CREST-2 trials: two parallel observer-blinded RCTs (155 sites, 5 countries) in patients with asymptomatic ≥70% extracranial carotid stenosis comparing revascularization plus intensive medical management vs intensive medical management alone. Stenting trial (N=1245): 4-year composite of periprocedural stroke/death plus postprocedural ipsilateral ischemic stroke was 6.0% medical-therapy vs 2.8% stenting (ARD 3.2 pp, 95% CI 0.6–5.9, P=0.02; RR 2.13, 95% CI 1.15–4.39). Authors reported NNT 31 to prevent one primary-outcome event over 4 years. Endarterectomy trial (N=1240): 5.3% medical-therapy vs 3.7% endarterectomy (ARD 1.6 pp, 95% CI −1.1 to 4.3, P=0.24; RR 1.43, 95% CI 0.78–2.72); primary not met. Periprocedural stroke/death: 0/629 (medical, stenting trial) vs 8/616 (CAS, 1.3%); 3/623 (medical, endarterectomy trial) vs 9/617 (CEA, 1.5%). Intensive medical management protocol identical across all four arms: SBP <130 mm Hg, LDL <70 mg/dL with alirocumab access after 2018, antithrombotic therapy, lifestyle coaching. Operator certification required (interventionists submitted preceding 12 months CAS cases; surgeons submitted preceding 50 consecutive CEA cases with <3% periprocedural stroke/death). Limitations: high-volume credentialed operators may not generalize to community practice; modern medical-management drift during enrollment may attenuate any incremental revascularization benefit; transcarotid revascularization not incorporated. Trial defines the modern asymptomatic-carotid management paradigm and supersedes the 1990s/2000s ACAS and ACST evidence base in the post-PCSK9, SBP <130, statin-optimized era.',
  },
};
