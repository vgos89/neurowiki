# UX Audit — EVT Pathway Round-6 Mockup (ui-architect lens)

**Date:** 2026-05-15
**Auditor:** ui-architect
**Skills loaded:** design-tokens, design:design-system, design:design-critique
**Scope:** Page composition, visual hierarchy, warmth/approachability, calculator-reference parity
**Output mode:** Read-only audit; no source files edited.

---

## Executive summary

- **Overall verdict:** minor-revisions-needed. The round-6 mockup is structurally sound and spec-compliant. It is not broken. But it reads more like an interactive spec sheet than a tool a tired clinician reaches for eagerly — the gap is not in the layout or the tokens, it is in three specific zones where the warmth is missing and one where friction is introduced.
- **10 findings: 0 Critical, 2 High, 4 Medium, 3 Low, 1 Polish.**
- **The 3 most consequential UX issues for bedside usability:**
  1. (Finding 1, High) The `Select…` unselected placeholder communicates nothing beyond "empty." A busy clinician who opens this at 2 AM on a stroke alert does not know whether to tap the row, whether it will expand, or what the full option set looks like. The affordance is too quiet.
  2. (Finding 2, High) The chip hover state is a pure spec-land construct. In the static mockup it reads as a passive label; without a visible "edit" microhint adjacent to the resting chip, a first-time (or fatigued) user will never discover tap-to-edit.
  3. (Finding 5, Medium) The "Awaiting Step N ↑" locked-step placeholder is correct spec but is the quietest element on the page — a single italic gray line that is easy to skim past. Under time pressure, a user who cannot find "why won't this step open" will feel the tool is broken.
- **Where round 6 already shines:** The cascade-clear notice (Frame 6) is exceptionally well-designed — inline, proportional, named exactly what was cleared, with an Undo that does not require a modal. The rail cobalt-vs-slate state communication is perceptually precise (Bertin ordinal cue, exactly as the research validated). The completed-step `cat-row-completed` with cobalt left-bar and neuro-50 background reads immediately as "done."
- **Is this user-friendly enough?** For a clinician who has used it before: yes. For a clinician opening it for the first time at 2 AM: no — the affordances for the category-row accordion and the tap-targetable chip are discoverable only if you already know they are there. One round of polish on those two interaction points closes the gap.

---

## Method

All six frames of `docs/specs/mockups/pathway-evt-reference.html` were read in full, including the `<style>` block, all inline CSS classes, and the HTML structure of every node, chip, category-row, drawer, and cascade notice. `docs/specs/mockups/calculator-reference.html` was read alongside for direct comparison (all three archetypes: ICH Score, NIHSS, HAS-BLED). `docs/specs/PATHWAY_SPEC.md` was read in full to distinguish intentional decisions from accidental gaps. `docs/research/2026-05-15-flowchart-pathway-design-research.md` Parts C and D were used to anchor what was already audited — findings that map to a "Satisfies" verdict in that table are not re-litigated here. This audit focuses on what the research synthesis validated as partials (Principles 4, 7, 8) and the user-friendliness / warmth dimensions that the research synthesis did not address (it was a structural-principles audit, not an approachability audit).

**Not re-litigated:** the research synthesis confirmed that the rail's node system, the progressive-disclosure of locked steps, the verdict-in-drawer pattern, the input affordance vocabulary (tri-button / band / numeric), and the cascade-clear notice all satisfy their respective principles. Those are not findings here.

---

## Findings

### Finding 1 — Category-row `Select…` placeholder communicates no affordance

- **Severity:** High
- **Frame(s):** Frame 1 (all 5 rows unselected), Frame 2 (Step 2 rows unselected)
- **Element:** `.cat-row-value-unset` — `font-size:0.875rem; color:#94a3b8; font-style:italic`
- **What's not user friendly:** The text "Select…" is italic slate-400 on a white background. On a real device at arm's length under fluorescent light, this reads as an empty field, not a tappable accordion trigger. There is no visual indicator — no chevron color change, no background tint, no label — that says "tap here to expand options."
- **Why it matters:** The first thing a clinician does on opening the tool is try to interact with Step 1. If the affordance does not communicate "tap me to open a list," they pause and re-read. At 2 AM that pause costs trust. Bates Commandment #1: speed is everything — and affordance friction is a speed tax.
- **Recommended change:** Two small additions, both within token bounds. First, warm the unselected chevron from `color:#94a3b8` (slate-400) to `color:var(--color-neuro-300)` (`#A5B4FC`) on rows that have never been opened — a faint cobalt chevron signals "there is more here." Second, change the "Select…" placeholder copy to "Tap to select" in the same `cat-row-value-unset` style. This is one character-set change and communicates the interaction explicitly without adding any visual weight. PATHWAY_SPEC §3.7 does not mandate the exact placeholder text — "Select…" was an example, not a locked string.
- **Risk if we ship without this fix:** First-time users stall at Step 1. On a stroke alert that's a compounding delay.
- **Class (CLAUDE.md §6):** B (copy change + one token tweak — no new component, no clinical content)

---

### Finding 2 — Tap-targetable chip affordance is invisible in the resting state

- **Severity:** High
- **Frame(s):** Frames 2, 3, 4, 5 (wherever a branch chip is rendered)
- **Element:** `.branch-chip` in resting state — `font-size:11px; color:#475569; background:#f8fafc; padding:2px 8px; border-radius:9999px`
- **What's not user friendly:** The branch chip at rest looks exactly like a static label. It has no border, no cursor-visible affordance (cursor:pointer is CSS-only and invisible in static mockup), no "edit" microhint, and no visual weight that distinguishes it from a read-only annotation. A clinician who has not read the spec will not try tapping it.
- **Why it matters:** Evolution 1 (tap-targetable chips) was the highest-evidence round-6 evolution per the research synthesis. But a feature that requires discovery only works if the affordance communicates itself. Norman's gulf of execution: the user cannot see how to act on the chip. Making it a `<button>` solves the semantic and accessibility gap; it does not solve the visual affordance gap.
- **Recommended change:** Add a hairline border to the resting chip: `border: 1px solid #e2e8f0` (slate-200). This adds one pixel of visual weight that signals "this thing has edges, it can be interacted with." Alternatively (or additionally), add a micro-label to the right of the chip text: a 10px pencil icon (`✎`) in slate-300 that communicates editability. The latter is more explicit but adds visual mass; the former is the minimal viable signal. Either stays within token bounds. The hover state (slate-100 + neuro-200 ring) is already correct — the gap is purely in the resting state.
- **Risk if we ship without this fix:** Evolution 1 (the single highest-impact round-6 change) becomes a hidden feature. Users never tap chips, never re-examine upstream decisions, never get the reversal-of-actions benefit.
- **Class (CLAUDE.md §6):** B (one CSS property addition on `.branch-chip`)

---

### Finding 3 — No progress signal in the header for the pathway (unlike the calculator's score numeral)

- **Severity:** Medium
- **Frame(s):** Frames 1, 2 (early/mid states)
- **Element:** Header identifier block — `text-[15px] font-semibold text-slate-900 leading-tight` for "EVT Pathway"
- **What's not user friendly:** The calculator header always shows the user where they are: `— / 6` (empty), `3 / 5` (partial), `3 / 6 · High` (complete). The pathway header shows only "EVT Pathway" in all states. A clinician opening the tool mid-session (e.g. after a phone call interruption) has no rapid scan-point to know whether they are 1/4 of the way through or 3/4 of the way through.
- **Why it matters:** Shneiderman Rule 4 (closure): sequences need "a beginning, middle, and end" with feedback at each stage. The header is the one element that does not scroll away. Without a step-progress cue in it, the header loses its navigational anchor role.
- **Recommended change:** Add a muted step counter to the header identifier block, directly below the "EVT Pathway" name — or as a small inline indicator after it: `Step 2 of 4` in `text-[11px] text-slate-400 font-medium mt-0.5`. This is compact, unobtrusive, and exactly how the spec §7 allows `text-[11px] font-semibold text-slate-700 uppercase tracking-widest` for step labels. Use the muted variant (not uppercase/bold) since this is a status line, not a section heading. This is a read-only indicator; it does not replace the rail.
- **Risk if we ship without this fix:** Interrupted users (the majority at the bedside) have no scan-point for "where was I?" other than reading the rail, which requires scrolling.
- **Class (CLAUDE.md §6):** B (single string addition in the header block — no new component)

---

### Finding 4 — Completed-step eyebrow ambiguity: active vs. completed use the same style

- **Severity:** Medium
- **Frame(s):** Frames 2, 3, 4, 5 (any frame with a completed step)
- **Element:** `.eyebrow-active` class is applied to BOTH active and completed steps — `font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8`
- **What's not user friendly:** Frames 2–5 show completed step nodes (filled cobalt dot) paired with `eyebrow-active` (full opacity, same color as the current active step eyebrow). The only distinction between "Step 1 — DONE" and "Step 2 — WORKING ON IT NOW" at the eyebrow level is the node shape. At 11px text, the node shape difference (filled dot vs. hollow ring) is the only legible differentiator, and it requires looking at two separate elements to parse.
- **Why it matters:** Visual hierarchy should encode state at the typography level, not just the node level. Bertin's brightness/value variable: completed steps should have a slightly reduced eyebrow brightness to reinforce "this is behind me," the way the calculator's selected-option uses opacity 0.75 for the value label versus full weight for the label text.
- **Recommended change:** Add an `.eyebrow-completed` class: `color:#94a3b8; opacity:0.65;` (or `color:#cbd5e1` — slate-300). Keep `.eyebrow-active` at full `#94a3b8`. Keep `.eyebrow-locked` at 50% opacity as spec. This creates a three-tier brightness hierarchy: active (full) > completed (65%) > locked (50%). The single CSS value addition does not require any structural change to the HTML — just swap the class on completed step eyebrow divs.
- **Risk if we ship without this fix:** The visual hierarchy of the rail is communicated only by the node (tiny, 12px dot), not by the associated label. Under time pressure, the node is easy to miss.
- **Class (CLAUDE.md §6):** B (one CSS class addition, no structural change)

---

### Finding 5 — Locked-step placeholder is too quiet to be discovered

- **Severity:** Medium
- **Frame(s):** Frame 1 (Steps 2, 3, 4 locked), Frame 2 (Steps 3, 4 locked)
- **Element:** `<p class="text-sm italic text-slate-400">Awaiting Step 1 ↑</p>`
- **What's not user friendly:** At `text-sm` (14px) italic `text-slate-400` (35% contrast ratio on white — below 4.5:1 WCAG AA for normal text), this line is the quietest element on the page. It is intentionally subordinate, which is correct. But it is so quiet that a first-time user scrolling past locked steps may not notice it at all — and "scrolling past" means the user tried to skip, found nothing, and had to figure out why on their own.
- **Why it matters:** The research synthesis flagged Evolution 5 as lowest priority ("Awaiting Step N ↑ is functional"). That judgment was correct for repeat users. But V's specific concern is first-open user-friendliness. For the first open, the locked-step body is the user's main feedback mechanism for "what do I do next?" — and it is currently a whisper.
- **Recommended change:** Two changes, either alone improves the situation. First: change the text from "Awaiting Step 1 ↑" to "Complete Step 1 to unlock ↑" — more directive, same register, no styling change needed. Second (optional enhancement): add a small non-blocking `→ Step 1 · TRIAGE` text link (in `text-[11px] text-neuro-600 font-medium`) immediately after the placeholder text as a tap target that jumps the user to the upstream step. This is within spec's locked-step body rules (§3.5 says only "no option rows or inputs"; a navigation hint is not an input). This second change would be Class C, so flag for V approval before implementing.
- **Risk if we ship without this fix:** First-time users interpret locked steps as errors ("why is this broken?") rather than as "I need to do step 1 first."
- **Class (CLAUDE.md §6):** B for the copy change; C for the navigation link

---

### Finding 6 — Numeric input row (`cat-input-field`) looks like decoration, not a form field

- **Severity:** Medium
- **Frame(s):** Any frame where ASPECTS is shown in active state (Frame 3 imaging step before completion)
- **Element:** `.cat-input-field` — `width:48px; padding:4px 8px; font-size:0.875rem; border:1px solid #e2e8f0; border-radius:6px; text-align:center`
- **What's not user friendly:** The 48px input field with `border:1px solid #e2e8f0` (slate-200 — a hairline border) on a white background reads as a styled number badge, not a tappable field. The border is 1px and the same color as the row dividers. At arm's length, the user cannot tell this is editable. The calculator-reference mockup (HAS-BLED archetype) uses the same `border border-slate-200` for its checkbox inputs, but those have a clearly recognizable checkbox affordance shape. A number box does not.
- **Why it matters:** Bates Commandment #8: don't ask for extra information unless you need it — but when you do need it (and ASPECTS is a critical numeric input), the field must clearly communicate "enter a number here." A barely-visible border undercuts that.
- **Recommended change:** Change `.cat-input-field` border to `border:1px solid #cbd5e1` (slate-300) and add `focus:border-neuro-500` on the active/focus state as already specified in PATHWAY_SPEC §4.4. The resting border step-up from slate-200 → slate-300 is a single token change that gives the field a legible edge without adding visual noise. Optionally, add a faint inner background: `background: #f8fafc` (slate-50) on the input resting state instead of white — this creates a "well" affordance that reads as "fill this in."
- **Risk if we ship without this fix:** Clinicians miss the ASPECTS field or tap the row expecting a dropdown, then get confused when a keyboard appears instead of an accordion.
- **Class (CLAUDE.md §6):** B (one token change on `.cat-input-field` border)

---

### Finding 7 — Cascade notice copy tone is flat for a consequential action

- **Severity:** Low
- **Frame(s):** Frame 6
- **Element:** Cascade notice `<span>` — `"Clinical, Imaging, and Result cleared — re-confirm."`
- **What's not user friendly:** The copy is accurate and precise (it names exactly what was cleared). But the tone is stiff — "re-confirm" is bureaucratic. The register is the same as a system log message, not the register of a bedside tool talking to a physician under stress. Small warmth opportunity without sacrificing clinical precision.
- **Why it matters:** V's specific ask is "warmth/approachability/discoverability." Microtext tone is the most direct lever for warmth in a tool that deliberately avoids visual decoration. The cascade notice is the one moment in the pathway where the tool addresses the user directly.
- **Recommended change:** Change to: `"Clinical, Imaging, and Result cleared. Pick up from Step 2 ↓"` or `"Steps 2–4 cleared — re-enter when ready."` The second variant is warmer (re-enter when ready acknowledges the user is in control) and adds an action cue without using the word "confirm" (which in a clinical context can sound like a legal action). Either variant fits in the existing `px-3 py-1.5` notice pill without wrapping at 375px.
- **Risk if we ship without this fix:** Low — the existing copy is functional. This is a warmth refinement, not a usability fix.
- **Class (CLAUDE.md §6):** B (copy string change)

---

### Finding 8 — Step 4 RESULT inline text lacks visual differentiation from body text

- **Severity:** Low
- **Frame(s):** Frames 3, 4, 5 (completed RESULT step bodies)
- **Element:** Frame 3 result: `<p class="text-sm font-medium text-slate-900">Eligible · Standard Early Window — Class I</p>`. Frame 4: `<p class="text-sm font-medium text-red-700">Not Eligible · Pre-stroke Disability</p>`.
- **What's not user friendly:** The result text in Step 4's rail body is `text-sm` — the same size as all the category-row values. The Eligible tier is `text-slate-900` (same as category labels) with only `font-medium` to distinguish it. At a glance from the full-page view, the RESULT block in the rail does not read as "this is the conclusion" — it reads as one more data row. The drawer at the bottom makes up for this (State C-1 in Frame 3 correctly uses the chevron-hint pattern), but the Step 4 rail body is an intermediate feedback point that deserves more visual weight.
- **Why it matters:** Shneiderman Rule 4 closure: the end of a sequence needs informative feedback. The rail body in Step 4 is that feedback's first appearance before the user opens the drawer.
- **Recommended change:** Increase the RESULT paragraph's label from `text-sm font-medium` to `text-[15px] font-semibold` — matching the pathway name in the header (`text-[15px] font-semibold text-slate-900`). This creates a visual echo: the pathway name in the header and the result in the rail share the same weight, bookending the session. Add `leading-snug` to prevent the line breaking awkwardly at 375px. The supporting explanation paragraph (`.text-xs.text-slate-500`) stays as-is.
- **Risk if we ship without this fix:** Low — the drawer communicates the result reliably. This is a polishing upgrade to the in-rail preview.
- **Class (CLAUDE.md §6):** B (one typography class change on the Step 4 result paragraph)

---

### Finding 9 — Frame 6 cascade demonstration has a rail-consistency edge case

- **Severity:** Low
- **Frame(s):** Frame 6
- **Element:** Step 1 rail class in Frame 6 — `class="rail-slate mb-1"` applied despite the step having 4 out of 5 rows already completed (only LVO Location changed)
- **What's not user friendly:** In Frame 6, Step 1 uses `rail-slate` (untraversed, slate-200 border) even though 4 of its 5 category rows show completed values with the cobalt `cat-row-completed` treatment. The rail-slate around completed rows creates a visual contradiction: cobalt left-bar on the rows, gray border on the rail. This is a correct spec-level representation of "step mid-edit," but it reads as inconsistent to the eye.
- **Why it matters:** Visual coherence — the seam between the rail state and the row state is visible in Frame 6. For the first-time user encountering cascade-clear, this adds a fraction of visual complexity to an already complex moment.
- **Recommended change:** Introduce a third rail class `.rail-cobalt-fading` (or use a CSS animation class) for the "mid-edit" state — where the rail renders cobalt-dashed or at 40% opacity — to communicate "this was cobalt, it's transitioning back." The spec §3.6 describes a "250ms color fade"; the Frame 6 static representation should show the mid-transition state visually rather than snapping to full slate. Concretely: `border-left: 2px dashed var(--color-neuro-500); opacity: 0.5;` would communicate "cobalt but fading." This is a mockup polish change only — the runtime handles the actual animation.
- **Risk if we ship without this fix:** Low — Frame 6 is a design artifact, not a shipped state. The runtime animation masks this. But if the mockup is shown to a designer or V for sign-off review, the contradiction is visible.
- **Class (CLAUDE.md §6):** B (mockup-only CSS class addition; no JSX impact)

---

### Finding 10 — Drawer State A copy ("Waiting for inputs · EVT") is generic

- **Severity:** Polish
- **Frame(s):** Frames 1, 2, 6 (State A drawer)
- **Element:** Drawer State A — `<div class="text-sm text-slate-500">Waiting for inputs · EVT</div>` and `<div class="text-xs text-slate-400">Appears when complete</div>`
- **What's not user friendly:** "Waiting for inputs · EVT" is correct but impersonal. The sub-label "Appears when complete" is accurate but its register is the same as a system tooltip. The calculator-reference mockup uses "0 of 5 selected" and "Appears when complete" — the counter is warmer because it tells you how many you have done. The pathway drawer has no equivalent progress cue at State A.
- **Why it matters:** Small warmth delta. A clinician who opens the tool and sees "Waiting for inputs · EVT" gets no sense of "here is how close I am." The calculator partial-state says "3 of 5 selected" which reads as conversational progress. The pathway State A has no equivalent.
- **Recommended change:** Change the State A sub-label to: `"Answer 4 steps to unlock"` (when no steps started) or `"Step 1 of 4 — keep going"` (when at least one category is filled). This is the warmest change available without restructuring the drawer. Tokens: `text-sm text-slate-500` unchanged. String only.
- **Risk if we ship without this fix:** None on usability. Warmth only.
- **Class (CLAUDE.md §6):** B (copy string change)

---

## Where round 6 shines — preserve these

- **Cascade-clear notice (Frame 6):** The inline pill below the changed row, naming the cleared steps, with a right-side Undo button, is the most thoughtfully designed interaction in the mockup. It is proportional, named, dismissing, and non-interruptive. Do not replace it with a toast or a modal in the JSX implementation. This is the canonical correct pattern per PATHWAY_SPEC §3.6.

- **Rail cobalt-vs-slate state encoding:** The use of `border-left: 2px solid neuro-500` (cobalt, traversed) vs. `border-left: 1px solid #e2e8f0` (slate, untraversed) is perceptually precise. Not only does the color change, the border weight changes (2px → 1px) — a double Bertin cue (hue + brightness + weight). Preserve both the color token and the stroke-weight distinction in the JSX implementation.

- **`cat-row-completed` with cobalt left-bar and neuro-50 background:** The completed row state (Frame 2 onward) reads immediately as "done." The combination of neuro-50 background + 2px cobalt border + reduced-opacity value text communicates completion without requiring any icon or checkmark. This is the right call and matches the calculator-reference's `selected-option` treatment in visual weight.

- **Drawer State C muted-slate for Eligible tier (Frame 3):** The spec decision to keep the Eligible drawer in plain slate (not cobalt-tinted) is correct and should be preserved. The research synthesis §6 validated this: cobalt reads "confident answer," not "the patient is fine." A tinted Eligible drawer would read as celebratory, which is wrong in a clinical tool.

---

## Comparison against calculator-reference

**At parity:**
- Header anatomy is identical: back arrow + identifier block (eyebrow + name or score) + right cluster (fav + reset + Copy). The pathway mockup matches the ICH Score header in Frame 1 of calculator-reference.html at the pixel level.
- Copy button presence, placement, and styling (`bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium min-h-[44px]`) is identical across all 6 pathway frames and all 3 calculator archetypes.
- Drawer shadow (`box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.08)`) is identical.
- Drawer State A chrome (`bg-slate-100`, non-interactive, `Interpretation` eyebrow, `Appears when complete` sub-label) matches the calculator's empty-state drawer exactly.
- Section eyebrow typography (`text-[10px] font-bold text-slate-400 uppercase tracking-widest`) is identical.

**Below parity (gaps relative to calculator bar):**
- The calculator shows a live score in the header (`—` when empty, numeral when partial/complete). The pathway shows nothing in the equivalent slot after the pathway name. Finding 3 addresses this.
- The calculator's `selected-option` has `bg-neuro-50 + cobalt left-bar` and applies it with `::before` pseudo-element, giving the selected row a slight more refined look than the pathway's `cat-row-completed`. The pathway version is close but the pseudo-element approach in the calculator is crisper (no inline `background-color: var(--color-neuro-50)` on the element itself, which can interact with divider-hair borders). Not a high-severity gap — but in the JSX implementation, adopt the calculator's `::before` approach for consistency.
- The calculator's partial-state drawer says "3 of 5 selected" — a human-readable progress count. The pathway State A drawer says "Waiting for inputs · EVT" — less progress-legible. Finding 10 addresses this.
- The calculator has an `amber-400 border-l-2` in-body callout (NIHSS archetype, Frame 3 of calculator-reference). The pathway spec allows `LearningPearl` and amber callouts per §4.5 but they are not shown in any of the 6 frames. This is not a bug — it is intentional omission. But if pearls are added in the JSX implementation, they should use the identical amber callout pattern from the calculator-reference, not a new pattern.

---

## Mobile/desktop trade-offs

**375px (mobile primary — bedside use case):**
- All 6 frames render within the 440px mockup frame, which approximates a 375px device with some lateral margin. No horizontal overflow is visible in the HTML structure.
- The branch chip in Frames 2–5 renders as `display:inline-block` with `p-3 -m-3` wrapper. On 375px, a chip reading "Anterior LVO · Confirmed · mRS 0–1 · Age 18–79" (41 characters) is likely to be 270–290px wide — still within 375px minus 34px left-rail offset minus 20px right padding. Safe.
- The cascade notice in Frame 6 reads: `"Clinical, Imaging, and Result cleared — re-confirm. [Undo]"`. At 375px minus the 34px left-rail offset (approx. 341px available), the pill at `px-3 py-1.5 text-xs` will either wrap or the Undo button will be pushed to a second line. This is a real mobile risk. Recommend testing at 375px and, if wrapping occurs, truncate the notice to `"Steps 2–4 cleared [Undo]"` with full message on tap-to-expand.
- The numeric ASPECTS input row at `cat-input-row` padding `10px 12px` gives a 20px hit area — well below the 44px minimum. The visible input field itself is 48px wide. The row container needs `min-height: 44px` to satisfy PATHWAY_SPEC §8. This is not visible from the mockup but needs enforcing in JSX.

**1280px (desktop — teaching/reference context):**
- The `max-w-440px mockup-frame` constrains the mockup to a phone-like frame even at desktop. In the actual JSX implementation, the `max-w-2xl mx-auto px-5` wrapper will center the pathway column at approximately 672px on desktop. This is correct per PATHWAY_SPEC §9.
- At 672px, the category-row label + value layout has ~550px of horizontal space after the rail offset. Category rows that have long values (e.g. "0–1 (Independent)") will still fit comfortably.
- Branch chips at desktop width will have even more room than at 375px — no wrapping concern.
- The desktop drawer offset by `--nav-rail-width` is handled by `CalculatorDrawer` per spec §5 — no concern at the mockup level.
- One desktop-specific gap: there is no two-column treatment at desktop (inputs left / drawer right). PATHWAY_SPEC §10 explicitly forbids it. Correct call — but on a 1280px monitor, the single-column pathway in `max-w-2xl` will have wide blank margins on both sides. This is by design (matching the calculator detail-page treatment), and is the right call for consistency. Not a finding; just flagged for awareness.

---

## Direct answer to V

The round-6 mockup is not ready to ship as-is for first-time bedside users, but it is not far off. The structural decisions — the vertical rail, the category-row accordion, the cascade-clear notice, the drawer tiers — are all correct and well-executed. What is missing is discoverability signal on the two key interactive affordances (the category-row expand and the chip tap-to-edit). A tired clinician on a stroke alert opens this, sees five rows all reading "Select…" in gray italic, and has to figure out that tapping one of them opens an accordion. That is a half-second pause that adds up to distrust. Fixing Finding 1 (placeholder copy → "Tap to select" and a faint cobalt chevron) and Finding 2 (resting chip border) closes that gap without adding visual noise or breaking the clinical-restraint contract the design has correctly maintained. The remaining eight findings are improvements and polish, but those two are the ones that would stop a real physician at 2 AM.

---

### @ui-architect — Sign-off

**Spec cited:** `docs/specs/PATHWAY_SPEC.md` §2, §3.4, §3.6, §3.7, §4.4, §5.1, §6, §7, §8, §9, §10. `docs/research/2026-05-15-flowchart-pathway-design-research.md` Parts C and D.
**Layout decisions:** No layout changes proposed. All 10 findings are token-level or copy-level changes. No new components, no new layout patterns.
**Deviations from spec:** None proposed. Finding 1 (chevron color change on unselected state) and Finding 2 (resting chip border) are additions not in conflict with any spec rule. Finding 5 second variant (navigation link in locked-step body) would be Class C and requires V approval before implementation.
**Risks flagged:** (1) Cascade notice wrapping on 375px (Finding 7, mobile section) — needs live browser test at 375px. (2) `cat-input-row` touch target is below 44px minimum — needs `min-height:44px` in JSX even though the mockup does not show it. (3) The `.eyebrow-completed` class addition (Finding 4) is not in the spec; should be accepted by Design Guardian before the JSX rebuild adopts it.
**Status:** ready
