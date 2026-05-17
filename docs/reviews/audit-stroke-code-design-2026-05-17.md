# Stroke Code design / UI-UX audit — 2026-05-17

**Scope:** Design/UI-UX audit of /pathways/stroke-code surface (~5000 LOC across 20+ files).
**Trigger:** V requested design walkthrough as part of swarm audit.
**Status:** findings + concrete improvement suggestions only. No code edits in this pass.
**Out of scope:** PM/connectivity (parallel quality-assurance audit), accessibility (parallel a11y audit), clinical content.

## Severity legend
- HIGH: visibly broken design, design-system violation that affects multiple surfaces, or visible inconsistency at the page level
- MEDIUM: noticeable inconsistency or token deviation; doesn't break the flow but creates polish-debt
- LOW: minor token drift or polish opportunity

---

## A. Design system compliance findings

### A-01 — HIGH: `border-2` used on multiple interactive elements (banned utility)
The spec explicitly bans `border-2`. Violations found:

- `StrokeBasicsWorkflowV2.tsx:613` — Thrombectomy Recommendation card: `border-2 border-neuro-200`
- `StrokeBasicsWorkflowV2.tsx:635` — "Copy to Clipboard" button inside Thrombectomy card: `border-2 border-neuro-200`
- `StrokeBasicsLayout.tsx:83` — Floating sidebar toggle button: `border-2 border-slate-200`
- `ThrombolysisEligibilityModal.tsx:272` — every chip in the Hard Stops grid: `border-2`
- `ThrombolysisEligibilityModal.tsx:312` — every chip in the Bleeding/Labs grid: `border-2`
- `ThrombolysisEligibilityModal.tsx:351` — every chip in the Relative grid: `border-2`
- `ThrombolysisEligibilityModal.tsx:396` — every chip in the Extended Window grid: `border-2`

Fix: Replace all with `border border-{color}`. The selected-state visual difference is handled via `bg-*` fill, not border width — which is exactly what spec §every-selected-state mandates.

### A-02 — HIGH: Off-palette colors throughout (banned: `blue-*`, `purple-*`, `green-*`, `gray-*`, `sky-*`, `yellow-*`)
The design system permits `neuro-*`, `slate-*`, and CALCULATOR_SPEC severity tokens only for UI chrome.

**CodeModeStep4.tsx — `getCategoryClasses()`:**
- `stroke-workup` category: `bg-purple-50`, `border-purple-200`, `text-purple-900`, `text-purple-700`, `text-purple-600`, `text-purple-600 focus:ring-purple-500` (lines 324–330)
- `labs` category: `bg-sky-50`, `border-sky-200`, `text-sky-900`, `text-sky-700`, `text-sky-600` (lines 333–340)
- `general` category: `bg-blue-50`, `border-blue-200`, `text-blue-900`, `text-blue-700`, `text-blue-600` (lines 343–350)
- `getEvidenceBadgeStyle()` at line 362: `bg-emerald-100 text-emerald-800` for Class I (emerald is CALCULATOR_SPEC severity token — acceptable) but `bg-amber-50 text-amber-700` for IIb and `bg-slate-100 text-slate-600` for III are acceptable. However no brand `neuro-*` representation for IIa — uses `bg-neuro-50 text-neuro-700` (correct).

**DeepLearningModal.tsx:**
- Line 10: `bg-green-100 text-green-800 border-green-300` for Class I badge
- Line 11: `bg-blue-100 text-blue-800 border-blue-300` for Class IIa badge
- Line 12: `bg-yellow-100 text-yellow-800 border-yellow-300` for Class IIb badge
- Line 176: filter button `text-blue-600 hover:underline`
- Lines 210–214: Class I filter chip: `bg-green-100 text-green-800 border-green-300`, selected state check icon class
- Lines 209–213: `border-green-600 bg-green-600` for checkbox fill
- Lines 322–323: pearl card: `bg-gradient-to-br from-purple-50 to-blue-50`, `border-purple-200`
- Lines 338–344: pearl type badge: `bg-purple-100 text-purple-800`, `bg-blue-100 text-blue-800`
- Lines 374–378: "Tap to expand" text: `text-purple-600`
- Line 141: modal header: `border-b-2 border-purple-200` (also a `border-2` violation — see A-01)
- Line 146: "Close" button: `hover:bg-gray-100` — `gray-*` is banned; should be `hover:bg-slate-100`
- Line 147: `text-gray-500` — banned; should be `text-slate-500`
- Lines 151, 153, 156, 159, 167, 171, 174–175, 177, 180, 182: extensive use of `text-gray-*`, `text-gray-900`, `text-gray-500` throughout modal

**StrokeBasicsWorkflowV2.tsx:**
- Line 406–433: Study mode evidence card for Step 1 uses `border border-blue-200 bg-blue-50` with `text-blue-800`, `text-blue-600`, `text-blue-500`, `text-blue-900`, `text-blue-700` throughout
- Line 614–615: Thrombectomy card: `bg-gradient-to-r from-neuro-50 to-blue-50` — the `blue-50` bleed is off-palette; use `to-neuro-100` or `to-white`
- Line 615: `bg-gradient-to-br from-neuro-500 to-blue-600` — icon badge uses off-palette `blue-600`

**StrokeIchProtocolStep.tsx:**
- Line 71: `bg-red-600 hover:bg-red-700` on the primary CTA — red is a severity token and contextually appropriate for ICH, but as a primary CTA it should follow spec CTA pattern (`bg-neuro-500 hover:bg-neuro-600`) unless V has made an explicit ICH exception. Flagged for review.
- Line 33: uses `material-icons-outlined` which indicates Material Icons dependency alongside lucide-react (see A-03).

### A-03 — HIGH: Mixed icon libraries (Material Icons + Lucide) in the same surface
Multiple files use `material-icons-outlined` (a Material Icons web font class) alongside lucide-react:

- `DeepLearningModal.tsx` lines 200, 213, 218, 232, 248, 254, 263, 266, 269, 302, 357: `<span className="material-icons-outlined">` used for checkmarks, icons in filter chips, and lightbulb/empty-state icons
- `StrokeIchProtocolStep.tsx` lines 31, 41, 72: `<span className="material-icons-outlined">` for info/error/check_circle icons

The rest of the stroke surface uses lucide-react exclusively. This creates an inconsistent icon weight/style and introduces a web-font load dependency. Per design system rules, lucide-react is the icon library of record.

### A-04 — MEDIUM: Inline `style` used for layout and shadow (banned per rules)
- `StrokeBasicsLayout.tsx:85–87` — `style={{ left: ..., transition: ... }}` on the sidebar toggle. Positional layout in inline style; should be handled by dynamic Tailwind classes or CSS variables.
- `HemorrhageProtocolModal.tsx:70`, `TpaReversalProtocolModal.tsx:79`, `OrolingualEdemaProtocolModal.tsx:78` — `style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}`. Hardcoded shadow via inline style; use `shadow-2xl` (which maps to a similar value) to stay token-compliant.
- `ThrombectomyPathwayModal.tsx:45` — `style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}` — same issue.
- `LKWTimePicker.tsx:88–93` — `style={{ height: ..., scrollbarWidth: 'none', WebkitOverflowScrolling: ... }}` on ScrollCol's scroll div. `scrollbarWidth: none` has no Tailwind equivalent and is acceptable as a functional style. The height value from `itemH` prop is dynamic and also acceptable. Not a violation — flagged informational.
- `StrokeBasicsWorkflowV2.tsx:382` — `style={{ scrollMarginTop: '163px' }}` on the main card panel. No Tailwind equivalent for arbitrary `scrollMarginTop` — acceptable as functional. Flagged informational.

### A-05 — MEDIUM: Typography inconsistencies in section labels
Spec mandates section eyebrow labels as `text-[10px] font-bold uppercase tracking-widest text-slate-400`.

Compliant examples (correctly implemented):
- `CodeModeStep1.tsx:146` — `text-[10px] font-bold uppercase tracking-widest text-slate-400`
- `CodeModeStep2.tsx:122` — `text-[10px] font-bold uppercase tracking-widest text-slate-400`

Non-compliant in the same surface:
- `ThrombolysisEligibilityModal.tsx:264` — Hard Stops label: `text-[11px] font-bold uppercase tracking-wider text-red-500` — wrong size (`11px` vs `10px`), wrong tracking (`wider` vs `widest`), wrong color (`red-500` instead of `slate-400`)
- `ThrombolysisEligibilityModal.tsx:305` — Bleeding/Labs label: `text-[11px] font-bold uppercase tracking-wider text-red-400` — same sizing and tracking issues
- `ThrombolysisEligibilityModal.tsx:344` — Relative label: `text-[11px] font-bold uppercase tracking-wider text-amber-600` — wrong size and tracking
- `DeepLearningModal.tsx:151` — `text-xs font-bold text-gray-500 uppercase tracking-wider` — wrong size class (`xs` vs `[10px]`), wrong tracking, banned `gray-*` color

### A-06 — MEDIUM: Missing dark mode pairings on multiple `bg-*` usages
The design system requires every `bg-*` to have a `dark:` partner. The stroke surface has no dark mode coverage at all. This is a pre-existing systemic gap rather than a new violation per-component, but it's notable given the modern pathway surfaces (EVT, SE, Migraine) also lack it — this is a repo-wide gap to track, not a Stroke Code-specific fix. Flagged for V's awareness.

### A-07 — LOW: `font-black` used outside spec contexts
- `CodeModeStep1.tsx:285` — NIHSS score display: `text-4xl font-semibold` — correct. But the adjacent `font-mono font-bold` on context bar values (StrokeBasicsWorkflowV2.tsx:350, 355, 360, 366) is fine.
- Not a `font-black` violation in this surface. Clean.

### A-08 — LOW: Hardcoded hex in JSX
- None found in this surface. All colors go through Tailwind tokens or the CALCULATOR_SPEC severity map.

---

## B. Component patterns and consistency

### B-01 — HIGH: Five protocol modals with identical structure but no shared primitive
`TpaReversalProtocolModal.tsx`, `OrolingualEdemaProtocolModal.tsx`, `HemorrhageProtocolModal.tsx` are structurally identical: fixed overlay → `max-w-lg` container → header (title + close button) → scrollable body with alert banner + numbered steps → footer (Copy to EMR + Close). They differ only in title, alert severity color, and data.

Yet each is a separate 140–155 LOC file with all structure duplicated. Estimated duplication: ~300 LOC of identical shell markup.

A `ProtocolModal` primitive consuming `{ title, subtitle, alertSeverity, alertLabel, alertBody, steps, emrText }` would reduce this to ~50 LOC total and unify the focus-trap implementation, `role="dialog"`, `aria-labelledby` wiring, Escape key handling, and copy-to-EMR logic.

`ThrombolysisEligibilityModal.tsx` uses a different but related pattern (sheet-style, slides from bottom on mobile) — can share the header/footer frame but not the body.

`DeepLearningModal.tsx` uses yet another pattern (right drawer on desktop, bottom sheet on mobile) — entirely different shape, cannot share.

`ThrombectomyPathwayModal.tsx` wraps a full page component inside a modal — another distinct pattern.

So the surface has 4 distinct modal patterns for 6 modals. This is manageable if each pattern is a reusable primitive, but right now each modal hard-codes its own frame.

### B-02 — HIGH: Inconsistent radio button / selection chip implementation
Two parallel selection patterns exist for the same type of interaction (tap one of N options):

**Pattern 1 — Radio row with custom dot** (CodeModeStep2.tsx:136–168, 241–267):
```
button > div.rounded-full.border-2 + label text
```
Uses `border-2` (banned), requires custom dot element, and the outer `button` is the interactive target.

**Pattern 2 — Toggle chip** (ThrombolysisEligibilityModal.tsx chips):
```
div.rounded-xl.border-2 > button (text) + button (info icon)
```
Also uses `border-2` (banned), and splits interactivity across two buttons.

**Pattern 3 — LVO present chips** (CodeModeStep2.tsx:292–306):
```
button.rounded-lg.border.capitalize
```
Simpler — no custom indicator, uses border color change only. Closer to spec but selected state is border-only, not full fill.

The spec says: "Every selected state uses full fill (border + background), not just border." Pattern 3 violates this. Patterns 1 and 2 do implement fill changes but use `border-2`.

Fix: One shared `SelectionChip` or `RadioOption` primitive with `border border-{color}` (no `border-2`) and `bg-*` fill when selected.

### B-03 — HIGH: `DeepLearningModal` is a completely off-brand bespoke component
The DeepLearningModal (`DeepLearningModal.tsx`) predates the design system and uses:
- `gray-*` colors throughout (banned)
- `purple-*` and `blue-*` throughout (banned)
- `border-b-2` in the header (banned)
- `material-icons-outlined` instead of lucide-react (see A-03)
- emoji characters in headings (`🔬 Deep Learning`) — spec says no emojis in files unless explicitly requested
- `hover:scale-[1.01]` on pearl cards — animation without discipline (animations everywhere vs. nowhere — see E-02)
- `bg-gradient-to-br from-purple-50 to-blue-50` on each pearl card — off-palette gradient

This modal was clearly built before the design system was established and has never been migrated. It is the most non-compliant component on the entire stroke surface.

### B-04 — MEDIUM: Inconsistent card border radius
Spec mandates `rounded-xl` for section cards, `rounded-lg` for inner cards, `rounded-full` for pills.

Violations:
- `CodeModeStep4.tsx:481` — order category group container: `rounded-lg border border-slate-200` — should be `rounded-xl`
- `StrokeIchProtocolStep.tsx:38` — `bg-red-50 rounded-lg border border-red-200` — outer section card, should be `rounded-xl`
- `StrokeIchProtocolStep.tsx:49` — individual ICH protocol item: `bg-white rounded-lg border border-slate-200` — inner card, `rounded-lg` is correct here
- `TimestampBubble.tsx:198` — timestamps panel: `rounded-2xl` — no spec token for `rounded-2xl` on panels; should be `rounded-xl`

### B-05 — MEDIUM: Two separate "Emergency protocols" surfaces for the same actions
The emergency protocol buttons (tPA reversal, orolingual edema, ICH) appear in TWO places:
1. `TimestampBubble.tsx` FAB (bottom-left) — opens `TpaReversalProtocolModal` and `OrolingualEdemaProtocolModal` via props
2. `StrokeBasicsWorkflowV2.tsx:651–676` — a static button strip at the bottom of the page

The FAB and the static strip trigger the same modals. The duplication creates confusion about which entry point to use and doubles the surface area for inconsistency. On a small mobile screen both are visible simultaneously.

### B-06 — LOW: `StudyPearlsButton` (StrokeBasicsWorkflowV2.tsx:142–152) is a file-level inline component
This small component (12 lines) is defined inside the workflow file and not exported. If Study Mode UI grows, it belongs in its own file or as part of a Study Mode component set. Low priority for now.

### B-07 — LOW: Inconsistent "Copy to EMR" button placement across modals
- `TpaReversalProtocolModal`: Copy is the PRIMARY button (left, filled), Close is secondary (right, outlined)
- `OrolingualEdemaProtocolModal`: Same pattern — Copy primary, Close secondary
- `HemorrhageProtocolModal`: Same pattern — Copy primary, Close secondary
- `ThrombolysisEligibilityModal`: Copy to EMR is a tertiary ghost button (left, outlined), Save & Return is primary (right, filled), Cancel is secondary (middle)
- `CodeModeStep3.tsx`: Copy to EMR is primary (flex-1 filled), Print is secondary (outlined)

A consistent rule should be: when there is a "Save" or "Return" action that updates workflow state, that is primary. Copy to EMR is always secondary/ghost. The three protocol modals invert this unnecessarily.

---

## C. Visual hierarchy and information architecture

### C-01 — HIGH: Tab system for the 3-step flow is an anti-pattern for a guided sequence
`StrokeBasicsWorkflowV2.tsx:324–342` renders a 3-tab bar ("Vitals", "Imaging", "Summary") that lets the user jump freely between steps. This looks like a tab component but is actually a sequential wizard.

The problem: no visual affordance distinguishes "completed", "current", or "locked" state. All three tabs look identical regardless of whether the user has filled Step 1 or not. The user can jump to "Summary" before filling anything. Other pathways (EVT, SE) use the Pattern A rail (`PathwayRailStep`) which communicates progress, completion, and sequence.

This is categorized HIGH because it communicates the wrong mental model to a clinician under time pressure — they may assume steps are independent tabs rather than a guided workflow.

### C-02 — HIGH: Thrombectomy Recommendation card (StrokeBasicsWorkflowV2.tsx:612–648) visually overshoots its importance
The card uses:
- `bg-gradient-to-r from-neuro-50 to-blue-50` (off-palette gradient)
- `border-2 border-neuro-200` (banned)
- `rounded-2xl` (no spec token for this on cards)
- `shadow-lg animate-in slide-in-from-bottom-4 duration-500` (heavy animation)
- Icon badge: `bg-gradient-to-br from-neuro-500 to-blue-600 rounded-xl shadow-md` (off-palette gradient)
- `text-lg font-bold` heading inside a result card (heading size exceeds spec body hierarchy)

The card visually competes with the primary page actions. Per spec, a result/verdict surface should use the standard card shell (`bg-white border border-slate-100 rounded-xl p-4`) and rely on the content (a colored verdict text/badge) to signal importance — not gradient backgrounds and oversized shadows.

### C-03 — MEDIUM: Clinical Context Bar (StrokeBasicsWorkflowV2.tsx:347–379) disappears when not filled
The context bar only renders when `step1DataLive` is truthy. Before Step 1 is completed, the bar is absent. But `mt-16` is applied to the card panel regardless (line 382), leaving a blank gap where the bar would be. More importantly, on a 375px screen this bar wraps — the `flex-wrap` items (NIHSS, BP, Glucose, LKW) stack into 2 rows, consuming significant vertical space before the main content.

### C-04 — MEDIUM: "Labs & Treatment Orders" heading hierarchy is inverted in Step 3
`StrokeBasicsWorkflowV2.tsx:537` renders `<h3 className="text-base font-bold text-slate-900 mb-1">Labs & Treatment Orders</h3>` inside a `rounded-xl border border-slate-200 bg-white p-5 shadow-sm` card.

Two issues:
1. The card uses `shadow-sm` (banned utility; spec says no `shadow-sm`)
2. The `CodeModeStep3` (Code Summary) that renders after this is at the same level but rendered via `<section>` with no corresponding heading — the visual weight between the "Labs" section and the "Code Summary" section is therefore inconsistent

### C-05 — MEDIUM: Study mode evidence `<details>` cards use three different color schemes on the same page
- Step 1 evidence card: `border-blue-200 bg-blue-50` (banned off-palette)
- Step 2 evidence card: `border-neuro-200 bg-neuro-50` (correct)
- Step 3 labs evidence card: `border-amber-200 bg-amber-50` (amber is acceptable severity token)
- Step 3 documentation evidence card: `border-green-200 bg-green-50` (off-palette)

Three different color schemes for the same "evidence accordion" component pattern. Should use a single consistent scheme: `border-slate-200 bg-slate-50` (neutral) or `border-neuro-200 bg-neuro-50` (brand) across all four.

### C-06 — LOW: "Related Resources" grid (StrokeBasicsWorkflowV2.tsx:679–699) uses four different hover colors for four cards
- IV tPA Guide: `hover:bg-neuro-50 hover:border-neuro-300`
- EVT/Thrombectomy: `hover:bg-neuro-50 hover:border-neuro-300`
- ICH Management: `hover:bg-red-50 hover:border-red-300`
- All Calculators: `hover:bg-emerald-50 hover:border-emerald-300`

The inconsistent hover palette for what is semantically a uniform list of resource links creates unnecessary visual noise. All four should use the same hover state (`hover:bg-neuro-50 hover:border-neuro-200`) and rely on the "Protocol"/"Tools" eyebrow label color for semantic differentiation.

---

## D. Mobile UX at 375px

### D-01 — HIGH: `TimestampBubble` has TWO FABs that overlap at the same vertical zone on mobile
At 375px on a phone:
- Emergency FAB: `fixed bottom-24 md:bottom-20 left-4` → at 96px from bottom
- Clock FAB: `fixed bottom-36 md:bottom-20 right-4` → at 144px from bottom

These two FABs have a 48px gap between them. The emergency FAB is at 96px, below the bottom tab bar. When the page is scrolled and the bottom tab bar scrolls away, the FABs may overlap with the bottom of the sticky context bar above and each other's labels. On a 375px screen, the ThoughtBubble tooltip for the Clock FAB (rendered via absolute positioning 100%+0.625rem to the left) may extend off-screen to the left.

### D-02 — HIGH: ThrombolysisEligibilityModal chips — grid-cols-2 at 375px creates 2×5 grid with very small tap areas
The modal uses `grid grid-cols-2 gap-2` for chip grids that contain up to 10 chips. At 375px with `px-4` padding on the container (32px total), the available width is 343px → each chip is ~163px wide. The chips have `min-h-[52px]` which meets the 44px minimum, but the info icon button within each chip (`px-2`) is only ~28px wide — below the 44px minimum touch target.

### D-03 — HIGH: `CodeModeStep4.tsx` — "Copy to EMR" and "Save Orders" buttons share a single row on mobile
`StrokeBasicsWorkflowV2.tsx:554–578` renders two buttons side-by-side: `flex items-center justify-between`. At 375px, "Copy to EMR" is `px-6 py-2.5` and "Save Orders" is `px-8 py-2.5`. The combined width of both plus `gap` likely causes the "Copy to EMR" text to truncate or wrap at 375px. Neither button has `min-w-0` or a flex-basis constraint. No `whitespace-nowrap` guard.

### D-04 — MEDIUM: `mt-16` offset on card panel without sticky header height calc
`StrokeBasicsWorkflowV2.tsx:382` — `<div ... className="px-3 sm:px-6 mt-16 pb-2">`. The `mt-16` (64px) is hardcoded to compensate for the sticky header height. But the sticky header height is variable:
- In Code mode without step 1 data: header row (50px) + tab bar (41px) = ~91px
- In Study mode with QuickReferenceCard expanded: header (50px) + QuickReferenceCard (variable) + tab bar = can exceed 300px

The `mt-16` offset only covers the base case. When QuickReferenceCard is expanded, the first card section is covered by the sticky area. The inline `style={{ scrollMarginTop: '163px' }}` partially compensates for scroll-target cases but does not fix the visual overlap.

### D-05 — MEDIUM: `LKWTimePicker` mobile layout — `sm:max-w-3xl` allows very wide picker on tablet
`LKWTimePicker.tsx:551` — `sm:max-w-3xl` (768px max-width) on a 3-panel time picker. At 375px the mobile layout renders correctly (full-width sheet). But at ~640px (sm breakpoint) the desktop layout kicks in with 3 columns: presets (155px) + calendar (flex-1) + time drums (210px). At 640px the calendar column would be only ~275px — usable but tight. The calendar day buttons (`w-8 h-8 = 32px`) are below 44px minimum touch target at this size. Flagged for mobile-first audit.

### D-06 — MEDIUM: Emergency protocol button strip wraps awkwardly at 375px
`StrokeBasicsWorkflowV2.tsx:651–675` — three `flex-1` buttons in a `flex gap-2` row. Each button has `whitespace-nowrap` which correctly prevents word-wrap. At 375px with `mx-4` (32px margin) and two 8px gaps, each button is ~(375 - 32 - 16) / 3 = ~109px wide. The labels "tPA reversal" (10 chars), "Orolingual edema" (16 chars), and "ICH protocol" (12 chars) — "Orolingual edema" is the longest and at `text-xs` (~10px) it is approximately 100px wide, which fits but is tight. On slightly narrower viewports this risks clipping.

### D-07 — LOW: `StrokeBasicsLayout` wraps mobile content in `px-4` (StrokeBasicsLayout.tsx:113)
Mobile layout: `<div className="px-4">`. This is correct padding but it applies to ALL content including CodeModeStep1 which itself has `space-y-3 px-1` (CodeModeStep1.tsx:141). The double-padding means horizontal edge spacing on mobile is 16px + 4px = 20px. Not harmful but slightly inconsistent with other pathway surfaces which use `px-3` or `px-4` at the page level only.

---

## E. Interaction patterns

### E-01 — HIGH: The 3-tab stepper has no backward affordance and no progress indicator
`StrokeBasicsWorkflowV2.tsx:325–342` — The tab bar shows "Vitals | Imaging | Summary" but:
1. No completed/incomplete/locked state is visualized on any tab
2. No step counter ("2 of 3"), no fill bar, no checkmarks
3. The user cannot tell if they have completed step 1 before moving to "Summary"
4. Auto-advance on form complete (`setActiveCard(2)`) at line 399 has no visual feedback — it simply jumps; no animation, no "Saved" confirmation

This is especially critical in a clinical tool used under time pressure. A clinician might complete Step 1, advance to Imaging, then wonder: "Did I actually save my vitals?" The answer (yes, because the context bar appeared) is not obvious.

### E-02 — MEDIUM: Animation discipline — `slide-in-from-bottom-4 duration-500` on Thrombectomy card only
`StrokeBasicsWorkflowV2.tsx:613` — `animate-in slide-in-from-bottom-4 duration-500`. This is the only animated entrance in the entire stroke surface. The NIHSS modal, eligibility modal, clock picker, and other elements appear without animation. Having animation on one element but not others creates an inconsistent interactive feel. Either introduce consistent entrance animations on modals/panels, or remove the one anomalous animation.

### E-03 — MEDIUM: ThoughtBubble auto-dismiss timing (5s) is too fast for a first-time user
`TimestampBubble.tsx:66–74` — Both thought bubbles auto-dismiss after 5000ms. The hint for "Emergency protocols" and "Record Stroke Time Stamps" are the only affordance for two non-obvious FABs. A clinician using the page for the first time who spends >5s reading any prior content will never see these labels. Consider 10–12s or "dismiss on first interaction elsewhere."

### E-04 — MEDIUM: `LKWTimePicker` confirm button label ("OK") is inadequate as a primary CTA
`LKWTimePicker.tsx:718` — `<button ...>OK</button>` styled as a plain text button (`text-slate-500 hover:text-neuro-600`) with no background fill. This is the PRIMARY action for the most critical input in the stroke workflow. It should be `bg-neuro-500 text-white rounded-xl px-8 py-2.5 min-h-[44px]` like the CTA pattern used everywhere else. The current style makes it look like a secondary action.

### E-05 — MEDIUM: No inline validation feedback on vitals inputs — error only appears as alert box below
`CodeModeStep1.tsx` — when BP is too high, the input border turns red (good) but the alert box is rendered BELOW the input (line 242), potentially below the fold on a 375px screen. The user must scroll to see why the form won't submit. Consider placing the error inline directly under the input pair.

### E-06 — LOW: `DeepLearningModal` pearl cards use `hover:scale-[1.01]` — animation overkill
`DeepLearningModal.tsx:323` — Every pearl card scales on hover. This is a mobile-unfriendly hover effect (no hover state on touch) and creates a "everything jiggles" feel on desktop. Lucide/spec pattern for interactive list items is background color change only.

### E-07 — LOW: `StrokeIchProtocolStep` CTA says "Mark ICH protocol complete" but no completion state is tracked
`StrokeIchProtocolStep.tsx:67–75` — the button calls `onComplete()` but the parent (`StrokeBasicsWorkflowV2.tsx:529–532`) passes a no-op: `onComplete={() => { /* no-op */ }}`. The button has no disabled state, no "completed" visual, and clicking it does nothing visually. This is likely a PM/QA finding too (broken wiring), but from a design perspective the button should not exist if it has no effect. Either wire it or replace with an informational affordance.

---

## F. Pattern A adoption opportunities

The following Pattern A primitives exist in `src/components/pathways/` and are used by EVT, SE, Migraine, and ExtendedIVT pathways. Stroke Code predates these and implements bespoke versions of the same patterns.

### F-01 — PathwayHeader (`PathwayHeader.tsx`)
**What it does:** Sticky header with back navigation, title, Code/Study mode toggle, and action buttons.
**Stroke Code equivalent:** The manual sticky header block at `StrokeBasicsWorkflowV2.tsx:281–343` — 62 lines of custom header markup including the back button, title, mode toggle, and tab bar.
**Adoption benefit:** Unified sticky header across all pathways. Back button, title, and mode toggle are already parameterizable. The tab bar is Stroke-specific and would need a `children` slot or extension prop.
**Cost:** Medium. Header slot extension needed, plus integration testing.
**Recommendation:** Adopt — highest ROI of all Pattern A opportunities.

### F-02 — PathwayRailStep (`PathwayRail.tsx`)
**What it does:** Vertical step indicator showing step number, label, completed/active/locked state, and a connecting rail line.
**Stroke Code equivalent:** The 3-tab system (`StrokeBasicsWorkflowV2.tsx:325–342`) conveys no step state.
**Adoption benefit:** Would fix C-01 (missing progress indicator), E-01 (no backward affordance), and give the workflow the visual "where am I" clarity that the 3-tab bar lacks. Can be rendered horizontally (the rail pattern already supports horizontal mode in the PathwayRail component).
**Cost:** High — requires rethinking the tab→rail UX transition and mobile layout. This is a significant visual redesign of the core navigation.
**Recommendation:** Propose to V as a standalone design initiative, not a patch.

### F-03 — PathwayCategoryRow (`PathwayCategoryRow.tsx`)
**What it does:** A selectable row with label, optional sublabel, and toggle/radio state.
**Stroke Code equivalent:** The CT Result radio options (CodeModeStep2.tsx:136–168) and Treatment Decision options (CodeModeStep2.tsx:241–267) — both use a bespoke `button > div.radio-dot + text` pattern.
**Adoption benefit:** Would fix B-02 (inconsistent selection pattern), remove the `border-2` violations, and standardize the radio interaction.
**Cost:** Low. The existing PathwayCategoryRow API is close to what's needed; may need a `subLabel` prop (dose info).
**Recommendation:** Adopt in the next Step 2 fix pass.

### F-04 — PathwayLearningPearl (`PathwayLearningPearl.tsx`)
**What it does:** Collapsible clinical pearl card with eyebrow label, content, and optional citation.
**Stroke Code equivalent:** The Study mode `<details>` evidence accordions (StrokeBasicsWorkflowV2.tsx:406–434, 470–495, 567–595). These are bespoke `<details>` elements with divergent color schemes.
**Adoption benefit:** Would fix C-05 (three different evidence accordion color schemes) and bring Study mode into the same visual language as other pathways.
**Cost:** Low. The PatternA pearl takes `title`, `body`, `citation` props — matching the existing accordion data shape.
**Recommendation:** Adopt. High impact, low effort.

### F-05 — PathwayCascadeNotice (`PathwayCascadeNotice.tsx`)
**What it does:** Alert/warning notice with severity color and icon.
**Stroke Code equivalent:** The BP alert (CodeModeStep1.tsx:243–261), glucose alert (CodeModeStep1.tsx:263–277), and eligibility warning boxes (CodeModeStep2.tsx:173–199).
**Adoption benefit:** Would unify the alert/warning pattern and fix A-02 (off-palette blue/amber alerts).
**Cost:** Low. CascadeNotice already takes a severity prop.
**Recommendation:** Adopt selectively — the inline BP/glucose alerts are a good match.

### F-06 — PathwayCocktailSummary (`PathwayCocktailSummary.tsx`)
**What it does:** Displays a summary row of selected values (drug, dose, rationale).
**Stroke Code equivalent:** The tPA/TNK dosing display in `CodeModeStep1.tsx:351–364` (two side-by-side pill cards showing dose + details).
**Adoption benefit:** Would standardize dose display across pathways.
**Cost:** Medium. The CocktailSummary may need a `compact` variant; current layout assumes a full-width row.
**Recommendation:** Consider — lower priority than F-03/F-04.

### F-07 — PathwayBottomDrawer / CalculatorDrawer
**What it does:** A bottom-anchored persistent result drawer showing verdict/recommendation, collapsible.
**Stroke Code equivalent:** The Thrombectomy Recommendation card (`StrokeBasicsWorkflowV2.tsx:612–648`) is the closest analog — it surfaces a verdict after the EVT modal returns.
**Adoption benefit:** Would fix C-02 (overshooting visual weight of Thrombectomy card) and replace the `border-2` gradient card with the spec-compliant drawer pattern.
**Cost:** Medium. Would require refactoring the thrombectomy recommendation display from an in-flow card to a bottom-pinned surface.
**Recommendation:** Evaluate alongside the PathwayRail rail redesign (F-02); would pair naturally.

---

## G. Concrete improvement suggestions (triage-ready)

Sorted by impact/cost ratio (highest first).

### G-01 — HIGH IMPACT / LOW COST: Replace `border-2` with `border` across the entire stroke surface
**Files:** ThrombolysisEligibilityModal.tsx (lines 272, 312, 351, 396), StrokeBasicsWorkflowV2.tsx (lines 613, 635), StrokeBasicsLayout.tsx (line 83), DeepLearningModal.tsx (line 141).
**Fix:** Find/replace `border-2` with `border`. Selected-state visual difference maintained via `bg-*` fill (no visual regression). ~20 replacements.
**Class:** B — tiny edit per file.

### G-02 — HIGH IMPACT / LOW COST: Consolidate 3 protocol modals into one `ProtocolModal` primitive
**Files:** `TpaReversalProtocolModal.tsx`, `OrolingualEdemaProtocolModal.tsx`, `HemorrhageProtocolModal.tsx`
**Fix:** Create `src/components/article/stroke/ProtocolModal.tsx` with props `{ title, subtitle, alertSeverity: 'red' | 'amber', alertLabel, alertBody, steps: { title, body }[], emrText }`. Reduce ~450 LOC to ~100 LOC total (primitive + 3 thin wrappers or direct call-sites).
**Class:** C.

### G-03 — HIGH IMPACT / LOW COST: Migrate `DeepLearningModal` color palette
**File:** `DeepLearningModal.tsx`
**Fix:** 
1. Replace all `gray-*` with `slate-*`
2. Replace `purple-*` chrome (header border, card background, "Tap to expand" text) with `neuro-*` (`border-neuro-200`, `bg-neuro-50`, `text-neuro-600`)
3. Replace `blue-*` chrome with `slate-*` or `neuro-*`
4. Replace `material-icons-outlined` with lucide-react equivalents (BeakerIcon → `FlaskConical`, `check` → `Check`, `lightbulb` → `Lightbulb`, `filter_alt_off` → `FilterX`)
5. Remove emoji from heading
6. Remove `hover:scale-[1.01]` from pearl cards (replace with `hover:bg-neuro-50` transition)
**Class:** C.

### G-04 — HIGH IMPACT / MEDIUM COST: Replace Study mode evidence accordions with `PathwayLearningPearl`
**File:** `StrokeBasicsWorkflowV2.tsx` (lines 406–434, 470–495, 567–595, 579–594)
**Fix:** Replace the 4 bespoke `<details>` elements with `<PathwayLearningPearl>` instances. Fixes C-05 (three different color schemes) and aligns with other pathways.
**Class:** C.

### G-05 — HIGH IMPACT / MEDIUM COST: Replace CT Result and Treatment Decision radio rows with `PathwayCategoryRow`
**File:** `CodeModeStep2.tsx` (lines 136–168, 241–267)
**Fix:** Import and use `PathwayCategoryRow` with `subLabel` for dose info. Removes `border-2` from radio pattern and unifies selection interaction across pathways.
**Class:** C.

### G-06 — HIGH IMPACT / MEDIUM COST: Standardize the 3-tab stepper with step state indicators
**File:** `StrokeBasicsWorkflowV2.tsx` (lines 324–342)
**Fix:** Add `completed`, `active`, and `todo` visual states to each tab. At minimum: a checkmark or filled dot on completed tabs, a colored underline on the active tab (already present via `border-neuro-500`), and muted text on future tabs when no data yet.
**This is a partial fix.** Full fix would adopt `PathwayRailStep` (F-02) — propose to V as a separate initiative.
**Class:** C.

### G-07 — MEDIUM IMPACT / LOW COST: Fix `LKWTimePicker` confirm button to match spec CTA pattern
**File:** `LKWTimePicker.tsx` (line 718)
**Fix:** Change `<button className="px-8 py-2 rounded-lg text-base font-semibold text-slate-500 hover:text-neuro-600 ...">OK</button>` to `<button className="px-8 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors">Set LKW Time</button>`.
**Class:** B.

### G-08 — MEDIUM IMPACT / LOW COST: Replace inline `style={{ boxShadow: ... }}` with `shadow-2xl`
**Files:** `HemorrhageProtocolModal.tsx:70`, `TpaReversalProtocolModal.tsx:79`, `OrolingualEdemaProtocolModal.tsx:78`, `ThrombectomyPathwayModal.tsx:45`
**Fix:** Remove inline `style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}` and add `shadow-2xl` to each modal container's className.
**Class:** B per file.

### G-09 — MEDIUM IMPACT / LOW COST: Replace `material-icons-outlined` in `StrokeIchProtocolStep` with lucide-react
**File:** `StrokeIchProtocolStep.tsx` (lines 31, 41, 72)
**Fix:**
- `material-icons-outlined: info` → `<Info className="w-5 h-5 text-amber-600" />`
- `material-icons-outlined: error_outline` → `<AlertCircle className="w-5 h-5 text-red-600" />`
- `material-icons-outlined: check_circle` → `<CheckCircle className="w-5 h-5" />`
**Class:** B.

### G-10 — MEDIUM IMPACT / MEDIUM COST: Consolidate duplicate Emergency Protocols surfaces
**Files:** `TimestampBubble.tsx`, `StrokeBasicsWorkflowV2.tsx` (lines 651–676)
**Fix:** Remove the static emergency button strip from the bottom of the page. The FAB in `TimestampBubble` already provides access; the static strip is redundant and confusing. If V wants emergency protocols permanently visible, keep the strip and remove the emergency FAB from `TimestampBubble`.
**Class:** C.

### G-11 — MEDIUM IMPACT / MEDIUM COST: Fix off-palette colors in `getCategoryClasses()` in CodeModeStep4
**File:** `CodeModeStep4.tsx` (lines 312–351)
**Fix:** Replace category color schemes:
- `stroke-workup` (purple): → `bg-neuro-50 border-neuro-200 text-neuro-900` (brand secondary)
- `labs` (sky): → `bg-slate-50 border-slate-200 text-slate-900` (neutral)
- `general` (blue): → already reasonable to map to `neuro-*` as secondary
**Class:** C.

### G-12 — LOW IMPACT / LOW COST: Increase ThoughtBubble auto-dismiss from 5s to 10s
**File:** `TimestampBubble.tsx` (lines 66–74)
**Fix:** Change `5000` to `10000` in both `setTimeout` calls. Small improvement in discoverability for first-time users.
**Class:** B.

### G-13 — LOW IMPACT / LOW COST: Remove `shadow-sm` from the orders card shell
**File:** `StrokeBasicsWorkflowV2.tsx` (line 536)
**Fix:** `className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"` → remove `shadow-sm`. Spec bans `shadow-sm`.
**Class:** B.

---

## H. Summary stats

- **Total findings:** 37 (across sections A–G)
- **HIGH:** 11 (A-01, A-02, A-03, B-01, B-02, B-03, C-01, C-02, D-01, D-02, D-03)
- **MEDIUM:** 18 (A-04, A-05, A-06, B-04, B-05, C-03, C-04, C-05, D-04, D-05, D-06, E-02, E-03, E-04, E-05, F-01 through F-07 as observations)
- **LOW:** 8 (A-07, A-08, B-06, B-07, C-06, D-07, E-06, E-07)
- **Pattern A adoption opportunities flagged:** 7 (F-01 through F-07)
- **Files inspected:** 22

### Top 5 by impact/cost ratio (triage order for V)

1. **G-01** — Replace `border-2` with `border` everywhere (B-level per file, fixes a HIGH design-system violation across 8 files, ~20 replacements)
2. **G-09 + G-03** — Purge `material-icons-outlined` and `gray-*`/`purple-*` from `DeepLearningModal` and `StrokeIchProtocolStep` (C-level, fixes both A-02 and A-03 in the two worst offenders)
3. **G-02** — Consolidate 3 protocol modals into one `ProtocolModal` primitive (~350 LOC reduction, fixes B-01 and B-07)
4. **G-07** — Fix `LKWTimePicker` confirm button (B-level, fixes E-04 — most critical input in the workflow has a nearly invisible CTA)
5. **G-04** — Migrate Study mode evidence accordions to `PathwayLearningPearl` (C-level, fixes C-05 and adopts Pattern A)

---

### @ui-architect — Sign-off
**Spec cited:** `.claude/skills/design-tokens/SKILL.md` (full), `CLAUDE.md §4`, design system enforcement rules
**Layout decisions:** Read-only audit pass. No layout decisions made. Findings and suggestions documented above.
**Deviations from spec:** None in this audit output.
**Risks flagged:**
1. The `DeepLearningModal` palette migration (G-03) touches a surface with filter state and 5 evidence class badges — needs visual regression verification on all badge combinations.
2. The `ProtocolModal` consolidation (G-02) must maintain ARIA structure (`role="dialog"`, `aria-labelledby`, `aria-describedby`) identically across all three modals — coordinate with accessibility-specialist.
3. Pattern A rail adoption (F-02) is a significant UX redesign — should not be executed as a patch; requires V's explicit design decision and a Class D plan.
**Status:** ready
