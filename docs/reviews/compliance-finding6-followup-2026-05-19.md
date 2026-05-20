# Compliance follow-up — Finding 6 default flip

**Reviewer:** compliance-legal
**Date:** 2026-05-19
**Re:** `docs/reviews/compliance-hipaa-saved-cases-2026-05-19.md` Finding 6

V asked whether absolute timestamps could default ON with a clinician opt-out, instead of the current opt-in. compliance-legal returned three points:

1. **Opt-out is acceptable** from HIPAA/disclosure standpoint, provided three conditions hold: Privacy Policy states "by default" explicitly; modal discloses default at the point of save (not in a help drawer); opt-out control is visible without scrolling on phone viewport. Advisory, not blocking — V is the product owner.

2. **No regulatory blocker.** Future-state concern only if NeuroWiki ever enters a Business Associate Agreement with a Covered Entity (not the case today).

3. **Recommended third option — smart default.** The signal `hasStrokeTimestamps` already exists; extend it to "is at least one stroke-code timestamp actually filled in this session." If yes → default the checkbox ON (a real code is in progress, quality metrics matter). If no → default OFF (standalone NIHSS with no timing data, no quality-metric value to preserve). This matches the clinically-accurate default without forcing the clinician to opt in either direction in the common cases.

## Decision

Shipping **smart default** (option 3) per compliance-legal's recommendation. V's UX concern is honored: clinicians who actually ran a code and captured timestamps no longer need to tick a checkbox to preserve their wall-clock times. Clinicians who didn't capture stamps see a checkbox that's already off and irrelevant — no behavior change for that path.

## Required language adjustments

- Save Case modal copy: drops "Off by default" / "On preserves" framing — copy now describes the two states symmetrically and lets the smart default pick the right one.
- Privacy Policy Saved Cases section: updated to describe the smart default behavior. ("When you've captured stroke-code timestamps in your session, NeuroWiki defaults to saving exact wall-clock times. Otherwise, timestamps save as elapsed offsets.")

## Files this affects in the next commit

- `src/components/cases/SaveCaseModal.tsx` — new `hasFilledStrokeTimestamps` prop drives default state
- `src/components/calculators/CalculatorHeader.tsx` — threads the prop
- `src/pages/NihssCalculator.tsx` — computes the boolean from live state
- `src/pages/PrivacyPage.tsx` — language update in the Saved Cases section
