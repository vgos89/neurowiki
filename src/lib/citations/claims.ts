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

  // ─── ELAN pathway — early oral anticoagulation after AF-related ischemic stroke ─
  // Surface type: static JSX — tagged with data-claim="early-doac-af-stroke-recommendation"
  // on the result card (step 4) and the accordion guideline box in ElanPathway.tsx.
  // Source confirmed 2026-05-22: AHA/ASA 2026 §4.9 Anticoagulants (NOT §4.8 —
  // §4.8 is Antiplatelet Treatment). COR 2a confirmed; LOE deliberately omitted
  // pending separate verification of the LOE column from the source PDF.
  // See docs/reviews/clinical-PR-citation-aha-2026-4.9-2026-05-22.md.
  'early-doac-af-stroke-recommendation': {
    id: 'early-doac-af-stroke-recommendation',
    citation_ids: ['aha-asa-2026-4.9'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'AHA/ASA 2026 §4.9 (Anticoagulants) — COR 2a recommendation that early oral anticoagulation is reasonable in carefully selected (eg, milder severity) patients with AIS and atrial fibrillation; efficacy for early recurrence prevention not established. Operationalized via ELAN trial timing bins. ELAN (NEJM 2023) showed risk difference −1.18 (95% CI −2.84 to 0.47), numerical but not statistically significant. OPTIMAS (Lancet 2024) and TIMING (Stroke 2022) confirmed noninferiority.',
  },

  // ─── Phase 1A pilot — GuidelineSummaryCard on /trials/q/anticoagulation ─────
  // First instance of the new <GuidelineSummaryCard> composition pattern
  // (ADR-2026-05-22-guideline-summary-card-composition). Surfaces the same
  // §4.9 recommendation as `early-doac-af-stroke-recommendation` above, but
  // on a different page (trial-question page rather than ELAN pathway page)
  // — distinct claim ID because it is a distinct rendering surface.
  // Single-citation case validates the rendering layer before Phase 2 expands
  // to multi-citation cards.
  // ─── ASPECTS calculator — EVT eligibility for ASPECTS 3–5 and 0–2 strata ─
  // Surface = data-claim attribute on the ASPECTS interpretation drawer text.
  // Mapped to AHA/ASA 2026 §4.7.2 (anterior-circulation large-core EVT) plus
  // the four foundational large-core EVT trials whose evidence underwrote
  // the 2026 expansion (SELECT2, ANGEL-ASPECT, TENSION, LASTE).
  //
  // Per clinical review clinical-PR-aspects-cor-2a-correction-2026-05-22.md,
  // Condition 2 option (a) — trial citations attached so the "established
  // benefit" attribution in the 3–5 string is sourced rather than free-floating.
  'aspects-evt-eligibility-2026': {
    id: 'aspects-evt-eligibility-2026',
    citation_ids: [
      'aha-asa-2026-4.7.2',
      'select2-trial-2023',
      'angel-aspect-trial-2023',
      'tension-trial-2023',
      'laste-trial-2024',
    ],
    // Two surfaces: the ScoreInfo object's claimId field (data) is the
    // canonical claim-binding site; the rendered <p data-claim="..."> is the
    // user-visible surface. Scanner regex matches both literal occurrences.
    surfaces: [
      { type: 'data', field: 'claimId' },
      { type: 'jsx', attribute: 'data-claim' },
    ],
    description: 'ASPECTS calculator EVT eligibility interpretation for the 3–5 stratum (COR 1, LOE A, 6–24h) and 0–2 stratum (COR 2a, LOE B-R, 0–6h) per AHA/ASA 2026 §4.7.2. Both require age <80, NIHSS ≥6, prestroke mRS 0–1, ASPECTS in range, no significant mass effect, anterior-circulation proximal LVO of ICA or M1. Trial basis: SELECT-2 / ANGEL-ASPECT / TENSION (2023) and LASTE (2024).',
  },

  'anticoagulation-guideline-summary': {
    id: 'anticoagulation-guideline-summary',
    citation_ids: ['aha-asa-2026-4.9'],
    // Surface = data field on the guidelineSummariesByQuestion record.
    // The GuidelineSummaryCard component reads the claim ID from that data
    // and renders dynamically; the canonical claim-binding surface is the
    // data file, not the (templated) JSX attribute.
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/anticoagulation. Surfaces AHA/ASA 2026 §4.9 (Anticoagulants) — early oral anticoagulation reasonable in carefully selected (eg, milder severity) AIS patients with AF (COR 2a). Linked trials below the card: ELAN, OPTIMAS, TIMING.',
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

  // ─── 2017 PFO closure cluster — CLOSE, RESPECT long-term, REDUCE ─────────
  //     Three NEJM 2017;377(11) trials published together. Cryptogenic stroke
  //     + PFO; closure + antiplatelet vs antiplatelet alone. AHA/ASA 2021
  //     Class IIa, Level B-R for non-lacunar stroke <60 with no other cause.
  //     Atrial fibrillation excess is the central trade-off across all three.
  //     See docs/evidence-packets/{close,respect-longterm,reduce}-2017-2026-05-20.md
  'close-pfo-2017': {
    id: 'close-pfo-2017',
    citation_ids: ['mas-close-2017'],
    surfaces: [DATA_SURFACE],
    description: 'CLOSE trial: in 663 patients ages 16–60 with recent cryptogenic ischemic stroke and a PFO with atrial septal aneurysm OR large interatrial shunt (>30 microbubbles), PFO closure + long-term antiplatelet vs antiplatelet alone reduced recurrent stroke from 14/235 (6.0%) to 0/238 (0%) over mean follow-up 5.3 years (HR 0.03, 95% CI 0.00–0.26, P<0.001). 5-year Kaplan–Meier absolute reduction 4.9 percentage points; authors reported NNT 20 (95% CI 17–25) over 5 years. Atrial fibrillation/flutter higher with closure (4.6% vs 0.9%, P=0.02) but 10/11 cases occurred within 30 days of procedure and did not recur over median 4.4-year follow-up. Procedural complications 5.9%. Anticoagulation arm (vs antiplatelet) underpowered: 3 vs 7 strokes, HR 0.44 (0.11–1.85), not analyzed for significance. Trial enrolled the narrowest high-risk PFO population (ASA or large shunt required) of the three 2017 cluster trials. Enrollment stopped early administratively (December 2014) for budget; follow-up continued. Supports AHA/ASA 2021 Secondary Prevention Guideline Class IIa, Level B-R for PFO closure in non-lacunar stroke <60 with no other apparent etiology.',
  },
  'respect-pfo-longterm-2017': {
    id: 'respect-pfo-longterm-2017',
    citation_ids: ['saver-respect-2017'],
    surfaces: [DATA_SURFACE],
    description: 'RESPECT extended follow-up: in 980 patients ages 18–60 with cryptogenic ischemic stroke and TEE-confirmed PFO (no atrial septal aneurysm or shunt-size requirement), PFO closure with the Amplatzer PFO Occluder vs medical therapy (clinician choice of aspirin, warfarin, clopidogrel, or aspirin + dipyridamole) reduced recurrent ischemic stroke over median 5.9-year follow-up: 18/499 (3.6%, 0.58 events per 100 patient-years) vs 28/481 (5.8%, 1.07 per 100 patient-years), HR 0.55 (95% CI 0.31–0.999), P=0.046 by log-rank. Authors reported NNT 42 over 5 years. Effect strongest in recurrent stroke of undetermined cause (HR 0.38, P=0.007) and cryptogenic-only recurrent stroke (HR 0.08, P=0.01). Subgroup heterogeneity favored closure when atrial septal aneurysm was present (HR 0.20 vs 0.86, P interaction=0.04) or shunt was substantial (HR 0.26 vs 0.96, P interaction=0.04). Safety: venous thromboembolism higher in closure arm (PE 0.41 vs 0.11 per 100 patient-years, HR 3.48, P=0.04). Procedure-related serious adverse events 4.2% (atrial fibrillation/flutter 1.4%, device-related thrombosis, residual shunt). Borderline P=0.046 vs group-sequential threshold 0.043 — exploratory long-term analysis. Differential dropout (33% medical vs 21% closure); multiple imputation sensitivity analyses confirmed direction (HR 0.50, P=0.02). Original 2013 RESPECT (Carroll JD et al., NEJM 2013;368:1092–1100) did not meet ITT primary at median 2.1 years; the 5.9-year extended follow-up converted the borderline result and supported FDA approval (October 2016) of the Amplatzer PFO Occluder for cryptogenic stroke recurrence prevention in patients 18–60. Supports AHA/ASA 2021 Class IIa, Level B-R.',
  },
  'reduce-pfo-2017': {
    id: 'reduce-pfo-2017',
    citation_ids: ['sondergaard-reduce-2017'],
    surfaces: [DATA_SURFACE],
    description: 'REDUCE trial: in 664 patients ages 18–59 with cryptogenic ischemic stroke within 180 days and TEE-confirmed PFO (81% moderate or large shunt; ASA not required), PFO closure with Gore HELEX or Cardioform Septal Occluder + antiplatelet vs antiplatelet alone (2:1 randomization; clean antiplatelet comparator with no anticoagulation permitted) reduced clinical ischemic stroke over median 3.2-year follow-up: 6/441 (1.4%, 0.39 per 100 patient-years) vs 12/223 (5.4%, 1.71 per 100 patient-years), HR 0.23 (95% CI 0.09–0.62), P=0.002 by log-rank. Authors reported NNT ~28 over 24 months. Second coprimary endpoint of new brain infarction at 24 months (clinical or silent on T2 MRI) also met: 4.7% vs 10.7%, RR 0.44 (95% CI 0.24–0.81), multiplicity-adjusted P=0.048; silent infarction component alone did not differ (3.4% vs 4.0%, P=0.75) — the clinical-stroke component drove the composite. Safety: atrial fibrillation/flutter 6.6% (29/441) closure vs 0.4% (1/223) antiplatelet, P<0.001 — the largest absolute AF signal of the three 2017 trials. 83% of AF detected within 45 days, 59% resolved within 2 weeks; predominantly transient periprocedural AF. Serious device-related adverse events 1.4% (device dislocation, device-related thrombosis, aortic dissection). Major bleeding did not differ (1.8% vs 2.7%). Statistical analysis plan revised mid-trial (without unblinding) to add the new-brain-infarction coprimary and rescind the planned interim analysis — documented limitation. Supports AHA/ASA 2021 Class IIa, Level B-R and FDA approval (March 2018) of the Gore Cardioform Septal Occluder for cryptogenic stroke prevention.',
  },

  // ─── IST (1997) — foundational aspirin RCT in acute ischaemic stroke ─────
  //     Lancet 1997;349(9065):1569-1581. Paired with CAST in Chen et al. 2000
  //     pooled analysis underwriting AHA/ASA Class I, Level A early aspirin.
  //     See docs/evidence-packets/ist-1997-2026-05-20.md.
  'ist-aspirin-1997': {
    id: 'ist-aspirin-1997',
    citation_ids: ['sandercock-ist-1997'],
    surfaces: [DATA_SURFACE],
    description: 'IST: international open factorial 2x2 trial of aspirin 300 mg/day and/or subcutaneous heparin (5000 or 12500 IU bd) vs avoid, within 48 hours of suspected acute ischaemic stroke. N=19,435 across 467 hospitals in 36 countries (1991-1996). Aspirin reduced 14-day recurrent ischaemic stroke 2.8% vs 3.9% with no excess haemorrhagic stroke (0.9% vs 0.8%); combined 14-day death or non-fatal recurrent stroke 11.3% vs 12.4% (2p=0.02; 11 fewer per 1000). 6-month death or dependence 62.2% vs 63.5% (unadjusted 2p=0.07, NS; adjusted for baseline prognosis 14 fewer per 1000, 2p=0.03). Extracranial bleeds +5 per 1000 with aspirin in the presence of heparin; +2 per 1000 without heparin (NS). Subcutaneous heparin (low or medium dose) at the doses tested showed no net benefit at 6 months: 14-day haemorrhagic stroke +8 per 1000 (1.2% vs 0.4%, 2p<0.00001), transfused or fatal extracranial bleeds +9 per 1000, recurrent ischaemic stroke reduction completely offset by haemorrhagic stroke increase; 6-month death-or-dependence 62.9% in both arms. Medium-dose heparin worse than low-dose on 14-day death or non-fatal stroke (12.6% vs 10.8%, 2p=0.007). IST is the primary RCT evidence against routine therapeutic-intensity heparin in acute ischaemic stroke and, jointly with CAST, the foundational evidence for early aspirin. Pre-thrombolytic era (NINDS published December 1995, most IST patients not thrombolysed). Open-label design (placebo for aspirin not used; secondary outcomes susceptible to assessment bias though 6-month assessor blinded in most countries). 4% of randomised patients never CT-scanned. Aspirin dose 300 mg/day differs from modern 81 mg or 325 mg practice; pooled IST+CAST analysis (Chen et al. 2000, PMID 10835439) covers the 160-325 mg range and is the canonical reference modern AHA/ASA guidelines cite for the Class I, Level A recommendation for aspirin within 24-48 hours of acute ischaemic stroke once ICH is excluded.',
  },

  // ─── CAST (1997) — foundational aspirin RCT in acute ischaemic stroke ────
  //     Lancet 1997;349(9066):1641-1649. Chinese double-blind placebo-
  //     controlled parallel to IST. See docs/evidence-packets/cast-1997-2026-05-20.md.
  'cast-aspirin-1997': {
    id: 'cast-aspirin-1997',
    citation_ids: ['cast-1997'],
    surfaces: [DATA_SURFACE],
    description: 'CAST: double-blind placebo-controlled trial of aspirin 160 mg/day vs placebo within 48 hours of suspected acute ischaemic stroke, continued in-hospital up to 4 weeks. N=21,106 across 413 Chinese hospitals (1993-1997). Aspirin reduced in-hospital mortality 3.3% vs 3.9% (14% proportional reduction, 2p=0.04; ARR 5.4 per 1000) and recurrent ischaemic stroke 1.6% vs 2.1% (2p=0.01) with a small non-significant excess of haemorrhagic stroke (1.1% vs 0.9%, 2p>0.1; +2 per 1000). Combined in-hospital death or non-fatal stroke at 4 weeks 5.3% vs 5.9% (12% proportional reduction, 2p=0.03; 6.8 fewer per 1000). Dead or dependent at discharge 30.5% vs 31.6% (11.4 fewer per 1000, 2p=0.08; trend, did not reach conventional significance for the second co-primary). Transfused or fatal extracranial bleeds +2.7 per 1000 with aspirin (0.8% vs 0.6%, 2p=0.02). Pre-thrombolytic era. Chinese-only enrolment with case-mix weighted toward intracranial atherosclerosis and lacunar stroke; 72% of patients younger than 70 (vs 38% under 70 in IST), lower mean in-hospital mortality than IST. CT before randomisation was mandatory only for comatose patients (87% had pre-randomisation CT; 94% had at least one in-hospital CT); 1.5% misdiagnosed at entry (174 haemorrhagic strokes, 128 brain tumours/other) and analysed by ITT with no signal of net harm in the misdiagnosed subgroup. CAST aspirin dose 160 mg/day; pooled with IST 300 mg/day in Chen et al. 2000 (PMID 10835439) the canonical ~40,000-patient pooled analysis underwriting the AHA/ASA Class I, Level A recommendation for aspirin within 24-48 hours of acute ischaemic stroke once ICH is excluded.',
  },

  // ─── THEIA (2025) — first phase 3 RCT of IV alteplase for non-arteritic CRAO
  //     Lancet Neurology 2025;24(11):909-919. Tagged as the canonical data
  //     surface for the THEIA trial entry in trialData.ts. AHA / NANOS 2021
  //     CRAO Scientific Statement (Mac Grory et al.) co-cited as the
  //     guideline anchor that THEIA does not supersede.
  //     See docs/evidence-packets/theia-2026-05-20.md.
  // ─── ICH anticoagulation reversal chain (2026-05-21 batch) ────────────────
  //     Three trials added to the ich-anticoagulation-reversal question:
  //     PATCH (2016) — HARM signal for platelet transfusion in antiplatelet-ICH
  //     ANNEXA-4 (2019) — single-arm cohort behind FDA andexanet approval
  //     Sarode 2013 — 4F-PCC vs FFP NI trial underwriting AHA/ASA Class I, Level A
  //     See docs/evidence-packets/{patch-2016,annexa-4-2019,sarode-2013}-2026-05-21.md
  'patch-platelet-transfusion-harm-2016': {
    id: 'patch-platelet-transfusion-harm-2016',
    citation_ids: ['baharoglu-patch-2016', 'aha-asa-ich-2022-reversal'],
    surfaces: [DATA_SURFACE],
    description: 'PATCH trial: in adults with spontaneous supratentorial ICH on antiplatelet therapy presenting within 6 h, platelet transfusion within 90 min of imaging vs standard care increased the odds of death or dependence at 3 months on mRS (adjusted common OR 2.05, 95% CI 1.18-3.56, P=0.0114). Serious adverse events 42% vs 30%; death 24% vs 17%. The trial that established AHA/ASA 2022 Class III: Harm against routine platelet transfusion in antiplatelet-associated ICH. Open-label PROBE design with masked endpoint adjudication. Excluded patients with planned neurosurgical evacuation. ESO 2022 also strongly recommends against routine platelet transfusion. No subsequent RCT has been mounted to challenge the harm signal.',
  },
  'annexa-4-fxa-reversal-2019': {
    id: 'annexa-4-fxa-reversal-2019',
    citation_ids: ['connolly-annexa-4-2019', 'aha-asa-ich-2022-reversal'],
    surfaces: [DATA_SURFACE],
    description: 'ANNEXA-4: single-arm, open-label prospective cohort study of andexanet alfa in 352 patients with acute major bleeding within 18 h of FXa-inhibitor dose (apixaban, rivaroxaban, edoxaban, enoxaparin). Bleeding was predominantly intracranial (64%). Anti-FXa activity fell 92% with andexanet for both apixaban (149.7 to 11.1 ng/mL, 95% CI 91-93%) and rivaroxaban (211.8 to 14.2 ng/mL, 95% CI 88-94%). Excellent or good hemostatic efficacy at 12 h in 204/249 (82%). 30-day mortality 14%; thrombotic events 10%. The cohort behind FDA accelerated approval (May 2018) and AHA/ASA 2022 Class IIa, Level B-NR for andexanet in FXa-inhibitor-associated ICH. Single-arm design cannot establish efficacy or attribute thrombotic events causally. Confirmed in randomized framework specifically in ICH by ANNEXA-I (Connolly NEJM 2024, PMID 38804514).',
  },
  'sarode-4fpcc-vka-reversal-2013': {
    id: 'sarode-4fpcc-vka-reversal-2013',
    citation_ids: ['sarode-4fpcc-2013', 'aha-asa-ich-2022-reversal'],
    surfaces: [DATA_SURFACE],
    description: 'Sarode 2013: multicenter open-label noninferiority RCT (phase IIIb) of 4-factor PCC (Kcentra/Beriplex) vs fresh frozen plasma in 202 VKA-treated adults with acute major bleeding (GI 38%, intracranial ~14%, visible ~13%). Both arms received vitamin K 5-10 mg IV. Coprimary endpoints: 24-h hemostatic efficacy and INR <=1.3 at 0.5 h post-infusion. Hemostatic efficacy 72.4% (4F-PCC) vs 65.4% (FFP); difference +7.1 pp (95% CI -5.8 to +19.9) — noninferiority established (margin -10 pp). INR <=1.3 at 0.5 h: 62.2% vs 9.6%; difference +52.6 pp (95% CI 39.4-65.9) — superiority established. Mortality (5.1% vs 4.8%) and thromboembolic events (6.8% vs 6.4%) comparable; fluid overload less common with 4F-PCC (2.9% vs 11.9%); median infusion volume 99 mL vs 814 mL. Population was general VKA major bleeding, not ICH-specific. Underwrote FDA approval of Kcentra (April 2013) and AHA/ASA 2022 Class I, Level A for 4F-PCC > FFP in VKA-associated ICH. ICH-specific confirmation comes from INCH (Steiner Lancet Neurol 2016) — halted early at interim for INR reversal favoring 4F-PCC.',
  },

  'theia-crao-alteplase-2025': {
    id: 'theia-crao-alteplase-2025',
    citation_ids: ['preterre-theia-2025', 'mac-grory-aha-nanos-crao-2021'],
    surfaces: [DATA_SURFACE],
    description: 'THEIA trial: first phase 3 randomised controlled trial of intravenous alteplase 0.9 mg/kg vs oral aspirin 300 mg for acute non-arteritic central retinal artery occlusion (CRAO) within 4.5 hours of severe monocular vision loss (Snellen <20/400). N=70 randomised (35 per arm) across 16 French stroke units, June 2018–October 2023. Double-dummy patient- and assessor-blinded; treating staff open-label. Primary endpoint of visual acuity improvement of at least 0.3 LogMAR at 1 month: 19/29 (66%) alteplase vs 13/27 (48%) aspirin; unadjusted risk difference +17.4 pp (95% CI -11.8 to +46.5); adjusted OR 1.10 (95% CI 0.07–18.39); p=0.95. Trial explicitly underpowered: sized for a 30 pp difference (40% alteplase vs assumed 10% aspirin); observed aspirin response was 48%, making the real difference too small to detect at N=70. Safety strongly reassuring: zero symptomatic intracranial haemorrhages and zero major extracranial bleeds related to study treatment in either arm; one asymptomatic 15 mm parietal haematoma incidentally detected on day 1 CT in the alteplase arm. Functional reading vision (≤0.5 LogMAR / Snellen 20/63) achieved in only 14% alteplase vs 7% aspirin patients — low durable recovery in both arms consistent with the hypothesis that retinal ischaemic tolerance may be much shorter than 4.5h (potentially as little as 15 minutes for complete CRAO per Tobalem 2018). Mean onset-to-treatment 232 min; only 11% treated within 3.0h. Aspirin chosen as comparator (not placebo) because at least one-third of CRAO patients have concomitant cerebral ischaemia on DWI MRI. Conducted in French stroke units with mature ophthalmology-stroke integration; ophthalmologist-confirmed CRAO diagnosis required. Trial does not change the existing AHA / NANOS 2021 Scientific Statement on CRAO management (Mac Grory et al., Stroke 2021;52:e282-e294) which suggests IV alteplase "may be considered" for patients with disabling visual deficits meeting criteria. THEIA fails to demonstrate but does not refute efficacy; the planned individual-patient-data meta-analysis combining THEIA + TenCRAOS (NCT04526951) + REVISION (NCT04965038), both still recruiting at the time of THEIA publication, is the path to level 1 evidence. The predecessor CRAO trial EAGLE (Schumacher 2010) tested intra-arterial fibrinolysis with windows up to 20 hours and showed no efficacy with 37% adverse events — THEIA tests a fundamentally different intervention (IV vs IA) within a much earlier and narrower window with substantially better safety. Clinical implications: CRAO belongs in the stroke pathway (triage to ED, stroke code activation, funduscopy, GCA screening, brain imaging, ophthalmology co-management); IV alteplase 0.9 mg/kg within 4.5h is safe; aspirin should not be withheld; secondary-prevention workup follows the standard ischaemic stroke pathway because CRAO is a marker of systemic cerebrovascular and cardiovascular disease.',
  },
};
