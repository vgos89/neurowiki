# Clinical review — PR #right-2-rebuild (re-review)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-sonnet-4-6)
**Date:** 2026-04-24
**Supersedes:** docs/reviews/clinical-right-2-rebuild.md (2026-04-24, block)

## Scope
- Claims touched (via `/* claimId: ... */` comment stubs per ADR-005 Option C hybrid): `right-2.inclusion`, `right-2.interpret`, `right-2.bedside-pearl`, `right-2.bottom-line`
- Citations affected: `right-2-lancet-2019` (Bath PM et al., Lancet 2019;393(10175):1009–1020; DOI 10.1016/S0140-6736(19)30194-1; PMID 30738484). Citation registry not yet shipped; governed by ADR-005 precedent (see Citation accuracy).
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts` (entry `right-2-trial`); static JSX prose in `src/pages/trials/TrialPageNew.tsx` (primary outcome paragraph, safety card).

## Semantic validity

**Item 1 — `trialResult: 'NEGATIVE'` (confirmed).** The label is now consistent with how the Lancet 2019 paper treated the result (primary endpoint trended against GTN in cohort 1) and with the repo's classification of MR ASAP (same mechanism, same prehospital paradigm, concordant safety signal). Prior reclassification concern fully resolved.

**Item 2 — Revised `doesNotProve` text (confirmed).** Current text: "This trial does not support transdermal GTN as an ultra-acute prehospital treatment for undifferentiated stroke. It does not establish whether later in-hospital administration has different effects." The second sentence is epistemically humble and accurate. No cross-trial synthesis, no unsupported ENOS claim. Drift concern resolved.

**Item 3 — "FAST score 2 or 3 on paramedic assessment" (confirmed).** Narrowing parenthetical removed. Accurately reflects the RIGHT-2 protocol inclusion criterion.

**Item 4 — "Recent nitrate use or PDE-5 inhibitor use" exclusion (confirmed, minor condition).** Clinically accurate. Condition: when the citation registry ships (W5.2), verify protocol-specified time window for PDE-5 exclusion and tighten if needed. Not blocking.

**Item 5 — MR ASAP distinction sentence (confirmed).** "RIGHT-2 completed planned enrollment, unlike the related prehospital nitrate trial MR ASAP which was stopped early for an ICH harm signal." Both claims factually accurate. Condition from prior review resolved.

**Item 6 — Additional items found on this pass:**

- `pearls[0]` read "RIGHT-2 was neutral for its primary endpoint" while the badge is NEGATIVE. Resolved in the same patch: now reads "RIGHT-2 was negative for its primary endpoint." Aligns with direction-of-effect in cohort 1.
- `clinicalContext` mechanistic framing ("lowering blood pressure and augmenting nitric oxide signaling") is accurate and faithful to the trial's stated rationale.
- Primary outcome prose and safety card in TrialPageNew.tsx: all reported numbers (cohort 1 cOR 1.25 [0.97–1.60] p=0.083, cohort 2 cOR 1.04 [0.84–1.29] p=0.69, symptomatic hypotension 21/568 vs 9/581 aOR 2.49 [1.11–5.57], ICH hematoma aOR 1.95 [1.07–3.58], ICH mass effect aOR 2.42 [1.26–4.68], SAE 33% vs 29% p=0.16) are faithful to the source as described. No drift detected.

No never-drift category violations remain.

## Citation accuracy

Per PM direction citing **ADR-005 Option C hybrid** as repo-wide governance: the `/* claimId: ... */` comment-stub tagging pattern and the absence of a shipped `src/lib/citations/registry.ts` are accepted as the current state for all 31 shipped trials in this repo. Not re-blocking RIGHT-2 on prior items (3)–(6).

**Escalation note (non-blocking to this PR):** With no citation registry, semantic review is reduced to checking claim text against what the PR submission asserts the source says. This is a real attenuation of the §13.1 gate, even under ADR-005 Option C. When the Class D citation registry track (W5.2) lands, RIGHT-2 stats should be in the first batch with `quoted_text`: cohort 1 cOR 1.25 (0.97–1.60) p=0.083; cohort 2 cOR 1.04 (0.84–1.29) p=0.69; symptomatic hypotension aOR 2.49 (1.11–5.57); ICH hematoma aOR 1.95 (1.07–3.58); ICH mass effect aOR 2.42 (1.26–4.68); ICH functional OR 1.87 (0.98–3.57) p=0.057; adherence 36%.

## Freshness

N/A at this pass. When the registry ships, RIGHT-2 is a landmark trial (§13.7 default 36-month window); `last_reviewed: 2026-04-24` will be valid subject to §13.6 checklist at that time.

## Rationale

All six first-pass blocking and conditional items are resolved. The `trialResult` is back to `'NEGATIVE'`, matching the Lancet 2019 paper's direction-of-effect and the repo's own labeling of MR ASAP. The ENOS synthesis error is cleanly excised. The FAST line, PDE-5/nitrate exclusion, and MR ASAP distinction are all accurate. The pearl[0] neutral/negative inconsistency was caught and resolved in the same patch. The citation registry absence is governed by ADR-005 Option C hybrid per PM direction; escalation note documented. Content is approve-with-conditions; the one remaining open condition (tighten nitrate exclusion time window) is deferred to the citation registry landing and does not require a third review cycle.

## Required follow-ups

**Conditions (deferred; no re-review required):**
- `[medical-scientist, W5.2]` When citation registry ships, verify protocol-specified time window for the PDE-5 inhibitor exclusion and tighten if needed.
- `[medical-scientist, W5.2]` RIGHT-2 stats to be in the first batch of `quoted_text` entries when registry lands (see Citation accuracy escalation note).

**Escalation (handled by PM, not blocking this PR):**
- ADR-005 Option C hybrid semantic-gate attenuation documented. PM to handle separately.

**Status:** ready_for_merge. Conditions are deferred to W5.2. Supersedes the prior `block` artifact.
