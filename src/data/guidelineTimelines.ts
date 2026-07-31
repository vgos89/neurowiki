/**
 * Guideline timelines — how a society position on one intervention changed
 * over time, and how it differs by INDICATION.
 *
 * Parallel to guidelineSummariesByQuestion.ts (one guideline, verbatim) and
 * clinicalSynthesesByQuestion.ts (editorial prose across trials). This module
 * covers the third case: several guidelines, over years, disagreeing or
 * diverging, where the sequence itself is the teaching point.
 *
 * PFO is the case it was built for. The same anatomical finding carries
 * OPPOSITE recommendations depending on why you are considering closing it:
 * for selected cryptogenic stroke the 2021 AHA/ASA gives a shared-decision
 * recommendation, while for migraine every society that has addressed it
 * recommends against. A clinician who has read only one of those can easily
 * carry it into the other conversation.
 *
 * CONTENT RULE. Entries carry NO authored clinical prose. Each renders the
 * `quoted_text` of an already-registered, already-verified citation, plus a
 * `stance` categorisation and a short `whatChanged` line describing the
 * MOVEMENT between entries rather than restating the recommendation. That
 * keeps this surface downstream of the citation registry: if a quote is
 * corrected there, this surface corrects with it, and no claim can drift here
 * without drifting in the registry first.
 */

export type GuidelineStance =
  /** Recommends the intervention, at whatever strength the document uses. */
  | 'for'
  /** Recommends against it. */
  | 'against'
  /** Explicitly treats the options as equally acceptable. */
  | 'equipoise'
  /**
   * Recommends a PROCESS, not the intervention. AHA/ASA 2021 is the case: its
   * recommendation is that the decision be made jointly by the patient, the
   * cardiologist and the neurologist. Bucketing that as 'for' rendered a green
   * "Recommends" chip over a recommendation that does not recommend closing
   * anything, which is a strength and action-verb upgrade.
   */
  | 'shared-decision';

export interface GuidelineTimelineEntry {
  /** Must resolve in CITATION_REGISTRY. The quote is read from there. */
  citationId: string;
  /** Short society label for the rail, e.g. 'AHA/ASA'. */
  society: string;
  /** Which clinical question this document was answering. */
  indication: string;
  stance: GuidelineStance;
  /**
   * The document's OWN strength words, rendered beside the stance chip. The
   * three stance buckets deliberately discard strength; this puts it back, so a
   * weak non-society recommendation and a graded society one cannot render
   * identically.
   */
  strength: string;
  /**
   * What MOVED at this point in the sequence. Not a restatement of the
   * recommendation, which the quote already carries.
   */
  whatChanged: string;
  /** Set when the document is not a graded practice guideline. */
  notGraded?: string;
}

export interface GuidelineTimeline {
  /** Claim ID in CLAIM_REGISTRY covering this timeline's authored lines. */
  claimId: string;
  title: string;
  intro: string;
  entries: GuidelineTimelineEntry[];
  /** The single thing to carry away from the sequence. */
  takeaway: string;
}

export const GUIDELINE_TIMELINES: Record<string, GuidelineTimeline> = {
  pfo: {
    claimId: 'pfo-guideline-timeline',
    title: 'How the PFO recommendations moved, 2018 to 2025',
    intro:
      'A patent foramen ovale is one finding, but the advice depends entirely on why you are asking. Three separate questions run through this sequence: whether to close it after a stroke, what to give if it is not closed, and whether to close it for migraine. Read across them rather than down one.',
    entries: [
      {
        citationId: 'kuijpers-bmj-rapidrec-pfo-2018',
        society: 'BMJ Rapid Recs',
        indication: 'Antithrombotic choice after cryptogenic stroke',
        stance: 'for',
        strength: 'Weak, low-quality evidence',
        whatChanged:
          'The most favourable position anticoagulation has been given. A rapid-recommendation panel came down weakly in its favour on low-quality evidence, before RE-SPECT ESUS reported. No society adopted it, and the later evidence did not confirm it.',
        notGraded:
          'A BMJ Rapid Recommendation panel, not a neurology or cardiology society.',
      },
      {
        citationId: 'messe-aan-pfo-advisory-2020',
        society: 'AAN',
        indication: 'Antithrombotic choice after cryptogenic stroke',
        stance: 'equipoise',
        strength: 'Level C for the choice; Level B where anticoagulation is separately indicated',
        whatChanged:
          'Two years later the neurology position was equipoise rather than preference, and a 2022 to 2026 search located no later society guideline on this question. Note the sentence most often misread: the interval also rules out a clinically important benefit for ASPIRIN. The advisory did not conclude that aspirin is better, only that neither has been shown to be.',
      },
      {
        citationId: 'aha-asa-2021-secondary-prevention-pfo',
        society: 'AHA/ASA',
        indication: 'Closure after cryptogenic stroke',
        stance: 'shared-decision',
        strength: 'Class 2a, Level B-R',
        whatChanged:
          'The stroke indication diverges here, and the recommendation is about HOW the decision is made rather than what to decide: jointly by the patient, the cardiologist and the neurologist. It is scoped tightly, to patients 18 to 60 years of age with a nonlacunar stroke of undetermined cause after a thorough evaluation.',
      },
      {
        citationId: 'kavinsky-scai-pfo-2022',
        society: 'SCAI',
        indication: 'Closure for migraine',
        stance: 'against',
        strength: 'Conditional against routine use, moderate certainty',
        whatChanged:
          'The migraine indication goes the other way, and it is the interventional cardiology society that says so. Read the scope carefully: the recommendation is against ROUTINE use, and it preserves an explicit carve-out for a patient with debilitating migraine refractory to conventional therapy who places a high value on the uncertain benefit and chooses closure after shared decision-making.',
      },
      {
        citationId: 'vadod-headache-cpg-2023',
        society: 'VA/DoD',
        indication: 'Closure for migraine',
        stance: 'against',
        strength: 'Weak against',
        whatChanged:
          'A headache guideline reaches the same answer independently. This one is worth naming precisely, because it is often cited as finding the evidence insufficient. It did not: that guideline maintains a separate insufficient-evidence category and deliberately did not place PFO closure in it, so this is an active recommendation against.',
      },
      {
        citationId: 'kim-asia-pacific-pfo-2025',
        society: 'Asia-Pacific panel',
        indication: 'Closure for migraine',
        stance: 'against',
        strength: 'Expert consensus, ungraded',
        whatChanged:
          'The most recent word, and the one that is hardest to dismiss. The summit was funded by the manufacturer of the device used in PRIMA and PREMIUM, and the panel still declined to endorse closure as a first-line or routine migraine treatment.',
        notGraded:
          'An expert consensus statement, not a graded practice guideline. It carries no class, level or certainty rating.',
      },
    ],
    takeaway:
      'For stroke, in a patient 18 to 60 with a nonlacunar stroke and no other cause found, closure is a decision to make jointly with cardiology and the patient. If it is not closed, the neurology position is that antiplatelet and anticoagulation are equally acceptable. For migraine the direction reverses: SCAI 2022 and VA/DoD 2023 both recommend against, as does a 2025 Asian-Pacific expert consensus that is not a graded guideline, and the SCAI recommendation is against ROUTINE use rather than an absolute bar. No AHA/ASA or AAN position on closure for migraine was located, which is not the same as knowing there is none.',
  },
};
