# Clinical review — PR #lkw-sleep-onset

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-5-5)
**Date:** 2026-11-16

## Scope
- Claims touched: none. `ivt-window-4.5h` (PatientContextPanel `data-claim` surface) was checked and is unchanged.
- Citations affected: none
- Surfaces changed: static JSX and string literals (picker labels, panel LKW row), computed strings (NIHSS `buildText` LKW line, `formatSavedCaseAsEmrText` LKW line), structured persistence (`nihssDraft`, `SavedCaseData.patientContext.wakeUp`)
- Evidence-verifier packet: not applicable
- Trial-statistician report: not applicable
- Blast radius not named in the brief: `src/pages/ExtendedIVTPathway.tsx` also renders `LKWTimePicker` with `onSleepOnset`. It takes bedtime as `lkwTimestamp` and wake as `wakeTimestamp` for its eligibility logic, so the rebuilt Sleep Onset tab and the new exact minutes reach that pathway too.

## Semantic validity
A. Clinical-semantics preservation: confirmed.
- `onSleepOnset` in PatientContextPanel sets `lkw: null` plus `wakeUp`. The `ivt` IIFE still returns null unless `values.lkw instanceof Date`, so the 0–4.5 h aid and the `data-claim="ivt-window-4.5h"` block do not render. The "Wake-up or unknown onset, so time since onset is not shown." line is still gated on `lkw === null` and still shows.
- The collapsed chip still reads "LKW: unknown".
- `onConfirm` and `onUnknown` now clear `wakeUp`, so a stale wake-up record cannot sit beside a specific LKW.
- The method note "WAKE-UP / THAWS · Treatment window runs 4.5 h from awakening." appears in the diff only as unchanged context, so it is byte-identical. Only the wrapper's padding class changed.

B. New rendered strings.
- None of these makes a recommendation, threshold, grade or evidence statement, so none needs a registry entry: `Wake-up: asleep <dt>, woke <dt>`, `24-hour time`, `Asleep X h Y min`, `Enter a valid time in both fields.`, and the format hint `Try "0630", "6:30 PM" or "23:25".`. They echo the clinician's own input.
- Keeping `lkw` null and recording bedtime as "Last asleep without symptoms" (the picker's existing label) is sound and conservative. It matches the panel's deliberate design of not running an onset clock for these patients. It keeps both times on record without a 0–4.5 h chip implying eligibility, which for wake-up stroke depends on imaging selection.
- Flagged (condition 1): the exported note and saved-case text say `LKW: Wake-up stroke.`. That text is pasted into the medical record. Choosing the Sleep Onset tab establishes the timing category (symptoms found on awakening), not the diagnosis; a stroke mimic would carry a stroke label in the chart. The panel row already uses the neutral "Wake-up:". This is not one of the five drift categories, but it is diagnostic overstatement in a copy-to-chart surface, and the fix is trivial.

C. Time-entry correctness: no path found where the recorded time differs from the confirmed on-screen read-back.
- `parseManualTime` checks: 0000 → 12 AM (military); 12:00 pm → noon; a bare 12 with AM kept → 00:xx; 13–23 → military PM; minutes above 59 and hours above 23 rejected.
- `to24h` handles the 12 AM → 0 and 12 PM → 12 edges.
- `buildSleepDate` uses the day offset correctly across month boundaries (tested) and zeroes seconds.
- `periodIdx: -1` keeps the column's current AM/PM. The resolved half of the day is always shown in the per-column read-back (visible and linked by `aria-describedby`) and in the reformatted field after blur, so an ambiguous "7" is never hidden.
- Each keystroke re-parses into state. An unparseable draft stays red, sets `invalid`, and blocks confirm. Blur never silently reverts.
- Guards are present: wake must be after bedtime, and wake must not be in the future. The future guard uses `now` as captured at open (the Specific Time tab uses `new Date()`). If the picker is left open, this can only reject a valid very recent wake time; it never accepts a wrong one.
- On reopen, `colFromDate` drops an out-of-range day to the default offset, and the read-back shows that changed date. Re-confirming records what is shown; cancelling keeps the stored value.

D. Specific Time clamp: acceptable. A typed :58/:59, or "Just now" at :58/:59, now snaps to :55 rather than wrapping to :00 of the same hour, which was about 58 minutes early. The remaining error is at most 4 minutes, always toward an earlier LKW (longer elapsed time). That is the safe direction for a treatment-window clock. After blur the field shows the snapped :55, so screen and record agree; while the field is still focused the text can show :58 against wheels at :55. Same minor gap as before.
- Pre-existing, not introduced here: the rounding is nearest-5, so for example 9:53 rounds up to 9:55. "Just now" can then trip "LKW cannot be in the future." See follow-ups.

E. Other: the Sleep Onset tab now records exact minutes (previously snapped to 5) and no longer wraps :58/:59. In ExtendedIVTPathway, which computes eligibility from bedtime and wake time, the inputs are now more accurate. No threshold in that pathway changed, but its eligibility branch has a behavior change that this review did not exercise (condition 2).

## Citation accuracy
No citation records or claim mappings were added, removed or edited. `ivt-window-4.5h` and its mapping are unchanged by this diff.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
No citations touched. No `last_reviewed` refresh in scope.

## Rationale
The change fixes a real documentation defect: wake-up times were silently discarded. It stores them as documentation only and leaves every clinical gate unchanged. `lkw` stays null, the thrombolysis timing aid stays suppressed, the claim-tagged surface is untouched, and the THAWS/WAKE-UP note is unchanged. The time-entry logic is sound at the 12 o'clock and day-boundary edges, and invalid input blocks confirmation instead of reverting. The minute fix removes an error of up to 58 minutes and leaves at most 4 minutes in the conservative direction. Two items stop this from being a plain approve: the chart-export wording asserts a diagnosis the input does not establish, and the Extended IVT pathway shares the rebuilt tab but is outside the stated scope and untested.

## Required follow-ups
Conditions (must be met before merge):
1. In `src/pages/NihssCalculator.tsx` (`buildText`) and `src/lib/cases/format.ts`, replace `LKW: Wake-up stroke.` with wording that names the onset category and not a diagnosis (e.g. `LKW: Wake-up onset.`). Keep the rest of the sentence: `Last asleep without symptoms <dt>; woke with symptoms <dt>.`. Update both assertions in `src/lib/cases/format.test.ts` to match.
2. Exercise the Extended IVT pathway's wake-up flow with an exact-minute entry, including a :58/:59 bedtime. Confirm that time-since-waking and the sleep-midpoint values reflect the entered minutes and that no eligibility verdict shifts other than by the corrected minutes. Record the result in the PR body, or add a unit test if that logic is testable.

Non-blocking:
- Pre-existing, route to medical-scientist: the method note "Treatment window runs 4.5 h from awakening." leaves out the imaging gate that WAKE-UP (MRI DWI-FLAIR mismatch) and THAWS selection depend on. That is a qualifier drift against the 2026 AIS guideline. It was not introduced by this diff, but this diff makes the tab reachable from two more screens, so it is worth a Class E check.
- Consider rounding the Specific Time tab's default and "Just now" minute down (floor) rather than to nearest-5 with a clamp. It would then always err earlier and never trip the future-time guard.
- Consider capturing `new Date()` at confirm for the wake-time future guard, to match the Specific Time tab.

---

## Orchestrator disposition of conditions (2026-11-16, pre-commit)

1. **Done.** The copy-to-chart line now reads `LKW: Wake-up onset. Last asleep without symptoms <dt>; woke with symptoms <dt>.` in both `src/pages/NihssCalculator.tsx` (`buildText`) and `src/lib/cases/format.ts`; both assertions in `src/lib/cases/format.test.ts` updated. No rendered string says "Wake-up stroke" for this entry.
2. **Done, exercised in the browser against the local build.** Extended IVT pathway, Sleep Onset entry of bedtime `2358` (yesterday) and wake `0617 am` (today): the pathway summary rendered `Bedtime 11:58 PM · Woke 6:17 AM · 975 min since waking`; an independent calculation from the entered minutes gave 975. The sleep-midpoint value is `(lkwTimestamp + wakeTimestamp) / 2` (ExtendedIVTPathway.tsx line 324) with no rounding, so it inherits the exact minutes. No threshold in that pathway was edited, and no verdict shifts other than by the corrected minutes.

Non-blocking items taken in the same change:
- Specific Time default and "Just now" now FLOOR to the 5-minute slot (was nearest-5 with a clamp), so they always err earlier and can no longer trip the future-time guard.
- The wake-time future guard now compares against `new Date()` at confirmation, matching the Specific Time tab.

Non-blocking item routed, not done here: the method note "Treatment window runs 4.5 h from awakening." omits the imaging-selection qualifier; opened in TASKS.md as a clinical wording check for medical-scientist.

