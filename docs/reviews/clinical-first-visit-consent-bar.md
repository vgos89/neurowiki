# Clinical review — first-visit consent bar PHI reconciliation

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05

## Scope
- Claims touched: none in `CLAIM_REGISTRY` (legal/PHI-policy copy, not
  guideline-derived clinical claims — no citation mapping, no `last_reviewed`).
- Surfaces changed (§13.3): static JSX on three legal/consent surfaces —
  `src/pages/TermsPage.tsx` ("Patient data and PHI"), `src/pages/PrivacyPage.tsx`
  (canonical PHI language, unchanged this PR — used as the reference), and
  `src/components/FirstRunConsentBar.tsx` (on-surface PHI line + HCP affirmation).
- Evidence-verifier packet: not applicable. Trial-statistician: not applicable.
- PHI-policy basis: `docs/reviews/compliance-hipaa-saved-cases-2026-05-19.md`
  (confirmed present — not a dangling reference).

## Semantic validity
Confirmed consistency of the four load-bearing PHI assertions across Terms,
Privacy, and the consent bar:
1. Calculator inputs local / not transmitted — consistent.
2. No names / MRN / DOB collected — identical force on all three surfaces.
3. Save Case stores initials + clinical context = **may** constitute PHI under
   hospital policy — the conditional certainty marker ("may"/"can", scoped to
   "under your hospital's policy") is preserved on every surface; the prior
   contradicting absolute denial ("not approved for handling PHI") is fully
   removed.
4. User responsible per institution rules — consistent.

No surface launders the conditional PHI claim into an absolute, and none could
mislead a clinician about what is stored, where, whether it leaves the device, or
who bears HIPAA responsibility.

## Citation accuracy
Not applicable — no `src/lib/citations/` records mapped to these surfaces.

## Freshness
Not applicable to citation windows. Surface dates internally consistent
(TermsPage "Last reviewed: 2026-06-05"; `DISCLAIMER_VERSION = '3.0'`).

## Rationale
The rework removes a genuine clinical-safety-adjacent contradiction (old Terms
flatly denied PHI handling while v3.0 + Privacy honestly acknowledge Save Case
may store PHI). The new Terms section states the same four facts as the canonical
Privacy surface and preserves the "may" qualifier. The only cross-surface delta
(Terms omits the absolute-vs-offset timestamp nuance Privacy carries in full) is
a faithful, more-conservative summary that links to the canonical source — safe
under the paraphrase standard.

## Required follow-ups
1. (Optional, non-blocking, no version bump) Mirror the Privacy timestamp nuance
   in the Terms summary: "…scores, vitals, and timestamps (stored as elapsed
   offsets by default; absolute times opt-in)."
