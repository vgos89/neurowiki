# Stroke Code Pathway — UX / Mobile / Accessibility Audit

**Date:** 2026-05-24
**Scope:** Every user-touching surface in `/pathways/stroke-code`
**Inputs:** ui-architect (flow + cognitive load + drop-off risk), mobile-first-developer (375px + touch targets + thumb reach), accessibility-specialist (WCAG 2.1 AA), V (manual finding: no step reversibility), web research on stroke-pathway tool patterns (Pulsara, Viz.ai, npj Digital Medicine 2025 review)
**Status:** Audit only — no code changes. Plan and execute next.

---

## Part 1 — English summary for V

This audit looks at the Stroke Code pathway through three lenses we hadn't audited yet (we just finished the visual chassis pass). The lenses: how the clinician's thumb actually works through it, what slows them down or makes them second-guess, and whether anyone with a screen reader or keyboard can use it at all.

**The headline:** the visual chassis pass got the look right. But there are some specific things that will actively trip up a resident at the bedside, and at least two are bad enough that I'd want to fix them before the next person uses the tool on a real code.

### The eight things that matter most

1. **You can't go back to fix an earlier step from the same session.** This is the issue you flagged. The step rail does already let you tap a completed-step pill to go back — but the pill is a tiny semi-transparent caption, not an obvious button. A first-time user will not realize it's clickable. This is a 30-minute fix: bigger pill, an "Edit" pencil icon on the right, full-contrast text.

2. **The "Save & Continue" button on Step 1 fires two actions at once.** If LKW is within 4.5h and Step 1 is complete, that button BOTH saves Step 1 AND opens the eligibility checklist. If the resident dismisses the eligibility modal without finishing, Step 1 is already marked complete and you're now stuck on Step 2 with "eligibility not checked" but no clear way to redo it. Risk: the resident pushes tPA through without finishing the contraindication checklist.

3. **There's no "you're done" moment.** After Step 4 finishes, nothing tells the resident "the code is documented, you can leave the tool." No completion banner, no Start New Code button. They have to figure out themselves what to do next. For a 30-second pre-rounds documentation pass, this is fine. For a busy resident who needs to start fresh on the next admit, it's a gap.

4. **Copy-to-EMR exists in two different places with different content.** Step 4 has a "Copy to EMR" button that copies the orders list only. Step 3 has another "Copy to EMR" button that copies the full code summary including orders. Both are visible simultaneously. A resident hitting the Step 4 one gets a partial EMR note — and might never realize the fuller version existed.

5. **The clinical context bar scrolls away.** The little summary line that shows NIHSS, BP, LKW, window-state is at the top of the page but doesn't follow you as you scroll. By the time you're on Step 2 picking a treatment, the LKW window state isn't on screen — and that's the single most important fact governing the decision. Should be sticky.

6. **The disabling-symptoms checklist for low-NIHSS patients looks like a regular alert.** When a patient has NIHSS 2–5 and the resident has to decide between IV tPA (only if disabling symptoms present) vs DAPT (default), the disabling-symptoms checklist appears in the same amber card style as the BP-high warning and the glucose-low warning. Visually equal weight to three different alerts. But the disabling-symptoms checklist IS a required decision, not just an alert. It needs to look more important.

7. **The ICH protocol modal is the right modal but the wrong shape.** You flagged this. When the resident picks "ICH detected" in Step 2, the protocol modal opens — but the modal frame uses its own pattern (severity strip on the left, numbered steps) instead of the chassis we just landed. Easy fix in the next pass; same chassis variant we used for the eligibility modal status banner.

8. **Touch targets fail on the back arrow, modal close buttons, and the Code/Study toggle.** The back arrow in the sticky header is 32×32px (needs 44×44px per spec). The NIHSS modal close X is 32×32px. The Code/Study toggle is roughly 30px tall. All three sit at the top of the viewport (worst thumb-reach zone) and all three are under the touch-target floor. Resident finger-misses to "Study" mode mid-code is the realistic failure.

### What the research literature says we're missing

- **Mobile-first is the norm now**, and clinicians enter data with one thumb while the other hand is on the patient. Information density and decision-flow matter more than minimalism. We're broadly aligned with this — the chassis pass got us there visually.
- **Workflow integration with EMR matters more than feature richness.** Pulsara + Viz.ai integration cut door-to-needle times by 43–53% by closing the loop between detection and team notification. Our tool currently terminates at "Copy to EMR" — the EMR step itself is still manual. Outside the scope of this audit but flagged for product roadmap.
- **Pulsara's clinician adoption study (AHA TP89): "100% of surveyed clinicians preferred Viz Connect over the previous process."** The thing they preferred wasn't a feature — it was the closed-loop notification + the lack of friction. We should not underestimate how much "one less tap" matters at 3 AM.
- **Healthcare UX 2026 guidance (npj Digital Medicine, Fuselab Creative, Eleken):** information density is OK, role-specific layouts beat universal layouts, accessibility is non-negotiable for AA target. Our biggest gap vs. this guidance: we don't yet differentiate the resident-overnight workflow from the attending-rounds workflow. Same screen for both. Out of scope here.

### What I recommend we tackle, in priority order

1. **This week (BLOCKER):** fix the Step 1 CTA double-fire (#2 above) + add an explicit "you're done" terminal state at the end of Step 4 (#3 above)
2. **This week (HIGH):** make the back-to-step-1 pill obviously clickable (#1 — your finding) + sticky context bar (#5) + remove the duplicate Copy-to-EMR (#4)
3. **Next pass (HIGH):** fix the three touch-target violations in the sticky header + NIHSS modal close + Code/Study toggle (#8) + make disabling-symptoms checklist visually heavier (#6)
4. **Next pass (HIGH):** roll ICH protocol modal onto the same chassis (#7), same approach we used for the eligibility status banner
5. **Then (MEDIUM + LOW):** the WCAG fixes — focus management, live regions, color contrast on red eyebrows, fieldset on disabling symptoms, accessible names on Calc / LKW buttons. These don't change observable behavior for sighted clinicians but they unlock the tool for any clinician using assistive tech, and they're cheap.

The Mobile + a11y findings are mostly small, mechanical fixes (32px → 44px, add `aria-live`, add `<fieldset>`). They cluster into 3-4 reasonable commits.

The UX findings are bigger product decisions. Numbers 2, 3, and 4 in the priority list are real design changes — not just polish.

I'd suggest we walk through Part 2 below and you tell me which ones to execute, which to park, and which to push back on. No code touched yet; we plan together.

---

## Part 2 — Full findings by severity

### BLOCKER (5 findings)

| # | Finding | Source | Surface |
|---|---|---|---|
| BL-1 | **Step 1 CTA double-fires save + open eligibility modal.** When `withinTPAWindow && isComplete && onOpenEligibility`, the button calls both `handleComplete()` AND `onOpenEligibility()` in the same click. If the user dismisses the eligibility modal without completing, Step 1 is already saved (`eligibilityChecked: false`) and `activeCard` is already 2. Patient-safety risk: tPA pushed without finishing contraindication checklist. | ui-architect | `CodeModeStep1.tsx:487–491` |
| BL-2 | **No terminal "code is done" state.** After Step 4 `onComplete` fires, nothing changes on screen — no completion banner, no "Start New Code" button, no clear next action. Drop-off cliff. | ui-architect | `StrokeBasicsWorkflowV2.tsx` (end of Step 3 panel) |
| BL-3 | **Focus is lost on step transitions.** Save & Continue advances `activeCard` but never calls `.focus()` on the new step's first interactive element. Keyboard / screen-reader users left orphaned. WCAG 2.4.3. | accessibility-specialist | `StrokeBasicsWorkflowV2.tsx:444` |
| BL-4 | **Clinical state alerts (BP-high, hypoglycemia, severe hyperglycemia, LKW unknown) have no live-region announcement.** Screen reader users never learn the alert appeared. WCAG 4.1.3. | accessibility-specialist | `CodeModeStep1.tsx:302, 313, 341, 361` |
| BL-5 | **Treatment Decision and LVO Yes/No/Pending button groups lack `role="radiogroup"` + arrow-key handling.** Keyboard users cannot navigate the groups in the conventional radio pattern. WCAG 2.1.1. | accessibility-specialist | `CodeModeStep2.tsx:271–319, 347–361` |
| BL-6 | **Back arrow in sticky header is 32×32px** — fails 44×44px minimum. Worst position (top of viewport, one-handed reach). Mis-fire navigates the resident OUT of an active code. | mobile-first | `StrokeBasicsWorkflowV2.tsx:326` |
| BL-7 | **NIHSS modal close X is 32×32px.** Modal cannot be dismissed any other way (no outside-click on this overlay). Same touch-target failure as BL-6. | mobile-first | `StrokeBasicsWorkflowV2.tsx:850` |
| BL-8 | **Eligibility modal Cancel button lacks `min-h-[44px]`.** Dismissing the eligibility modal by mistake during a code is a patient-safety risk. | mobile-first | `ThrombolysisEligibilityModal.tsx:479` |

### HIGH (15 findings)

| # | Finding | Source | Surface |
|---|---|---|---|
| H-1 | **No obvious way to edit Step 1 from Step 2.** (V's manual finding.) The collapsed "Vitals saved" pill IS clickable and DOES correctly return to Step 1 with state preserved — but the pill reads as a status label, not as an interactive control. `opacity-75` semi-transparent text. No edit/pencil icon. | V + ui-architect | `StrokeBasicsWorkflowV2.tsx:421–429` |
| H-2 | **Weight required even when DAPT pathway is indicated.** A patient with NIHSS 2 and no disabling symptoms is going to DAPT, not tPA — weight is irrelevant — but the Step 1 completion gate still requires `weightValue > 0`. Forces a meaningless data entry. | ui-architect | `CodeModeStep1.tsx:120–127` |
| H-3 | **CTA & LVO Screening card always visible**, even before user selects CT result. Residents may begin LVO entry before reading CT. | ui-architect | `CodeModeStep2.tsx:329–375` |
| H-4 | **PatientContextPanel collapse toggle is always live** in Stroke Code, even when `defaultExpanded={true}`. Accidental tap on the header collapses required fields mid-entry. | ui-architect | `PatientContextPanel.tsx:117, 173–194` |
| H-5 | **NIHSS modal return state ambiguous.** Tap "Calc", complete the modal, return — if PatientContextPanel collapsed during the modal, the applied NIHSS score is hidden. | ui-architect | `CodeModeStep1.tsx:214–220` |
| H-6 | **Step 3 inverts the natural reading order.** Orders checklist renders BEFORE the Code Summary + Copy-to-EMR action card. Residents must scroll past 20+ order rows to reach the primary "Copy to EMR" deliverable. Single most likely drop-off point in the pathway. | ui-architect | `StrokeBasicsWorkflowV2.tsx:625–654` |
| H-7 | **Step 1 disabling symptoms checklist has same visual weight as BP/glucose alerts**, but it IS a clinical decision (not an alert). No "required answer" affordance; CTA enables without checking the checklist. | ui-architect | `CodeModeStep1.tsx:409–450` |
| H-8 | **Step 2 BP alert duplicates Step 1 BP alert** without acknowledging `bpControlled` flag already set in Step 1. Repeated treatment instructions read as new info. | ui-architect | `CodeModeStep2.tsx:127–141` |
| H-9 | **Extended IVT cross-link competes with Save & Continue CTA** for LKW > 4.5h or unknown. Two equally-prominent actions on screen; the lower one (Save & Continue) lets the resident skip Extended IVT entirely. | ui-architect | `CodeModeStep1.tsx:459–504` |
| H-10 | **Two "Copy to EMR" buttons in Step 3 with different content.** Step 4 footer = orders only; Step 3 = full summary including orders. Both visible. Ambiguous. | ui-architect | `CodeModeStep3.tsx:404–441` + `CodeModeStep4.tsx:575–607` |
| H-11 | **Clinical context bar scrolls away.** Window badge (IVT / Extended / Outside) and NIHSS/BP not sticky. On Step 2/3, the governing facts are off-screen. | ui-architect | `StrokeBasicsWorkflowV2.tsx:373–407` |
| H-12 | **ICH detected modal protocol — different chassis than rest of pathway.** ProtocolModal uses left-border severity strip + numbered steps. Inconsistent with the chassis we just landed across all other pathway surfaces. **(V flagged this in the audit request.)** | V + ui-architect | `ProtocolModal.tsx` |
| H-13 | **Code/Study toggle: `py-1.5`, no `min-h-[44px]`, top-right of sticky header.** Rendered ~30px tall, worst thumb-reach zone. Mid-code mis-tap likely. | mobile-first | `StrokeBasicsWorkflowV2.tsx:342, 355` |
| H-14 | **LKWTimePicker month-nav chevrons + calendar day cells are 32×32px.** Calendar cells especially — picking the wrong LKW date changes the entire treatment window. | mobile-first | `LKWTimePicker.tsx:232, 243, 273` |
| H-15 | **LKWTimePicker sleep-onset wake-time validation error scrolls inside body** instead of being pinned above footer (which the other sleep error IS). Soft keyboard covers it. | mobile-first | `LKWTimePicker.tsx:585–589` |
| H-16 | **Computed Dosing chip grid may overflow** at 320px viewport (iPhone SE 1st gen). `{tpaBolus} bolus + {tpaInfusion} inf` string can wrap. | mobile-first | `CodeModeStep1.tsx:386` |
| H-17 | **Eligibility modal footer 5 controls on 343px row** — likely wraps or clips on 375px. Copy + Send + (gap) + Cancel + Save. | mobile-first | `ThrombolysisEligibilityModal.tsx:458–492` |
| H-18 | **PatientContextPanel `aria-controls="patient-context-body"` references an element not in DOM when collapsed.** Violates ARIA spec. | accessibility | `PatientContextPanel.tsx:178` |
| H-19 | **Locked rail step has no focusable element**, so keyboard users cannot land on it or hear the `lockedAriaLabel`. WCAG 2.4.1. | accessibility | `PathwayRail.tsx:215–219` |
| H-20 | **Eligibility chip section eyebrows are `<p>` not `<h3>`.** Screen reader users navigating by heading skip Hard Stops / Bleeding-Labs / Consider sections entirely. | accessibility | `ThrombolysisEligibilityModal.tsx:294, 336, 376` |
| H-21 | **`prefers-reduced-motion` not respected** anywhere — chevron rotations, accordion expands, modal fade-ins all run unconditionally. WCAG 2.3.3. | accessibility | `StrokeBasicsWorkflowV2.tsx:456, 545, 663, 675, 705, 747` |

### MEDIUM (12 findings)

| # | Finding | Source | Surface |
|---|---|---|---|
| M-1 | **No live countdown in final tPA window minutes** (LKW 4.0–4.5h). Resident may lose 10 min in EMR and cross window without noticing. | ui-architect | window badge logic |
| M-2 | **`mt-16` gap on first load** creates 124px empty space above first content node. | ui-architect | `StrokeBasicsWorkflowV2.tsx:409` |
| M-3 | **Eligibility modal instruction text below the fold** on mobile bottom-sheet variant. Residents tap chips before reading instruction. | ui-architect | `ThrombolysisEligibilityModal.tsx:287` |
| M-4 | **StudyPearlsButton `py-1.5` without `min-h-[44px]`.** ~30px rendered. | mobile-first | `StrokeBasicsWorkflowV2.tsx:157` |
| M-5 | **Step 4 evidence-grade expand chevrons and adjacent checkboxes lack `min-h-[44px]` row wrappers.** | mobile-first | `CodeModeStep4.tsx:542` |
| M-6 | **BP / Glucose paired inputs in PatientContextPanel `py-1`** — ~32px effective height, below 44px floor. | mobile-first | `PatientContextPanel.tsx:223–234` |
| M-7 | **LKWTimePicker missing body-scroll-lock.** `document.body.style.overflow = 'hidden'` is set in ThrombolysisEligibilityModal but not here. Background scrolls behind modal on iOS. | mobile-first | `LKWTimePicker.tsx` |
| M-8 | **Color contrast — `text-red-600` on `bg-red-50`: ~3.8:1.** Fails WCAG 1.4.3 for normal text (10px eyebrow is not "large text"). Should be `text-red-700`. | accessibility | chassis eyebrow tokens |
| M-9 | **Color contrast — `text-slate-400` on `bg-slate-50`: ~3.0:1.** Same failure as M-8. Should be `text-slate-500`. | accessibility | chassis eyebrow tokens |
| M-10 | **Disabling symptoms checkbox group missing `<fieldset>`/`<legend>`.** Screen readers read each checkbox without group context. | accessibility | `CodeModeStep1.tsx:424–433` |
| M-11 | **Anticoag chip group missing `role="group" aria-labelledby`.** Same issue: four chips read in isolation. | accessibility | `PatientContextPanel.tsx:261–279` |
| M-12 | **NIHSS Calc button accessible name = "Calc" with no context.** | accessibility | `CodeModeStep1.tsx:215–220` |
| M-13 | **LKW button accessible name concatenates poorly** — "Last known well" + "Add" / "Unknown / wake-up" → ambiguous. | accessibility | `PatientContextPanel.tsx:201–212` |
| M-14 | **Weight + dosing not linked via `aria-describedby`.** | accessibility | `CodeModeStep1.tsx:240, 248` |
| M-15 | **Calendar day-of-week single-letter abbreviations** (M T W T F S S) not wrapped in `<abbr>`. Two Ts and two Ss render ambiguously. | accessibility | `LKWTimePicker.tsx:251–255` |
| M-16 | **Safe-area-bottom spacer `<div className="h-24 pb-[env(safe-area-inset-bottom,0px)]" />`** — `pb-` on a fixed-height div doesn't push content. Mechanism is fragile on iPhone with home indicator. | mobile-first | `StrokeBasicsWorkflowV2.tsx:931` |

### LOW (8 findings)

| # | Finding | Source | Surface |
|---|---|---|---|
| L-1 | Step 3 "Code complete" status dot 8×8px — too small. | ui-architect | `CodeModeStep3.tsx:230–241` |
| L-2 | Step 4 button-row hierarchy unclear (Copy + Send + Save Orders side-by-side, equal weight). | ui-architect | `CodeModeStep4.tsx:575–607` |
| L-3 | Collapsed LKW eyebrow shows "LKW set" not actual time. | ui-architect | `PatientContextPanel.tsx:374–387` |
| L-4 | Code/Study toggle gives no first-time-user hint about what "Study" does. | ui-architect | `StrokeBasicsWorkflowV2.tsx:342–362` |
| L-5 | Long-press hazard on LKW preset chips (Android system context menu triggers). | mobile-first | `LKWTimePicker.tsx:1047, 1059` |
| L-6 | Hypoglycemia AHA link button — no `min-h` floor. | mobile-first | `CodeModeStep1.tsx:347–350` |
| L-7 | Decorative `→` arrow characters in CTA button text read aloud by some screen readers as "right-pointing arrow." | accessibility | multiple |
| L-8 | Toast live region only mounted when active — some screen readers miss the announcement because the live region itself was just inserted. | accessibility | `StrokeBasicsWorkflowV2.tsx:933–936` |
| L-9 | Clinical Context Bar over-announces every 30s as `liveLkwHours` updates. Needs `aria-live="off"`. | accessibility | `StrokeBasicsWorkflowV2.tsx:374` |
| L-10 | LKW picker close button missing `type="button"` (consistency only). | accessibility | `LKWTimePicker.tsx:977` |

---

## Part 3 — Web research synthesis

### Key takeaways from the literature

**Pulsara + Viz.ai integration study (AHA Stroke 2025, abstract TP89):** the integration cut door-to-CT, door-to-needle, and door-to-puncture times by **43–53%**. The mechanism: closed-loop communication eliminated the "who knows what" gap between detection, neurology, IR, and pharmacy. Mobile-first design with one-tap notifications. 100% of surveyed clinicians preferred it over the prior process. ([Pulsara](https://www.pulsara.com/blog/new-study-shows-drop-in-stroke-treatment-times-with-pulsara-and-viz.ai), [Viz.ai](https://www.viz.ai/news/new-study-highlights-positive-impact-of-viz-ai-on-enhancing-post-stroke-patient-care))

**npj Digital Medicine 2025 (UI/UX requirements for stroke survivors):** participatory co-design with end users is necessary; clinicians frequently abandon tools that don't match their workflow. ([npj Digital Medicine](https://www.nature.com/articles/s41746-025-01796-8))

**Healthcare UX 2026 reviews (Fuselab Creative, Eleken, Idea Theorem):** for clinical tools, information density is acceptable; minimalism is wrong; what matters is information hierarchy + role-specific layouts + reducing cognitive load through good defaults. Mobile-first because clinicians enter data one-handed at the bedside. ([Fuselab](https://fuselabcreative.com/healthcare-ux-design-best-practices-guide/), [Eleken](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications))

**Workflow integration:** Nicolab (the StrokeViewer team) repeatedly emphasizes that the UX problem is the *gap between detection and team activation*, not the data-entry step. Tools that win adoption automate communication; tools that lose adoption add another data-entry burden. ([Nicolab](https://www.nicolab.com/the-impact-of-user-interface-and-user-experience-on-simplifying-stroke-care-for-clinicians/))

### How NeuroWiki Stroke Code compares

| Dimension | Best practice | NeuroWiki status |
|---|---|---|
| Mobile-first | One-handed thumb operation | ✓ Mostly, but the 8 touch-target violations break this |
| Workflow integration | Closed-loop EMR + team notification | ✗ Terminates at "Copy to EMR" — manual paste |
| Information density | Show a lot, organized | ✓ Chassis pass landed this; sticky context bar would close the gap |
| Cognitive load | Strong defaults, optional fields | Partial — Weight required even on DAPT path (H-2) |
| Decision flow | One primary action per step | Partial — BL-1 (double-fire) + H-9 (two CTAs) break this |
| Accessibility (clinician with disability or assistive tech) | WCAG 2.1 AA | ✗ 5 BLOCKER + 4 HIGH WCAG issues open |
| Reversibility | Edit-back to any completed step | ✓ Functionally works; H-1 (UI affordance unclear) breaks the perception |
| Completion signal | Explicit "done" state | ✗ BL-2 — no terminal state |

### One product-level observation

NeuroWiki Stroke Code is a *documentation + decision-support* tool. Pulsara is a *coordination* tool. Different products. NeuroWiki's job is to make the resident faster and more accurate at the bedside; it should not try to be Pulsara. But the *internal* friction we found (BL-1, BL-2, H-6, H-10) is the same kind of friction that drives abandonment in any of these tools.

---

## Sweep status — CLOSED 2026-05-24

All four waves shipped today. Each commit was a single-revert rollback boundary; Gate 6 live-verify green on every push.

| Wave | Commit | Scope |
|---|---|---|
| 1 — Patient safety + drop-offs | 206ee42 | BL-1 (CTA double-fire) · BL-2 (terminal Code-Documented state) · H-1 (back-edit Edit-pill affordance) |
| 2 — Visual + structural UX | 9e66ef4 | H-2 H-3 H-4 H-5 H-6 H-7 H-8 H-9 H-10 H-11 H-12 + M-1 L-1 L-3 |
| 3 — Mobile + touch targets | 5995692 | BL-6 BL-7 BL-8 H-13 H-14 H-17 M-4 M-7 L-4 — every top-of-viewport interaction now 44px+ |
| 4 — WCAG 2.1 AA | (this commit) | BL-3 BL-4 H-1-modal H-20 M-8 M-9 M-10 M-11 M-12 M-13 — role="alert" + fieldset + role="group" + section h3 + focus management on step transitions + contrast nudges |

Remaining items left for future waves (BL-5, H-18, H-19, H-21, M-2 M-3 M-5 M-6 M-14 M-15 M-16, L-2 L-5 L-6 L-8 L-9, plus the Wave-5 product-roadmap items): explicit on the audit; not closing without separate execution.

## Part 4 — Proposed execution sequence (subject to your priority calls)

**Wave 1 — Patient safety + drop-off cliffs (1 commit, Class C):**
- BL-1 Step 1 CTA double-fire
- BL-2 Step 3 terminal "code is done" state
- H-1 Make back-to-step affordance obvious

**Wave 2 — Visual + structural UX (1 commit, Class C):**
- H-6 Invert Step 3 order (Summary first, Orders below)
- H-10 Remove duplicate Copy to EMR
- H-11 Sticky context bar with window badge
- H-7 Disabling symptoms visual weight
- H-9 Extended IVT CTA precedence
- H-2 Weight required only when relevant
- H-3 CTA & LVO gated on CT result
- H-4 Panel collapse lock in required mode
- H-5 Panel re-expand on NIHSS modal return
- H-8 BP alert acknowledge `bpControlled` flag
- H-12 ICH protocol modal chassis-align (your flag)
- M-1 Live countdown in last 30 min of tPA window
- L-1, L-2, L-3, L-4 minor polish

**Wave 3 — Touch targets + mobile fixes (1 commit, Class C):**
- BL-6, BL-7, BL-8 — sticky-header back arrow + NIHSS modal close + eligibility Cancel button → 44px
- H-13 Code/Study toggle 44px
- H-14 LKW calendar cells 44px
- H-15 LKW sleep-onset wake validation pin above footer
- H-16 Computed Dosing 320px overflow
- H-17 Eligibility footer wrap on 375px
- M-4, M-5, M-6, M-7, M-16, L-5, L-6 — remaining mobile polish

**Wave 4 — WCAG 2.1 AA compliance (1 commit, Class C):**
- BL-3 Focus management on step transitions
- BL-4 Live regions on clinical alerts
- BL-5 Radiogroup semantics on Treatment Decision + LVO
- H-18 PatientContextPanel `aria-controls` target always in DOM
- H-19 Locked rail step focusable
- H-20 Eligibility section eyebrows as `<h3>`
- H-21 `prefers-reduced-motion` guards
- M-8, M-9 contrast on red-600 + slate-400 eyebrows
- M-10, M-11 fieldset on disabling symptoms + role=group on anticoag
- M-12, M-13, M-14 accessible names on NIHSS Calc + LKW + Weight
- M-15 `<abbr>` on calendar DOW
- L-7, L-8, L-9, L-10 minor a11y polish

**Wave 5 — Future product decisions (separate PRs, may need design review):**
- "Start New Code" button + sessionStorage reset
- Role-specific layouts (resident vs attending vs nursing)
- Closed-loop EMR integration (deep link out + back) — large, separate roadmap item
- Co-design session with bedside residents to validate the rest

---

## What I need from you

Walk through the BLOCKER + HIGH lists in Part 2 and tell me, for each:
1. **Ship in Wave 1** (this week)
2. **Ship in Wave 2/3/4** (next 1–2 weeks)
3. **Park** (defer to roadmap)
4. **Push back** (you disagree with the finding or the proposed approach)

Or, if you'd rather, say "ship Waves 1–4 in order, my answers are obvious." Either way works.
