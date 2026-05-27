# Clinic Headache Pathway — PM Spec

**Date:** 2026-05-25
**Owner:** PM (V, via Claude orchestrator acting as pm-agent)
**Status:** Draft — pending V sign-off
**Supersedes:** the implicit interaction contract behind commits `affdcc8` (chip-picker) and `a8117aa` (first adaptive interview). Both shipped, both rejected by V on usability grounds. This spec is the new contract before any further code lands on `/pathways/headache-clinic`.

---

## 1. Purpose

The Clinic Headache Pathway is the outpatient surface a clinician opens during a clinic visit to (a) confirm an ICHD-3 headache phenotype and (b) get a concrete acute + preventive plan. It serves two audiences in one tool:

- The **experienced neurologist** who already has a working diagnosis in mind and wants the plan in two taps.
- The **resident, internist, or infrequent-headache-treater** who needs the tool to walk them through the differential, build a mental model of the ICHD-3 framework, and arrive at a defensible phenotype.

The tool is a **navigation aid**, not a diagnostic tool. Output uses "Features consistent with X" / "Probable X" language; the diagnosis remains the clinician's call.

## 2. Problem statement — what is broken in what shipped

**Commit `affdcc8` (chip-picker)** put 60+ chips across 7 groups on a single page. Cognitive load was high, no progression, no moment of "you've reached a phenotype." V's verdict: "too much cognitive workload… long form… not innovating."

**Commit `a8117aa` (first adaptive interview)** moved to a single-question flow but the first question — the red-flag screen — rendered the 12 SNNOOP10 flags as 12 individually-selectable pills with "None of the below" mixed into the same pile. No primary Continue button. The user could not tell what to do next. V's verdict: "still a bunch of pills… where is the next button… not user-friendly at all."

The pattern across both failures: I shipped variations of the same visual shape (lots of equivalent-looking selectable elements) without a primary action call-out. The PM spec did not exist at the time, so each iteration was me guessing at the shape.

## 3. Clinician intent — three scenarios

| Scenario | User | Goal | Time budget |
|---|---|---|---|
| **A. Experienced** | Headache neurologist, knows it's migraine | Confirm phenotype + get current preventive escalation guidance | ≤30 seconds, ≤3 taps |
| **B. Walking through** | Senior resident, suspects migraine vs TTH | Be guided through ICHD-3 discriminators, arrive at "Consistent with X" or "Probable X" | ≤90 seconds, ≤6 taps |
| **C. Learning** | First-year resident or internist | Same as B, plus understand WHY each question matters; build mental model | ≤2 minutes with Teach mode on |

All three scenarios share one screen — the differentiator is the power-user exit (Scenario A) and the Teach-mode toggle (Scenario C).

## 4. Success criteria

A clinician completing the interview gets:

1. **A phenotype suggestion** in the language "Features consistent with X" or "Probable X" (ICHD-3 X.5 framework), with the criteria-met / criteria-missing list visible.
2. **A concrete acute plan** for that phenotype (drug, dose, route) backed by a registered citation.
3. **A concrete preventive plan** when the AHS preventive threshold is met, with CGRP escalation rules.
4. **A red-flag short-circuit** that routes to imaging/labs/referral without surfacing a phenotype, when any SNNOOP10 feature is present.
5. **A power-user exit** to jump straight to a phenotype's management plan, for clinicians who already have the diagnosis.
6. **Teach mode** (toggle, default off) that adds pedagogy: "why we ask," ICHD-3 section reference, "Learn this pattern" pearl per phenotype.

Anti-success criteria — what would mean we failed again:

- Any single screen with >5 visually-equivalent selectable elements competing for attention.
- "Continue" or "None present" hidden inside a list of equivalent options.
- A page that takes >2 minutes for Scenario B clinician on a typical case.
- Output language that says "Diagnosis" rather than "Consistent with."
- Management content disconnected from the matched phenotype (e.g. a static text block at the bottom of the page).

## 5. Failure modes the next implementation must avoid

These are explicit lessons from `affdcc8` and `a8117aa`. Every screen mockup must be testable against this list.

### 5.1 The pill rule

**Pills (rounded chip buttons) are permitted ONLY when:**
- The user is tagging multiple of a kind from a closed, homogeneous list (e.g. picking comorbidities for a preventive choice).
- The chips are clearly secondary to a primary action button on the same screen.
- The chip count is ≤6 visible on a phone screen at once (more = pagination or collapse).

**Pills are NOT permitted when:**
- The question is binary or has a clear primary action (use full-width buttons instead).
- Different items in the chip set carry different urgency or meaning (e.g. "None" vs 12 red flags).
- The chip list is the only way to advance.

### 5.2 The primary action rule

Every screen MUST have exactly one visually dominant primary action. The clinician should be able to tell, in less than one second, what tapping forward means. Specifically:

- Primary action is a full-width or near-full-width button at the bottom of the question card.
- The primary action is visually distinct from the answer options (different color, different shape, different position).
- "None" / "No" / "Skip" is its own primary action button when relevant — never mixed into the answer pills.

### 5.3 The read-then-decide pattern (red-flag screen, specifically)

The SNNOOP10 screen should NOT ask the clinician to tap-select each flag. It should:

- Render the 12 flags as **a readable bulleted list** (informational text, not selectable).
- Offer **two primary buttons**: "None present — continue" and "One or more — workup."
- If the second is tapped, surface a follow-up that asks WHICH flag (so the workup card can be specific to it).

This matches how a clinician scans the list in their head — read all twelve, decide yes or no, then specify if yes. It does NOT match "tap-select each flag individually" which is the pattern of a flat checkbox form.

### 5.4 The single-question rule

Every interview screen asks ONE question. Multi-check screens are still allowed (e.g. "Which character features apply?") but only when:
- The question genuinely is "select multiple of a homogeneous kind."
- There is an explicit "Continue" primary action below the chips, not hidden among them.
- The chip count is bounded (≤6 visible; collapse the rest into "Show more").

### 5.5 The management connection rule

Management content (acute + preventive plan) is rendered ONLY in the State C decision drawer for the matched phenotype. It is not a separate static page section. The clinician sees management in the moment the phenotype is reached, in the same view as the criteria-met list.

## 6. Screen-by-screen interaction contract

This is the contract the mockup must implement. Each row is one screen.

| # | Screen | Primary action(s) | Notes |
|---|---|---|---|
| 1 | **Intro** | `Begin →` (full-width primary). `I already know the diagnosis →` (secondary link) | Disclaimer banner + Teach toggle visible above |
| 2 | **Safety screen** | `No red flags present — continue →` (full-width primary). `One or more present — go to workup →` (secondary, amber) | Renders the 12 SNNOOP10 flags as a readable list (informational text with checkmark-bullet glyphs, NOT selectable). No tap-select on flags themselves. |
| 2a | **Workup specifier** (only if user tapped "One or more" on #2) | Multi-check chips for the 12 flags, with `Continue to workup card →` primary button below | Now the chips are appropriate — user is genuinely tagging which flags are present for a specific workup recommendation |
| 3 | **Pattern** | `Episodic →` (full-width primary, large card). `Continuous →` (full-width primary, large card) | Two large card-style choices; tap auto-advances |
| 4a | **Episodic — duration** | Four time-band cards: `<15 min` / `15-180 min` / `4-72 h` / `30 min to days` | Card grid, tap auto-advances |
| 4b | **Continuous — laterality** | Two cards: `Strictly one-sided` / `Both sides` | Tap auto-advances |
| 5a | **Episodic — character (multi-check)** | Chip list of character features (unilateral, pulsating, pressing, severity, etc.). **Explicit `Continue →` primary button below.** | This is the legitimate multi-check use case. Chip count ≤9 visible. |
| 5b | **Continuous — autonomic** | Two cards: `Yes — ipsilateral autonomic features` / `No autonomic features` | Single-choice cards |
| 6a | **Episodic — associated symptoms (multi-check)** | Chip list (nausea, vomiting, photo, phono, autonomic, restlessness). **Explicit `Continue →` primary button below.** + `None of these — continue →` as a separate primary alternative. | Two primary actions: "Continue with selections" or "None of these." |
| 6b | **Continuous — indomethacin gate** | Cards: `Complete response` / `Partial` / `No response` / `Not tried yet` | Single-choice |
| 7 | **Episodic — lifetime attacks** | Three cards: `<5` / `5-10` / `>10` | Single-choice, terminates flow |
| 8 | **Result** (drawer State C) | Acute block + Preventive block + Criteria met/missing + `Edit answers` + `Start over` | Drawer expanded by default; "Features consistent with X" headline |
| 8' | **Workup** (drawer State C, alternative) | Per-flag imaging/labs/referral list + `Edit answers` + `Start over` | Triggered by Screen 2a; replaces phenotype result |

Total screens for Scenario B clinician on a typical case: **5-6** (intro skipped if already in pathway; safety → pattern → duration → character → associated → attacks → result).

Total screens for Scenario A (power user): **2** (intro → phenotype-pick sheet → result).

## 7. Visual chassis rules (specific to the interview pattern)

Reuse the stroke-code chassis where it applies; new rules for this pattern:

### 7.1 The question card

```
┌──────────────────────────────────────┐
│ STEP X OF Y · CATEGORY (eyebrow)     │  bg-slate-50 header, optional in Teach
├──────────────────────────────────────┤
│                                      │
│ Prompt as H2 (text-[17px] semibold)  │  px-5 py-4
│                                      │
│ (Teach mode: italic helpText + ICHD- │
│  3 section reference)                │
│                                      │
│ [ Answer card 1 (full-width) ]       │
│ [ Answer card 2 (full-width) ]       │  Single-choice: large cards
│ [ Answer card 3 (full-width) ]       │  64px min height, full width
│                                      │
│  ─ OR ─                              │
│                                      │
│ [chip][chip][chip][chip]             │  Multi-check: chips wrap, ≤9
│ [chip][chip]                         │
│                                      │
│ ──────────────────────────────────── │  Border-t separator
│                                      │
│       [   Continue →   ]             │  Multi-check ONLY:
│                                      │  Full-width primary, neuro-600
│                                      │
└──────────────────────────────────────┘
```

### 7.2 Single-choice cards vs multi-check chips

| Use cards (full-width buttons, single-choice, auto-advance) when… | Use chips + Continue button (multi-check) when… |
|---|---|
| 2 to 4 distinct options | 4+ homogeneous toggleable features |
| Choices have different meaning/urgency | Choices are siblings of one kind |
| Tap commits and advances immediately | User picks several before advancing |

### 7.3 The differential bar (State B drawer)

- Lives in `PathwayBottomDrawer` State B
- Shows top 3 candidates as horizontal probability bars
- Updates `aria-live="polite"` so each answer announces "Migraine 90 percent, TTH 40 percent"
- Bar color: emerald ≥80%, amber 40-79%, slate <40%

### 7.4 The result drawer (State C)

- Lives in `PathwayBottomDrawer` State C
- Expanded by default when phenotype reached
- Sections (top-down):
  1. Phenotype headline ("Features consistent with X" / "Probable X")
  2. ICHD-3 criteria met (emerald ✓) + criteria missing (slate ○) — Teach mode shows criterion description text
  3. Acute treatment block (data-claim tagged)
  4. Preventive treatment block (data-claim tagged, only when threshold met)
  5. Teach pearl (Teach mode only — "Learn this pattern")
  6. Citation footer (1-2 lines)

## 8. Open questions for V (decide before mockup)

1. **Power-user exit placement.** Currently the spec puts it on the Intro screen and on every question screen ("I already know the diagnosis →" secondary link). Keep on every screen, or only on Intro? *Recommended: every screen — experienced clinicians may decide mid-flow they want to skip.*

2. **Workup specifier (Screen 2a).** When the user taps "One or more red flags," do we:
   - (a) Show the 12 flags as multi-check chips with Continue button (current spec)
   - (b) Walk through each flag one at a time as yes/no
   - (c) Show the workup card immediately with a "Which flags are present?" sub-question inside the card
   *Recommended: (a). Most efficient. The chip use here is legitimate per §5.1 because the user has already committed to "yes, flags present" and is now tagging specifically which.*

3. **Teach mode default.** Currently off. Keep off, or default on for first 5 uses then off? *Recommended: off always. Adding default-on-then-off creates a state surface that's hard to test and the user has not yet asked for a usage-counter mechanism.*

4. **Result drawer auto-expand.** When the phenotype is reached, does the State C drawer auto-expand, or stay collapsed for the clinician to tap? *Recommended: auto-expand on first reach in that session. Tap-to-collapse after that. Matches GCS/ASCVD pattern but with auto-open on the result moment.*

5. **"Edit answers" vs "Back".** Should the result screen offer a single "Edit answers" that returns to the last question, or a back-step trail that lets the user revise any prior question? *Recommended: single "Edit answers" → returns to the last question with chips intact. Trail is a v2.*

## 9. What the mockup must produce

`design-prototyper` is the next handoff. The mockup deliverables:

- `docs/specs/mockups/headache-intro.html` — Screen 1
- `docs/specs/mockups/headache-safety-screen.html` — Screen 2 (the read-then-decide pattern)
- `docs/specs/mockups/headache-pattern.html` — Screen 3 (large card single-choice)
- `docs/specs/mockups/headache-character-multi.html` — Screen 5a (multi-check with explicit Continue button — the canonical example of when chips ARE okay)
- `docs/specs/mockups/headache-result.html` — Screen 8 (drawer State C with all sections)
- `docs/specs/mockups/headache-workup.html` — Screen 8' (workup result)

Each mockup must render at 375px without scrolling on the primary action. Each mockup must include the differential bar at the bottom in its appropriate State (A blank, B mid-flow with bars, C result).

## 10. Sign-off

PM spec is V's call. Three things to confirm:

1. **Section 5 (failure modes) is correct and complete** — anything else I should add to the "never do this again" list?
2. **Section 6 (screen contract) matches your mental model** — are the screens in the right order, do the primary actions on each screen feel right?
3. **Section 8 open questions** — your picks on 1-5.

Once you confirm, I route to `design-prototyper` for the HTML mockups, then `ui-architect` + `mobile-first-developer` + `accessibility-specialist` review in parallel, then back to you with the consolidated package.
