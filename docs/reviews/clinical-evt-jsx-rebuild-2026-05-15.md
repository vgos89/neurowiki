# Clinical review — EVT JSX rebuild (pre-execution)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer
**Date:** 2026-05-15

## Scope

- **Claims touched (branch/criteriaName keys):**
  - `Basilar EVT - Prestroke mRS ≥2 (IDD)` (NEW; replaces `Basilar EVT - Baseline Function`)
  - `Late Window Very Large Core (>100 mL) — Insufficient Evidence` (NEW; replaces "Avoid EVT")
  - `Large Core (50-100 mL) - Class IIb` (REMOVED)
  - `Selected MeVO` (TIGHTENED to 0–6 h; new 6–24 h `Consult` branch)
  - `Standard Early Window - Class I`, `Late Window ASPECTS 3–5 - Class I`, `Very Large Core (ASPECTS 0–2) - Class IIa`, `Early Window mRS 2 - Class IIa`, `Early Window mRS 3-4 - Class IIb`, `Basilar EVT - Low NIHSS`, `Early Window (Low NIHSS)`, basilar Rec 2 IIb branch — all citation/LOE label refinements
  - 4 new LearningPearl claims: IVT+EVT (skip-IVT not recommended), Adjunctive IA thrombolytic post-mTICI 2b/3, Pre-EVT tirofiban Class III, GA vs procedural-sedation
- **Citations affected:** AHA/ASA 2026 §4.7.1 Rec 1+2; §4.7.2 Rec 1–8; §4.7.3 Rec 1+2; §4.7.4 Rec 3, 8, 9; Figure 3 (page e61); SELECT2 PMID 36762865 footnote; LASTE PMID 38718358; ESCAPE-MeVO; DISTAL PMID 39908430; HERMES IPDMA dominant-M2 subgroup; Salwi 2022 PMID 36147993; BAOCHE PMID 36273395; ATTENTION PMID 36239644; CHOICE 2022; RESCUE-BT 2022; ANGEL-ASPECT PMID 36762852; RESCUE-Japan LIMIT PMID 35138767; TENSION PMID 37837989; DAWN PMID 29129157; DEFUSE-3 PMID 29364767
- **Surfaces changed:** pathway algorithm interpretation function (computed strings) + branch `criteriaName`/`details`/`reason` string literals + LearningPearl static content + selection-card descriptions
- **Evidence-verifier packet:** `docs/evidence-packets/2026-05-15-evt-pathway-aha-2026-PDF-VERIFIED.md`
- **Fix manifest:** `docs/audits/2026-05-15/evt-pathway-fix-manifest.md`
- **Trial-statistician report:** not applicable

## Semantic validity

Item-by-item check of every Class E / threshold / label change in the plan against the PDF-verified dossier:

| Plan item | Dossier anchor | Match? |
|---|---|---|
| A9: "Avoid EVT if core >100 mL" → Consult + SELECT2 ≥26 mL HU caveat | §4.7.2 Rec 4 footnote page e54 verbatim — caveat language, not a numbered Class III. Figure 3 6–24 h has no ASPECTS 0–2 branch → IDD by absence | **Confirmed.** Reframe is faithful. Removal of unsourced "futile reperfusion >80%" and "hemorrhagic transformation >20%" figures is correct (not in dossier). |
| A8: Remove IIb large core 50–100 mL stratum; replace with Class I A ASPECTS 3–5 + age <80 + no mass effect | §4.7.2 Rec 3 verbatim: "…between 6 and 24 hours…age <80 years, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 3 to 5, and without significant mass effect…EVT is recommended…" Class 1, LOE A | **Confirmed.** No standalone volumetric IIb at 6–24 h exists in §4.7.2. |
| A3: Basilar prestroke mRS ≥2 → "Consult — Insufficient Data" (Figure 3 IDD) | Figure 3 page e61: basilar / PC-ASPECTS ≥6 / mRS ≥2 → **IDD**. §4.7.3 Rec 1+2 specify "baseline mRS score of 0 to 1" but guideline silent (not exclusionary) on ≥2 | **Confirmed.** Reframe is faithful. `variant: 'warning'` appropriate. |
| B7: Skip-IVT pearl | §4.7.1 synopsis page e48 verbatim: *"a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended"*; §4.7.1 Rec 1 Class 1 LOE A | **Confirmed.** |
| A13: Dominant M2 IIa tightened to 0–6 h only; ≥50% MCA territory tooltip | §4.7.2 Rec 7 verbatim: "…within 6 hours…prestroke mRS 0–1, NIHSS ≥6, ASPECTS ≥6…COR 2a LOE B-NR…benefits are uncertain." Page e56: "Dominant is defined as the M2 segment supplying 50% or more of the MCA territory. This does not refer to left/right side dominance." Figure 3: dominant M2 / >6 h → IDD | **Confirmed.** "Benefits are uncertain" clause must be preserved verbatim — see condition 2. |
| Patch 3 two-tier mRS structure (mRS 2 → IIa B-NR; mRS 3–4 → IIb B-NR; both ASPECTS ≥6 at 0–6 h) | §4.7.2 Rec 5 + Rec 6 verbatim | **Confirmed.** NOT collapsed. |
| A1 basilar Rec 2 LOE: "COR 2b" → "COR 2b B-R" | §4.7.3 Rec 2: COR 2b, LOE B-R | **Confirmed.** |
| A12 MeVO: "COR 3" → "COR 3: No Benefit · LOE A" (NOT "Harm") | §4.7.2 Rec 8: COR 3: No Benefit, LOE A | **Confirmed.** Critical never-drift category 1 preserved. |
| A15 (mRS 2 IIa) replace HERMES with Salwi 2022 + Italian Registry | §4.7.2 Rec 5 — HERMES excluded mRS ≥2 | **Confirmed.** |
| A4/A5/A6 citation corrections | Cross-verified against dossier §4.7.2 Rec 1/3/4 anchor trials | **Confirmed.** |
| B4 (GA vs procedural sedation, Class I B-R) | §4.7.4 Rec 3: COR 1 LOE B-R | **Confirmed.** |
| B5 (Adjunctive IA thrombolytic post-mTICI 2b/3, IIb B-R, new) | §4.7.4 Rec 8: COR 2b LOE B-R | **Confirmed.** |
| B6 (Pre-EVT tirofiban Class III No Benefit, B-R) | §4.7.4 Rec 9: COR 3: No Benefit, LOE B-R | **Confirmed.** |

**Never-drift category audit:**
1. **Recommendation strength** — preserved. Class III locutions distinguish "No Benefit" vs "Harm" (A12, B6).
2. **Action verbs** — preserved. "is recommended" / "is reasonable" / "might be reasonable" / "may be reasonable" / "is not recommended" each map to canonical COR.
3. **Qualifiers and gates** — preserved. Age <80 scoped to Rec 3 only. ASPECTS ≥6 constraint attached to mRS 3–4 IIb branch. Mass-effect exclusion surfaced for Rec 3 + Rec 4.
4. **Certainty markers** — preserved. "Benefits are uncertain" (A13). "Not well established" (A1).
5. **Temporal constraints** — preserved. Dominant M2 "within 6 hours" (A13). Basilar Rec 2 "within 24 hours" (A1). Skip-IVT "within 2 hours and 20 minutes" meta-analysis (B7).

## Ship-blockers addressed (A3, A8, A9, B7)

| Ship-blocker | Plan reference | Status |
|---|---|---|
| **A9** core >100 mL → soften | Plan §3 Patch 1 bullet 1 | **Addressed.** |
| **A8** Class IIb 50–100 mL stratum → retire | Plan §3 Patch 1 bullet 2 | **Addressed.** |
| **A3** Basilar mRS ≥2 "Not Eligible" → "Consult — Insufficient Data" | Plan §3 Patch 1 bullet 3 | **Addressed.** |
| **B7** Skip-IVT pearl | Plan §3 Patch 1 bullet 4 | **Addressed.** |

All 4 ship-blockers explicitly scoped in Patch 1 with `variant: 'warning'` / Consult framing matching IDD position.

## Citation accuracy

Spot-checks all resolved: AHA 2026 DOI 10.1161/STR.0000000000000513; ESCAPE-MeVO + DISTAL (PMID 39908430); SELECT2 ≥26 mL caveat (page e54); ATTENTION (PMID 36239644) + BAOCHE (PMID 36273395); HERMES dominant-M2 subgroup aOR 2.39; Figure 3 page e61 transcribed cell-by-cell. No fabricated thresholds or paraphrased class labels.

## Freshness

AHA/ASA 2026 anchor — PDF-verified 2026-05-15. Plan does NOT explicitly state `last_reviewed` will be refreshed in `src/lib/citations/registry.ts` as part of this rebuild — added as required condition 1. All subordinate trial citations within 36-month default freshness window.

## Rationale

The plan faithfully maps every Class E and Class C-clinical fix from the 24-item manifest to verbatim PDF anchors in the dossier. All four ship-blockers scoped into Patch 1. The four most patient-safety-significant transformations (A9, A8, A3, A13) preserve recommendation strength, action verbs, qualifiers, certainty markers, and temporal constraints exactly. The two-tier prestroke mRS structure correctly described and NOT collapsed. Proposal 3 provisional-verdict-pill anchoring hazard correctly parked. Class III "No Benefit" vs "Harm" distinction preserved. Plan is structurally sound for the pre-execution gate.

## Required conditions (must be met during execution)

1. **`last_reviewed` refresh per CLAUDE.md §13.6.** Before merge, refresh `last_reviewed: "2026-05-15"` on every AHA/ASA 2026 §4.7 citation record. All six §13.6 checklist steps completed (source resolves, version current, dependent claims consistent, no wording drift, newer evidence considered, dual sign-off).

2. **Verbatim caveat preservation in rebuilt `details` strings:**
   - A13: *"benefits are uncertain"* (§4.7.2 Rec 7 verbatim)
   - A1: *"not well established"* (§4.7.3 Rec 2 verbatim)
   - A3: *"insufficient data to determine"* or *"IDD"* (Figure 3 verbatim)
   - A9: SELECT2 caveat must include *"diminished treatment benefit"* + *"cerebral edema"* + *"hemicraniectomy"* (page e54 verbatim)
   - B7: *"a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended"* (§4.7.1 verbatim)

3. **Humanizer pass on all new prose.** All 4 new LearningPearl `content` strings (B7, B4, B5, B6) AND rewritten `details` strings for A3, A8, A9 pass through humanizer review before commit. Verbatim PDF clauses (per condition 2) exempt from humanizer rewriting.

4. **Claim tagging.** Every new/rewritten user-facing clinical string tagged per §13.4 (computed strings: `claim()` helper; LearningPearl content: JSX-site tag). Pre-commit hook must pass.

5. **Post-execution clinical re-review.** Per CLAUDE.md §18, Class E gating is both pre-execution AND post-execution. After implementation, second clinical-reviewer pass required to confirm rebuilt JSX strings match conditions above. The artifact for that second pass is the merge-gate artifact (this artifact is the pre-execution one).

6. **Proposal 3 stays parked.** Confirm during execution that no intermediate "partial-eligible" verdict surface is introduced through a side door (drawer header, step-strip badge, in-rail pill). Cascade-clear notice OK; anchoring partial-verdict surface NOT.

## Blocking issues

None. No drift detected in any of the five never-drift categories. No mandatory-block conditions triggered.

---

**Decision: approve-with-conditions.** Execute Patch 1 (ship-blockers) → Patch 2 → Patches 3/4/5, with conditions 1–6 enforced. A post-execution clinical-reviewer artifact will gate the merge.
