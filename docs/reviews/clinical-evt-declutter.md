# Clinical review — EVT pathway de-clutter (pre-execution gate)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-07
**Class:** D-clinical

## Scope
- **Claims touched:** none registered. Grep for `data-claim` / `claimId` / `claim(` across `src/pages/EvtPathway.tsx` returned zero matches. All relocated text is untagged static JSX / `PathwayLearningPearl` props.
- **Citations affected:** none. No citation `last_reviewed` field is touched by this PR. Citations referenced *in the relocated copy* (AHA/ASA 2026 §4.7.4 Rec 3/8/9; ESCAPE-MeVO 2025; DISTAL 2025; and the disclaimer trial list DAWN, DEFUSE-3, SELECT2, ESCAPE-MeVO, DISTAL, ATTENTION, BAOCHE) are mentioned inline, not edited.
- **Surfaces changed (§13.3):** Static JSX text; string literals inside components; `PathwayLearningPearl` `content` props (static and React-node). All in the same file; text moves from the Step-4 `{result && (...)}` card (1718–1783) into the eligibility drawer's `result && drawerState === 'C'` panel (1889–2004).
- **Evidence-verifier packet:** not applicable — no new trial entry, no trial-data file change.
- **Trial-statistician report:** not applicable — no statistics display change. The sICH figures in the MeVO box are pre-existing display text being moved verbatim, not new/recomputed statistics.

### Fragments in relocation scope (1718–1783)
1. **(a) MeVO/DVO Risk & Evidence box** (`isMevo` only, 1724–1743): header + three bullets — ESCAPE-MeVO (2025), DISTAL (2025) incl. "5.9% vs 2.6%", Synthesis.
2. **(b) "Decision Support Only" disclaimer** (1747–1755): the `autoLinkReactNodes` basis line + the "Clinical Context" team-discussion line.
3. **(c) Three 2026 peri-procedural pearls** (1759–1770): Anesthesia (COR 1, LOE B-R, §4.7.4 Rec 3); Adjunctive IA thrombolytic after successful EVT (COR 2b, LOE B-R, §4.7.4 Rec 8); Pre-EVT IV tirofiban not useful (COR 3: No Benefit, LOE B-R, §4.7.4 Rec 9).
4. **(d) "Clinical Context Summary" pearl** (1773–1781): Evidence / Selection / Team bullets.

## Semantic validity
**This is a pure relocation. No re-grading is performed, and none is required — explicitly stated as a finding, not an assumption.** Each fragment carries its full clinical context within itself: every recommendation-strength marker (COR 1 / COR 2b / COR 3: No Benefit), every evidence level (LOE B-R), every action verb ("may be reasonable", "is not useful", "recommended"), every certainty marker ("no functional benefit", "trend toward higher mortality"), every qualifier (mTICI 2b/2c/3; "in patients with acute ischemic stroke from LVO"; dominant M2/M3), and every temporal/trial anchor (ESCAPE-MeVO 2025, DISTAL 2025, §4.7.4 Recs) lives inside the fragment being moved.

Moving these fragments from a Step-4 card into the drawer's expanded result panel does not strip the surrounding context that gives them meaning — each pearl/box is self-contained. There is no fragment whose clinical force depends on a sibling element that is being left behind. Checked specifically for context-dependence (e.g., a bullet that only makes sense under a heading that stays in Step 4): none found. The MeVO box stays gated on `isMevo`, matching the drawer panel's existing MeVO-conditional rows, so the population gate is preserved.

**Five never-drift categories: no change, because no text changes.** Recommendation strength, action verbs, qualifiers/gates, certainty markers, and temporal constraints are all preserved by definition of byte-for-byte relocation. The post-execution review will diff the rendered strings against the preservation contract below; any character delta is a block.

**EMR note path:** `buildEmrText` (919–966) and `copySummary` (968–973) are verified present and are out of relocation scope. The new in-drawer copy button must call the existing `copySummary` (which calls `buildEmrText`) — not a reimplementation. The verdict generators (`calculateLvoProtocol` / `calculateMevoProtocol`) are likewise untouched; the drawer already renders `result.status` / `result.reason` / `result.details` / `result.exclusionReason` from that same `result` object, so the eligibility-outcome text is unaffected.

## Citation accuracy
Not re-verified line-by-line — out of scope for a relocation, and no citation record is being edited. The inline grades and trial/section references in the moved copy are not being changed, so their accuracy is held constant relative to the pre-PR state. The post-execution diff against the preservation contract is the accuracy guarantee here: if every string matches character-for-character, citation fidelity is preserved by construction. (If the implementer alters any grade, trial name, year, or section number, that is a never-drift violation and a mandatory block at post-exec.)

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
No freshness refresh is required or permitted by this PR. A UI relocation does not touch any citation's `last_reviewed`, does not author new claim text, and must not flip any review date. All cited evidence (AHA/ASA 2026, ESCAPE-MeVO 2025, DISTAL 2025) keeps whatever `last_reviewed` it currently holds in the registry. Per §13.6, a date refresh would require the full six-step checklist with dual sign-off — that is out of scope and must not happen incidentally here.

## Rationale
This is a Class D-clinical UI de-clutter that physically moves self-contained, untagged clinical text from a Step-4 result card into the eligibility drawer's expanded panel, with the EMR-note logic and verdict logic held byte-for-byte unchanged. No claim surface in scope is tagged (zero grep matches), no citation record is edited, and every fragment carries its own clinical context, so no semantic re-grading is needed and no never-drift category can be affected by a faithful move. Approving with conditions rather than unconditional approve solely because the safety of a "pure relocation" rests entirely on byte-for-byte preservation — the conditions below convert that assumption into an enforceable, diffable contract for the post-execution check. There is no clinical-safety reason to block: no fragment loses meaning out of context, and no tag would be orphaned.

## Required follow-ups
1. **Implementer must reproduce every string in the Preservation Contract below character-for-character** in the drawer panel. Any deviation in a COR/LOE grade, trial name, year, section number, or statistic is a never-drift violation and blocks at post-exec.
2. **The disclaimer basis line must keep the `autoLinkReactNodes(..., openTrial)` wrapper** so the trial names (DAWN, DEFUSE-3, SELECT2, ESCAPE-MeVO, DISTAL, ATTENTION, BAOCHE) stay auto-linked. Plain-texting that string is a regression (broken trial links) even though the words match.
3. **The new in-drawer "Copy to EMR" button must call the existing `copySummary`** (which calls `buildEmrText`). It must not reimplement note assembly. `buildEmrText` (919–966) and `copySummary` (968–973) stay byte-for-byte unchanged.
4. **The MeVO box must remain gated on `isMevo`** in its new location, so the population constraint is not silently broadened to LVO results.
5. **Confirm no `last_reviewed` date is touched** in the resulting diff. A relocation that incidentally flips a freshness date is a governance violation (§13.6) and blocks.
6. **Post-execution clinical-reviewer pass is required** (this is the pre-execution gate). The post-exec reviewer diffs the rendered drawer text against the contract below; PASS only on a clean byte-for-byte match.

### Preservation contract (byte-for-byte)
Each string below must appear verbatim in the relocated drawer panel. Strings are the human-readable text content; surrounding JSX/markup may change but the text and inline `<strong>`-emphasized substrings must be preserved exactly.

**(a) MeVO / DVO Risk & Evidence box** — render only when `isMevo`:
- Heading: `MeVO / DVO Risk & Evidence`
- Bullet 1: **`ESCAPE-MeVO (2025):`** `No functional benefit at 90d overall. Higher sICH rate and trend toward higher mortality in EVT arm.`
- Bullet 2: **`DISTAL (2025):`** `Neutral primary outcome. Higher sICH in EVT arm (5.9% vs 2.6%). Reperfusion rates were lower than typical LVO trials.`
- Bullet 3: **`Synthesis:`** `Be cautious in older patients, those with mild deficits, or baseline disability. Benefit is most plausible for dominant M2/M3 occlusions with disabling deficits.`

**(b) "Decision Support Only" disclaimer:**
- Lead: **`Decision Support Only.`**
- Basis line (must stay wrapped in `autoLinkReactNodes(..., openTrial)`): `Based on AHA/ASA Guidelines and major trials (DAWN, DEFUSE-3, SELECT2, ESCAPE-MeVO, DISTAL, ATTENTION, BAOCHE). Always verify clinical details.`
- Team line: **`Clinical Context:`** `Always discuss with Vascular Neurology and the Neurointerventional/Interventional Neurology team; local protocols and anatomy-specific factors apply.`

**(c) Three 2026 peri-procedural pearls** (`PathwayLearningPearl` title + content):
- Title: `Anesthesia choice — GA or procedural sedation`
  Content: `During EVT, either general anesthesia or procedural sedation are recommended (COR 1, LOE B-R) per AHA/ASA 2026 §4.7.4 Rec 3. Local protocol, hemodynamic stability, and airway risk drive the choice — there is no guideline preference between the two strategies in the average patient.`
- Title: `Adjunctive intra-arterial thrombolytic after successful EVT (new 2026)`
  Content: `After successful EVT (mTICI 2b/2c/3), adjunctive intra-arterial alteplase, urokinase, or tenecteplase may be reasonable to improve distal reperfusion (COR 2b, LOE B-R) — a new 2026 recommendation per §4.7.4 Rec 8. Decision should be individualized with neurointerventional team based on residual perfusion deficit and bleeding risk.`
- Title: `Pre-EVT IV tirofiban — not useful`
  Content: `Pre-EVT IV tirofiban is not useful in patients with acute ischemic stroke from LVO (COR 3: No Benefit, LOE B-R) per AHA/ASA 2026 §4.7.4 Rec 9. Do not give upstream tirofiban as a routine adjunct to thrombectomy.`

**(d) "Clinical Context Summary" pearl** (`PathwayLearningPearl` title + React-node content; preserve the three bullets and their `<strong>` labels):
- Title: `Clinical Context Summary`
- Bullet 1: **`Evidence:`** `Strong for LVO (Anterior & Basilar), evolving for MeVO / DVO.`
- Bullet 2: **`Selection:`** `Imaging guides eligibility, but clinical judgment on disability and risk drives the final call.`
- Bullet 3: **`Team:`** `Discuss with vascular neurology and neurointerventional for borderline cases.`

---

## Post-execution verification
**Decision:** PASS
**Date:** 2026-06-07
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)

Byte-for-byte diff of the Preservation Contract against the relocated drawer panel
(src/pages/EvtPathway.tsx, expanded panel lines ~1951–2011; Step-4 rail card reduced
to a one-line pointer at lines 1718–1722).

- Fragment (a) MeVO / DVO Risk & Evidence box — verbatim match: YES. Heading, all three
  bullets (ESCAPE-MeVO 2025; DISTAL 2025 incl. "5.9% vs 2.6%"; Synthesis) intact. Still
  gated on `isMevo` (line 1952) — population constraint preserved, not broadened to LVO.
- Fragment (b) "Decision Support Only" disclaimer — verbatim match: YES. autoLinkReactNodes
  wrapper present: YES (line 1980, seven-trial list DAWN/DEFUSE-3/SELECT2/ESCAPE-MeVO/
  DISTAL/ATTENTION/BAOCHE intact, trial links preserved). "Clinical Context:" team line verbatim.
- Fragment (c) three 2026 peri-procedural pearls — verbatim match: YES. Titles and content
  bodies intact, em-dashes preserved in both titles and content (clinical text, not flagged).
  All COR/LOE grades verbatim (COR 1 / COR 2b / COR 3: No Benefit; all LOE B-R) and all
  section numbers verbatim (§4.7.4 Rec 3 / 8 / 9). mTICI 2b/2c/3 qualifier intact.
- Fragment (d) Clinical Context Summary pearl — verbatim match: YES. Title + three <strong>
  bullets (Evidence / Selection / Team) intact, including literal "Anterior & Basilar" ampersand.
- copySummary / buildEmrText unchanged: YES. buildEmrText (919–966) and copySummary (968–973)
  byte-for-byte intact; in-drawer Copy button (line 1944) calls `onClick={copySummary}`
  (count = 1) — no note-assembly reimplementation.
- Each fragment count == 1: YES. Moved, not duplicated (the raw "Clinical Context Summary"
  count of 2 = one code comment + one pearl title).
- No `last_reviewed` touched: YES (zero occurrences in the file).

No character-level drift detected in any COR/LOE grade, trial name, year, section number,
or statistic. The autoLinkReactNodes wrapper was not dropped. All six pre-execution
conditions (Required follow-ups 1–6) are satisfied. PASS.
