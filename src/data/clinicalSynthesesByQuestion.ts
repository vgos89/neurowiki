/**
 * Maps trial-question slug → ClinicalSynthesisCard claim ID + authored prose.
 *
 * Parallel to guidelineSummariesByQuestion.ts. The two patterns are
 * complementary:
 *   - <GuidelineSummaryCard>  → renders verbatim COR/LOE text from a
 *     registered guideline citation. Use when an AHA/ASA / ESO / equivalent
 *     guideline directly answers the question.
 *   - <ClinicalSynthesisCard> → renders editorial synthesis prose authored
 *     by medical-scientist and gated by clinical-reviewer §17.2. Use when
 *     no single guideline answers the question (PFO closure, CRAO, etc.)
 *     or when synthesising across multiple trials is more useful than a
 *     verbatim quote.
 *
 * A question may have EITHER a guideline summary OR a clinical synthesis,
 * not both. QuestionDetailPage prefers the guideline summary when both
 * exist (the canonical-source signal beats editorial prose).
 *
 * Each synthesis entry contains:
 *   - claimId: links to CLAIM_REGISTRY for citation tracking
 *   - headline: one-sentence bottom-line takeaway (eyebrow position)
 *   - bodyParagraphs: 3–5 short paragraphs of synthesis prose
 *   - bottomLine: a single-line actionable takeaway shown in a distinct
 *     "bottom line" callout box at the end of the card
 */

export interface ClinicalSynthesis {
  /** Claim ID from CLAIM_REGISTRY (lists every supporting citation). */
  claimId: string;
  /** One-sentence headline shown immediately under the eyebrow. */
  headline: string;
  /** Body prose: 3–5 short paragraphs. */
  bodyParagraphs: string[];
  /** Actionable single-line bottom-line shown in a distinct callout. */
  bottomLine: string;
}

export const CLINICAL_SYNTHESES_BY_QUESTION: Record<string, ClinicalSynthesis> = {
  // Phase 1 — pilot synthesis for PFO closure (out of 2026 AIS guideline scope;
  // governed by 2021 AHA/ASA Secondary Prevention Guideline).
  'pfo-closure-cryptogenic': {
    claimId: 'pfo-closure-cryptogenic-synthesis',
    headline:
      'For selected patients <60 with cryptogenic ischemic stroke and a PFO carrying high-risk morphology, transcatheter closure plus antiplatelet therapy reduces recurrent stroke compared with antiplatelet alone; atrial fibrillation excess is the central trade-off.',
    bodyParagraphs: [
      'PFO closure for cryptogenic stroke is governed by the 2021 AHA/ASA Secondary Prevention of Stroke Guideline, not the 2026 acute ischemic stroke guideline. The 2021 guideline assigns Class IIa, Level B-R to PFO closure in patients 18 to 60 with nonlacunar ischemic stroke of undetermined cause and a PFO, with the closure decision made jointly by the patient, the cardiologist, and the neurologist after weighing the probability of a causal role for the PFO.',
      'The recommendation rests on three randomized trials published together in NEJM on September 14, 2017. CLOSE (Mas et al.) restricted enrollment to patients with high-risk PFO morphology (atrial septal aneurysm OR large interatrial shunt >30 microbubbles) and reported the strongest effect: 0 of 238 closure patients had recurrent stroke vs 14 of 235 antiplatelet patients over mean 5.3-year follow-up (HR 0.03, NNT 20). REDUCE (Søndergaard et al.) prohibited anticoagulation in the comparator and randomized 2:1 to closure with Gore HELEX or Cardioform plus antiplatelet vs antiplatelet alone, reporting HR 0.23 over a median 3.2 years (NNT roughly 28). RESPECT long-term (Saver et al.) reported a 5.9-year extended follow-up of the Amplatzer PFO Occluder cohort, converting the borderline 2013 primary into HR 0.55 (P=0.046, NNT 42).',
      'The pre-2017 landscape was inconclusive. CLOSURE-I (NEJM 2012, STARFlex device) and the PC trial (NEJM 2013, Amplatzer) were negative on primary intention-to-treat analysis, and the original RESPECT 2013 publication missed its primary endpoint at 2.1 years (HR 0.49, P=0.08). The DEFENSE-PFO trial (Lee et al., JACC 2018) subsequently confirmed benefit in patients with high-risk anatomy and was halted early for efficacy. The PASCAL classification (Kent et al., JAMA 2021) integrates the RoPE score with PFO morphology to stratify patients as having unlikely, possible, or probable PFO-attributable stroke; closure benefit concentrates in the probable category.',
      'The central trade-off is atrial fibrillation. AF or flutter occurred more often with closure across all three 2017 trials, with REDUCE reporting the largest absolute signal (6.6% vs 0.4%). Across the cluster, 59 to 83 percent of new AF was detected within the first 45 days post-procedure and the majority resolved spontaneously, consistent with transient periprocedural irritation rather than a durable arrhythmic substrate. Whether procedure-induced AF carries downstream stroke risk in patients lost to long-term monitoring remains an open question and a legitimate subject for shared decision-making.',
      'What the cluster does NOT establish: benefit in patients over 60 (excluded from all three trials), benefit in patients with PFO but no high-risk morphology (CLOSE explicitly required it; REDUCE and RESPECT did not but exploratory analyses suggested most of the benefit accrues to the high-risk subgroup), or benefit when a competing stroke etiology is present (rigorous workup to exclude large-artery, small-vessel, established cardioembolic, hypercoagulable, and dissection causes is a prerequisite). Prolonged ECG monitoring to exclude occult AF should be completed before classifying a stroke as cryptogenic.',
    ],
    bottomLine:
      'In selected non-lacunar cryptogenic-stroke patients <60 with PFO carrying high-risk morphology and no other apparent etiology, percutaneous PFO closure plus long-term antiplatelet is reasonable (Class IIa, Level B-R). Confirm cryptogenic status with vessel imaging + prolonged cardiac monitoring + echocardiography with bubble study before applying.',
  },
};

export function getClinicalSynthesisForQuestion(
  questionId: string,
): ClinicalSynthesis | undefined {
  return CLINICAL_SYNTHESES_BY_QUESTION[questionId];
}
