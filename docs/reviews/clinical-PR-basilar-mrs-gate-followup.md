# Clinical review — basilar-mrs-gate-followup

**Decision:** approve-with-conditions (condition cleared before commit)
**Reviewer:** clinical-reviewer, six fresh-context rounds
**Date:** 2026-07-30

## Scope
- **Claims touched:** `baoche-posterior-evt`, `attention-posterior-evt`, `posterior-circulation-evt-quick-claim`, `basilar-evt-guideline-summary`
- **Citations affected:** `aha-asa-2026-4.7.3`, `aha-asa-2026-4.7.3-nihss-6-9`, `baoche-trial-2022`, `attention-trial-2022`
- **Surfaces changed:** `src/pages/EvtPathway.tsx`, `src/pages/guide/Thrombectomy.tsx`, `src/data/strokeClinicalPearls.ts`, `src/data/guideContent.ts`, `src/data/trialData.ts`, `src/data/strokeGuidelineMindmapData.ts`, `src/seo/schema.ts`, `src/seo/routeMeta.ts`, `src/lib/citations/claims.ts`, `src/lib/citations/registry.ts`, generated card meta
- **Evidence:** `docs/evidence-packets/2026-05-15-evt-pathway-aha-2026-PDF-VERIFIED.md` §4.7.3 + Figure 3

## The defect
The basilar EVT Class 1 / LOE A recommendation was stated on many rendered surfaces without its `baseline mRS 0 to 1` eligibility gate. Without it, a Class I recommendation reaches prestroke mRS ≥2, the population Figure 3 assigns to *insufficient data to determine*, contradicting the EVT pathway calculator on the same site.

The task turned out to contain **three distinct defects**, not one:
1. surfaces omitting the mRS gate entirely;
2. surfaces attaching Class 1 to the **trial enrolment windows** (12 h ATTENTION, 6-24 h BAOCHE) rather than the guideline's single 24 h window;
3. a Class IIa verb ("is reasonable") against a COR 1 label.

## What was corrected
The gate, the single-window framing, and the correct COR/LOE per stratum are now present on every rendered surface asserting the recommendation: the Study Mode pearls, `guideContent.ts` (two locations), `pages/guide/Thrombectomy.tsx`, `seo/routeMeta.ts`, `seo/schema.ts` (`QUESTION_META` description and JSON-LD answer, plus the `/pathways/evt` FAQ and the `lvo-evt` answer), the BAOCHE bedsidePearl and both bottomLineSummary strings, `EvtPathway.tsx` (COR 1 branch, IDD branch, NIHSS <6 fall-through, and two basilar-screen notes), and the guideline mindmap.

Additionally:
- **The COR 2b assertion had no supporting citation.** `aha-asa-2026-4.7.3-nihss-6-9` existed but was unwired; it is now on all three claims whose rendered text asserts COR 2b, plus the guideline-summary claim.
- **The temporal anchor was restored.** The source says "within 24 hours **from onset of symptoms**". Several surfaces said only "within 24 h", and in the pearls and the pathway a trial last-known-well window preceded the sentence, so the nearest antecedent anchor was LKW. LKW is earlier than onset, so an LKW reading makes patients look out-of-window and **under-treats** a condition with very high untreated mortality.
- **The sync contract was restored.** `routeMeta.ts` declares its description must stay byte-identical to `schema.ts` `QUESTION_META`; an earlier round updated one and left the other. Both now match, at exactly the 160-character ceiling.
- **Dates were corrected against commit history.** Work had been stamped 2026-07-23; git shows PFO Phase 1 on 07-23, PFO Phase 2 and the trial-library remediation on 07-27, and this work on 07-30. Two citations legitimately carry 07-30; eight others were briefly bumped forward in error and reverted to 07-27, their true review date. Filenames and the genuine 07-23 approval were left alone.

## Review history: six rounds, four of which caught a real defect in the fix itself
Recorded because it is the governing lesson.

| Round | Outcome |
|---|---|
| 1 | **block** — the mRS gate was still open on three surfaces, one of which the fix itself had desynchronised from a surface it did correct. |
| 2 | **block** — a rendered COR 2b assertion whose citation trail resolved to a COR 1 quote; and a §13.6 record certifying a closure that had not happened. |
| 3 | **block** — a false statement about a trial's own enrolment criteria (ATTENTION was said to require mRS 0-1; it permitted ≤2 under 80); and dropped onset anchors. |
| 4 | **block** — a claimed fix had landed on the wrong branch and was "verified" by counting occurrences rather than checking the location, so the miss was masked. |
| 5 | **block** — the anchor fix had added an unsupported contrast, "(not from last known well)". BAOCHE's own quoted_text says patients "presented 6 to 24 hours **after symptom onset**", so the contrast was not merely unsourced but backwards; and for an unwitnessed stroke, where onset is unknown, it removed the only defensible clock and invited treating past a defensible window. **Harm in the opposite direction from the defect being fixed.** |
| 6 | **approve-with-conditions** — contrast dropped, anchor stated positively; one condition (below). |

**Governance conclusion.** Every round that added explanatory text introduced a defect; the rounds that removed text or stated a fact plainly did not. Two rounds shipped a fix that was never applied to the intended line, in both cases because verification counted matches instead of reading the location. The mechanical gates passed throughout — they verify that a citation resolves, never that a sentence matches its source, and they cannot see an untagged surface at all.

## Condition status
- **CLEARED** — `bedsidePearlClaimId: 'baoche-posterior-evt'` added to the BAOCHE record, and `BEDSIDE_PEARL_SURFACE` declared on the claim. The claims hook immediately caught the missing surface declaration, which is the system working: that one string needed six rounds of hand review precisely because it was invisible to the hook.

## Freshness
`aha-asa-2026-4.7.3` and `aha-asa-2026-4.7.3-nihss-6-9`: `last_reviewed` 2026-07-30, `review_window_months` 3 per §13.7. `baoche-trial-2022` and `attention-trial-2022`: 2026-07-02, landmark window. §13.6 step 3 is COMPLETE as of 2026-07-30 **for the four mapped dependents**, which is the only scope the record can verify; untagged surfaces are explicitly excluded from that certification.

## Required follow-ups (tracked in TASKS.md)
- Align the BAOCHE enrolment-window anchor across the remaining trial-page mirrors to the combined "from symptom onset or last seen well" phrasing, then regenerate card meta. These are narrower-but-true statements, not contradictions, so they do not block.
- The EVT pathway offers only "0-6h / 6-24h" under a "Time from Last Known Well" label, with no onset input, while the basilar recommendation is onset-anchored. The basilar branch is time-agnostic (it reads only mRS, pc-ASPECTS and NIHSS) and LKW ≤ onset makes the gate conservative, so this cannot change the verdict, but the copy mismatch should be resolved.
- Tag the ATTENTION bedsidePearl with `bedsidePearlClaimId: 'attention-posterior-evt'` (same invisibility gap; not edited this round).
- Delete the stale gitignored worktree at `.claude/worktrees/agent-ab9d815fae22ee79d/`, which still carries pre-fix text. Per §5 rule 8 no worktrees should exist; round 4's wrong-branch failure is the precedent. **Not removed here** because the deletion was declined as a destructive operation; needs an explicit decision.
- Claim-surface tagging gap: roughly 95 recommendations in the guideline mirror carry no `claimId`, and the take-home array is a flat `string[]` with no slot for one. This is the mechanism by which a wrong recommendation sat undetected in a designated validation reference.
- Add the guideline mirror and the SEO schema file to the humanizer scanner targets.
