# Clinical review — PR #PLAN (lkw-window-chip), PRE-EXECUTION

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-5-5)
**Date:** 2026-11-16

## Scope
- Claims touched: `ivt-window-4.5h` (rewritten: citations and description); `ivt-window-wake-up` (NEW); `bp-ivt-threshold-185-110` (description only, C14).
- Citations affected (no registry edits): `aha-asa-2026-4.6.1`, `aha-asa-2026-4.6.2`, `aha-asa-2026-4.6.3`, `extend-trial-2019`, `wake-up-trial-2018`.
- Surfaces changed: static JSX chip, elapsed line and sentence in PatientContextPanel (NIHSS + Stroke Code Step 1); removal of Stroke Code `WindowBadge`; Step 1 gating flags and their alert, checklist and notice blocks; the NIHSS copy-export elapsed string; code comments (D1).
- Evidence-verifier packet: not applicable (no trial data). The correction summary used is `docs/evidence-packets/2026-11-16-ais-2026-guideline-correction-summary.md`.
- Trial-statistician report: not applicable.

## Ruling table

| # | Item | Ruling |
|---|---|---|
| 1 | Rule | **Approve.** standard: aMin ≤270 from last asleep. Grounds: §4.6.2 quoted_text "within 4.5 hours of symptom onset or last known well"; the last time asleep without symptoms is the LKW. extended: wMin ≤270 matches §4.6.3 Rec 1 "within 4.5 hours from symptom recognition" (waking = recognition); mMin ≤540 matches Rec 2(a) "within 9 hours from the midpoint of sleep". The Rec 2(b) clause is redundant, as the spec says, because the midpoint is never before asleepAt, so mMin ≤ aMin. Inclusive boundaries match the witnessed rule and ExtendedIVTPathway (`minutesSinceWaking <= 270`, `hoursSinceMidpoint <= 9`, L122/L334). Null on out-of-order input is accepted. **Open item (d): measuring NOW against the midpoint is the faithful reading. Approve.** Reasons: (i) the other reading ("woke within 9 h of the midpoint") is met by anyone who slept under 18 h, which would empty the criterion of meaning; (ii) it matches our Late-window pathway (L324-325, L122); (iii) it is the conservative choice, because the chip leaves the tier earlier, never later. Caveat to record: the `extend-trial-2019` quoted_text supports only "at the time the patient awoke with stroke symptoms". It does NOT define the midpoint anchor. The midpoint anchor rests on §4.6.3 Rec 2(a) plus the treatment-time convention, and the claim description must say so (C9). |
| 2 | (a) Chip for wake-up at all | **Approve. No imaging qualifier required** in the visible text or the accessible name. The chip states a time category, the same as the witnessed 4.5–9 h chip, and imaging selection belongs to the Late-window pathway, which the Step 1 cross-link points to. The claim descriptions must say the tier is imaging-gated (C8, C9). |
| 3 | (b) First proof vs corrected Rec 2 | **Approve, checked string by string.** Every label (`Within 4.5h`, `{N} min left`, `4.5–9h window`, `Extended window`, `Past wake-up windows`, `Beyond 9h`), every elapsed line and every accessible-name string in C3 names a clock or a time band only. None states a verb, strength, grade, EVT gate or eligibility. The correction changes Rec 2's population gate and verb, not its time criteria (correction summary item 13), so each string is equally true under both texts. The EVT-candidate exposure (orange chip shown to a thrombectomy candidate) is pre-existing on the witnessed chip and is logged as F3, not fixed here. |
| 4 | Labels | **Two labels for the extended tier: approve** (`4.5–9h window` witnessed, `Extended window` wake-up). "4.5–9h" would be false against the last-asleep clock in rows 4 and 5. **No separate label for the Rec-1-only state**: the chip claims neither route, and the elapsed line shows both clocks. **`Beyond 9h` for wake-up: REJECTED.** It sits beside a woke clock that can read under 9 h, and the referent of "9h" is ambiguous. Use `Past wake-up windows` (true against Rec 1 and Rec 2a; it does not claim Rec 3 is closed). **Retirements (D2): approve.** Stroke Code's `Extended window` (witnessed) becomes `4.5–9h window`; `Outside tPA window` becomes `Beyond 9h`. "Outside tPA window" names one agent and implies no IVT after 9 h, which contradicts §4.6.3 Rec 3 (4.5 to 24 h, COR 2b). The aria-label "Within 4.5 hour tPA window" is retired for the same reason. V's phrase "extended window" is kept for the wake-up label. |
| 5 | Elapsed line | Wake-up lines: **approve as written.** **Stroke Code moving to "since onset": BLOCKED as drafted** (category 5: the reference swaps from LKW to onset). **Open item (f): require `since last known well` now, on both pages and in the NIHSS copy export** (C4), because the clock is LKW. `~X.Xh` becomes `~X h Y min`: approve. |
| 6 | Claims | **Separate claim id required (architect upheld).** The two evidence bases differ, and the witnessed claim currently cites WAKE-UP, which is no evidence for witnessed time bands. New id: `ivt-window-wake-up`. `aha-asa-2026-4.6.3` **joins the witnessed claim: required.** Its first-proof quoted_text contains, word for word, "within 4.5 hours from symptom recognition", "within 9 hours from the midpoint of sleep" and "4.5–9 hours from last known well", so it supports all three time criteria. Exact entries are in C8 and C9. |
| 7(i) | NIHSS BP prompt for wake-up, standard tier | **Approve.** For a wake-up patient inside 4.5 h of last asleep, the standard window is open from the LKW. The <185/110 pre-thrombolysis target applies, and the existing conditional wording ("If thrombolysis planned…") asserts no eligibility. |
| 7(ii) | Stroke Code gating | **Option A**, with the safeguards in C10-C12. Why: under Option B a nap patient 3.5 h from last asleep sees a green `Within 4.5h` chip while the BP alert stays at the 220/120 threshold, the Step 1 completion gate waives BP control, and the disabling-symptoms checklist and eligibility check are missing. That is a chip inviting lysis with the BP safety gate removed, which is worse than having no chip. Under Option A the wake-up standard tier gets exactly the witnessed ≤4.5 h toolset. The extended tier gets exactly what wake-up gets today (both flags false). The outside tier implies aMin > 540, which is the same LKW state as witnessed >9 h. Witnessed behaviour is unchanged. |
| 7(iii) | "Wake-up / Unknown Onset" notice | **Keep the wording unchanged; restrict when it shows** (C11). DWI-FLAIR mismatch is the Rec 1 route only. The notice is false in the standard tier (no mismatch selection needed), false in the outside tier, and false in the Rec-2a-only state (row 5). |
| 7(iv) | Sticky bar still "Unknown" | **Acceptable for this change.** It is pre-existing and less informative but not contradictory in a way that leads toward treatment. Logged as P1 follow-up F1. |
| 8 | D1 / D2 | **Both belong in this change: approve.** D1's replacement comment is accurate against the p.44 extract. D2 is ruled in item 4. |
| 9 | Boundary cases | **All 12 rows verified correct** (aMin/wMin/mMin arithmetic and tiers). Additional required tests are in C15. |
| 10 | Icons / non-colour cue | **Chip text alone is a sufficient non-colour cue.** Every tier has distinct words. Icons are NOT required on either page, and dropping them on Stroke Code is acceptable. Accessible-name mechanics go to accessibility review (F5). |

## Consolidated conditions (binding on the implementer)

**C1. Classifier.** Pure function in `src/utils/ivtWindow.ts`, per the architect.
- Returns `null` / an explicit invalid result when asleepAt > wokeAt, wokeAt > now, or an input is missing. Never NaN.
- Tiers: standard if aMin ≤270; else extended if wMin ≤270 OR mMin ≤540; else outside.
- Witnessed: ≤270 standard, ≤540 extended, else outside.
- Minutes are floored and clamped at 0, the same as today.
- Also returns `rec1Open` (wMin ≤270) and `rec2aOpen` (mMin ≤540), plus aMin, wMin, mMin and minutesLeft = 270 − aMin.
- Contains no user-facing strings.
- Add a comment stating that the midpoint clock is measured to the current time (the treatment-time reading of §4.6.3 Rec 2(a)), matching ExtendedIVTPathway.

**C2. Visible chip labels (exact).**
- Witnessed: `Within 4.5h` / `{N} min left` (only when N ≤30, standard tier) / `4.5–9h window` / `Beyond 9h`.
- Wake-up: `Within 4.5h` / `{N} min left` (counted from last asleep) / `Extended window` / `Past wake-up windows`.
- Use an en-dash in `4.5–9h`. No em-dash anywhere.
- Colours: emerald / amber / orange / rose. No countdown in the extended tier.

**C3. Accessible names (exact, if any are used).**
- Standard: `Within 4.5 hours of last known well`
- Countdown: `{N} minutes left in the 4.5 hour window`
- Witnessed extended: `4.5 to 9 hours from last known well`
- Witnessed outside: `More than 9 hours from last known well`
- Wake-up extended: `Within 4.5 hours of waking or 9 hours of the sleep midpoint`
- Wake-up outside: `More than 4.5 hours since waking and more than 9 hours since the sleep midpoint`
- No accessible name may contain "tPA", "eligible", "candidate", "recommended" or any grade.

**C4. Elapsed lines (exact).**
- Witnessed, both pages: `~{elapsed} since last known well`
- Wake-up, standard tier: `~{a} since last asleep`
- Wake-up, extended or outside tier: `~{w} since woke · ~{m} since sleep midpoint`
- Formatter: `{h} h {m} min` / `{m} min`.
- Change the NIHSS copy export (`src/pages/NihssCalculator.tsx` ~L775) from `since onset` to `since last known well` in the same change, so the panel and the export match.
- The `~X.Xh since LKW` sibling line on Stroke Code is removed.

**C5. Sentence.** Keep `Wake-up or unknown onset, so time since onset is not shown.` verbatim. Show it only when `lkw === null && !wakeUp`. Wake-up entries get the chip and line in the same slot, directly under the Last known well row.

**C6. Tagging.** The claims scanner matches only literal `data-claim="…"` attributes (`scripts/check-claims.ts` L69).
- Witnessed chip container: literal `data-claim="ivt-window-4.5h"`.
- Wake-up chip container: literal `data-claim="ivt-window-wake-up"`.
- Use two literal JSX branches. A dynamic expression is not allowed.
- Both pages render the same tagged element from PatientContextPanel. The Stroke Code badge is deleted, not re-tagged.

**C7. Retirements (D2).** Delete `WindowBadge`. The strings `Extended window` (witnessed context), `Outside tPA window`, `Within 4.5 hour tPA window` and `Only {N} minutes left in tPA window` must not ship anywhere.

**C8. Claim `ivt-window-4.5h` (replace the entry; keep `surfaces`).**
- `citation_ids: ['extend-trial-2019', 'aha-asa-2026-4.6.1', 'aha-asa-2026-4.6.2', 'aha-asa-2026-4.6.3']` (WAKE-UP moves to C9).
- `description`: `IV thrombolysis time-window chip for a witnessed last known well, on the patient panel (NIHSS calculator and Stroke Code step 1). States a time category only; never eligibility, imaging selection, grade or recommendation strength. Within 4.5h when ≤4.5 h from last known well, with a minutes-left countdown in the final 30 min (AHA/ASA 2026 §4.6.1, §4.6.2); 4.5–9h window when >4.5 and ≤9 h from last known well, a perfusion-imaging-selected band (§4.6.3 Rec 2b, EXTEND); Beyond 9h otherwise, which does not mean no IV thrombolysis route remains (§4.6.3 Rec 3 runs to 24 h for selected LVO patients). Elapsed line reads "since last known well". Time criteria verified against the held first proof; the published correction (Stroke 2026;57(8):e461-e467) changes Rec 2's population gate and verb only, not its time criteria.`

**C9. Claim `ivt-window-wake-up` (new).**
- `surfaces: [{ type: 'jsx', attribute: 'data-claim' }]`
- `citation_ids: ['wake-up-trial-2018', 'extend-trial-2019', 'aha-asa-2026-4.6.1', 'aha-asa-2026-4.6.2', 'aha-asa-2026-4.6.3']`
- `description`: `IV thrombolysis time-window chip for a wake-up entry (asleep and woke times entered), on the patient panel (NIHSS calculator and Stroke Code step 1). States a time category only; never eligibility, imaging selection, grade or recommendation strength. Within 4.5h when ≤4.5 h from last asleep, taken as the last known well (AHA/ASA 2026 §4.6.1, §4.6.2), with a minutes-left countdown in the final 30 min; Extended window when ≤4.5 h from waking with symptoms (§4.6.3 Rec 1, WAKE-UP; MRI DWI-FLAIR selected) or ≤9 h from the sleep midpoint measured to the current time (§4.6.3 Rec 2a, EXTEND; perfusion selected); Past wake-up windows otherwise. The midpoint anchor rests on §4.6.3 Rec 2a, not on the EXTEND quoted_text. Time criteria verified against the held first proof; the published correction (Stroke 2026;57(8):e461-e467) changes Rec 2's population gate and verb only, not its time criteria.`
- Bind in the same change: the claims.ts entry plus the literal JSX tag. Registry records already exist, so no registry edit.

**C10. Stroke Code gating (Option A).**
- Derive `withinTPAWindow = tier === 'standard'` and `outsideThromboWindow = tier === 'outside'` from the classifier, for witnessed and wake-up entries alike.
- Introduce `trulyUnknownOnset = lkw === null && !wakeUp`, and replace `lkwUnknown` with it in exactly three places:
  - the `&& !lkwUnknown` in `showDisablingSymptomsChecklist`
  - the `|| lkwUnknown` BP-control waiver in `isComplete`
  - the Step 1 notice trigger (C11)
- Do NOT change what `onComplete` / Step1Data carries (`lkwHours`, `lkwUnknown`, `lkwTimestamp`), so Step 2, Step 3, the sticky bar and the eligibility modal behave as they do today (F1, F2).

**C11. Step 1 "Wake-up / Unknown Onset" notice.** Text is unchanged. Show it only when `trulyUnknownOnset || (wakeUp && tier === 'extended' && rec1Open)`.

**C12. Step 1 "Extended-Window IVT" cross-link.**
- Witnessed: unchanged.
- Wake-up entries: hidden in the standard tier; shown in the extended and outside tiers with today's text unchanged. Rewording for wake-up is F4.
- Truly unknown onset: unchanged.

**C13. Comments (D1).**
- Replace PatientContextPanel ~L407-414 with the spec's D1 text verbatim.
- Update the ~L515-518 render comment and the ~L199 prop doc so they no longer say "time since onset" or "red >9h = outside the window". Describe the witnessed and wake-up tiers instead.

**C14. `bp-ivt-threshold-185-110`.** Add one sentence to its description: `For a wake-up entry, the standard window is measured from last asleep (the last known well).` No change to its citations or wording.

**C15. Tests (in `ivtWindow.test.ts` plus Step 1 tests).** The 12 spec rows and the 4 witnessed regressions, plus:
- (13) Rec 2a-only with aMin ≤540: asleep 01:00, woke 03:00, now 09:30 gives 510/390/450, extended.
- (14) wokeAt > now gives null.
- (15) asleepAt === wokeAt: 10:00/10:00, now 14:30 gives standard, N=0.
- (16) sub-minute flooring: 270 min 59 s gives standard. Midpoint with an odd minute (asleep 22:00, woke 06:01, now 11:00:59) is asserted and documented.
- (17) missing wokeAt or asleepAt gives null.
- (18) Step 1: wake-up standard tier with BP 200/115 makes `bpTooHigh` true and makes `isComplete` require `bpControlled`.
- (19) Step 1: wake-up standard tier with NIHSS 3 shows the disabling-symptoms checklist.
- (20) Step 1: wake-up outside tier gives `weightRequired` false, identical to witnessed >9 h.
- (21) Notice visibility for rows 1 (hidden), 3 (shown), 5 (hidden), 6 (hidden), and truly unknown (shown).
- (22) Stroke Code and NIHSS render identical chip text for the same inputs.

**C16. Freshness precondition (hard, so the hook does not block mid-change).** Mapped citations lapse on these dates:
- `aha-asa-2026-4.6.2` (last reviewed 2026-05-19, 6-month window): **2026-11-19**
- `aha-asa-2026-4.6.1` (2026-05-23): **2026-11-23**
- `aha-asa-2026-4.6.3` (2026-09-01, 3-month window): **2026-12-01**

Ship before 2026-11-19. Otherwise complete the full six-step §13.6 refresh first; flipping the date alone is not allowed. Any refresh of 4.6.2 or 4.6.3 must be done against the corrected final text (TASKS L4/P1 items at L269-270).

**C17. Post-execution gate.** A post-execution §17.2 artifact against the actual diff is required before `/pr-ready`. This pre-execution approval does not satisfy it.

## Semantic validity
- Every chip clause maps to verbatim first-proof text: §4.6.2 "within 4.5 hours of symptom onset or last known well"; §4.6.3 Rec 1 "within 4.5 hours from symptom recognition"; Rec 2(a) "within 9 hours from the midpoint of sleep"; Rec 2(b) "4.5–9 hours from last known well".
- No string carries a recommendation strength, action verb, certainty marker or eligibility gate, so never-drift categories 1-4 are not engaged.
- Category 5 (temporal reference) is engaged twice: by the Stroke Code "since onset" change (rejected, C4) and by `Beyond 9h` beside a woke clock (replaced, C2).
- Synthesis across WAKE-UP, EXTEND, §4.6.1, §4.6.2 and §4.6.3 has no conflict on any time criterion. The split claims stop WAKE-UP being cited for witnessed bands.

## Citation accuracy
- `aha-asa-2026-4.6.3` quoted_text matches the p.44 reading-order extract word for word for Recs 1-3 (first proof).
- `aha-asa-2026-4.6.2` quoted_text supports the 4.5 h / LKW wording. Its alteplase wording predates the 90 mg cap correction; that does not affect this claim.
- `aha-asa-2026-4.6.1` supports "within 4.5 hours of symptom onset". TASKS L550 flags this record as self-referential and unverified beyond one row; this claim relies only on the 4.5 h phrase, which §4.6.2 also carries.
- `extend-trial-2019` supports 4.5–9 h and the wake-up enrolment, not the midpoint anchor (stated in C9).
- `wake-up-trial-2018` supports unknown onset with DWI-FLAIR selection; it states no time criterion.

## Editorial / expert context
Not applicable: no new trial entry in this PR.

## Freshness
- `extend-trial-2019`, `wake-up-trial-2018`: last reviewed 2026-06-10, 36-month window. Pass.
- `aha-asa-2026-4.6.1`: lapses 2026-11-23. Pass today; see C16.
- `aha-asa-2026-4.6.2`: lapses 2026-11-19. Pass today; see C16.
- `aha-asa-2026-4.6.3`: lapses 2026-12-01. Pass today; must be refreshed against the corrected text (C16).

## Rationale
The time rule is a faithful, conservative reading of §4.6.2 and §4.6.3 Recs 1 and 2(a), and it matches the Late-window pathway's existing arithmetic. Every displayed string is a clock or a time band, so it stays true under both the first-proof and the corrected Rec 2.

Two of the spec's proposals fail category 5 and are corrected here: the move to "since onset" on Stroke Code, and `Beyond 9h` beside a woke clock.

The larger risk sits outside the chip. Showing `Within 4.5h` for a wake-up patient while Step 1 keeps "unknown" gating would remove the 185/110 BP gate exactly where the chip invites treatment. So gating follows the tier (Option A), the BP-control waiver and checklist suppression are limited to truly unknown onset, and the DWI-FLAIR notice shows only while the Rec 1 route is open.

The separate claim id keeps the two evidence bases apart.

## Required follow-ups
- **F1 (P1)** — Sticky context bar (`StrokeBasicsWorkflowV2.tsx` L480-484) shows "Unknown" for wake-up entries. Step 1 Data still reports `lkwUnknown`/`lkwHours = 0` for wake-up, which Step 2's `> 9` logic, Step 3's summary and copy, and `StrokeCardGrid` read. Converge these on the classifier (architect follow-up 1).
- **F2 (P2)** — The eligibility modal gets `lkwDate` null for wake-up entries. Decide whether it should receive the last-asleep clock in the standard tier.
- **F3 (P1, with the 4.6.3 Rec 2 correction task)** — The corrected Rec 2 excludes EVT-eligible patients. Consider an EVT-gate note next to the extended-tier chip, for witnessed and wake-up entries alike.
- **F4 (P1, medical-scientist)** — Reword the Step 1 "Extended-Window IVT" cross-link text for wake-up entries. Today's "may qualify … using DWI-FLAIR mismatch criteria" is false in the outside tier and incomplete when only Rec 2(a) is open.
- **F5 (accessibility review)** — `aria-label` on a span with no role is not reliably announced. Choose visually hidden text or rely on the visible text. The wording must match C3 exactly.
- **F6** — `ExtendedIVTPathway` uses `< 4.5` where the chip uses `≤ 4.5` at exactly 4.5 h. This is a clinical question for a separate change (architect follow-up 1/7).
- **F7** — Re-verify all §4.6.x quoted_text against the final published PDF, and replace the first proof in the CLAUDE.md §13.9 register.

---

## Orchestrator disposition (2026-11-16)

- This is the pre-execution gate only. Condition C17 stands: a post-execution review of the actual diff is filed separately before the change ships.
- Where this artifact and `docs/2026_11_16/spec-lkw-window-chip.md` differ, this artifact governs (CLAUDE.md §4: clinical safety outranks spec). The differences are: the elapsed line reads "since last known well" on both pages (C4), the wake-up outside-tier label is `Past wake-up windows` (C2), the wake-up chip carries its own claim id `ivt-window-wake-up` (C6, C9), and Stroke Code gating follows the tier with the three `trulyUnknownOnset` substitutions (C10 to C12).
- Follow-ups F1 to F7 are logged in TASKS.md.
