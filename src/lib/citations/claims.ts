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

// Trial-page bedsidePearl content uses a dedicated field so the scanner
// can distinguish trial-page claims from strokeClinicalPearls claims.
const BEDSIDE_PEARL_SURFACE = { type: 'bedsidePearl' as const, field: 'bedsidePearlClaimId' as const };

// ─── citation_ids ordering convention (architect §17.1 2026-05-25) ───────
// Within each claim's citation_ids array, list citations in this order:
//   1. Primary trials (RCTs, landmark cohorts) — chronologically within
//   2. Guidelines (AHA / AAN / EFNS / AHS / ESO) — newest first
//   3. Review articles (Continuum, NEJM Reviews) — as secondary references
// Rationale: clinicians should see the primary evidence first; the review
// articles remain in the array as secondary context. Per V direction
// 2026-05-25: "you can't reference Continuum, that's a review article;
// reference the trial within the continuum articles where you get that
// information." Continuum reviews retained but demoted.
// ─────────────────────────────────────────────────────────────────────────

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

  // ─── Extended / late-window IV thrombolysis pathway — sICH caution surfaces ──
  // Class E authoring 2026-07-19. Two claims backing the ExtendedIVTPathway
  // result cards. Evidence-verifier packet: extended-late-window-ivt-sich-caution
  // (2026-07-19). Surfaces are static JSX in src/pages/ExtendedIVTPathway.tsx,
  // tagged via data-claim on the rendered caution / figure elements. The
  // orchestrator owns that file; strings are authored here and pasted there.
  //
  // NOTE on citation ordering: the §17.1 convention above lists primary trials
  // before guidelines. For the shared caution (claim 1) that order is
  // deliberately relaxed to lead with the two governing 2026 guideline sections,
  // because this is a guideline-anchored safety caution and §4.6.1 / §4.6.3 are
  // the governing sources; the three foundational trials follow as supporting
  // hemorrhage evidence. Deviation documented per the packet's explicit
  // guideline-first recommendation. Claim 2 keeps trial-first order.
  //
  // Claim 1 — shared QUALITATIVE sICH caution shown on every Eligible verdict
  // (Path A unknown-onset / wake-up DWI-FLAIR mismatch, Path B 4.5–9h
  // perfusion-mismatch alteplase, Path C 9–24h tenecteplase for LVO). Carries NO single
  // numeric sICH rate: the packet established that no one percentage is fair
  // across the three windows (published sICH ranges ~1.4%–6.2%, differing
  // definitions and populations; Paths A/B are alteplase, not tenecteplase).
  'extended-ivt-sich-caution': {
    id: 'extended-ivt-sich-caution',
    citation_ids: [
      'aha-asa-2026-4.6.1',
      'aha-asa-2026-4.6.3',
      'extend-trial-2019',
      'wake-up-trial-2018',
      'trace-iii-trial-2024',
    ],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Qualitative symptomatic-intracranial-hemorrhage caution shown on every Eligible verdict of the extended / late-window IV thrombolysis pathway (Paths A/B/C). Asserts that thrombolysis beyond 4.5 hours carries an sICH risk that rises with larger established infarct, and directs confirmation of salvageable tissue plus expert oversight. No numeric sICH rate in the shared caution because no single percentage is fair across the 4.5–9h alteplase, unknown-onset alteplase, and 9–24h tenecteplase windows. EXTEND (2019) and WAKE-UP (2018) each reported more (or numerically more) symptomatic cerebral hemorrhage with alteplase; TRACE-III (2024) reported a higher sICH incidence with late-window tenecteplase. Governed by AHA/ASA 2026 §4.6.1 (thrombolysis decision-making) and §4.6.3 (late-window tenecteplase for LVO).',
  },

  // Claim 2 — Path C ONLY numeric line citing TRACE-III sICH figure (about 3%
  // with tenecteplase vs under 1% without). Path C is the genuinely tenecteplase,
  // late-window (9–24h), LVO trial, so its numeric rate is attributable here and
  // MUST NOT be generalized to Paths A/B (alteplase). Packet rated the exact sICH
  // definition label UNVERIFIED (secondary source, egress-blocked from primary
  // full text) at Medium confidence; the rendered string is phrased to stay
  // defensible at that confidence (names the trial, uses "about" / "under", makes
  // no definition-label claim).
  'trace-iii-late-tnk-sich': {
    id: 'trace-iii-late-tnk-sich',
    citation_ids: ['trace-iii-trial-2024', 'aha-asa-2026-4.6.3'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Path C (9–24h tenecteplase for LVO) numeric sICH line: in TRACE-III, symptomatic intracranial hemorrhage occurred in about 3% of tenecteplase patients versus under 1% with standard medical treatment. Figure is specific to late-window tenecteplase for large-vessel occlusion and is not generalized to the alteplase Paths A/B. Exact sICH definition label unverified at Medium confidence per the 2026-07-19 evidence packet; the string names the trial and uses approximate phrasing to remain defensible. Governed by TRACE-III (2024) and AHA/ASA 2026 §4.6.3.',
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
    description: 'ASPECTS calculator EVT eligibility interpretation, two-tier for the 3–5 stratum plus the 0–2 stratum, per AHA/ASA 2026 §4.7.2. ASPECTS 3–5 within 6h: COR 1, LOE A as part of the ASPECTS 3–10 recommendation, gated on NIHSS ≥6 and prestroke mRS 0–1 only (no age or mass-effect gate). ASPECTS 3–5 at 6–24h: COR 1, LOE A in selected patients (age <80, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect). ASPECTS 0–2 within 6h: COR 2a, LOE B-R in selected patients (age <80, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect). All strata require anterior-circulation proximal LVO of ICA or M1. Trial basis: SELECT-2 / ANGEL-ASPECT / TENSION (2023) underwrite the ASPECTS 3–5 strata; LASTE (2024) underwrites the ASPECTS 0–2 stratum.',
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

  // ─── PFO closure for cryptogenic stroke — clinical synthesis pilot ─────────
  // First instance of the <ClinicalSynthesisCard> editorial-prose pattern.
  // Surfaces a multi-paragraph synthesis on /trials/q/pfo-closure-cryptogenic
  // since PFO closure is OUT OF SCOPE for the 2026 AIS guideline (it's
  // governed by the 2021 AHA/ASA Secondary Prevention guideline) — so the
  // existing <GuidelineSummaryCard> pattern, which renders verbatim 2026 AIS
  // recommendations, does not apply here.
  //
  // Citations (4): three 2017 NEJM trials (CLOSE, REDUCE, RESPECT long-term)
  // plus the 2021 AHA/ASA Secondary Prevention guideline (Class IIa, Level
  // B-R for non-lacunar stroke <60 with PFO and no other apparent etiology).
  // Surface = data field (claimId) on the clinicalSynthesesByQuestion record;
  // ClinicalSynthesisCard reads the claim ID dynamically. Pattern mirrors
  // anticoagulation-guideline-summary above.
  'pfo-closure-cryptogenic-synthesis': {
    id: 'pfo-closure-cryptogenic-synthesis',
    citation_ids: [
      'mas-close-2017',
      'sondergaard-reduce-2017',
      'saver-respect-2017',
      'aha-asa-2021-secondary-prevention-pfo',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/pfo-closure-cryptogenic. Synthesises the 2017 NEJM PFO closure cluster (CLOSE, REDUCE, RESPECT long-term) against the 2021 AHA/ASA Secondary Prevention Guideline Class IIa Level B-R framing for non-lacunar stroke <60 with PFO and no other apparent etiology. Acknowledges the broader pre-2017 landscape (CLOSURE-I 2012, PC trial 2013, original RESPECT 2013, DEFENSE-PFO 2018) and the AF-excess trade-off central to shared decision-making.',
  },

  // ─── Phase 2 GuidelineSummaryCard rollout — 7 question-page claims ──────────
  // Each maps a trial-question slug to the canonical AHA/ASA 2026 section
  // that directly answers the clinical question. Surface is the data field
  // on the guidelineSummariesByQuestion record. All single-citation
  // (validates the rendering layer's same-shape path used by the
  // anticoagulation pilot in commit 00199fb).

  'tpa-timing-guideline-summary': {
    id: 'tpa-timing-guideline-summary',
    citation_ids: ['aha-asa-2026-4.6.1'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/tpa-timing. Surfaces AHA/ASA 2026 §4.6.1 (Thrombolysis Decision-Making): faster treatment improves outcomes for disabling deficits; do not delay for advanced imaging; do not routinely treat non-disabling deficits with IVT (DAPT preferred).',
  },

  'tnk-vs-alteplase-guideline-summary': {
    id: 'tnk-vs-alteplase-guideline-summary',
    citation_ids: ['aha-asa-2026-4.6.2'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/tnk-vs-alteplase. Surfaces AHA/ASA 2026 §4.6.2 (Choice of Thrombolytic Agent): TNK 0.25 mg/kg and alteplase 0.9 mg/kg are equivalent first-line options within 4.5h (COR 1, LOE A).',
  },

  'late-window-selection-guideline-summary': {
    id: 'late-window-selection-guideline-summary',
    citation_ids: ['extend-trial-2019', 'wake-up-trial-2018'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/late-window-selection. Surfaces the extended-window IV thrombolysis recommendation (COR 2a, LOE B-R per AHA/ASA 2026): IVT is reasonable in patients with salvageable penumbra on perfusion imaging who are 4.5–9h from LKW, or who wake with symptoms or have unknown onset with DWI-FLAIR mismatch. Established by EXTEND (alteplase 4.5–9h, perfusion mismatch) and WAKE-UP (unknown onset, DWI-FLAIR mismatch). Distinct from the late-window tenecteplase-for-LVO recommendation (TRACE-III/TIMELESS, §4.6.3, 4.5–24h, Class IIb).',
  },

  'lvo-evt-guideline-summary': {
    id: 'lvo-evt-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/lvo-evt. Surfaces AHA/ASA 2026 §4.7.2 (Endovascular Thrombectomy for Adults): EVT recommended for anterior-circulation proximal LVO 0–6h and 6–24h windows with appropriate imaging selection (COR 1, LOE A); large-core stratum (ASPECTS 3–5, also 0–2 within 6h) carries its own recommendations.',
  },

  'basilar-evt-guideline-summary': {
    id: 'basilar-evt-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.3'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/basilar-evt. Surfaces AHA/ASA 2026 §4.7.3 (Posterior Circulation Stroke): EVT for basilar artery occlusion recommended within 24h in selected patients with baseline mRS 0–1, NIHSS ≥10, and PC-ASPECTS ≥6 (COR 1, LOE A).',
  },

  'dapt-guideline-summary': {
    id: 'dapt-guideline-summary',
    citation_ids: ['aha-asa-2026-4.8'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/dapt. Surfaces AHA/ASA 2026 §4.8 (Antiplatelet Treatment): DAPT (aspirin + clopidogrel with loading dose) recommended within 24h for minor noncardioembolic AIS (NIHSS ≤3) or high-risk TIA (ABCD² ≥4) who did not receive IVT, for 21 days followed by SAPT (COR 1, LOE A).',
  },

  'bp-control-guideline-summary': {
    id: 'bp-control-guideline-summary',
    citation_ids: ['aha-asa-2026-4.3'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/bp-control. Surfaces AHA/ASA 2026 §4.3 (Blood Pressure Management): pre-IVT target SBP <185 and DBP <110 (COR 1, LOE B-NR); post-IVT target <180/105 for at least 24h (COR 1, LOE B-R); intensive SBP reduction to <140 post-IVT is not recommended (COR 3 No Benefit, LOE B-R) and post-EVT after successful recanalization is harmful and should be avoided (COR 3 Harm, LOE A). Cited citation aha-asa-2026-4.3 quoted_text covers all four rows including the pre-IVT threshold.',
  },

  // ─── Phase 3 rollout — 6 more questions wired to AHA/ASA 2026 sections ────

  'msu-dispatch-guideline-summary': {
    id: 'msu-dispatch-guideline-summary',
    citation_ids: ['aha-asa-2026-2.5'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/msu-dispatch. Surfaces AHA/ASA 2026 §2.5 (Mobile Stroke Units): MSU-delivered IVT improves functional outcomes vs standard EMS (COR 1, LOE B-R); MSU dispatch helps triage EVT-eligible patients to TSC/CSC centers (COR 2a, LOE B-R).',
  },

  'direct-vs-bridging-guideline-summary': {
    id: 'direct-vs-bridging-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.1'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/direct-vs-bridging. Surfaces AHA/ASA 2026 §4.7.1 (EVT Concomitant with IVT): in patients eligible for BOTH, give IVT and do not skip it; do not observe for clinical response before EVT (both COR 1, LOE A). The 2026 guideline closes the "skip IVT to facilitate EVT" question.',
  },

  'large-core-evt-guideline-summary': {
    id: 'large-core-evt-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/large-core-evt. Surfaces AHA/ASA 2026 §4.7.2 (anterior-circulation EVT, large-core strata): ASPECTS 3–5 EVT recommended 6–24h (COR 1, LOE A); ASPECTS 0–2 EVT can reasonably be considered within 6h in selected patients with age <80, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect (COR 2a, LOE B-R). Same §4.7.2 citation shared with lvo-evt-guideline-summary; this card emphasizes the large-core strata specifically.',
  },

  'mevo-distal-evt-guideline-summary': {
    id: 'mevo-distal-evt-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.2'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/mevo-distal-evt. Surfaces AHA/ASA 2026 §4.7.2: EVT for dominant proximal M2 occlusion presenting within 6h, NIHSS ≥6, prestroke mRS 0–1, ASPECTS ≥6 is reasonable (COR 2a, LOE B-NR); EVT for non-dominant M2, M3, distal occlusions, ACA, PCA is NOT recommended (COR 3: No Benefit, LOE A).',
  },

  'post-evt-bp-target-guideline-summary': {
    id: 'post-evt-bp-target-guideline-summary',
    citation_ids: ['aha-asa-2026-4.3'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/post-evt-bp-target. Surfaces AHA/ASA 2026 §4.3 (Blood Pressure Management) with emphasis on the post-EVT recommendations: intensive SBP <140 after successful EVT (mTICI 2b/2c/3) is NOT recommended because it is associated with harm (COR 3: Harm, citing OPTIMAL-BP and ENCHANTED2/MT). Target ≤180/105.',
  },

  'aspiration-vs-stentriever-guideline-summary': {
    id: 'aspiration-vs-stentriever-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.4'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/aspiration-vs-stentriever. Surfaces AHA/ASA 2026 §4.7.4 (Endovascular Techniques): stent retrievers, contact aspiration, and combination techniques are all equivalent first-line options to achieve rapid and adequate reperfusion (COR 1, LOE A). Operator choice between techniques is not constrained by the guideline.',
  },

  'evt-adjunct-pharmacotherapy-guideline-summary': {
    id: 'evt-adjunct-pharmacotherapy-guideline-summary',
    citation_ids: ['aha-asa-2026-4.7.4'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/evt-adjunct-pharmacotherapy. Surfaces AHA/ASA 2026 §4.7.4 adjunctive pharmacotherapy recommendations: preoperative IV tirofiban before EVT is not useful (COR 3 No Benefit, LOE A per RESCUE-BT). Post-EVT adjunctive intraarterial thrombolytics (urokinase, alteplase, or tenecteplase) after successful TICI 2b+ reperfusion may be reasonable (COR 2b, LOE B-R per CHOICE).',
  },

  'minor-stroke-choice-guideline-summary': {
    id: 'minor-stroke-choice-guideline-summary',
    citation_ids: ['aha-asa-2026-4.6.1', 'aha-asa-2026-4.8'],
    surfaces: [DATA_SURFACE],
    description: 'GuidelineSummaryCard on /trials/q/minor-stroke-choice — FIRST multi-citation card in the rollout. Surfaces TWO complementary 2026 recommendations: §4.6.1 Rec 4 (COR 3 No Benefit) — IVT should not be used routinely for non-disabling deficits within 4.5h; AND §4.8 Rec 12 (COR 1, LOE A) — DAPT (clopidogrel + aspirin loading then 21 days) is the preferred alternative for NIHSS ≤3 / ABCD² ≥4. Validates the multi-section composition pattern from ADR-2026-05-22-guideline-summary-card-composition.',
  },

  // ─── Asymptomatic carotid clinical synthesis ────────────────────────────────
  'asymptomatic-carotid-synthesis': {
    id: 'asymptomatic-carotid-synthesis',
    citation_ids: [
      'crest-brott-2010',
      'brott-crest-2-2026',
      'aha-asa-2021-secondary-prevention-carotid',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/asymptomatic-carotid. Synthesises CREST (2010, head-to-head CAS vs CEA, failed superiority) and CREST-2 (NEJM 2026, two parallel RCTs vs modern intensive medical management — stenting separated, endarterectomy did not). Frames the 2021 AHA/ASA Secondary Prevention §5.3 wording as pre-CREST-2 and explicitly notes that the asymptomatic-question evidence base is now anchored on the modern-medical-management comparator.',
  },

  // ─── ICH anticoagulation reversal clinical synthesis ────────────────────────
  'ich-anticoagulation-reversal-synthesis': {
    id: 'ich-anticoagulation-reversal-synthesis',
    citation_ids: [
      'connolly-annexa-i-2024',
      'connolly-annexa-4-2019',
      'sarode-4fpcc-2013',
      'baharoglu-patch-2016',
      'aha-asa-2022-ich-anticoag-reversal',
      'fda-andexxa-safety-2024',
      'astrazeneca-andexxa-withdrawal-2025',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/ich-anticoagulation-reversal. Agent-specific reversal: 4F-PCC + IV vitamin K for VKA, idarucizumab for dabigatran, 4F-PCC 50 U/kg for FXa inhibitors (default since Dec 22 2025 US withdrawal of andexanet alfa per FDA risk-benefit conclusion). Explicitly surfaces PATCH (2016) HARM finding — DO NOT transfuse platelets for antiplatelet-associated ICH outside a planned neurosurgical procedure (AHA/ASA 2022 Class III: Harm). Grounded in 2022 AHA/ASA Spontaneous ICH Guideline §5.2.1; updated 2026-05-24 to incorporate FDA Nov-2024 advisory committee finding (full ANNEXA-I dataset: total thromboembolic events 14.6% vs 6.9%, thrombosis-related deaths at day 30 2.5% vs 0.9%) and AstraZeneca voluntary BLA withdrawal effective 2025-12-22.',
  },

  // ─── FXa-inhibitor ICH reversal — bedside surfaces (andexanet US withdrawal) ─
  // Sibling to the synthesis claim above, scoped to the short bedside
  // recommendation strings in the ICH/hemorrhage protocols and pearls
  // (StrokeIchProtocolStep, CodeModeStep4, HemorrhageProtocol, two
  // strokeClinicalPearls entries). These surfaces now lead with 4F-PCC and
  // note that andexanet alfa was withdrawn from the US market (commercial
  // sales ended 2025-12-22 per FDA risk-benefit conclusion + AstraZeneca
  // voluntary withdrawal). Data surface only — the two guide-page
  // <Paragraph> surfaces (IchManagement, IvTpa) carry the same corrected
  // text but cannot hold a scannable tag because <Paragraph> does not
  // accept/spread data-claim; see clinical review note for PR.
  'fxa-reversal-4fpcc-andexanet-withdrawn': {
    id: 'fxa-reversal-4fpcc-andexanet-withdrawn',
    citation_ids: [
      'aha-asa-2022-ich-anticoag-reversal',
      'fda-andexxa-safety-2024',
      'astrazeneca-andexxa-withdrawal-2025',
    ],
    surfaces: [DATA_SURFACE],
    description: 'Bedside FXa-inhibitor ICH reversal recommendation across the ICH/hemorrhage protocol data objects and quick pearls. Leads with 4-factor PCC 50 U/kg IV and notes andexanet alfa was withdrawn from the US market (US commercial sales ended 2025-12-22 per FDA risk-benefit conclusion + AstraZeneca voluntary withdrawal). Warfarin (4F-PCC + IV vitamin K) and dabigatran (idarucizumab 5 g IV) recommendations unchanged. Grounded in 2022 AHA/ASA Spontaneous ICH Guideline §5.2.1 reversal framework. Tagged surfaces: StrokeIchProtocolStep ICH_PROTOCOL_ITEMS reversal item, CodeModeStep4 stat-ct-decline order, HemorrhageProtocol STEPS reversal item, strokeClinicalPearls hemorrhage-management-quick and hemorrhage-reversal-protocol.',
  },

  // ─── Hemicraniectomy clinical synthesis ─────────────────────────────────────
  'hemicraniectomy-synthesis': {
    id: 'hemicraniectomy-synthesis',
    citation_ids: [
      'aha-asa-2014-hemicraniectomy',
      'aha-asa-2026-6.3',
      'vahedi-decimal-2007',
      'juttler-destiny-2007',
      'hofmeijer-hamlet-2009',
      'vahedi-pooled-decimal-destiny-hamlet-2007',
      'juttler-destiny-ii-2014',
      'sheth-charm-2024',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/hemicraniectomy. Synthesizes the four hemicraniectomy RCTs (DECIMAL, DESTINY, HAMLET 2007–2009 pooled per Vahedi 2007 + DESTINY-II 2014 for the >60 cohort) + AHA/ASA 2026 §6.3 (COR 1 LOE B-R for age ≤60; COR 2a LOE B-R individualized for age >60) + CHARM 2024 (negative IV glibenclamide adjunct for edema prevention, underpowered after COVID early-stop). ≤60-year mortality + mRS-≤3 benefit established; in the >60-year cohort survival benefit is real but concentrated at mRS 4–5, making the decision values-based.',
  },

  // ─── ICH surgery clinical synthesis ─────────────────────────────────────────
  'ich-surgery-synthesis': {
    id: 'ich-surgery-synthesis',
    citation_ids: [
      'aha-asa-2022-ich-surgery',
      'mendelow-stich-i-2005',
      'mendelow-stich-ii-2013',
      'hanley-mistie-iii-2019',
      'pradilla-enrich-2024',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/ich-surgery. Synthesizes the spontaneous-ICH surgical chain: STICH-I/II (negative for open craniotomy in supratentorial ICH), MISTIE-III (volume reduction without functional benefit), ENRICH 2024 (Bayesian primary met for early minimally invasive parafascicular surgery in 30–80 mL supratentorial ICH; posterior probability 0.981). Cerebellar ICH >3 cm with brainstem compression / hydrocephalus retains separate Class I surgical indication per 2022 AHA/ASA ICH §10. ENRICH is reported as Bayesian posterior per trial-statistics skill; no NNT.',
  },

  // ─── ICAS stenting clinical synthesis ───────────────────────────────────────
  'icas-stenting-synthesis': {
    id: 'icas-stenting-synthesis',
    citation_ids: [
      'aha-asa-2021-secondary-prevention-icas',
      'chimowitz-sammpris-2011',
      'derdeyn-sammpris-longterm-2014',
      'alexander-weave-2019',
      'gao-cassiss-2022',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/icas-stenting. Synthesizes the symptomatic-ICAS evidence chain: SAMMPRIS 2011 + long-term 2014 (Wingspan stenting causes net harm; aggressive medical management is the standard); WEAVE 2019 postmarket registry (lower periprocedural rates under restricted FDA labeling, but single-arm and cannot prove efficacy); CASSISS 2022 (contemporary periprocedural safety improvements but no superiority over modern medical management). Governing source = 2021 AHA/ASA SP §5.5 Intracranial Atherosclerosis.',
  },

  // ─── CRAO management clinical synthesis ─────────────────────────────────────

  'crao-management-synthesis': {
    id: 'crao-management-synthesis',
    citation_ids: [
      'preterre-theia-2025',
      'aao-2020-retinal-artery-occlusion',
      'schumacher-eagle-crao-2010',
    ],
    surfaces: [DATA_SURFACE],
    description: 'ClinicalSynthesisCard on /trials/q/crao-management. THEIA (Lancet Neurology 2025) was underpowered and did not establish IV alteplase efficacy in CRAO (primary not met, P=0.95). EAGLE (Ophthalmology 2010) closed the IA fibrinolysis question (negative + harm). AAO 2020 PPP and AAO/AAN messaging position CRAO as a TIA-equivalent: no proven acute therapy; pursue urgent stroke-pathway workup. Synthesis also surfaces the giant-cell-arteritis branch (ESR/CRP and empirical steroids if suspicion is meaningful).',
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
    // Repointed 2026-07-02 (audit item D) from the deleted duplicate
    // `brott-crest-2-2025` to the canonical `brott-crest-2-2026` (same
    // publication: NEJM 2026;394(3):219-231, PMID 41269206).
    citation_ids: ['brott-crest-2-2026'],
    surfaces: [DATA_SURFACE],
    description: 'CREST-2 trials: two parallel observer-blinded RCTs (155 sites, 5 countries) in patients with asymptomatic ≥70% extracranial carotid stenosis comparing revascularization plus intensive medical management vs intensive medical management alone. Stenting trial (N=1245): 4-year composite of periprocedural stroke/death plus postprocedural ipsilateral ischemic stroke was 6.0% medical-therapy vs 2.8% stenting (absolute risk reduction 3.2 pp, 95% CI 0.6 to 5.9, P=0.02; RR 2.13, 95% CI 1.15–4.39). Authors reported NNT 31 to prevent one primary-outcome event over 4 years. Endarterectomy trial (N=1240): 5.3% medical-therapy vs 3.7% endarterectomy (absolute difference 1.6 pp, 95% CI -1.1 to 4.3, P=0.24; RR 1.43, 95% CI 0.78–2.72); primary not met. Periprocedural stroke/death: 0/629 (medical, stenting trial) vs 8/616 (CAS, 1.3%); 3/623 (medical, endarterectomy trial) vs 9/617 (CEA, 1.5%). Intensive medical management protocol identical across all four arms: SBP <130 mm Hg, LDL <70 mg/dL with alirocumab access after 2018, antithrombotic therapy, lifestyle coaching. Operator certification required (interventionists submitted preceding 12 months CAS cases; surgeons submitted preceding 50 consecutive CEA cases with <3% periprocedural stroke/death). Limitations: high-volume credentialed operators may not generalize to community practice; modern medical-management drift during enrollment may attenuate any incremental revascularization benefit; transcarotid revascularization not incorporated. Trial defines the modern asymptomatic-carotid management paradigm and supersedes the 1990s/2000s ACAS and ACST evidence base in the post-PCSK9, SBP <130, statin-optimized era.',
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
  // ─── PFO closure precursor trials (2012–2018) — added 2026-05-23 ──────────
  //     Four trials framing the 2017 PFO cluster: CLOSURE-I (2012, STARFlex,
  //     negative), PC (2013, Amplatzer, negative), original RESPECT (2013,
  //     Amplatzer, ITT not met at 2.1y), DEFENSE-PFO (2018, high-risk
  //     anatomy, halted early for efficacy).
  'closure-i-pfo-2012': {
    id: 'closure-i-pfo-2012',
    citation_ids: ['furlan-closure-i-2012'],
    surfaces: [DATA_SURFACE],
    description: 'CLOSURE-I trial: in 909 patients ages 18–60 with cryptogenic stroke or TIA and PFO, transcatheter closure with the STARFlex Septal Closure System (NMT Medical) + 6 months clopidogrel + 2 years aspirin vs medical therapy alone over 2 years. Primary 2-year composite of stroke or TIA, 30-day all-cause death, or days 31–730 death from neurologic causes: 5.5% closure vs 6.8% medical; adjusted HR 0.78 (95% CI 0.45–1.35, P=0.37). Secondary stroke 2.9% vs 3.1% (P=0.79); TIA 3.1% vs 4.1% (P=0.44). Major vascular procedural complications 3.2% with closure; atrial fibrillation 5.7% vs 0.7% (P<0.001). First major PFO closure RCT; primary not met. Negative result widely attributed to device choice (STARFlex now withdrawn) and broad inclusion without morphology enrichment. With the PC trial (2013) and original RESPECT (2013), defined the pre-2017 ambiguity that CLOSE, REDUCE, and RESPECT long-term (2017) ultimately resolved.',
  },
  'pc-trial-pfo-2013': {
    id: 'pc-trial-pfo-2013',
    citation_ids: ['meier-pc-trial-2013'],
    surfaces: [DATA_SURFACE],
    description: 'PC trial: in 414 patients <60 with PFO and prior ischemic stroke, TIA, or peripheral thromboembolic event, percutaneous closure with the Amplatzer PFO Occluder vs medical therapy (antiplatelet or anticoagulant per investigator) over mean ~4 years. Primary composite of death, nonfatal stroke, TIA, or peripheral embolism: 3.4% closure (7/204) vs 5.2% medical (11/210); HR 0.63 (95% CI 0.24–1.62, P=0.34). Nonfatal stroke 0.5% vs 2.4% (HR 0.20, 95% CI 0.02–1.72, P=0.14). TIA 2.5% vs 3.3% (HR 0.71, P=0.56). Primary not met — underpowered: only 18 primary events accrued. Companion publication to original RESPECT in the same NEJM 2013 issue (March 21). With CLOSURE-I (2012) and original RESPECT (2013), defined the pre-2017 ambiguity.',
  },
  'respect-original-pfo-2013': {
    id: 'respect-original-pfo-2013',
    citation_ids: ['carroll-respect-original-2013'],
    surfaces: [DATA_SURFACE],
    description: 'Original RESPECT (2013 primary publication, distinct from saver-respect-2017 long-term extension): in 980 patients ages 18–60 with cryptogenic ischemic stroke and TEE-confirmed PFO, transcatheter closure with the Amplatzer PFO Occluder vs medical therapy (clinician-chosen aspirin, warfarin, clopidogrel, or aspirin + dipyridamole) at median 2.1-year follow-up. Primary endpoint (recurrent nonfatal ischemic stroke, fatal ischemic stroke, or early death after randomization), intention-to-treat: 9 events closure vs 16 events medical; HR 0.49 (95% CI 0.22–1.11, P=0.08) — ITT primary NOT MET. Per-protocol: 6 vs 14, HR 0.37 (95% CI 0.14–0.96, P=0.03). As-treated: 5 vs 16, HR 0.27 (95% CI 0.10–0.75, P=0.007). Serious adverse events 23.0% vs 21.6%; procedure-related serious events 4.2%; atrial fibrillation rate not increased per primary report. The borderline P=0.08 ITT result preserved equipoise and motivated extended follow-up; the 2017 long-term analysis (Saver JL et al., NEJM 2017;377:1022, citation saver-respect-2017) ultimately converted the result at median 5.9y (HR 0.55, P=0.046) and underwrote FDA approval of the Amplatzer PFO Occluder (October 2016).',
  },
  'defense-pfo-2018': {
    id: 'defense-pfo-2018',
    citation_ids: ['lee-defense-pfo-2018'],
    surfaces: [DATA_SURFACE],
    description: 'DEFENSE-PFO trial: in 120 Korean patients (mean age 51.8 years) with cryptogenic ischemic stroke and HIGH-RISK PFO anatomy (atrial septal aneurysm, septal hypermobility with phasic excursion ≥10 mm, or PFO size ≥2 mm), transcatheter PFO closure + antiplatelet/anticoagulant vs medication-only therapy. Primary 2-year composite of stroke, vascular death, or TIMI-defined major bleeding: 0/60 closure vs 6/60 medication-only (2-year event rate 12.9%, log-rank P=0.013). 2-year ischemic stroke rate 0% vs 10.5% (P=0.023). Medication-arm events: ischemic stroke (n=5), cerebral hemorrhage (n=1), TIMI major bleeding (n=2), TIA (n=1). Closure-arm nonfatal procedural complications: atrial fibrillation (n=2), pericardial effusion (n=1), pseudoaneurysm (n=1); all closures technically successful. Enrolled September 2011 to October 2017. Confirms the morphology-enrichment hypothesis from the 2017 cluster: in patients with high-risk PFO anatomy, closure is markedly superior to medical therapy alone. Small sample size (N=120) and Korean-only enrolment limit generalizability; results are concordant with the 2017 NEJM cluster.',
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
    citation_ids: ['baharoglu-patch-2016', 'aha-asa-2022-ich-anticoag-reversal'],
    surfaces: [DATA_SURFACE],
    description: 'PATCH trial: in adults with spontaneous supratentorial ICH on antiplatelet therapy presenting within 6 h, platelet transfusion within 90 min of imaging vs standard care increased the odds of death or dependence at 3 months on mRS (adjusted common OR 2.05, 95% CI 1.18-3.56, P=0.0114). Serious adverse events 42% vs 30%; death 24% vs 17%. The trial that established AHA/ASA 2022 Class III: Harm against routine platelet transfusion in antiplatelet-associated ICH. Open-label PROBE design with masked endpoint adjudication. Excluded patients with planned neurosurgical evacuation. ESO 2022 also strongly recommends against routine platelet transfusion. No subsequent RCT has been mounted to challenge the harm signal.',
  },
  'annexa-4-fxa-reversal-2019': {
    id: 'annexa-4-fxa-reversal-2019',
    citation_ids: ['connolly-annexa-4-2019', 'aha-asa-2022-ich-anticoag-reversal'],
    surfaces: [DATA_SURFACE],
    description: 'ANNEXA-4: single-arm, open-label prospective cohort study of andexanet alfa in 352 patients with acute major bleeding within 18 h of FXa-inhibitor dose (apixaban, rivaroxaban, edoxaban, enoxaparin). Bleeding was predominantly intracranial (64%). Anti-FXa activity fell 92% with andexanet for both apixaban (149.7 to 11.1 ng/mL, 95% CI 91-93%) and rivaroxaban (211.8 to 14.2 ng/mL, 95% CI 88-94%). Excellent or good hemostatic efficacy at 12 h in 204/249 (82%). 30-day mortality 14%; thrombotic events 10%. The cohort behind FDA accelerated approval (May 2018) and AHA/ASA 2022 Class IIa, Level B-NR for andexanet in FXa-inhibitor-associated ICH. Single-arm design cannot establish efficacy or attribute thrombotic events causally. Confirmed in randomized framework specifically in ICH by ANNEXA-I (Connolly NEJM 2024, PMID 38804514).',
  },
  'sarode-4fpcc-vka-reversal-2013': {
    id: 'sarode-4fpcc-vka-reversal-2013',
    citation_ids: ['sarode-4fpcc-2013', 'aha-asa-2022-ich-anticoag-reversal'],
    surfaces: [DATA_SURFACE],
    description: 'Sarode 2013: multicenter open-label noninferiority RCT (phase IIIb) of 4-factor PCC (Kcentra/Beriplex) vs fresh frozen plasma in 202 VKA-treated adults with acute major bleeding (GI 38%, intracranial ~14%, visible ~13%). Both arms received vitamin K 5-10 mg IV. Coprimary endpoints: 24-h hemostatic efficacy and INR <=1.3 at 0.5 h post-infusion. Hemostatic efficacy 72.4% (4F-PCC) vs 65.4% (FFP); difference +7.1 pp (95% CI -5.8 to +19.9) — noninferiority established (margin -10 pp). INR <=1.3 at 0.5 h: 62.2% vs 9.6%; difference +52.6 pp (95% CI 39.4-65.9) — superiority established. Mortality (5.1% vs 4.8%) and thromboembolic events (6.8% vs 6.4%) comparable; fluid overload less common with 4F-PCC (2.9% vs 11.9%); median infusion volume 99 mL vs 814 mL. Population was general VKA major bleeding, not ICH-specific. Underwrote FDA approval of Kcentra (April 2013) and AHA/ASA 2022 Class 1, Level B-R (§5.2.1) for 4F-PCC > FFP in VKA-associated ICH. ICH-specific confirmation comes from INCH (Steiner Lancet Neurol 2016) — halted early at interim for INR reversal favoring 4F-PCC.',
  },

  // ─── NIHSS portal drawer — severity-band clinical interpretation ──────────
  // Phase 7D.2 (2026-05-23). The NihssCalculator drawer renders 4 prose
  // paragraphs (Minor 1–4, Moderate 5–15, Moderate-to-severe 16–20, Severe
  // ≥21) sourced from AHA/ASA 2026 §4.6.1 (Thrombolysis Decision-Making) and
  // §4.7.2 (anterior-circulation EVT eligibility). The DAPT alternative
  // mentioned in the Minor paragraph is sourced from §4.8 (Antiplatelet
  // Treatment — DAPT for minor noncardioembolic AIS / high-risk TIA).
  // Surface = static JSX, tagged with data-claim="nihss-severity-interpretation-2026"
  // on the parent <div> inside DrawerContent in src/pages/NihssCalculator.tsx.
  // Severity bands match the existing nihssScoring thresholds (Adams 1999 +
  // Brott 1989); the calculator's getNihssSeverity function is the single
  // source of truth for the numeric cut-points.
  'nihss-severity-interpretation-2026': {
    id: 'nihss-severity-interpretation-2026',
    citation_ids: [
      'aha-asa-2026-4.6.1',
      'aha-asa-2026-4.7.2',
      'aha-asa-2026-4.8',
    ],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'NIHSS portal drawer severity-band clinical interpretation. Minor (1–4): IVT pivots on disabling vs non-disabling deficit per §4.6.1 COR 3 No Benefit for non-disabling; DAPT × 21d per §4.8 COR 1 LOE A. Moderate (5–15): disabling deficit; IVT within 4.5h indicated; NIHSS ≥6 + cortical signs triggers CTA head/neck for EVT triage (vascular imaging recommendation lives in AHA/ASA 2026 Section 3 Imaging, not §4.7.2 — a new aha-asa-2026-3.x citation is needed in registry.ts for this clause). Moderate-to-severe (16–20): typical proximal LVO range; expedite EVT pathway per §4.7.2; post-IVT BP ≤180/105. Severe (≥21): large-territory infarct risk; reassess ASPECTS, age, prestroke mRS before EVT; sICH risk elevated.',
  },

  // ─── 2026 ACC/AHA Dyslipidemia §4.2.6 — secondary prevention after stroke ────
  // Wave 1 (2026-05-24): SPARCL pearl + bedsidePearl surface on trialData.ts.
  // Wave 2 (2026-05-25): Post-Stroke Lipid Management Pathway JSX surfaces.
  'dyslipidemia-2026-stroke-ldlc-55': {
    id: 'dyslipidemia-2026-stroke-ldlc-55',
    citation_ids: ['acc-aha-dyslipidemia-2026-4.2.6-vhr'],
    surfaces: [DATA_SURFACE, BEDSIDE_PEARL_SURFACE, { type: 'jsx', attribute: 'data-claim' }],
    description: '2026 ACC/AHA §4.2.6 Rec #5 (COR 1, LOE A): in clinical ASCVD patients at very high risk on maximally tolerated statin, add ezetimibe and/or a PCSK9 mAb to achieve LDL-C <55 mg/dL (1.4 mmol/L) and non-HDL-C <85 mg/dL. Prior ischemic stroke qualifies as a major ASCVD event per Figure 10; VHR = ≥2 major events OR 1 major + ≥2 high-risk conditions.',
  },

  'dyslipidemia-2026-stroke-ldlc-70-not-vhr': {
    id: 'dyslipidemia-2026-stroke-ldlc-70-not-vhr',
    citation_ids: ['acc-aha-dyslipidemia-2026-4.2.6-not-vhr'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2026 ACC/AHA §4.2.6 Rec #1 (COR 1, LOE A): in clinical ASCVD not at very high risk, high-intensity statin to achieve ≥50% LDL-C reduction and goal <70 mg/dL (1.8 mmol/L) and non-HDL-C <100 mg/dL.',
  },

  'dyslipidemia-2026-pcsk9-escalation': {
    id: 'dyslipidemia-2026-pcsk9-escalation',
    citation_ids: ['acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2026 ACC/AHA §4.2.6 Synopsis: the 2026 guideline no longer requires ezetimibe to be added to statin therapy prior to initiating a PCSK9 mAb. Ezetimibe and PCSK9 mAbs are now co-equal add-on options after maximally tolerated statin.',
  },

  'dyslipidemia-2026-stroke-major-ascvd': {
    id: 'dyslipidemia-2026-stroke-major-ascvd',
    citation_ids: ['acc-aha-dyslipidemia-2026-fig10'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2026 ACC/AHA Figure 10: history of ischemic stroke is listed as a major ASCVD event. A patient with prior ischemic stroke has ≥1 major ASCVD event and therefore qualifies for the ASCVD secondary prevention pathway. VHR status requires ≥2 major ASCVD events OR 1 event + ≥2 high-risk conditions.',
  },

  'dyslipidemia-2026-bempedoic-vhr': {
    id: 'dyslipidemia-2026-bempedoic-vhr',
    citation_ids: ['acc-aha-dyslipidemia-2026-4.2.6-bempedoic-vhr'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2026 ACC/AHA §4.2.6 Rec #6 (COR 2a, LOE B-R): in VHR ASCVD on maximally tolerated statin, it is reasonable to add bempedoic acid (with or without ezetimibe and/or PCSK9 mAb) to reach LDL-C <55 mg/dL. Bempedoic acid is the final escalation step per Figure 11 (after PCSK9 mAb failure/intolerance). Does not cause myopathy; suitable for statin-intolerant patients.',
  },

  'dyslipidemia-2026-inclisiran-vhr': {
    id: 'dyslipidemia-2026-inclisiran-vhr',
    citation_ids: ['acc-aha-dyslipidemia-2026-4.2.6-inclisiran'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2026 ACC/AHA §4.2.6 Rec #7 (COR 2a, LOE B-R): in VHR ASCVD on maximally tolerated statin ± ezetimibe, inclisiran is reasonable for those unable to tolerate evolocumab/alirocumab or preferring twice-yearly dosing. IMPORTANT: inclisiran has no completed cardiovascular outcomes trial; it is considered second-line PCSK9i after evolocumab/alirocumab.',
  },

  'dyslipidemia-2026-ich-statin-uncertain': {
    id: 'dyslipidemia-2026-ich-statin-uncertain',
    citation_ids: ['aha-asa-ich-2022-statin', 'teoh-2019-statin-stroke-ich'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2022 AHA/ASA ICH Guideline (COR 2b, LOE B-NR): in patients with spontaneous ICH and an established statin indication, the risks and benefits are uncertain. Teoh 2019 meta-analysis (17 RCTs, n=11,576): statins in stroke survivors increased ICH risk (RR 1.42, 95% CI 1.07–1.87). Decisions should be individualised to ICH aetiology (lobar/CAA = higher recurrence risk) and strength of cardiovascular indication.',
  },

  'ascvd-pce-formula-2013': {
    id: 'ascvd-pce-formula-2013',
    citation_ids: ['goff-2014-pce-pooled-cohort-equations'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Pooled Cohort Equations (Goff 2014) estimate 10-year ASCVD risk in adults 40-79 without prior clinical ASCVD using sex- and race-specific coefficients for ln(age), ln(total cholesterol), ln(HDL-C), ln(SBP) with separate coefficients for treated vs untreated BP, current smoking, and diabetes. Formula: risk = 1 - S₀^exp(Σ(β·x) - mean).',
  },
  'ascvd-risk-tiers-2019': {
    id: 'ascvd-risk-tiers-2019',
    citation_ids: ['arnett-2019-prevention-risk-tiers'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: '2019 ACC/AHA Primary Prevention Guideline risk tiers: low <5%, borderline 5-7.5%, intermediate 7.5-20%, high ≥20%. Statin recommended at intermediate or high risk (COR 1, LOE A). PCE does not apply to patients with established ASCVD.',
  },

  'theia-crao-alteplase-2025': {
    id: 'theia-crao-alteplase-2025',
    citation_ids: ['preterre-theia-2025', 'mac-grory-aha-nanos-crao-2021'],
    surfaces: [DATA_SURFACE],
    description: 'THEIA trial: first phase 3 randomised controlled trial of intravenous alteplase 0.9 mg/kg vs oral aspirin 300 mg for acute non-arteritic central retinal artery occlusion (CRAO) within 4.5 hours of severe monocular vision loss (Snellen <20/400). N=70 randomised (35 per arm) across 16 French stroke units, June 2018–October 2023. Double-dummy patient- and assessor-blinded; treating staff open-label. Primary endpoint of visual acuity improvement of at least 0.3 LogMAR at 1 month: 19/29 (66%) alteplase vs 13/27 (48%) aspirin; unadjusted risk difference +17.4 pp (95% CI -11.8 to +46.5); adjusted OR 1.10 (95% CI 0.07–18.39); p=0.95. Trial explicitly underpowered: sized for a 30 pp difference (40% alteplase vs assumed 10% aspirin); observed aspirin response was 48%, making the real difference too small to detect at N=70. Safety strongly reassuring: zero symptomatic intracranial haemorrhages and zero major extracranial bleeds related to study treatment in either arm; one asymptomatic 15 mm parietal haematoma incidentally detected on day 1 CT in the alteplase arm. Functional reading vision (≤0.5 LogMAR / Snellen 20/63) achieved in only 14% alteplase vs 7% aspirin patients — low durable recovery in both arms consistent with the hypothesis that retinal ischaemic tolerance may be much shorter than 4.5h (potentially as little as 15 minutes for complete CRAO per Tobalem 2018). Mean onset-to-treatment 232 min; only 11% treated within 3.0h. Aspirin chosen as comparator (not placebo) because at least one-third of CRAO patients have concomitant cerebral ischaemia on DWI MRI. Conducted in French stroke units with mature ophthalmology-stroke integration; ophthalmologist-confirmed CRAO diagnosis required. Trial does not change the existing AHA / NANOS 2021 Scientific Statement on CRAO management (Mac Grory et al., Stroke 2021;52:e282-e294) which suggests IV alteplase "may be considered" for patients with disabling visual deficits meeting criteria. THEIA fails to demonstrate but does not refute efficacy; the planned individual-patient-data meta-analysis combining THEIA + TenCRAOS (NCT04526951) + REVISION (NCT04965038), both still recruiting at the time of THEIA publication, is the path to level 1 evidence. The predecessor CRAO trial EAGLE (Schumacher 2010) tested intra-arterial fibrinolysis with windows up to 20 hours and showed no efficacy with 37% adverse events — THEIA tests a fundamentally different intervention (IV vs IA) within a much earlier and narrower window with substantially better safety. Clinical implications: CRAO belongs in the stroke pathway (triage to ED, stroke code activation, funduscopy, GCA screening, brain imaging, ophthalmology co-management); IV alteplase 0.9 mg/kg within 4.5h is safe; aspirin should not be withheld; secondary-prevention workup follows the standard ischaemic stroke pathway because CRAO is a marker of systemic cerebrovascular and cardiovascular disease.',
  },

  // ─── Headache / Migraine claims ────────────────────────────────────────────

  'migraine-sonb-level-b': {
    id: 'migraine-sonb-level-b',
    citation_ids: ['robblee-ahs-2025'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Supraorbital nerve block (SONB) is Level B (Should Offer) for acute migraine in the ED per AHS 2025 consensus statement. Technique: inject 1–2 mL local anaesthetic (0.5% bupivacaine or 1% lidocaine) at the supraorbital notch bilaterally.',
  },

  'migraine-opioid-must-not-offer': {
    id: 'migraine-opioid-must-not-offer',
    citation_ids: ['robblee-ahs-2025'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Opioids (including hydromorphone) and tramadol are Level A Must NOT Offer for acute migraine treatment per AHS 2025 consensus. Opioids worsen headache chronification, increase MOH risk, and have inferior efficacy vs dopamine antagonists. Not indicated as first- or second-line ED migraine treatment.',
  },

  'migraine-dex-recurrence-level-b-pain-level-c': {
    id: 'migraine-dex-recurrence-level-b-pain-level-c',
    citation_ids: ['robblee-ahs-2025'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Dexamethasone for acute migraine: Level B (Should Offer) for recurrence prevention (reduces 24–72h headache recurrence by ~25–30%), but only Level C (May Offer) for acute pain reduction. Add-on to primary treatment; not used as monotherapy. Dose: 10 mg IV for recurrence prevention.',
  },

  'migraine-magnesium-level-u-aura': {
    id: 'migraine-magnesium-level-u-aura',
    citation_ids: ['robblee-ahs-2025'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'IV magnesium sulfate for acute migraine is Level U (Insufficient Evidence) per AHS 2025. Sub-group evidence suggests possible benefit in migraine with aura and photophobia. Dose: 1–2 g IV over 15 min. Not recommended as routine first-line; may be offered when aura is present or prominent photophobia.',
  },

  'clinic-headache-preventive-threshold': {
    id: 'clinic-headache-preventive-threshold',
    citation_ids: ['ailani-ahs-2021', 'lipton-2024-continuum-preventive'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Preventive migraine therapy threshold (AHS 2021 + Lipton 2024 Continuum): ≥4 migraine days/month with significant disability (MIDAS Grade II–IV) OR ≥6 migraine days/month regardless of disability OR acute medication use ≥10 days/month (MOH risk). Meeting any single criterion qualifies for preventive therapy discussion.',
  },

  'clinic-headache-cgrp-escalation': {
    id: 'clinic-headache-cgrp-escalation',
    citation_ids: ['ailani-ahs-2021'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'CGRP mAb escalation per AHS 2021 Consensus: indicated after failure of ≥2 adequate trials of conventional preventive agents (each ≥2 months at therapeutic dose). CGRP mAbs are also reasonable first-line when conventional agents are contraindicated or poorly tolerated. Options: erenumab 70–140 mg SC monthly, fremanezumab 225 mg SC monthly or 675 mg SC quarterly, galcanezumab 240 mg SC loading then 120 mg SC monthly, eptinezumab 100–300 mg IV quarterly.',
  },

  'clinic-headache-moh-gepant-safe': {
    id: 'clinic-headache-moh-gepant-safe',
    citation_ids: ['lipton-rimegepant-acute-2019', 'dodick-ubrogepant-acute-2019', 'ailani-atogepant-advance-2021', 'ailani-ahs-2021', 'rizzoli-2024-continuum-moh'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Gepants (ubrogepant, rimegepant, atogepant) do not cause medication-overuse headache (MOH) — primary evidence: Lipton NEJM 2019 (rimegepant ACHIEVE-I), Dodick NEJM 2019 (ubrogepant ACHIEVE-I), Ailani NEJM 2021 (atogepant ADVANCE; oral preventive without MOH signal). AHS 2021 Consensus Statement codifies "gepants do not cause MOH" as policy. Gepants are preferred acute and preventive agents in patients with established MOH or high MOH risk (acute use ≥10 days/month). Unlike triptans (MOH threshold ≥10 days/month) and NSAIDs (≥15 days/month), no MOH threshold has been established for gepants. Rizzoli Continuum 2024 retained as secondary review.',
  },

  // ─── ICHD-3 phenotype classifier — Clinic Headache Pathway ────────────────
  // Six diagnostic-criteria claims, one per phenotype displayed by the
  // classifier result card. Surface: static JSX with data-claim attribute
  // on each per-phenotype criteria checklist. All anchor to ichd3-2018.

  'clinic-headache-ichd3-migraine-criteria': {
    id: 'clinic-headache-ichd3-migraine-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 1.1 Migraine without aura (Cephalalgia 2018;38:1-211, PMID 29368949): ≥5 attacks; 4-72 h duration; ≥2 of (unilateral / pulsating / moderate-severe / aggravated by activity); plus nausea/vomiting OR photophobia+phonophobia. ICHD-3 1.2 Migraine with aura adds ≥2 attacks with fully reversible aura (visual, sensory, speech, motor, brainstem, or retinal) spreading gradually over ≥5 min, lasting 5-60 min, followed by headache within 60 min.',
  },

  'clinic-headache-ichd3-cluster-criteria': {
    id: 'clinic-headache-ichd3-cluster-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 3.1 Cluster headache: ≥5 attacks of severe/very severe unilateral orbital/supraorbital/temporal pain lasting 15-180 min untreated; with ipsilateral cranial autonomic features (conjunctival injection, lacrimation, nasal congestion, rhinorrhoea, eyelid oedema, forehead/facial sweating, miosis, ptosis) AND/OR restlessness or agitation. Attack frequency 1 every other day to 8/day during active bouts.',
  },

  'clinic-headache-ichd3-hemicrania-criteria': {
    id: 'clinic-headache-ichd3-hemicrania-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 3.4 Hemicrania continua: continuous strictly unilateral headache present >3 months with exacerbations of moderate or greater intensity; ipsilateral cranial autonomic features AND/OR restlessness/aggravation by movement; ABSOLUTE response to therapeutic-dose indomethacin is required for diagnosis. Indomethacin non-response rules out HC.',
  },

  'clinic-headache-ichd3-tension-criteria': {
    id: 'clinic-headache-ichd3-tension-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // Description updated 2026-05-25 per clinical-reviewer §17.2 Condition 6:
    // verbatim §2.3 D is "Both of the following: 1) no more than one of photophobia,
    // phonophobia or mild nausea; 2) neither moderate or severe nausea nor vomiting."
    description: 'ICHD-3 2.2 Frequent episodic TTH: 1-14 headache days/month for >3 months; 30 min-7 days duration; ≥2 of (bilateral / pressing-tightening / mild-moderate / NOT aggravated by routine activity); no nausea or vomiting; ≤1 of photophobia or phonophobia. ICHD-3 2.3 Chronic TTH: ≥15 days/month for >3 months with the same B-D features, but with §2.3 D verbatim: (1) no more than ONE of photophobia, phonophobia, OR mild nausea (combined ≤1 pool); (2) neither moderate or severe nausea nor vomiting.',
  },

  'clinic-headache-ichd3-ndph-criteria': {
    id: 'clinic-headache-ichd3-ndph-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // Section relabel 2026-05-25: ICHD-3 places NDPH at §4.10 (Other primary
    // headache disorders), NOT §3.3 (which is SUNCT/SUNA). Claim ID kept stable;
    // surface text updated to reflect the correct ICHD-3 chapter.
    description: 'ICHD-3 4.10 New daily persistent headache (NDPH): distinct and clearly-remembered onset of headache becoming continuous and unremitting within 24 h; present >3 months; not better accounted for by another ICHD-3 diagnosis. The defining feature is the patient pinpointing the moment the headache began and it never resolving since.',
  },

  'clinic-headache-ichd3-primary-stabbing-criteria': {
    id: 'clinic-headache-ichd3-primary-stabbing-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 §4.7 added 2026-07-06 (evidence packet 2026-07-06-ichd3-4-7-primary-stabbing.md).
    description: 'ICHD-3 4.7 Primary stabbing headache: spontaneous single stab or series of stabs; each stab lasts up to a few seconds (80% are 3 seconds or less); recurring irregularly from one to many per day; NO cranial autonomic symptoms (their presence steers to 3.3 SUNCT/SUNA); not better accounted for by another ICHD-3 diagnosis. §4.7.1 Probable = two only of the three characteristic criteria (seconds duration / irregular one-to-many per day / no autonomic).',
  },

  'clinic-headache-ichd3-status-migrainosus-criteria': {
    id: 'clinic-headache-ichd3-status-migrainosus-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 §1.4.1 added 2026-07-06 (evidence packet 2026-07-06-ichd3-1-4-1-status-migrainosus.md).
    description: 'ICHD-3 1.4.1 Status migrainosus: a debilitating migraine attack lasting more than 72 hours in a patient with established 1.1/1.2 migraine, typical of previous attacks except for its duration and severity; remissions of up to 12 h (medication or sleep) allowed; milder (non-debilitating) cases are coded 1.5.1 Probable migraine without aura; if 8.2 Medication-overuse headache criteria are met, code MOH plus the migraine type instead of 1.4.1.',
  },

  'clinic-headache-ichd3-trigeminal-neuralgia-criteria': {
    id: 'clinic-headache-ichd3-trigeminal-neuralgia-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 §13.1.1 added 2026-07-06 (evidence packet 2026-07-06-ichd3-13-1-trigeminal-neuralgia.md).
    description: 'ICHD-3 13.1.1 Trigeminal neuralgia: recurrent brief (a fraction of a second to 2 minutes), severe, electric-shock-like / shooting / stabbing / sharp unilateral facial pain in one or more trigeminal divisions, precipitated by innocuous stimuli. Aetiology (13.1.1.1 classical neurovascular compression / 13.1.1.2 secondary / 13.1.1.3 idiopathic) is imaging-determined. Secondary-TN red flags (sensory deficit, bilateral pain, onset before age 40, poor drug response) warrant MRI plus referral. Carbamazepine response is clinically supportive but not an ICHD-3 diagnostic criterion.',
  },

  'clinic-headache-ichd3-occipital-neuralgia-criteria': {
    id: 'clinic-headache-ichd3-occipital-neuralgia-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 §13.4 added 2026-07-06 (evidence packet 2026-07-06-ichd3-13-4-occipital-neuralgia.md).
    description: 'ICHD-3 13.4 Occipital neuralgia: unilateral or bilateral paroxysmal shooting/stabbing pain in the greater, lesser, and/or third occipital nerve distribution (posterior scalp); at least 2 of (seconds-to-minutes paroxysms, severe intensity, shooting/stabbing/sharp quality); associated with both scalp dysaesthesia/allodynia AND nerve tenderness or a C2 trigger point; temporarily relieved by a local anaesthetic nerve block (mandatory criterion D). Must be distinguished from atlantoaxial / upper-cervical zygapophyseal joint referral and cervical myofascial trigger points.',
  },

  'clinic-headache-ichd3-hypnic-criteria': {
    id: 'clinic-headache-ichd3-hypnic-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 §4.9 added 2026-07-06 (evidence packet 2026-07-06-ichd3-4-9-hypnic-headache.md).
    description: 'ICHD-3 4.9 Hypnic headache ("alarm-clock" headache): recurrent attacks developing ONLY during sleep and causing wakening, on 10 or more days/month for >3 months, lasting 15 minutes up to 4 hours after waking, with NO cranial autonomic symptoms or restlessness (their presence steers to 3 Trigeminal autonomic cephalalgias, especially 3.1 Cluster). Usually begins after age 50 and is often bilateral. §4.9.1 Probable = two only of the three characteristic criteria (>=10 d/mo for >3 mo / 15 min-4 h duration / no autonomic-restlessness). Rule out sleep apnoea, nocturnal hypertension, hypoglycaemia, medication overuse, and intracranial disorders; lithium/caffeine/melatonin/indomethacin are treatments, not criteria.',
  },

  'clinic-headache-ichd3-aura-subtypes': {
    id: 'clinic-headache-ichd3-aura-subtypes',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 migraine-with-aura subtypes (ADR-2026-07-06 Stage 3) added 2026-07-06.
    description: 'ICHD-3 migraine-with-aura subtypes: 1.2.1 typical aura (visual/sensory/speech, fully reversible, no motor/brainstem/retinal); 1.2.2 brainstem aura (at least two brainstem symptoms, no motor or retinal); 1.2.3 hemiplegic migraine (fully reversible motor weakness; exclude stroke or structural cause and refer for genetic evaluation, familial hemiplegic migraine); 1.2.4 retinal migraine (repeated monocular visual disturbance; exclude other causes of transient monocular visual loss such as amaurosis fugax or retinal artery occlusion).',
  },

  'clinic-headache-ichd3-moh': {
    id: 'clinic-headache-ichd3-moh',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 §8.2 Medication-overuse headache overlay (ADR-2026-07-06 Stage 4) added 2026-07-08.
    description: 'ICHD-3 8.2 Medication-overuse headache: headache on 15 or more days/month in a patient with a pre-existing headache disorder, with regular overuse for over 3 months of an acute headache drug — simple analgesics on 15 or more days/month, or triptans, ergots, opioids, combination analgesics, or multiple drug classes on 10 or more days/month. Coded ALONGSIDE the primary headache type. It is a reversible complication (plan medication withdrawal plus preventive initiation), not a secondary-cause danger workup.',
  },

  'clinic-headache-redflag-workup': {
    id: 'clinic-headache-redflag-workup',
    citation_ids: ['do-snnoop10-2019'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // B-4: red-flag → suspect → first-test mapping (evidence packet
    // docs/evidence-packets/2026-07-06-headache-redflag-safety-b1-b4.md).
    description: 'SNNOOP10 red-flag to must-not-miss suspect to first investigation (Do 2019): thunderclap to SAH/RCVS to non-contrast CT (plus CTA/LP if non-diagnostic); new headache after 50 with GCA features to giant cell arteritis to ESR/CRP + temporal artery biopsy (the over-50 threshold follows GCA epidemiology; SNNOOP10 itself lists over 65); papilloedema or recumbent-worse to raised ICP (mass, IIH, CVST) to MRI + MRV; upright-worse (orthostatic) to spontaneous intracranial hypotension to MRI with and without gadolinium (plus CT myelography); fever + neck stiffness or immunocompromise to meningitis / opportunistic infection to LP (imaging first if immunocompromised or focal deficit); posttraumatic to intracranial haemorrhage to non-contrast CT; painful eye with autonomic features to acute angle-closure glaucoma to intraocular pressure / ophthalmology; medication overuse to medication-overuse headache (reversible, not a danger work-up).',
  },

  'clinic-headache-ichd3-tn-subtypes': {
    id: 'clinic-headache-ichd3-tn-subtypes',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 trigeminal-neuralgia aetiology subtypes (ADR-2026-07-06 Stage 3b) added 2026-07-06.
    description: 'ICHD-3 trigeminal neuralgia aetiology subtypes (imaging-determined): 13.1.1.1 classical (neurovascular compression WITH morphological change of the nerve root); 13.1.1.2 secondary (an underlying disease demonstrated: MS, cerebellopontine-angle tumour, or AVM; confirm and manage the cause, specialist referral); 13.1.1.3 idiopathic (adequate MRI and electrophysiology with no significant abnormality; a vessel-nerve contact without morphological change is still idiopathic).',
  },

  'clinic-headache-ichd3-tac-subtypes': {
    id: 'clinic-headache-ichd3-tac-subtypes',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    // ICHD-3 TAC/cluster subtypes (ADR-2026-07-06 subtype pass) added 2026-07-06.
    description: 'ICHD-3 TAC/cluster subtypes: 3.3.1 SUNCT (SUNCT/SUNA with BOTH conjunctival injection AND lacrimation) vs 3.3.2 SUNA (one or neither of those, with other cranial autonomic features); 3.1.1 Episodic cluster headache (bouts separated by pain-free remissions of 3 months or more) vs 3.1.2 Chronic cluster headache (attacks for 1 year or more without remission, or remissions shorter than 3 months).',
  },

  'clinic-headache-tension-acute-management': {
    id: 'clinic-headache-tension-acute-management',
    citation_ids: ['bendtsen-efns-tth-2010', 'scher-tth-2024-continuum'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'TTH acute management (EFNS task force, Bendtsen Eur J Neurol 2010): ibuprofen 400-600 mg PO first-line; aspirin 500-1000 mg PO alternative; acetaminophen 1000 mg PO preferred in pregnancy or NSAID contraindication. Avoid opioids and butalbital combinations (MOH and dependence risk per EFNS). Limit acute medication to ≤10 days/month for triptans/opioids and ≤15 days/month for simple analgesics to avoid medication-overuse headache. Scher Continuum 2024 retained as secondary review.',
  },

  'clinic-headache-tension-preventive': {
    id: 'clinic-headache-tension-preventive',
    citation_ids: ['bendtsen-amitriptyline-tth-1996', 'bendtsen-efns-tth-2010', 'ailani-ahs-2021', 'scher-tth-2024-continuum'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'TTH preventive management — primary evidence: Bendtsen Jensen Olesen JNNP 1996 (amitriptyline RCT in chronic TTH) + EFNS task-force guideline (Bendtsen Eur J Neurol 2010). Preventive indicated for chronic TTH (≥15 days/month) or high-frequency episodic TTH with functional impact. First-line: amitriptyline 10-75 mg at bedtime (Bendtsen 1996; EFNS class A). Second-line: venlafaxine 75-150 mg/day if depression/anxiety comorbid; mirtazapine 15-30 mg at bedtime for sleep + anxiety (EFNS class B). Third-line: topiramate (less evidence for TTH than migraine). Combined non-pharmacologic approach (stress management + biofeedback + physical therapy) has Level A evidence and should be offered alongside pharmacotherapy. Beta-blockers have insufficient evidence specifically for TTH. AHS 2021 + Scher Continuum 2024 retained as secondary policy + review references.',
  },

  // ─── Pitfall: migraine vs TTH overlap discriminator ────────────────────────
  // Surfaced in MapperPanel when both migraine and TTH return non-partial
  // matches. Wording is a paraphrase of ICHD-3 1.1 D vs 2.2 D criteria text.
  'clinic-headache-pitfall-mig-vs-tth': {
    id: 'clinic-headache-pitfall-mig-vs-tth',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Migraine 1.1 D requires nausea or vomiting, or the photophobia+phonophobia pair. TTH 2.2 D excludes nausea and vomiting and allows at most one of photophobia or phonophobia. Patients commonly carry both phenotypes per ICHD-3 General Principles, treated as separate diagnoses.',
  },

  // ─── Cluster + HC management surfaces (clinical-reviewer §17.2 condition 2) ──
  'clinic-headache-cluster-acute-management': {
    id: 'clinic-headache-cluster-acute-management',
    citation_ids: ['sumatriptan-cluster-1991', 'cohen-oxygen-cluster-2009', 'burish-2024-continuum-cluster'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Cluster headache acute treatment — primary evidence: Sumatriptan Cluster Headache Study Group NEJM 1991 (SC sumatriptan, pain-free 15 min 46% vs 10% placebo) + Cohen JAMA 2009 (high-flow O₂ pain-free 15 min 78% vs 20% placebo). Standard protocol: high-flow O₂ 100% 12-15 L/min via non-rebreather × 15-20 min; sumatriptan 6 mg SC or 20 mg nasal. Greater occipital nerve block with corticosteroid is effective bridging therapy at bout onset; prednisone 100 mg/day × 5 days then taper as transitional therapy. Burish Continuum 2024 retained as secondary review.',
  },
  'clinic-headache-cluster-preventive': {
    id: 'clinic-headache-cluster-preventive',
    citation_ids: ['bussone-lithium-verapamil-cluster-1990', 'leone-verapamil-cluster-2000', 'burish-2024-continuum-cluster'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Cluster headache preventive treatment — primary evidence: Leone Neurology 2000 (verapamil placebo-controlled RCT, significant reduction in attack frequency and abortive consumption) + Bussone Headache 1990 (lithium vs verapamil head-to-head; both effective, verapamil fewer side effects). Standard protocol: verapamil 80 mg TID first-line, titrate to 360 mg/day with baseline ECG and recheck after each dose change for PR prolongation. Lithium 300 mg BID-TID second-line; serum-level monitoring required. Topiramate 100-200 mg/day third-line; avoid in WOCBP without contraception. Burish Continuum 2024 retained as secondary review.',
  },
  'clinic-headache-hc-indomethacin-protocol': {
    id: 'clinic-headache-hc-indomethacin-protocol',
    citation_ids: ['newman-hc-indomethacin-1994', 'antonaci-indotest-1998', 'goadsby-2024-continuum-indomethacin'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Hemicrania continua indomethacin protocol — primary evidence: Newman Lipton Solomon Neurology 1994 (HC case series; "all forms are characterized by a dramatic and selective response to indomethacin") + Antonaci Headache 1998 (parenteral indomethacin "indotest" diagnostic protocol). Standard titration: indomethacin 25 mg TID week 1; titrate to 50 mg TID (150 mg/day) week 2 if incomplete response; max 150 mg/day per Goadsby Continuum 2024 quoted text. PPI co-prescription mandatory for GI protection. Complete response within 1-2 weeks confirms the hemicrania continua phenotype; maintain at lowest effective dose. Indomethacin non-response rules out 3.4 HC. Goadsby Continuum 2024 retained as secondary review.',
  },

  // ─── ICHD-3 §1.3 Chronic migraine — added 2026-05-25 per medsci audit ────
  'clinic-headache-ichd3-chronic-migraine-criteria': {
    id: 'clinic-headache-ichd3-chronic-migraine-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 1.3 Chronic migraine: headache (TTH-like and/or migraine-like) on ≥15 days/month for >3 months (A), in a patient with ≥5 prior attacks fulfilling 1.1 or 1.2 criteria (B), on ≥8 days/month fulfilling C.1 migraine criteria C and D, C.2 migraine-with-aura criteria B and C, or C.3 believed by the patient to be migraine at onset and relieved by a triptan or ergot derivative (C). §2.3 Note 1: code 1.3 in preference to 2.3 Chronic TTH when both criteria sets are met.',
  },
  'clinic-headache-chronic-migraine-acute': {
    id: 'clinic-headache-chronic-migraine-acute',
    citation_ids: ['lipton-rimegepant-acute-2019', 'dodick-ubrogepant-acute-2019', 'burch-2024-continuum-acute', 'rizzoli-2024-continuum-moh'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Chronic migraine acute treatment — primary evidence: Lipton NEJM 2019 (rimegepant ACHIEVE-I, pain-free 2h 19.6% vs 12.0% placebo) + Dodick NEJM 2019 (ubrogepant ACHIEVE-I, oral acute therapy without MOH risk). Stepwise framework: NSAIDs and triptans first-line; gepants (rimegepant, ubrogepant) and ditans (lasmiditan) for triptan contraindications or MOH risk. Gepants do not cause MOH per the ACHIEVE program data and are preferred in chronic patients with high acute-medication days. Burch + Rizzoli Continuum 2024 retained as secondary reviews.',
  },
  'clinic-headache-chronic-migraine-preventive': {
    id: 'clinic-headache-chronic-migraine-preventive',
    citation_ids: ['aurora-preempt-1-2010', 'diener-preempt-2-2010', 'dodick-preempt-pooled-2010', 'tepper-erenumab-chronic-2017', 'silberstein-fremanezumab-halo-cm-2017', 'mulleners-conquer-galcanezumab-2020', 'lipton-promise2-eptinezumab-2020', 'silberstein-aan-ahs-migraine-prevention-2012', 'ailani-ahs-2021', 'lipton-2024-continuum-preventive'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Chronic migraine preventive treatment — primary evidence: PREEMPT 1+2 (Aurora + Diener Cephalalgia 2010, pooled Dodick Headache 2010) for onabotulinumtoxinA — FDA chronic-migraine indication anchor. CGRP mAbs each have a chronic-migraine pivotal trial: erenumab (Tepper Lancet Neurol 2017), fremanezumab (Silberstein HALO-CM NEJM 2017), galcanezumab in 2-4-failure migraine (Mulleners CONQUER Lancet Neurol 2020), eptinezumab (Lipton PROMISE-2 Neurology 2020). AHS 2021 + AAN-AHS 2012 (Silberstein/Holland; episodic migraine prevention guideline — applies to the shared oral preventive ladder: topiramate, valproate avoiding WOCBP, propranolol/metoprolol, amitriptyline, venlafaxine). Lipton Continuum 2024 retained as secondary review. CAVEAT: PREEMPT 1 did not meet its primary endpoint; FDA indication rests on the pooled PREEMPT 1+2 analysis.',
  },

  // ─── ICHD-3 §3.2 Paroxysmal hemicrania — added 2026-05-25 ────────────────
  'clinic-headache-ichd3-paroxysmal-criteria': {
    id: 'clinic-headache-ichd3-paroxysmal-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 3.2 Paroxysmal hemicrania: ≥20 attacks (A); severe unilateral orbital/supraorbital/temporal pain lasting 2-30 min (B); either or both ipsilateral cranial autonomic symptoms OR restlessness/agitation (C); >5 attacks/day for more than half the time when active (D); prevented absolutely by therapeutic-dose indomethacin (E, definitional).',
  },
  'clinic-headache-ph-indomethacin-protocol': {
    id: 'clinic-headache-ph-indomethacin-protocol',
    citation_ids: ['antonaci-indotest-1998', 'goadsby-2024-continuum-indomethacin'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Paroxysmal hemicrania indomethacin protocol — primary evidence: Antonaci Headache 1998 (parenteral indomethacin "indotest" diagnostic protocol; 50 mg IM gives clear-cut diagnostic answer). Standard titration: indomethacin 25 mg TID, titrate to 75-150 mg/day per ICHD-3 §3.2 E. PPI co-prescription mandatory for GI protection. Complete response within 1-2 weeks confirms the paroxysmal hemicrania phenotype; maintain at lowest effective dose. Indomethacin non-response rules out 3.2 PH. Goadsby Continuum 2024 retained as secondary review (quoted_text covers both PH and HC).',
  },

  // ─── ICHD-3 §3.3 SUNCT/SUNA — added 2026-05-25 ───────────────────────────
  'clinic-headache-ichd3-sunct-criteria': {
    id: 'clinic-headache-ichd3-sunct-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 3.3 Short-lasting unilateral neuralgiform headache attacks: ≥20 attacks (A); moderate or severe unilateral trigeminal-distribution pain lasting 1-600 seconds (B); ≥1 ipsilateral cranial autonomic symptom (C); attack frequency ≥1/day for more than half the time when active (D). Subtypes 3.3.1 SUNCT (both conjunctival injection + lacrimation) and 3.3.2 SUNA (one or neither) are deferred from this Phase 1 implementation.',
  },
  'clinic-headache-sunct-lamotrigine': {
    id: 'clinic-headache-sunct-lamotrigine',
    citation_ids: ['dandrea-lamotrigine-sunct-2001', 'cohen-sunct-suna-2006', 'burish-2024-continuum-cluster'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'SUNCT/SUNA preventive treatment — primary evidence: D\'Andrea Neurology 2001 (lamotrigine 125-200 mg/day; complete remission in 3 of 5 + ~80% reduction in remaining 2; no adverse effects). Cohen Brain 2006 prospective cohort (n=52) confirms lamotrigine as most consistently effective preventive in the cohort. Standard protocol: lamotrigine first-line, titrate slowly to avoid rash. Carbamazepine is second-line. Refer to a headache specialist; very-short-attack TACs are uncommon and often misdiagnosed as trigeminal neuralgia. Burish Continuum 2024 retained as secondary review.',
  },

  // ─── Partial-match management caveat — Clinic Headache Pathway ─────────────
  // Surface: static JSX with data-claim attribute at the top of the management
  // body on `partial`-strength match rows only (the opt-in "Show management"
  // expander). Guards against anchoring on a weakly-matched phenotype: states
  // ICHD-3 criteria are not yet met, directs diagnosis confirmation before
  // initiating treatment, and frames the displayed dosing as reference-only.
  // Anchored to ichd3-2018 — the ICHD-3 source the phenotype criteria come from.
  // Authored + confirmed by medical-scientist; clinical-reviewer gate 2026-06-05.
  'clinic-headache-partial-match-caveat': {
    id: 'clinic-headache-partial-match-caveat',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Partial-match safety caveat rendered at the top of the management body on partial-strength ICHD-3 phenotype rows in the Clinic Headache Pathway: "Partial match: confirm the diagnosis before initiating. Criteria are not yet met for this phenotype; dosing is shown for reference." Anti-anchoring guard for the opt-in Show-management expander. The displayed treatment/dosing is reference-only because the ICHD-3 diagnostic criteria for the phenotype are not fully satisfied. Anchored to ICHD-3 (2018) as the source defining the diagnostic criteria that are not yet met.',
  },

  // ─── mRS Calculator — added 2026-05-27 ────────────────────────────────────

  'mrs-grade-definitions': {
    id: 'mrs-grade-definitions',
    citation_ids: ['van-swieten-mrs-1988', 'wilson-mrs-structured-interview-2002'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'mRS 0–6 grade definitions as displayed in the scale-reference section of the mRS calculator drawer. Grade text matches van Swieten 1988 (the standard modification). Wilson 2002 structured-interview is cited as the source of the guided-interview logic. Grade 6 (dead) is the commonly accepted extension of the 0–5 scale.',
  },

  'mrs-prestroke-evt-eligibility': {
    id: 'mrs-prestroke-evt-eligibility',
    citation_ids: ['aha-asa-2026-4.7.2'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Pre-stroke mRS eligibility interpretation in the mRS calculator drawer. IVT (§4.6.1) carries NO prestroke-mRS eligibility criterion; the prestroke mRS threshold applies to EVT only. mRS 0–1 = standard EVT baseline-function criterion (AHA/ASA 2026 §4.7.2 COR 1 LOE A for the standard window). mRS 2 = guideline-permissive for EVT, NOT a contraindication: for anterior-circulation ICA/M1 LVO within 6h with NIHSS ≥6 and ASPECTS ≥6, EVT can reasonably be considered (COR 2a, LOE B-NR per §4.7.2). Note the trial-inclusion history separately: most landmark trials (DAWN, DEFUSE-3, SELECT-2) enrolled only prestroke mRS 0–1, which is a study-population fact, not current guidance. mRS 3–4 within the same criteria: EVT might be reasonable (COR 2b, LOE B-NR). mRS 5 = high baseline disability, not guideline-supported for routine acute intervention.',
  },

  'mrs-outcome-context': {
    id: 'mrs-outcome-context',
    citation_ids: ['van-swieten-mrs-1988', 'aha-asa-2026-4.7.2'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Current/outcome context interpretation in the mRS calculator drawer: mRS 0–2 at 90 days = "good outcome" threshold used as primary endpoint in DAWN, DEFUSE-3, SELECT-2, and most acute stroke RCTs. NOTE: NINDS (1995) did NOT use mRS 0-2 as a standalone primary — its favorable outcome was a global statistic across four scales (Barthel, Rankin, Glasgow, NIHSS), with the Rankin component dichotomized at 0-1 (not 0-2). mRS 3 = dependent but ambulatory; below good-outcome threshold. mRS 4–5 = poor functional outcome range.',
  },

  // ─── NIHSS minor-stroke disabling-features checklist ────────────────────
  // Phase 7D.3 (2026-06-01). Renders inside the NIHSS drawer when total 1–4.
  // Surface: data-claim attribute on the parent <div> in DrawerContent
  // (src/pages/NihssCalculator.tsx). Pre-execution clinical review:
  // docs/reviews/clinical-PR-nihss-low-score-checklist.md.
  //
  // Any-Yes verdict: AHA/ASA 2026 §4.6.1 Rec 3 (COR 1, LOE A) — IVT
  //   recommended for disabling deficits regardless of NIHSS when eligible.
  // All-No verdict: AHA/ASA 2026 §4.6.1 Rec 4 (COR 3 No Benefit, LOE B-R) +
  //   PRISMS 2018 (alteplase vs aspirin, n=313 stopped early, no functional
  //   benefit, sICH 3.2% vs 0%) + §4.8 Rec 12 (DAPT COR 1, LOE A).
  'nihss-minor-disabling-check': {
    id: 'nihss-minor-disabling-check',
    citation_ids: [
      'aha-asa-2026-4.6.1',
      'aha-asa-2026-4.8',
      'prisms-trial-2018',
    ],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'NIHSS drawer disabling-features checklist for minor stroke (total 1–4). Verdict Any-Yes: IVT recommended for disabling deficits regardless of NIHSS (COR 1, LOE A per §4.6.1). Verdict All-No: IVT not recommended for mild non-disabling stroke (COR 3 No Benefit, LOE B-R per §4.6.1); PRISMS showed no functional benefit and sICH 3.2% vs 0% (Khatri, JAMA 2018); DAPT preferred per §4.8 (COR 1, LOE A).',
  },

  // ─── PatientContextPanel — BP tPA/TNK threshold alert ───────────────────
  // Alert chip below BP row when SBP ≥185 or DBP ≥110. Pre-treatment gate.
  // Clinical-reviewer approved: docs/reviews/clinical-PR-bp-alert.md (2026-05-27).
  'bp-ivt-threshold-185-110': {
    id: 'bp-ivt-threshold-185-110',
    citation_ids: ['aha-asa-ivt-bp-threshold', 'aha-asa-2026-4.6.1', 'aha-asa-2026-4.6.2'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Inline BP alert in PatientContextPanel when SBP ≥185 OR DBP ≥110. On the thrombolysis-timing surface (NIHSS opt-in via showThrombolysisTiming) the prompt appears ONLY when the patient is inside the standard 4.5h IV thrombolysis window, where it reads "If thrombolysis planned: BP goal <185/110"; out of window, or before LKW is entered, no BP prompt is shown (the <185/110 pre-thrombolysis target does not apply). On surfaces without the timing aid it reads "BP above tPA/TNK threshold. Lower to ≤185/110 before treatment" whenever BP is elevated. Conditional in-window wording chosen so the chip surfaces the BP target without asserting overall thrombolysis eligibility (clinical-review 2026-06-10); in-window-only gating per V direction 2026-06-10. Threshold per AHA/ASA 2019 Table 5 (PMID 31662037), confirmed unchanged in 2026 guideline. Applies to both alteplase and tenecteplase. Scoped to pre-treatment context only (PatientContextPanel is an initial-assessment surface).',
  },
  'ivt-window-4.5h': {
    id: 'ivt-window-4.5h',
    citation_ids: ['aha-asa-2026-4.6.1', 'aha-asa-2026-4.6.2', 'extend-trial-2019', 'wake-up-trial-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'NIHSS thrombolysis-timing chip in PatientContextPanel (opt-in via showThrombolysisTiming). When a witnessed LKW is set, shows time since onset plus a three-tier IV thrombolysis window chip: green "Within 4.5h" (with a minutes-left countdown in the final 30 min) for the standard window per AHA/ASA 2026 §4.6.1 (COR 1) and §4.6.2 (alteplase/tenecteplase equivalence within 4.5h); orange "4.5–9h window" for the perfusion-imaging-selected extended window (COR 2a per AHA/ASA 2026), established by EXTEND (alteplase 4.5–9h, perfusion mismatch) and WAKE-UP (unknown onset, DWI-FLAIR mismatch); red "Beyond 9h" once past the extended IV thrombolysis window. The chip states factual onset-clock time bands, not eligibility determinations (the extended window in particular is imaging-gated). On-screen real-time aid only; the chip is not emitted to the NIHSS copy export (only the time-since-onset line is).',
  },

  // ─── Anticoagulant IV-thrombolysis eligibility feature (2026-06-10) ────────
  // Five claims for the anticoagulant-class IVT eligibility surface. Authored
  // by medical-scientist directly from the 2026 AHA/ASA AIS guideline full
  // text (Prabhakaran et al., DOI 10.1161/STR.0000000000000513, local PDF
  // pages e38 + e49–e52). Surface = data-claim attribute (jsx) — the feature
  // UI tags each excluding/permitting state with these exact claim IDs.
  // Routed to clinical-reviewer; NOT yet gated. Two structural findings for
  // the reviewer (see PR deliverable):
  //   • The 2026 guideline does NOT use the 2019-style standalone "ineligibility"
  //     table. Anticoagulant criteria live in §4.6.5 + Table 8 (risk-gradient).
  //   • DOAC <48h is a RELATIVE (not absolute) contraindication in the 2026 text.
  //   • There is NO standalone treatment-dose-LMWH-<24h row in the 2026
  //     guideline — see ivt-anticoag-lmwh-24h note below.

  // Single/dual antiplatelet is NOT a contraindication to IVT.
  'ivt-anticoag-antiplatelet-ok': {
    id: 'ivt-anticoag-antiplatelet-ok',
    citation_ids: ['aha-asa-2026-4.6.1-antiplatelet'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Single or dual antiplatelet therapy (aspirin, clopidogrel, DAPT) is NOT a contraindication to IV thrombolysis. AHA/ASA 2026 §4.6.1 Rec 9 (COR 1, LOE B-NR): in suspected AIS patients on single or DAPT and otherwise eligible, IVT is recommended despite a small absolute increase in sICH risk (~0.9%–1.2% per §4.6.1 supportive text item 9), outweighed by the anticipated treatment benefit. UI state: permitting (not an exclusion).',
  },

  // DOAC last dose <48h: RELATIVE contraindication per the actual 2026 text.
  'ivt-anticoag-doac-48h': {
    id: 'ivt-anticoag-doac-48h',
    citation_ids: ['aha-asa-2026-4.6.5-doac-relative'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Recent DOAC exposure within 48h of last dose is a RELATIVE contraindication to IVT in the 2026 AHA/ASA guideline (§4.6.5 + Table 8, Relative Contraindications — DOAC exposure), NOT an absolute one. Verbatim: safety is "unknown"; IVT "may be considered after a thorough benefit vs risk analysis on an individual basis," weighing timing of last dose, renal function, stroke severity, EVT availability, reversal-agent availability, and DOAC-specific anti-FXa/thrombin-time assays. NOTE: the 2026 guideline does NOT state the "unless drug-specific assays are normal" carve-out as an absolute permit (that framing is in the older/mis-sectioned aha-asa-2026-4.2 citation, flagged for correction). The assay reference here is one input to an individualized benefit-risk decision, not an automatic green light. UI state: relative exclusion / individualized decision — do not present as an absolute block or an absolute permit.',
  },

  // Warfarin / VKA: INR > 1.7 excludes IVT (absolute).
  'ivt-anticoag-warfarin-inr': {
    id: 'ivt-anticoag-warfarin-inr',
    citation_ids: ['aha-asa-2026-4.6.5-coagulopathy'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Warfarin / VKA: INR > 1.7 is an absolute contraindication to IVT. AHA/ASA 2026 §4.6.5 + Table 8 (Absolute Contraindications — Severe coagulopathy or thrombocytopenia): IVT in patients with INR > 1.7 (also platelets <100,000/mm³, aPTT >40 s, or PT >15 s) "is unknown though may substantially increase risk of harm and should not be administered." In patients without recent warfarin or heparin use, IVT may be started before lab results return but must be discontinued if INR >1.7 (or PT/PTT abnormal by local standards). Confirms the assumed INR >1.7 cutoff verbatim. UI state: excluding when INR > 1.7.',
  },

  // IV unfractionated heparin: aPTT > 40 s excludes IVT (absolute).
  'ivt-anticoag-ufh-aptt': {
    id: 'ivt-anticoag-ufh-aptt',
    citation_ids: ['aha-asa-2026-4.6.5-coagulopathy'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'IV unfractionated heparin: an elevated aPTT > 40 s is an absolute contraindication to IVT. AHA/ASA 2026 §4.6.5 + Table 8 (Absolute Contraindications — Severe coagulopathy or thrombocytopenia): IVT in patients with aPTT > 40 s (alongside INR >1.7, PT >15 s, platelets <100,000/mm³) "is unknown though may substantially increase risk of harm and should not be administered." The 2026 guideline expresses the UFH contraindication as the aPTT >40 s lab threshold rather than a fixed since-last-dose timing rule. UI state: excluding when aPTT > 40 s. Confirms the assumed aPTT criterion verbatim with the exact value (>40 s).',
  },

  // NOTE: no `ivt-anticoag-lmwh-24h` claim. The 2026 AHA/ASA guideline removed
  // the standalone treatment-dose-LMWH-<24h row that the 2019 guideline carried;
  // heparin-class agents are captured by the aPTT >40s threshold
  // (ivt-anticoag-ufh-aptt). Per V direction 2026-06-10, the Heparin/LMWH input
  // is aPTT-only, so no LMWH-timing surface or claim is shipped.

  // Hypoglycemia treat-threshold. Same caution as the Stroke Code pathway alert,
  // unified to the guideline-correct <60 (supersedes the legacy <50; the audit
  // stroke-code-glucose-threshold-60 corrected the citation but missed the
  // CodeModeStep1/Step3 triggers, now aligned per V direction 2026-06-10).
  'ivt-hypoglycemia-60': {
    id: 'ivt-hypoglycemia-60',
    citation_ids: ['aha-asa-2026-4.5'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'Hypoglycemia (blood glucose <60 mg/dL) should be treated as part of acute stroke care: treat (eg, D50 50 mL IV), recheck glucose, and reassess for IV thrombolysis if symptoms persist after normoglycemia. AHA/ASA 2026 §4.5 row 1 (COR 1, LOE C-LD), verbatim in aha-asa-2026-4.5: "hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications." Threshold is <60, not the legacy <50 (audit stroke-code-glucose-threshold-60). Mirrors the Stroke Code CodeModeStep1 hypoglycemia alert. UI state: amber caution note when glucose <60.',
  },
};
