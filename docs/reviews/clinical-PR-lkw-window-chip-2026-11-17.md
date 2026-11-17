# Clinical review: PR #lkw-window-chip, POST-EXECUTION (condition C17)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-5-5)
**Date:** 2026-11-17

## Scope
- Claims touched: `ivt-window-4.5h` (citations and description replaced), `ivt-window-wake-up` (new), `bp-ivt-threshold-185-110` (one sentence added to the description).
- Citations affected (no registry edits): `aha-asa-2026-4.6.1`, `aha-asa-2026-4.6.2`, `aha-asa-2026-4.6.3`, `extend-trial-2019`, `wake-up-trial-2018`. `aha-asa-ivt-bp-threshold` is also mapped to `bp-ivt-threshold-185-110` but was not changed.
- Surfaces changed:
  - static JSX chip, elapsed line and unknown-onset sentence in PatientContextPanel, rendered on NIHSS and Stroke Code Step 1
  - wake-up value display in the Last known well row
  - Stroke Code `WindowBadge` and the "~X.Xh since LKW" line deleted
  - Step 1 gating flags (BP threshold, BP-control waiver, disabling-symptoms checklist, DAPT path, weight requirement, eligibility CTA, wake-up notice, Extended-Window IVT card), now taken from `step1Gating.ts`
  - the NIHSS copy-export elapsed string
  - code comments (D1)
- Evidence-verifier packet: not applicable (no trial data). Correction summary used: `docs/evidence-packets/2026-11-16-ais-2026-guideline-correction-summary.md`.
- Trial-statistician report: not applicable.
- Reviewed against: `docs/reviews/DIFF-lkw-window-chip-2026-11-17.patch`. I spot-checked the on-disk files (`src/utils/ivtWindow.ts`, `src/components/article/stroke/step1Gating.ts`, `src/components/shared/PatientContextPanel.tsx` L412-684, `src/components/article/stroke/CodeModeStep1.tsx` L74-191, L308-349, L480-549, `src/lib/citations/claims.ts` L1501-1513, `src/pages/NihssCalculator.tsx` L704-776). They match the patch.

## Conditions check (pre-execution C1 to C15)

| # | Condition | Status | Evidence relied on |
|---|---|---|---|
| C1 | Pure classifier: null on invalid input, never NaN, tier rule, witnessed rule, floored and clamped minutes, rec1Open/rec2aOpen/aMin/wMin/mMin/minutesLeft, no strings, comment on the midpoint clock | Met | `ivtWindow.ts`: `validTime()` uses `Number.isFinite(d.getTime())`; `if (a > w) return null; if (w > n) return null;`; `aMin <= STANDARD_MIN ? 'standard' : rec1Open \|\| rec2aOpen ? 'extended' : 'outside'`; `wholeMinutes = Math.max(0, Math.floor(ms / MS_PER_MIN))`; header comment "C1: the midpoint clock is measured to the CURRENT time ... matches ExtendedIVTPathway". No string literals are rendered. |
| C2 | Exact visible labels, en-dash, colours, no countdown in the extended tier | Met | PatientContextPanel L569-575 (`'Within 4.5h'`, `` `${ivt.minutesLeft} min left` ``, `'4.5–9h window'`, `'Beyond 9h'`) and L598-604 (`'Extended window'`, `'Past wake-up windows'`). `lastHalfHour: tier === 'standard' && minutesLeft <= 30`. Colours are CHIP_EMERALD/AMBER/ORANGE/ROSE. U+2013 in `4.5–9h`. No em-dash in any rendered string. |
| C3 | Accessible names, if used | Met (none used) | No `aria-label` on either chip. The visible text is the accessible text, which item 10 / F5 permits. No accessible name contains "tPA", "eligible", "candidate", "recommended" or a grade. |
| C4 | Elapsed lines; NIHSS export; sibling line removed | Met | L577 `since last known well`; L607 `since last asleep`; L610-611 `since woke ·` + `{' '}` + `since sleep midpoint`. `formatElapsed` gives `{h} h {m} min` / `{m} min`. NihssCalculator L776 `since last known well`. The CodeModeStep1 `~{lkwHours.toFixed(1)}h since LKW` line is deleted (patch L153-161). |
| C5 | Sentence verbatim; shown only when lkw null and no wakeUp | Met | L616-619: `windowChip && values.lkw === null && !values.wakeUp`, text unchanged. Note that `windowChip` now includes Stroke Code (see D-g). |
| C6 | Literal `data-claim` in two branches; Stroke Code badge deleted | Met | L553 `data-claim="ivt-window-4.5h"`, L582 `data-claim="ivt-window-wake-up"`, both literal. `WindowBadge` is removed and no longer found in `src/`. |
| C7 | Retired strings gone | Met | No match in `src/` for `Outside tPA window`, `Within 4.5 hour tPA window`, `minutes left in tPA window`, `WindowBadge` or `h since LKW`. The only `Extended window` in the chip code is the wake-up branch (L603). Other matches (EvtPathway, IvTpa guide, pearls, seo/schema) are unrelated surfaces this diff does not touch. |
| C8 | `ivt-window-4.5h` citations and description | Met (with D-d) | claims.ts L1505 citation order matches exactly. Description matches C8 character for character except `Rec 2's` written as `Rec 2` (D-d). |
| C9 | `ivt-window-wake-up` new entry | Met (with D-d) | L1509-1513: surfaces, citation_ids (order exact) and description match C9 except the same apostrophe. The literal JSX tag ships in the same change. |
| C10 | Option A gating; `trulyUnknownOnset` in exactly three places; onComplete unchanged | Met (with D-a, D-c) | `step1Gating.ts`: `withinTPAWindow = ivtWindow?.tier === 'standard'`, `outsideThromboWindow = ivtWindow?.tier === 'outside'`. `trulyUnknownOnset` is used in the checklist (`&& !trulyUnknownOnset`), in `bpControlWaived` (CodeModeStep1 L165) and in `showWakeUpNotice`. `handleComplete` L176-191 still sends `lkwHours`, `lkwUnknown` and `lkwTimestamp` derived as before. |
| C11 | Notice shown only on `trulyUnknownOnset \|\| (wakeUp && extended && rec1Open)`, text unchanged | Met | `showWakeUpNotice = trulyUnknownOnset \|\| (ivtWindow?.kind === 'wake-up' && ivtWindow.tier === 'extended' && ivtWindow.rec1Open)`; CodeModeStep1 L313-321, text unchanged. |
| C12 | Extended-Window IVT card: witnessed unchanged; wake-up hidden in standard, shown in extended and outside; unknown unchanged | Met, except the sub-minute witnessed shift (D-b) | `showExtendedIvtLink = lkwEntered && (trulyUnknownOnset \|\| (ivtWindow != null && ivtWindow.tier !== 'standard'))`. Card text L490-494 is unchanged. |
| C13 | D1 comment verbatim; render comment and prop doc updated | Met | L425-428 carries the spec D1 text verbatim, plus one neutral sentence ("Recomputed each render..."). The render comment (L541-550) and the `showThrombolysisTiming` / `showWindowChip` prop docs no longer say "time since onset" or "red >9h = outside the window". |
| C14 | One sentence appended to `bp-ivt-threshold-185-110` | Met | claims.ts patch L481 ends `For a wake-up entry, the standard window is measured from last asleep (the last known well).` Citations unchanged. |
| C15 | Tests: 12 rows, 4 witnessed regressions, items 13-22 | Met | `ivtWindow.test.ts` has rows 1-12, regressions 270/271/540/541 plus future-LKW clamp and invalid Date, and items 13, 14, 15, 16a, 16b, 17. `step1Gating.test.ts` has items 18, 19, 20 and 21 (rows 1/3/5/6 plus truly unknown). `patientContextPanel.windowChip.test.tsx` compares `timing` and `chip` modes on the same inputs (item 22). |

## Deviation rulings

| # | Deviation | Ruling | Reason |
|---|---|---|---|
| D-a | `trulyUnknownOnset = lkw === null && (!wakeUp \|\| ivtWindow === null)` | **Accept** | It only widens for a wake-up entry the classifier rejects (out-of-order or future times). Such an entry gets no chip, so the safe default is the unknown-onset toolset that every wake-up entry got before this change: 220/120 threshold with the waiver as today, no checklist, notice and card shown. The alternative would be neither a chip nor the unknown-onset safeguards, which is worse. Residual: on the panel this entry shows the asleep/woke lines with no chip and no sentence (C5 is literal on `!wakeUp`). It asserts no time category, so it is acceptable. Logged as follow-up R4. |
| D-b | Witnessed card on `tier !== 'standard'` (floored >270 min) instead of `lkwHours > 4.5` | **Accept** | The shift is under one minute. Input precision is one minute (the picker), so sub-minute timing carries no clinical information. Keeping the card and chip on one clock removes a state where the chip says "0 min left" and the card says "past the standard 4.5h window" at the same moment, which was a contradiction. Flooring was approved in C1 and is asserted in C15 item 16. |
| D-c | Stroke Code `withinTPAWindow` / `outsideThromboWindow` on floored minutes | **Accept** | Same basis as D-b. The 185/110 gate persists up to 59 s longer, which is the safer direction. DAPT path, checklist and eligibility CTA persist up to 59 s past 4 h 30 min, inside the one-minute resolution of the entered LKW. The weight requirement persists up to 59 s past 9 h, which is the safer direction. The 4.5 h endpoint is preserved at the precision the data carries, so this is not a category-5 drift. |
| D-d | `Rec 2 population gate` for `Rec 2's population gate` in the C8/C9 descriptions | **Accept** | I compared both descriptions against C8 and C9 word by word. The only difference is the missing possessive apostrophe, in both entries. Citation arrays and order match exactly. Meaning is unchanged. These are registry descriptions, not rendered text. |
| D-e | Wake-up LKW value as two lines, `Asleep {time}` / `Woke {time}` | **Accept** | Both times are still shown, each labelled with its own event, under the "Last known well" label. The asleep time is the LKW, so the reading is faithful. The aria-label still carries the full `Wake-up: asleep ..., woke ...` sentence (`lkwDisplay`, L412-419, unchanged). The value is a data display, not a claim. |
| D-f | Chip before the elapsed line | **Accept** | Order is a layout change. Strings are exactly C2/C4. The rendered text content of the wake-up extended/outside line is `~{w} since woke · ~{m} since sleep midpoint` (test (b) asserts `~1 h 0 min since woke · ~4 h 30 min since sleep midpoint`). No aria-label is used, consistent with item 10 / F5. The live region is recomputed per render, not on a timer, so it does not announce repeatedly. |
| D-g | Unknown-onset sentence now also on Stroke Code, "time since onset" beside "since last known well" elsewhere | **Accept as shipped** | It follows from C5 plus the shared panel. The sentence states that no clock is shown, which is true. It makes no time-window claim and no temporal comparison, so no never-drift category is engaged. The state really is "wake-up (times not entered) or unknown onset", so "onset" is accurate here, as the spec item 4 reasoning holds. The wording mismatch is editorial. Optional alignment logged as follow-up R3. |
| D-h | Empty "Still needed: " label when the BP-control checkbox is the only missing item | **Accept with P1 follow-up (R1)** | The safety gate holds: `isComplete` requires `bpControlled` (L165), and the red "BP Above tPA Limit" card with the checkbox renders directly above as `role="alert"`. The defect is a blank prompt, not a wrong one. It predates this change for witnessed in-window patients, and wake-up standard-tier patients now correctly join that population. It is not in a never-drift category. Because the gate it explains is the BP safety gate at the moment the chip reads green, I want it fixed promptly, not parked. The exact one-line fix is in R1. |

## Semantic validity

**Witnessed chip (`ivt-window-4.5h`)**
- `Within 4.5h` up to 270 min and `4.5–9h window` up to 540 min map to §4.6.1/§4.6.2 "within 4.5 hours of symptom onset or last known well" and to §4.6.3 Rec 2(b) "4.5–9 hours from last known well".
- `Beyond 9h` is a factual band. It does not say "outside" or "no IVT", so it is consistent with §4.6.3 Rec 3 (to 24 h).
- The elapsed line "since last known well" names the right clock. This fixes the category-5 drift ("since onset") on both pages and in the NIHSS export.

**Wake-up chip (`ivt-window-wake-up`)**
- Standard tier counts from last asleep, which is the LKW. Extended tier is wMin ≤270, matching Rec 1 "within 4.5 hours from symptom recognition", or mMin ≤540, matching Rec 2(a) "within 9 hours from the midpoint of sleep", measured to now. Outside is everything else, labelled `Past wake-up windows`.
- The observed values are arithmetically right: asleep 430 / woke 70 gives a midpoint 250 min ago = "~4 h 10 min since sleep midpoint"; asleep 675 / woke 555 gives wMin 555 and mMin 615, so outside.

**Arithmetic checks (C15 item 16)**
- 16b: span 22:00 to 06:01 = 481 min, so the midpoint is 02:00:30. At 11:00:59, now minus midpoint = 540 min 29 s, floored to 540 (extended). aMin = 780 min 59 s, floored to 780. wMin = 299 min 59 s, floored to 299. All three match the test.
- The half-minute midpoint is carried in milliseconds and floored once, so there is no double rounding.
- Every invalid path returns null before any arithmetic: a NaN Date fails `Number.isFinite`; missing, out-of-order or future-woke input is rejected.
- Every returned number comes from finite getTime() differences through floor and max, so NaN is impossible. A future witnessed LKW clamps to 0 (standard), as before.
- Elapsed values are wall-clock millisecond differences, so DST changes do not distort them.

**Never-drift sweep of every rendered string in the diff**
- Strings checked: chip labels, three elapsed-line forms, the sentence, the copy-export line, and the unchanged BP note texts.
- None states eligibility, a recommendation strength, a grade, an action verb or a certainty marker.
- No new string names a single agent. The only "tPA" strings on these surfaces ("BP above tPA/TNK threshold...", "BP Above tPA Limit", "Check tPA Eligibility") predate this change and are untouched.
- Categories 1 to 4 are not engaged. Category 5 is preserved: every clock is named by its true anchor, and all endpoints are inclusive per C1.

**Gating (Option A)**
- Wake-up standard tier: 185/110 gate, BP-control requirement and disabling-symptoms checklist (tests 18, 19).
- Extended tier: neither flag (test "extended tier gets neither...").
- Outside tier: same as witnessed >9 h (test 20).
- Witnessed behaviour: unchanged apart from the sub-minute D-b/D-c alignment.
- No path shows a green chip while the 185/110 gate is off.

## Citation accuracy
- `aha-asa-2026-4.6.3`: quoted_text (registry L738) contains, verbatim, "within 4.5 hours from symptom recognition", "within 9 hours from the midpoint of sleep" and "4.5–9 hours from last known well". It supports every non-standard tier on both claims. First-proof text; time criteria are unaffected by the published correction (Stroke 2026;57(8):e461-e467), per the correction summary.
- `aha-asa-2026-4.6.2`: quoted_text "within 4.5 hours of symptom onset or last known well" supports the standard tier. Its dose wording predates the 90 mg cap correction, which does not bear on this claim.
- `aha-asa-2026-4.6.1`: supports the 4.5 h phrase only. TASKS L550 still flags this record as self-referential. This claim does not rely on it alone.
- `extend-trial-2019`: quoted_text supports "between 4.5 and 9.0 hours after stroke onset or at the time the patient awoke with stroke symptoms". It does not support the midpoint anchor. The C9 description says so explicitly ("The midpoint anchor rests on §4.6.3 Rec 2a, not on the EXTEND quoted_text").
- `wake-up-trial-2018`: supports unknown onset with DWI-FLAIR selection. It is now mapped only to the wake-up claim, which removes the earlier mis-citation on witnessed bands.
- Synthesis: no conflict across the five sources on any time criterion. Every qualifier is preserved in the descriptions: imaging selection, EVT gate deferred to F3, and Rec 3 not closed by `Beyond 9h`.
- Incidental, outside this diff: `bp-ivt-threshold-185-110` also maps to `aha-asa-ivt-bp-threshold`, the superseded 2019 guideline (Table 5). CLAUDE.md §13.9 says claims citing it should be re-pointed to the 2026 guideline. This PR changed only that claim's description, not its citations or rendered text, so this is not grounds to block. Logged as R5.

## Editorial / expert context
Not applicable: no new trial entry in this PR.

## Freshness (as of 2026-11-17)
- `extend-trial-2019`: last reviewed 2026-06-10, 36-month window, lapses 2029-06-10. Pass.
- `wake-up-trial-2018`: last reviewed 2026-06-10, 36-month window, lapses 2029-06-10. Pass.
- `aha-asa-2026-4.6.1`: last reviewed 2026-05-23, 6-month window, lapses **2026-11-23**. Pass today.
- `aha-asa-2026-4.6.2`: last reviewed 2026-05-19, 6-month window, lapses **2026-11-19**. Pass today, with two days of margin. This drives Condition 1.
- `aha-asa-2026-4.6.3`: last reviewed 2026-09-01, 3-month override, lapses **2026-12-01**. Pass today. The refresh must be done against the corrected final text.
- `aha-asa-ivt-bp-threshold` (mapped to the touched `bp-ivt-threshold-185-110`): last reviewed 2026-05-27, 36-month window. Pass on freshness; see R5 on currency.

## Rationale
The diff does what the pre-execution gate required. One pure classifier drives the chip on both pages and the Stroke Code gates, so the chip and the BP safety gate cannot disagree. A wake-up patient inside 4.5 h of last asleep now gets the full standard-window toolset, including the 185/110 gate, instead of a green chip with the gate removed.

Every rendered string is a clock or a time band anchored to its true reference. The "since onset" drift is corrected everywhere, including the copy export. The retired single-agent and "outside window" labels are gone. The two claims keep the WAKE-UP and EXTEND evidence bases apart, with descriptions that match my conditions word for word apart from one apostrophe.

The eight deviations are either sub-minute alignments made at the input's own precision, conservative fallbacks, or layout changes that leave the clinical text untouched. None engages a never-drift category, and no mandatory-block condition is met:
- no drift
- no smoothed-over conflict
- all sources resolve
- quoted_text supports each claim as written
- this artifact satisfies C17
- no `last_reviewed` refresh in the diff
- no trial-statistics change
- no new trial entry

The one live risk is calendar, not content. `aha-asa-2026-4.6.2` lapses in two days, after which the hook blocks and a date flip is forbidden.

## Required follow-ups

**Conditions (must be met before merge)**

1. **Ship-by date.** Commit and push this change on or before 2026-11-18, with this artifact committed alongside. If the commit slips to 2026-11-19 or later, do not merge until `aha-asa-2026-4.6.2` has had the full six-step §13.6 refresh against the corrected final 2026 text, with dual sign-off. Do not change `last_reviewed` alone.
2. **Scope freeze.** This approval covers the patch as reviewed. Any further edit to `src/utils/ivtWindow.ts`, `src/components/article/stroke/step1Gating.ts`, the chip, sentence or BP-note blocks of `src/components/shared/PatientContextPanel.tsx`, the gating or CTA blocks of `src/components/article/stroke/CodeModeStep1.tsx`, or the three claims.ts entries before commit needs a fresh review. The working-copy file `docs/reviews/DIFF-lkw-window-chip-2026-11-17.patch` is review input and does not need to ship.

**Follow-ups (log in TASKS.md; do not block this merge)**

- **R1 (P1, D-h).** In `src/components/article/stroke/CodeModeStep1.tsx`, after `if (weightValue <= 0 && weightRequired) missingFields.push('Weight');`, add exactly:
  `if (bpTooHigh && !bpControlled && !gating.bpControlWaived) missingFields.push('BP control');`
  This makes the button read "Still needed: BP control" instead of an empty list. It mirrors the `isComplete` clause and adds no clinical claim.
- **R2 (P1, reaffirms F4).** The Extended-Window IVT card text for wake-up entries ("LKW unknown: if patient woke with symptoms, they may qualify for thrombolysis using DWI-FLAIR mismatch criteria.") now sits beside the `Past wake-up windows` chip in the outside tier. Reword it under medical-scientist ownership, together with the Rec 2 correction work.
- **R3 (P2, D-g, optional).** For vocabulary consistency, consider `Wake-up or unknown onset, so time since last known well is not shown.` This is a clinical-copy change, so it needs medical-scientist authorship and review. Not required.
- **R4 (P2, D-a).** On the panel, a wake-up entry the classifier rejects shows neither chip nor sentence. Consider validation in the picker or a neutral "Check asleep and woke times" line. The picker currently prevents this state.
- **R5 (P1).** Re-point `bp-ivt-threshold-185-110` from `aha-asa-ivt-bp-threshold` (2019, superseded per CLAUDE.md §13.9) to the 2026 guideline BP-before-IVT recommendation (§4.3, which the Stroke Code card already cites), with verbatim quoted_text from the held PDF.
- **R6 (P1, observed outside this diff).** Two pre-existing texts describe 3 to 4.5 h treatment with the ECASS III exclusions (age >80, NIHSS >25, anticoagulation, prior stroke plus diabetes): `src/seo/schema.ts` L330 says "Extended window is 3–4.5 hours with additional exclusions", and `src/data/strokeClinicalPearls.ts` L158 says the same. Have medical-scientist check both against the 2026 guideline.
- F1, F2, F3, F5, F6 and F7 from the pre-execution artifact remain open and unchanged.
- C16 refreshes: `aha-asa-2026-4.6.1` by 2026-11-23 and `aha-asa-2026-4.6.3` by 2026-12-01, both against the corrected final text.

---

## Orchestrator disposition (2026-11-17)

- **Condition 1 (ship-by date): met.** Committed and pushed 2026-11-17, with this artifact in the same commit.
- **Condition 2 (scope freeze): met.** No source file was edited after the reviewed patch was generated; the working tree was re-diffed against `docs/reviews/DIFF-lkw-window-chip-2026-11-17.patch` immediately before the commit and matched. The patch is committed as review input (same precedent as the sleep-onset review).
- **R1** is applied as its own follow-on commit, using the reviewer's line verbatim and nothing else, so it stays outside the frozen change.
- **R2 to R6**, the open pre-execution follow-ups (F1, F2, F3, F5, F6, F7) and the C16 refresh deadlines are logged in TASKS.md under LKW-WINDOW-CHIP.
- Verification run by the orchestrator, not by the reviewer: compile check clean; 454 unit tests pass; claims and humanizer hooks pass; production build 184 of 184 routes; browser checks at 390 px, 360 px and 1280 px on the NIHSS calculator and Stroke Code step 1 for witnessed 3 h, 6 h and 12 h, wake-up standard, countdown, extended and outside tiers, and unknown onset.
