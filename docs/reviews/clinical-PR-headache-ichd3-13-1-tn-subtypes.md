# Clinical review — Class D Stage 3b: trigeminal neuralgia aetiology subtypes (§13.1.1.1/.2/.3)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-07
**Class:** D (structural, ADR-2026-07-06 Stage 3) · discharges the deferred subtyping in `clinical-PR-headache-ichd3-13-1-trigeminal-neuralgia.md`

## Scope
- **Claims touched:** `clinic-headache-ichd3-tn-subtypes` (new).
- **Citations affected:** `ichd3-2018` (`section` += 13.1.1.1/.2/.3; `quoted_text` aetiology summary, with the §13.1.1.3 Note-1 clause appended this commit).
- **Surfaces changed:** structured data (`SUBTYPE_RESOLVERS['trigeminal-neuralgia']` + subtype labels/sections/note), `b-trigeminal` branch options, `HiddenClaimMarkers` span.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`, `src/data/clinicHeadacheData.test.ts`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-13-1-trigeminal-neuralgia.md` (§13.1.1.1/.2/.3 verbatim).

## Semantic validity
Faithful, verbatim-anchored encoding of §13.1.1.1/.2/.3:
- **Classical (§13.1.1.1)** gated on `tn-nvc-morphological-change` labeled "compression WITH nerve changes (atrophy or displacement)" — the "neurovascular compression (not simply contact), with morphological changes" standard, not simple contact.
- **Secondary (§13.1.1.2)** gated on an underlying disease demonstrated (MS / CPA tumour / AVM), matching criterion B + Note 1.
- **Idiopathic (§13.1.1.3)** requires the explicit "adequate MRI AND electrophysiology, both negative" chip; its teach text carries §13.1.1.3 Note 1 ("a vessel-nerve contact WITHOUT morphological change is still idiopathic"). "WITH morphological change" preserved verbatim across the chip label, resolver note, claim description, and `quoted_text`. No qualifier dropped, softened, or upgraded.

**Precedence:** `underlying-disease → secondary` correctly takes precedence over `nvc → classical` — a demonstrated underlying cause makes the neuralgia secondary regardless of an incidental neurovascular contact. The test asserting underlying-disease+NVC → secondary is a correct guard.

**Secondary→refer note:** clinically sound and action-appropriate ("confirm and manage the underlying cause; specialist referral") without over-claiming.

**Parent fallback:** returning `undefined` when no investigation chip is present is clinically correct — aetiology cannot be assigned without imaging/electrophysiology, so the subtype-less TN parent (carrying the teachPearl's imaging/referral steer + secondary-TN red flags) is the right behavior rather than defaulting a patient into an aetiology on no evidence.

**Parent never suppressed:** the evaluator spreads `...(subtype ? { subtype } : {})` and pushes the parent match unconditionally; parent tn-A/B/C criteria are unchanged.

## Citation accuracy & freshness
`ichd3-2018` resolves (PMID 29368949); `section` includes 13.1.1.1/.2/.3; `quoted_text` reproduces the §13.1.1 A–D + Note 4 verbatim block plus an accurate aetiology-subtype summary (now including the §13.1.1.3 Note-1 clause). `last_reviewed` 2026-05-25, window 24 months — within window; not touched by this PR.

## Mandatory-block check
All eight cleared (faithful, single source, citation resolves, `quoted_text` supports the claims, artifact present, no `last_reviewed` refresh, not a trial PR).

## Rationale
A faithful encoding of the §13.1.1.1/.2/.3 aetiology subtypes on the additive resolver spine, with correct secondary-over-classical precedence, a sound secondary→refer note, and a clinically correct parent-fallback when aetiology is uninvestigated. Discharges the subtyping deferred at the TN parent's Stage-1 review.

## Required follow-ups
- None blocking. (The reviewer's editorial note — append the §13.1.1.3 Note-1 clause to `quoted_text` — was applied in this commit.)

## Verification state at gate time
- `npx vitest run` → 252/252 (247 prior + 5 new: classical/secondary+note/idiopathic/parent-fallback/precedence); `tsc --noEmit` clean; `check:humanizer` PASS; `check:claims` pass.
