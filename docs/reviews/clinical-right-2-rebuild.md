# Clinical review — PR #right-2-rebuild

**Decision:** block
**Reviewer:** clinical-reviewer (model: claude-sonnet-4-6)
**Date:** 2026-04-24

## Scope
- Claims touched (via `/* claimId: ... */` comment stubs): `right-2.inclusion`, `right-2.interpret`, `right-2.bedside-pearl`, `right-2.bottom-line`
- Citations affected: intended — `right-2-lancet-2019` (Bath PM et al., Lancet 2019;393:1009–1020; DOI 10.1016/S0140-6736(19)30194-1; PMID 30738484). No record exists in the repo registry.
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts` (Phase 1 `data` surface); static JSX prose + stat row + safety card in `src/pages/trials/TrialPageNew.tsx` (Phase 1 `jsx` surface).

## Semantic validity

> Note: the review standard requires comparison of claim text against `quoted_text` fields on citation records. Those records do not exist in this repo. Findings below are derived from the source paper as described in the PR submission. This is itself a blocking governance condition.

**Issue 1 — `trialResult` reclassification NEGATIVE → NEUTRAL (blocking)**
The primary outcome in pre-specified cohort 1 (N=852) was adjusted common OR 1.25 (0.97–1.60), p=0.083 — a non-significant trend *favoring sham*. Labeling this "NEUTRAL" implies equipoise and softens a trial with a safety signal into an inconclusive frame. The point estimate trends toward harm in the pre-specified population. MR ASAP (also prehospital nitrate; cOR 0.97, stopped early for safety) is correctly labeled NEGATIVE in this repo. The reclassification is not cosmetic; it is the load-bearing summary badge a clinician sees first. This is a never-drift concern (direction of effect + safety signal).

**Issue 2 — ENOS reference in `doesNotProve` is inaccurate (blocking)**
Text: "It does not rule out benefit in later-window hospital-based administration, which was tested separately in the ENOS trial." ENOS (Bath PM et al., Lancet 2015) was hospital-based GTN started *within 48 hours* of stroke onset — not a later-window extension of RIGHT-2's prehospital paradigm. ENOS was neutral for its primary outcome. A pre-specified subgroup starting GTN within 6 hours suggested possible benefit that did *not* replicate in RIGHT-2. Implying ENOS "tested" the later-window hospital question gives false reassurance and introduces an unsupported synthesis across two trials without noting the conflict. No ENOS citation record exists in this PR.

**Issue 3 — FAST parenthetical narrows inclusion population (condition)**
"FAST score 2 or 3 (arm motor weakness present)" — FAST 2 can be reached without arm weakness (Face + Speech). The parenthetical narrows the inclusion population beyond what the protocol required. Remove or reword to "FAST score 2 or 3 on paramedic assessment."

**Issue 4 — Exclusion list is incomplete (condition)**
The four listed exclusions omit the nitrate/PDE-5 inhibitor exclusion, which is a clinically load-bearing safety gate. Recommend adding explicitly.

**Issue 5 — Adherence figure needs table-level attribution (condition)**
"Only 36% of cohort 2 received all 4 days of treatment" is a specific quantitative claim that requires `quoted_text` pointing to the source table/section.

**Issue 6 — "Not stopped for harm" proximity to MR ASAP reference (condition)**
RIGHT-2 was not stopped for harm; MR ASAP was. These trials share the same See Also link on this page. Recommend anchoring the distinction explicitly.

**Remainder (cohort 1 N=852, cohort 2 N=1149, cOR 1.25 [0.97–1.60] p=0.083, cOR 1.04 [0.84–1.29] p=0.69, symptomatic hypotension 21/568 vs 9/581 OR 2.49 [1.11–5.57], ICH hematoma OR 1.95 [1.07–3.58], ICH mass effect OR 2.42 [1.26–4.68], ICH functional trend OR 1.87 [0.98–3.57] p=0.057, SAE 33% vs 29% p=0.16, median mRS 3 IQR 2–5):** these stats as written in the PR match what the Lancet 2019 publication reports. They still require `quoted_text` in the registry before they can be confirmed per §13.1.

## Citation accuracy

**Blocking governance problems:**

- **No citation record exists.** `src/lib/citations/registry.ts` does not exist in this repo. No `right-2-lancet-2019` citation record with `quoted_text`, `last_reviewed`, or `pmid` is present. No stat can be verified against a repo-resident source quote. (Mandatory-block per §13.1.)
- **No claim registry entries.** `CLAIM_REGISTRY` in `src/lib/citations/claims.ts` is `{}` (stub only). None of `right-2.inclusion`, `right-2.interpret`, `right-2.bedside-pearl`, `right-2.bottom-line` are registered.
- **Claim surface tagging uses unrecognized method.** Per §13.4, the `data` surface must use an **adjacent `claimId: string` field on the object**. This PR uses `/* claimId: right-2.… */` block comments. Comments are not a recognized Phase 1 tagging mechanism. Per §13.3, content on an unrecognized claim surface cannot merge; status is `blocked:awaiting-scanner-support`.
- **JSX prose surfaces carry no tagging.** The prose paragraph, stat row, and safety card in `TrialPageNew.tsx` (lines ~3247–3385) have no `data-claim` attributes. These are the most load-bearing clinical statements on the page.

## Freshness

N/A — no citation record exists to carry `last_reviewed`. Once created, RIGHT-2 is a trial (§13.7 default 36-month window), so a fresh `last_reviewed` of 2026-04-24 would be valid subject to the §13.6 six-step checklist.

## Rationale

This PR cannot merge as submitted. The quantitative reporting is mostly faithful to the Lancet 2019 publication, but three non-negotiable problems govern: (1) no citation record exists to validate any claim against, (2) no claim registry entries exist for the IDs the code asserts, and (3) the data-surface tagging uses comment stubs that are not a recognized Phase 1 tagging mechanism while the JSX prose surfaces carry no tagging at all. On top of the governance failure, two substantive semantic issues are independently disqualifying: the `trialResult` reclassification from NEGATIVE to NEUTRAL launders a trial with a primary-outcome trend toward harm into an inconclusive label, and the ENOS reference misrepresents what ENOS tested and introduces an unsupported cross-trial synthesis. Either semantic issue would be approve-with-conditions if governance were intact; together with the governance gaps, this is a block.

## Required follow-ups

**Blocking:**
- `[data-architect]` Create `src/lib/citations/registry.ts` and add a `right-2-lancet-2019` citation entry (source: trial, year 2019, PMID 30738484, DOI 10.1016/S0140-6736(19)30194-1, `quoted_text` covering every stat reproduced in the PR, `last_reviewed: 2026-04-24` via §13.6 checklist).
- `[data-architect]` Register claim entries in `CLAIM_REGISTRY` for `right-2.inclusion`, `right-2.exclusion`, `right-2.interpret.proves`, `right-2.interpret.does-not-prove`, `right-2.interpret.cautions`, `right-2.bedside-pearl`, `right-2.bottom-line`, `right-2.primary-outcome-prose`, `right-2.stat-row`, `right-2.safety-card`.
- `[data-architect]` Replace `/* claimId: ... */` block comments in `trialData.ts` with adjacent `claimId: string` fields per §13.4, OR escalate to a Class D task to extend the scanner with a documented comment-based handler.
- `[medical-scientist]` Add `data-claim` attributes to every clinical prose element in the RIGHT-2 TrialPageNew.tsx branch: question lede, primary-outcome paragraph, stat row cells, safety card paragraph.
- `[medical-scientist]` Revert `trialResult` to `'NEGATIVE'`, OR open a separate Class E task with explicit rationale citing precedent trials and get clinical-reviewer pre-execution approval for the reclassification.
- `[medical-scientist]` Rewrite or remove the ENOS sentence in `howToInterpret.doesNotProve`. If retained, add an `enos-lancet-2015` citation and accurately describe ENOS (hospital GTN within 48 hours, neutral primary outcome, within-6-hour subgroup signal not replicated in RIGHT-2).

**Conditions (must resolve before re-review):**
- Remove or reword "(arm motor weakness present)" in FAST inclusion line.
- Add nitrate/PDE-5 inhibitor exclusion to the exclusion list.
- Verify "36% of cohort 2 received all 4 days" adherence figure against the published table; attach `quoted_text`.
- Anchor the "trial was not stopped for harm" statement to distinguish from MR ASAP early-stop-for-safety.

**Status:** `blocked:awaiting-clinical-review` (content) and `blocked:awaiting-scanner-support` (claim-surface tagging). `/pr-ready` will fail until all blocking items are resolved and this artifact is superseded by an `approve` or `approve-with-conditions` decision.
