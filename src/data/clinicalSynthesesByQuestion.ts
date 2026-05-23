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

  'asymptomatic-carotid': {
    claimId: 'asymptomatic-carotid-synthesis',
    headline:
      'In asymptomatic carotid stenosis on modern intensive medical management, carotid stenting reduces stroke vs medical therapy alone (CREST-2 2026), while endarterectomy does not; the historic CEA-vs-medical literature predates contemporary statin and antiplatelet practice and should not be relied on in 2026.',
    bodyParagraphs: [
      'Asymptomatic carotid stenosis sits outside the 2026 AHA AIS guideline scope; it is governed by the 2021 AHA/ASA Secondary Prevention Guideline (Section 5.3, Carotid Artery Disease). That guideline was written before CREST-2 reported, and its language presumes that the comparator for revascularization is older medical therapy rather than contemporary intensive medical management with high-intensity statin, antiplatelet, and systematic blood-pressure control.',
      'CREST-2 (Brott et al., NEJM 2026;394:219-231) was the field-defining test of that presumption. It enrolled patients with asymptomatic stenosis of at least 70 percent and ran two parallel randomized trials against modern intensive medical management. In the stenting trial, the 4-year stroke or death rate was 2.8 percent with stenting plus medical management vs 6.0 percent with medical management alone (HR 0.45, P=0.02, ARD 3.2 percentage points, NNT 31). In the endarterectomy trial, the corresponding rates were 3.7 percent vs 5.3 percent (HR 0.69, P=0.24); endarterectomy did not separate from medical management alone.',
      'The earlier CREST trial (Brott et al., NEJM 2010) compared stenting head-to-head with endarterectomy in a mixed symptomatic and asymptomatic population and missed superiority on the composite primary outcome (HR 1.11, P=0.51). The component split is the durable lesson: stenting carried excess periprocedural stroke, endarterectomy carried excess periprocedural MI and a 4.7 percent rate of cranial nerve palsy. That trade-off has not gone away, and it shapes how the two CREST-2 results should be read together rather than separately.',
      'What CREST-2 does NOT establish: benefit in patients who cannot or will not adhere to intensive medical management (the trial enforced it through a dedicated medical-management protocol), benefit in stenosis under 70 percent, benefit in patients who would not have qualified for revascularization on operator or anatomic grounds, or generalizability outside high-volume centers with credentialed operators (periprocedural event rates outside trial conditions are typically higher). Symptomatic carotid disease is a separate question with separate evidence (NASCET, ECST, and the 2021 SP Guideline carotid sections); the CREST-2 result should not be back-applied to symptomatic patients.',
    ],
    bottomLine:
      'For asymptomatic carotid stenosis ≥70%, start intensive medical management first; in patients who would otherwise be revascularization candidates, carotid artery stenting at an experienced center is now a defensible add-on per CREST-2 (NNT 31 over 4 years), while CEA is not.',
  },

  'ich-anticoagulation-reversal': {
    claimId: 'ich-anticoagulation-reversal-synthesis',
    headline:
      'In anticoagulant-associated ICH, give 4F-PCC plus IV vitamin K for VKA reversal, idarucizumab for dabigatran, and andexanet alfa or 4F-PCC for factor Xa inhibitors; do NOT transfuse platelets for antiplatelet-associated ICH outside of a planned neurosurgical procedure.',
    bodyParagraphs: [
      'Anticoagulant-associated ICH is governed by the 2022 AHA/ASA Spontaneous ICH Guideline (Greenberg et al., Stroke 2022;53:e282-e361). The principle is that reversal should be agent-specific, started as soon as the diagnosis is made on CT, and pursued in parallel with blood-pressure control and neurosurgical evaluation rather than sequentially. Delay to reversal is associated with hematoma expansion, which is the single strongest modifiable predictor of death and dependency.',
      'For warfarin-associated ICH, 4-factor PCC 25 to 50 units per kg IV plus vitamin K 10 mg IV is preferred over FFP. Sarode et al. (Circulation 2013) randomized urgent VKA reversal and showed 4F-PCC was noninferior to FFP for hemostatic efficacy and superior for INR correction at 30 minutes (62 percent vs 10 percent achieved INR ≤1.3). Vitamin K is non-negotiable because PCC alone restores factors transiently; without vitamin K the INR rebounds.',
      'For factor Xa inhibitors (apixaban, rivaroxaban, edoxaban), andexanet alfa is the agent-specific reversal. ANNEXA-I (Connolly et al., NEJM 2024) randomized 530 patients with acute FXa-inhibitor-associated ICH and found hemostatic efficacy in 67.0 percent with andexanet vs 53.1 percent with usual care (4F-PCC in most), an absolute difference of 13.4 percentage points (P=0.003). The trial was halted at interim by the DSMB. The trade-off was thrombosis: ischemic stroke occurred in 6.5 percent with andexanet vs 1.5 percent with usual care. ANNEXA-4 (Connolly et al., NEJM 2019), a prior single-arm cohort, had reported 82 percent hemostasis at 12 hours and informed FDA accelerated approval. For dabigatran, idarucizumab 5 g IV (two 2.5 g doses) is the specific reversal.',
      'The PATCH trial (Baharoglu et al., Lancet 2016) is the reason platelet transfusion is now contraindicated in antiplatelet-associated ICH outside a planned procedure. PATCH randomized 190 patients on antiplatelet therapy with spontaneous supratentorial ICH to platelet transfusion vs standard care and found HARM: death or dependence at 3 months was more common with transfusion (adjusted OR 2.05, 95% CI 1.18 to 3.56, P=0.0114). The 2022 AHA/ASA guideline cites this as Class III: Harm. Platelet transfusion remains reasonable when the patient is going to neurosurgery for hematoma evacuation or EVD placement, but not as a hemostatic strategy on its own.',
      'What we do NOT know: whether andexanet alfa improves functional outcomes (ANNEXA-I was powered for hemostasis, not mRS), whether 4F-PCC is truly equivalent to andexanet outside trial conditions and at lower cost, optimal management when the last DOAC dose is unknown or the anti-Xa level is unavailable, and how to manage patients on combined anticoagulant plus antiplatelet therapy. Resuming anticoagulation after ICH (timing, agent selection, patient selection) is a separate decision governed by case-level estimation of recurrent ICH vs thromboembolic risk and is not addressed by the reversal trials.',
    ],
    bottomLine:
      'Reverse by agent: 4F-PCC + vitamin K for warfarin, idarucizumab for dabigatran, andexanet alfa or 4F-PCC for factor Xa inhibitors. Do NOT transfuse platelets for antiplatelet-associated ICH unless the patient is heading to neurosurgery (PATCH showed harm; AHA/ASA Class III).',
  },

  'crao-management': {
    claimId: 'crao-management-synthesis',
    headline:
      'No therapy has been proven to restore vision after non-arteritic CRAO; the THEIA trial of IV alteplase within 4.5 hours was underpowered and missed its primary endpoint, and current practice is to treat CRAO as a TIA-equivalent and pursue urgent stroke workup rather than to deliver acute reperfusion.',
    bodyParagraphs: [
      'Central retinal artery occlusion is best framed as a stroke of the retina. The American Academy of Ophthalmology clinical statement on retinal artery occlusion (Flaxel et al., Ophthalmology 2020) and joint AAO/AAN messaging position CRAO as a TIA-equivalent: it carries the same short-term risk of subsequent cerebral ischemic events as a hemispheric TIA, and the immediate priority is urgent stroke-pathway workup (vessel imaging, cardiac evaluation, ECG monitoring, vascular risk-factor management) rather than ocular intervention.',
      'Historic acute therapies (ocular massage, anterior chamber paracentesis, IOP-lowering agents, isovolemic hemodilution, hyperbaric oxygen) lack randomized evidence of visual benefit and are not recommended as standard care. EAGLE (Schumacher et al., Ophthalmology 2010) randomized intra-arterial fibrinolysis vs conservative therapy for non-arteritic CRAO and was stopped early after no efficacy signal and a higher rate of adverse events in the interventional arm; that result effectively closed the IA fibrinolysis question.',
      'THEIA (Sibon et al., Lancet Neurology 2025) was the first phase 3 RCT of intravenous alteplase within 4.5 hours of non-arteritic CRAO onset. The trial was stopped early for slow recruitment after enrolling only 70 of a planned 178 patients and was therefore underpowered. Visual acuity improvement of at least 0.3 LogMAR at 90 days occurred in 66 percent with alteplase vs 48 percent with placebo, adjusted OR 1.10 (P=0.95 for the primary). Safety was reassuring with no symptomatic intracranial hemorrhages in the alteplase arm. The directional signal is encouraging but the trial cannot establish efficacy, and THEIA should not be cited as positive evidence for IV thrombolysis in CRAO.',
      'What we do NOT know: whether IV thrombolysis improves vision in CRAO (THEIA was underpowered and the question remains open; an adequately powered successor trial would be needed), whether a shorter time window (under 3 hours, or under 90 minutes as suggested by retrospective series) would shift the effect, whether tenecteplase performs differently than alteplase in this setting, and the role of any acute therapy in arteritic (giant cell arteritis-related) CRAO, where the priority is high-dose corticosteroid and biopsy rather than reperfusion. ESR, CRP, and a low threshold for empirical steroids while awaiting temporal artery biopsy are essential whenever GCA is plausible.',
    ],
    bottomLine:
      'There is no proven acute therapy for non-arteritic CRAO. Treat as a stroke-equivalent: admit (or expedited stroke-pathway workup), vessel and cardiac imaging, ECG monitoring, secondary-prevention initiation, and ophthalmology follow-up. Rule out giant cell arteritis with ESR/CRP and start empirical high-dose steroids if suspicion is meaningful.',
  },
};

export function getClinicalSynthesisForQuestion(
  questionId: string,
): ClinicalSynthesis | undefined {
  return CLINICAL_SYNTHESES_BY_QUESTION[questionId];
}
