# Live `EvtPathway.tsx` vs v2 Mockup — Design Comparison & Synthesis

**Date:** 2026-05-15
**Auditor:** ui-architect
**Method:** Read both source files end-to-end; identified every visual element and interaction pattern in the live site; mapped each to a keep / drop / transform verdict against the v2 design.
**Output mode:** Read-only proposal. No code or demo changes in this task.

---

## Executive summary

- v2 solved the structural problems that plagued the live site (15 anti-pattern violations per PATHWAY_SPEC §11), but in doing so it stripped the interaction texture that made the live site feel like a clinical workflow tool. The result is an interface that reads as a form.
- The single biggest reason v2 feels calculator-like: **the path has no step identity**. In the live site, each step announces itself with a colored icon tile, an icon specific to its clinical domain (UserCheck, Clock, ScanLine), and an accent palette (cobalt, teal, purple). In v2, every step looks visually identical — same eyebrow format, same node dots, no icon, no per-step color differentiation. The eye cannot tell Triage from Imaging at a glance.
- The second reason: **the path is silent until terminal**. The live site surfaces a provisional result banner mid-workflow (at the top of the Imaging step) and inline clinical context (LearningPearl blocks) throughout. v2 defers all feedback to the drawer and removes the pearls. The page gives no signal that the user's choices are being evaluated in real time.
- The third reason: **the option inputs have no tactile presence**. The live site's `CompactSelectionCard` has a rounded border, a hover lift, and a full-fill selected state. v2's accordion options are flat text rows with only a cobalt left bar as the selection indicator. This is correct per the content-density redesign, but the supporting chrome (the section card wrapper, the divider texture) is now gone too.
- The research synthesis (13 principles) validates both: the v2 structure is well-grounded (Principles 1, 2, 3, 5, 9, 12), and several live-site patterns are also well-grounded (Principles 7, 11 for pearls; Principle 7 for provisional banner; Principle 4 for branch chips as decision trail). The question is not which file is right — both are partially right.
- The proposed v3 is an **incremental addition** to v2, not a redesign. It back-borrows three specific elements from the live site (step icons, inline pearls, provisional verdict band), all anchored in research principles, while keeping every structural improvement v2 introduced.
- Confidence: **High** on step icons (low risk, zero principle violations); **High** on inline pearls (Principle 11, exactly what the spec already allows in §4.5); **Medium** on provisional verdict band (edge case handling requires precise spec language). Auto-scroll is a behavioral add, not a visual change; risk is low.

---

## Why the live site feels like a pathway

The following elements in `EvtPathway.tsx` collectively create the clinical-workflow feel. Each entry cites the exact source.

1. **Per-step accent color tile with a domain icon in the section header.** `CollapsibleSection` receives `accentClass` and `icon` props. Triage: `bg-neuro-100 text-neuro-600` + `<UserCheck size={14} />`. Clinical: `bg-teal-100 text-teal-600` + `<Clock size={14} />`. Imaging: `bg-purple-100 text-purple-600` + `<ScanLine size={14} />`. Decision: dynamic, tied to result variant. This gives each step a visual fingerprint — a clinician scrolling can recognize which step they're on without reading the label. (EvtPathway.tsx lines 995–996, 1096–1097, 1166–1167, 1414–1415)

2. **`CollapsibleSection` card chrome.** Each step lives in a bordered card: `border rounded-lg overflow-hidden`, active state `border-neuro-200 bg-white shadow-sm`, inactive state `border-slate-200 bg-slate-50/50`. (CollapsibleSection.tsx lines 31–34) The card wrapper creates visual depth — each step has a "surface" that the content sits inside. Between steps, the card borders create explicit visual separation rather than the v2 hairline divider approach.

3. **`CompactSelectionCard` with rounded-xl border and selected fill.** Options are rendered as full-width bordered cards (`rounded-xl`, border, padding, hover lift, selected state with full `bg-neuro-50 border-neuro-500`). The selected card has a full fill, not just a left bar. The danger variant paints the card in red/amber to signal consequence before the result. (EvtPathway.tsx lines 1002–1003, 1030–1033, 1064)

4. **`LearningPearl` inline education blocks throughout the active step body.** Present in Triage (2 pearls — "Evidence Landscape", "Exclusions"), Clinical (2 pearls — "2026 Guideline Update", "NIHSS Limitations"), and Imaging (per sub-path — "Understanding ASPECTS", "AHA/ASA 2026 Early Window", "pc-ASPECTS & 2026 Guidelines", "MeVO Imaging Selection", "Procedural Risks"). Each pearl is collapsible, default-closed, with a Lightbulb icon and uppercase label. (EvtPathway.tsx lines 1073, 1077, 1141, 1145, 1228–1235, 1250–1253, 1376–1383)

5. **Provisional result banner inside the Imaging step.** When Steps 1 and 2 are complete and a partial result can be computed, a colored left-bar banner appears at the top of the Imaging step body: `border-l-4 rounded-xl` with variant-matched background (emerald/amber/red/slate), an `<Activity />` icon, and the text "Provisional: [status] — complete imaging to confirm." (EvtPathway.tsx lines 1171–1180)

6. **Auto-scroll to the next unanswered field after each selection.** `fieldRefs` and `sectionRefs` are populated for every input. When a value is selected via `updateInput`, `scrollToNextField` is called, which computes the next rendered field in the current section and scrolls it into view with `scroll-margin-top`. The page guides the user forward. (EvtPathway.tsx lines 914–930, `getNextRenderedField` function lines 107–165)

7. **Section-level collapsed summary text.** When a `CollapsibleSection` is not active and has a `summary` prop, it shows a one-line summary below the step title: "Anterior LVO, 0–6h, ASPECTS 8…" This gives context when scrolling back up through completed steps. (CollapsibleSection.tsx lines 73–75; getSummary function EvtPathway.tsx lines 860–912)

8. **The "Imaging complete" cobalt nudge card.** When Step 3 completes, a `bg-neuro-500 text-white rounded-2xl shadow-lg` strip appears at the bottom of the Imaging section with a Check icon, "Imaging complete", and a `<ChevronRight />`. It is a strong visual CTA that signals the transition to the result step. (EvtPathway.tsx lines 1388–1400)

9. **Sticky bottom action bar with Back/Next/Copy buttons.** The fixed footer bar (`fixed bottom-[4.5rem]`) keeps navigation affordances persistent and always reachable, plus a mobile progress strip of four color-coded segments (emerald for complete, cobalt for active, slate for locked). (EvtPathway.tsx lines 1553–1578)

10. **The large result card with `border-l-[8px]`, variant-matched background, and `text-5xl font-black` status headline.** The Decision step renders a full visual statement: huge variant-colored left border, matching background wash, "Eligible" in `text-5xl font-black text-emerald-900`, followed by criteria name, evidence badge, and reasoning. (EvtPathway.tsx lines 1454–1498)

11. **Assessment Summary card inside the Decision step (before the result card).** A `bg-white p-6 rounded-2xl border border-slate-100 shadow-sm` card lists input values as key-value pairs (Type, Time, NIHSS, ASPECTS, etc.). Clinicians can scan the assessment summary as a check against their mental model before acting on the result. (EvtPathway.tsx lines 1418–1440)

12. **MeVO Risk and Evidence box.** For MeVO paths, an `bg-amber-50 border border-amber-200 rounded-2xl` block surfaces ESCAPE-MeVO and DISTAL findings inline with the result. This is editorial context that moves the tool from "answer machine" to "clinical co-pilot." (EvtPathway.tsx lines 1501–1523)

13. **The four distinct `accentClass` states on the Decision section.** The Decision step's circle badge dynamically reflects the result: emerald for eligible, red for avoid, amber for consult, slate for pending. This creates a visual micro-celebration or warning at the moment of resolution. (EvtPathway.tsx line 1415)

---

## Why v2 feels calculator-like

The following v2 elements, individually defensible per the spec, collectively produce the "austere" read:

1. **No per-step icon or accent differentiator.** In v2, every step's eyebrow reads `STEP N · TITLE` in the same `text-[10px] font-bold text-slate-400 uppercase` token. The node dots provide state (completed / active / locked) but no identity. A clinician cannot distinguish Triage from Imaging by peripheral vision — they must read the label. Calculator sections use the same approach because all sections are symmetric; pathway steps are semantically distinct.

2. **No card wrapper around steps.** v2 uses a rail with the content sitting in open space to the right. The absence of a card boundary means the content of each step visually merges with the surrounding page. In the live site, the card border signals "you are inside a step now." In v2, the step body has no container edge. This is structurally correct (Principle 12 — no decorative wrappers) but removes the spatial grounding that made each step feel self-contained.

3. **Only a hairline divider between category rows.** The `divider-hair: border-top: 1px solid #e2e8f0` between rows is correct per the content-density redesign, but when combined with no card wrapper and no accent color, the rows read as a flat list. The live site's `CompactSelectionCard` borders created a grid of pressure-points — each option was a button that looked like a button.

4. **Accordion options have no selected fill — only a left bar.** v2's selected option uses `border-left: 2px solid var(--color-neuro-500)` and `padding-left: 14px`. The label darkens to `neuro-700`. But there is no background fill change on the option row. Compare to the live site's selected `CompactSelectionCard`: full `bg-neuro-50` fill plus border change. The left bar alone reads as a quiet indicator; the full-fill reads as "I have made a choice."

5. **No inline pearls.** v2 removed `LearningPearl` blocks from the step bodies. The spec §4.5 explicitly permits them (`LearningPearl` and amber callouts "may render inside a step when a clinical caveat applies"), but the mockup does not implement them. The result is a step body that is purely transactional — fill in the values, move on. There is no clinical reasoning surfaced alongside the inputs.

6. **No provisional result before terminal.** The drawer is State A (muted) until every step is complete. A clinician who has answered Triage and Clinical (enough to compute most LVO results) sees no indication of trajectory. The live site surfaces "Provisional: Eligible — complete imaging to confirm" at the top of Step 3. v2 is silent until Step 4.

7. **The drawer is fully hidden and muted in States A and B.** This is correct per spec §5.1, but the combined effect of no provisional banner, no inline pearls, and a silent muted drawer is that the page provides zero feedback about the value of the user's choices until the last input is filled. A form provides feedback at submission; a clinical tool should signal trajectory earlier.

8. **The single-active-step view eliminates the gestalt.** The live site shows all four steps on screen simultaneously, with collapsed steps showing their summary lines. This lets the user see the entire workflow at once. v2's single-active-step view is more focused (Principle 1 — segmenting) but eliminates the peripheral awareness of completed and upcoming steps. The branch chips on the rail partially address this, but they require reading; the live site's collapsed cards with summaries are scannable at a glance.

9. **The "step counter" text in the header area (`STEP 1 OF 4`)** is absent in v2 (correct per spec §2 — no step strip in header), but nothing else signals linear progress until the user has scrolled through the entire rail. On a 375px viewport, locked steps 3 and 4 may be below the fold.

10. **No "Imaging complete" or step-transition affordance.** v2's step transition is the `Next` button appearing after all inputs are filled. The live site had an additional, prominent cobalt nudge card when a step completed. The `Next` button alone is quieter — which is correct per spec §4.6 — but the live site's full-bleed CTA card created a moment of visual closure (Shneiderman Rule 4) that v2 does not replicate.

---

## What the research synthesis already validates

The 13 principles from `docs/research/2026-05-15-flowchart-pathway-design-research.md` provide the anchor for every recommendation below.

**Principles that LIMIT what can be re-added (hard constraints):**

- **Principle 5 — Reserve color for the verdict.** Bertin, Tufte, Horsky, AHRQ alert-fatigue. Forbids bringing back the teal/purple accent tiles on individual steps. Per-step color differentiation in the path competes with the severity-tinted drawer (the actual verdict). Only cobalt is permitted in the path; the drawer holds amber/red.
- **Principle 12 — Low visual density.** Mendling G1, Tufte, Mayer coherence. Forbids bringing back the card-within-card nesting, per-option borders on every row, or info boxes inside step bodies. The content-density redesign was the right call.
- **Principle 3 — Progressive disclosure mechanics must be obvious.** The single-active-step view stays. Showing all steps at once (live site behavior) is a partial violation of segmenting. The rail's locked-step eyebrows at 50% opacity satisfy this better than the live site's collapsed cards.

**Principles that SUPPORT re-adding warmth:**

- **Principle 7 — Explicit feedback on state change.** Nielsen H#1, Norman gulf of evaluation, ISO 9241-110 self-descriptiveness. Directly supports the provisional result banner: the clinician has made choices and deserves to see their trajectory before completing the path.
- **Principle 11 — Match scaffolding to expertise.** Van Merriënboer, Klein RPD, Kahneman dual-process. Directly supports inline pearls: residents need the "why does this question matter" context; attendings can ignore it. The spec §4.5 already ratifies this — the pearls belong in the JSX build.
- **Principle 4 — Always-visible decision trail.** Supports branch chips (already in v2) and supports the step icon as a landmark cue — icons help the user recognize which step they are on, reducing the mental work of reading the eyebrow text.
- **Principle 2 — Display current step prominently.** Budiu, Nielsen H#1. Supports the step icon because it differentiates the active step from a list item. The cobalt node dot alone is a minimal state cue; adding a domain icon raises the differentiation without adding a second color.

**Principles that are partially satisfied by v2 and do not need change:**

- **Principle 1 — Discrete user-paced steps.** Fully satisfied by single-active-step view. Keep.
- **Principle 6 — Easy reversal.** Fully satisfied by tap-targetable branch chips and cascade-clear with Undo. Keep.
- **Principle 8 — Mark branch points.** Partially satisfied by chips; branch-point glyph is medium-confidence for readers vs. authors (flagged in research doc). This is a round-7 item, not a v3 item.
- **Principle 9 — Simple input affordances.** Fully satisfied by category-row accordion with two-line stacked options. Do not regress.
- **Principle 10 — Persistent verdict drawer.** Fully satisfied by the CalculatorDrawer State A/B/C machine. The provisional band is additive, not a drawer replacement.
- **Principle 13 — Speed.** Not affected by any of the proposed visual additions.

---

## Element-by-element keep/drop/transform table

| Element from live site | Verdict | Rationale | If transformed: how |
|---|---|---|---|
| Per-step accent color tile (cobalt/teal/purple circle badge with domain icon) | **Transform** | Color tile violates Principle 5 (teal and purple in path compete with severity-tinted drawer). But the icon itself provides step identity with no color cost. | Render icon in `text-slate-500` at 14px next to the step eyebrow. No colored tile. No teal, no purple. Just `<UserCheck />`, `<Clock />`, `<ScanLine />`, `<ListChecks />` in slate. |
| `CollapsibleSection` card wrapper (border, bg-white, shadow-sm per step) | **Drop** | Violates Principle 12 — card wrappers inside the content column add visual weight. v2's rail-embedded content is lower density and cleaner. Do not regress. | n/a |
| `CompactSelectionCard` with full border + hover lift + selected fill | **Drop** | v2 replaced this with two-line stacked accordion options per the content-density redesign. The category-row pattern is strictly better for option-dense steps (MeVO Location 6 options). Do not regress. | n/a |
| Selected-option full fill (bg-neuro-50 on selected row) | **Transform** | The left-bar-only selection indicator in v2 is quiet. Adding a background fill to the selected accordion option row would restore tactile presence without re-introducing borders. Principle 9 — simple affordances — still satisfied. | Add `background: var(--color-neuro-50)` to `.cat-option-selected`. No border addition — left bar stays as the primary indicator. The fill confirms "I chose this." |
| `LearningPearl` inline education blocks (collapsible, default-closed) | **Keep (selectively)** | Principle 11 — scaffolding matched to expertise — directly supports this. Spec §4.5 already permits pearls inside step bodies. Residents benefit; experts can ignore. Limit: max 2 pearls per step, collapsible, default-closed. | Render in the existing `LearningPearl` component. Surface only after an option has been selected in that step (not on entry to the step). Use `variant="slate"` to stay neutral. |
| Provisional result banner (border-l-4, colored bg, Activity icon, "Provisional: [status]") | **Keep (transformed)** | Principle 7 — explicit feedback on state change — directly supports this. The user has filled Steps 1 and 2; the pathway can compute a provisional verdict. Not showing it is an opportunity cost. The color must comply with Principle 5: use only the drawer's tier tokens (neuro-50 for eligible, amber-50 for consult, red-50 for avoid), not the raw emerald-50 from the live site. | Render as a small inline pill (not a full-width card) at the top of the active step body when steps 1–2 are complete. Use PATHWAY_SPEC §6 severity tokens. Text: "Provisional: [tierLabel] — confirm imaging." No Activity icon (avoid icon-in-path density). |
| Auto-scroll to next unanswered field after each selection | **Keep** | Reduces friction; Principle 11 scaffolding for residents. Already specified implicitly in the spec's sequential flow model. The v2 mockup cannot demo this (static HTML), but the JSX rebuild should implement it. | Behavioral contract: after a category-row selection resolves, scroll the next unanswered category row's label into the upper third of the viewport (80px from top, accounting for sticky header height). |
| Sticky step-counter row in header with four colored dots | **Drop** | Explicitly rejected in PATHWAY_SPEC §3.9. The rail is the step indicator. A separate header strip duplicates information and competes with the back-arrow + eyebrow + pathway-name header anatomy. Hard rule. | n/a |
| Sticky bottom action bar with Back/Next/Copy buttons | **Already in spec** | PATHWAY_SPEC §4.6 specifies a `Next` button and a `Back` button. The exact fixed-footer pattern from the live site is implementation detail; the v3 mockup should reflect spec §4.6 exactly. | n/a |
| Collapsed section summary text below step title | **Transform** | The live site shows summaries in `CollapsibleSection`. v2 surfaces them as branch chips on the rail — strictly better (branch chips are tap-targetable, on the rail, more contextual). Do not bring back text summaries inside section headers. Branch chips are the summary mechanism. | n/a (already handled by branch chips) |
| "Imaging complete" cobalt full-bleed nudge card | **Drop** | PATHWAY_SPEC §11 anti-pattern #11: "cobalt full-bleed Imaging complete nudge card" is explicitly listed as a spec violation. The `Next` button from §4.6 is the approved completion signal. | n/a |
| Assessment Summary card (bg-white p-6 rounded-2xl, key-value rows) | **Transform** | PATHWAY_SPEC §5.5 specifies the Assessment Summary in the drawer's expanded content, not as a step-body card. The live site's version is out of spec. It belongs in the drawer. | Already covered by spec §5.5. No new work in v3 mockup. |
| MeVO Risk & Evidence box (amber, ESCAPE-MeVO / DISTAL bullets) | **Transform** | Clinical evidence context in the result is valuable. But it belongs in the drawer's expanded content, not as a separate card in the step body. Principle 12 — low density. | Map to the drawer expanded content. In the v3 mockup, the drawer expanded view should carry a "Trial Context" sub-section with the evidence bullets. |
| Black "Copy to EMR" button in the Decision step body | **Drop** | PATHWAY_SPEC §11 anti-pattern #7: copy lives in the header, not in the drawer or step body. Already in v2 header correctly. | n/a |
| Dynamic `accentClass` on the Decision section (emerald/red/amber based on result) | **Transform** | The colored badge circle on the Decision step is acceptable as a micro-confirmation. However, the color must use PATHWAY_SPEC §6 severity tokens (neuro-50 for eligible, not emerald), and the icon tile form is forbidden by §2. A small dot or text label near the step eyebrow is the right vehicle. | Render the tier label as a small inline pill next to the `STEP 4 · RESULT` eyebrow: e.g., `Eligible` in `bg-neuro-50 text-neuro-700 text-[10px] px-1.5 rounded-full` when result is computable. |
| `text-5xl font-black` result headline | **Drop** | PATHWAY_SPEC §11 anti-pattern #8 and §7 typography scale. The result lives in the drawer with `text-xl font-semibold`. | n/a (drawer handles this) |
| `LearningPearl` at the end of the Decision step ("Clinical Context Summary") | **Transform** | Clinical synthesis at the result step is high-value. But it belongs in the drawer expanded content, not in the step body. The drawer expanded body's "Reasoning paragraph" (§5.4 step 2) is where synthesis prose lives. | Move to drawer. |

---

## Recommended v3 design — incremental evolution from v2

v3 is v2 with four targeted additions. It does not change the Pattern A rail, the category-row accordion, the branch chips, the cascade-clear notice, or any of the WCAG/mobile fixes. It adds warmth to the three places where v2 is provably cold: step identity, in-flow clinical context, and pre-terminal feedback.

**1. Step icons next to each step eyebrow (zero color cost)**

Each step's eyebrow row — currently `STEP N · TITLE` in `text-[10px] font-bold text-slate-400 uppercase` — gains a 14px icon to its left. Triage: `<UserCheck />`. Clinical: `<Clock />`. Imaging: `<ScanLine />`. Result: `<ListChecks />`. All icons in `text-slate-500` (not teal, not purple). The icon sits between the rail node and the eyebrow text, at the same vertical axis. The node dot remains the state indicator (cobalt filled / cobalt ring / slate hollow). The icon provides domain identity.

This is the single highest-leverage change in v3. It costs nothing in color budget, zero additional tokens, and directly addresses why "all steps look the same." Anchored in Principle 2 (Budiu — communicate a clear mental model of the process) and Principle 4 (make the current step visually distinct, not just textually distinct).

**2. Inline pearls inside the active step body (collapsed by default)**

After an option is selected in a given step, one or two `LearningPearl` blocks appear at the bottom of the step body in `variant="slate"`. They are collapsed by default — a single-line `Lightbulb` button with an uppercase label. Tapping expands; tapping again collapses. Experts see a single 28px-tall toggle they can ignore. Residents tap it and get the clinical rationale.

Each step carries a maximum of two pearls. The pearls are conditional on at least one answer having been selected (so they do not front-load the step). In v2, the step bodies are empty except for category rows — the pearls bring back the signal that clinical reasoning is happening alongside the data entry. Anchored in Principle 11 (van Merriënboer scaffolding for novices; Klein RPD for experts who skip it).

This is also explicitly permitted by PATHWAY_SPEC §4.5: "LearningPearl and amber border-l-2 border-amber-400 pl-3 callouts may render inside a step when a clinical caveat applies to the current input set." v3 is not breaking new ground — it is fulfilling a spec provision the mockup did not implement.

**3. Provisional verdict pill above the active-step's first category row**

When Steps 1 and 2 are both complete and the pathway can compute a result (i.e., `result.status !== 'Incomplete'`), a small inline pill renders at the top of the Step 3 (Imaging) body, before the first category row. It uses PATHWAY_SPEC §6 severity tokens:

- Eligible / EVT Reasonable: `bg-neuro-50 text-neuro-700 border border-neuro-200`
- Consult / Clinical Judgment: `bg-amber-50 text-amber-700 border border-amber-200`
- Avoid: `bg-red-50 text-red-700 border border-red-200`

Text pattern: `Provisional · [tierLabel] — imaging pending.` At `text-[11px] font-medium px-2.5 py-1 rounded-full`.

This is smaller and quieter than the live site's `border-l-4 px-4 py-3 rounded-xl` banner. It does not use saturated emerald; it uses the spec's neuro-50 for proceed. It disappears once the terminal result is computed (the drawer takes over with State C). Anchored in Principle 7 (Nielsen H#1 visibility of system status; Norman gulf of evaluation) and the live site's validated UX pattern of surfacing trajectory before completion.

**4. Auto-scroll behavioral contract added to the spec**

When a category-row selection is made, the next unanswered category row in the current step should scroll into the upper third of the viewport (with a 80px margin from the top, adjusted for the sticky header). This is a behavior that the v2 mockup cannot demonstrate but the JSX rebuild must implement.

This is the same behavior already implemented in the live site (`scrollToNextField` using `fieldRefs`). It reduces friction by removing the cognitive step of "where do I look next after selecting an option." Anchored in Principle 11 (scaffolding) and Principle 9 (Horsky — "allow clinicians to respond with one or two clicks").

**What v3 does NOT do (and why):**

- It does not bring back colored accent tiles (teal/purple) on steps. Principle 5 is hard.
- It does not bring back `CompactSelectionCard` borders on accordion options. The content-density redesign was correct.
- It does not bring back the sticky step-counter header strip. PATHWAY_SPEC §3.9 explicitly prohibits it.
- It does not add emerald to the provisional pill. Neuro-50 (cobalt-light) is the proceed token per §6.
- It does not add the full-bleed "Imaging complete" card. Anti-pattern #11.
- It does not add the Assessment Summary as a step-body card. It belongs in the drawer per §5.5.

---

## What this proposal does NOT change

The following v2 elements are correct and must be preserved exactly:

- Pattern A vertical rail with cobalt `border-l-2` (traversed) and slate-200 `border-l-1` (untraversed)
- Step nodes: filled cobalt (completed), hollow cobalt ring (active), slate-300 hollow 10px (locked)
- Tap-targetable branch chips as `<button>` elements with 44px hit targets and `aria-label="Edit: ..."` — per PATHWAY_SPEC §3.4
- Cascade-clear inline notice with named steps, Undo button, 4-second auto-dismiss, 200ms fade — per §3.6
- Two-line stacked option anatomy: `flex-direction: column` on `.cat-option-btn`, `cat-option-desc` at `font-size: 11px; color: #64748b` — the v2 content-density fix
- WCAG-compliant description text at slate-500 (4.48:1 on white, AA pass)
- 44px minimum touch targets on all interactive elements
- `aria-live` cascade notice (not a toast or modal)
- `prefers-reduced-motion` guard on all transitions
- Locked step body: `text-sm italic text-slate-400` "Awaiting Step N ↑" placeholder; eyebrow at 50% opacity
- Completed-step category rows: `cat-row-completed-btn` pattern with cobalt left bar + neuro-50 background + tap-to-edit
- Drawer: State A (muted slate-100), State B (muted, NOT tappable for pathways), State C (tier-tinted, tappable) per §5.1
- Header anatomy: back-arrow SVG (not lucide ArrowLeft) + PATHWAY eyebrow + pathway name + Star + Reset + Copy pill — per §2
- `max-w-2xl mx-auto px-5` content wrapper — per §9
- No card wrappers around steps in the content column (calculator-restraint chrome)
- No colored CTAs or info boxes inside step bodies (except the provisional pill added in v3)
- No emerald anywhere in the path

---

## Risk assessment

**Step icons (Proposal 1):**
- Risk: icons drift toward the icon-tile aesthetic the spec forbids — if a future developer wraps them in a background div.
- Mitigation: the spec (§11 anti-pattern #10) explicitly forbids "icon-tile flourish." The v3 spec addendum must state: icon is bare, inline, `text-slate-500`, no background element, no border, no padding container.
- Severity if wrong: Low (visual regression; easily caught in QA).

**Inline pearls (Proposal 2):**
- Risk 1: pearl content becomes too long and users scroll past it, creating dead content the clinical team maintains indefinitely.
- Mitigation: max 2 pearls per step; max ~80 words per pearl body. The LearningPearl component's default-closed state already protects against forced reading.
- Risk 2: a resident reads the pearl mid-stroke-code and loses 10 seconds.
- Mitigation: pearls are opt-in — the user must tap the Lightbulb toggle. Default closed is non-negotiable.
- Severity if wrong: Medium (content quality risk; addressable with editorial guidelines).

**Provisional verdict pill (Proposal 3):**
- Risk 1: ambiguous edge cases — when does "provisional" become misleading? Example: anterior LVO, early window, mRS 0-1, NIHSS 6 → "Provisional: Eligible" appears, but then ASPECTS 1 is entered and the result becomes "Consult." The provisional read was technically correct at the time but potentially anchors the clinician.
- Mitigation: the pill text must include "— imaging pending" to signal incompleteness. The pill disappears and the drawer takes over the moment the terminal result is computable. Never show a green pill when imaging could produce a stop result.
- Risk 2: the provisional pill produces a tier label for incomplete inputs. The `calculateLvoProtocol` function already returns `variant: 'neutral'` with `status: "Incomplete"` / `"Not Eligible"` / `"Pending Imaging"` for incomplete states — the pill must only render when `result.status !== 'Incomplete' && result.reason !== 'Pending Imaging'`. This is exactly the condition the live site uses (EvtPathway.tsx line 1171).
- Severity if wrong: High (a misleading Eligible pill on a case that should be Avoid is a clinical safety issue). Requires careful spec language and clinical-reviewer sign-off before JSX implementation.

**Auto-scroll (Proposal 4):**
- Risk: jumpy scroll on slow 3G connections or devices that disable smooth scrolling.
- Mitigation: use `behavior: 'smooth'` with a `prefers-reduced-motion` check (use `behavior: 'auto'` if reduced-motion is set). Scroll should be a gentle assist, not a teleport. A 50ms debounce after the state update prevents scroll-on-every-keystroke for numeric inputs.
- Severity if wrong: Low (disorientation; can be toggled off without visible regression in the UI).

---

## Recommendation

**Verdict: Adopt subset — Proposals 1, 2, and 4. Adopt Proposal 3 with conditions.**

**Reasoning by proposal:**

- **Proposal 1 (Step icons):** Adopt. Zero color cost, zero principle violations, high perceptual benefit. The spec permits icons in step bodies (§4.5 context) and the v3 mockup renders them inline with the eyebrow. This is the change that most directly answers V's feedback that "it still looks like a calculator."
- **Proposal 2 (Inline pearls):** Adopt. Already explicitly permitted by PATHWAY_SPEC §4.5. The v3 mockup should implement the LearningPearl component (default-closed, variant="slate", conditional on first answer being selected). Editorial guidelines on pearl length are needed from the content-writer agent before JSX implementation.
- **Proposal 3 (Provisional verdict pill):** Adopt with conditions. Condition: the exact edge cases where the pill must suppress (any state where `result.status === 'Incomplete'`, `result.reason === 'Pending Imaging'`, or `result.reason === 'Incomplete Imaging'`) must be enumerated in the v3 spec addendum, and clinical-reviewer must sign off on the trigger condition before JSX implementation. The v3 mockup should demonstrate the pill in a safe state (Anterior LVO + 0–6h + NIHSS 12 → Provisional: Eligible). Do not demo an edge case in the mockup.
- **Proposal 4 (Auto-scroll):** Adopt. This is a behavior that already exists in the live site. The v3 mockup cannot demo it (static HTML), but the JSX build contract should specify it. Add to PATHWAY_SPEC §4.6 as a behavioral addendum.

**Confidence: High** — Proposals 1 and 2 have clean principle backing (Principles 2, 4, 11) and zero risk of violating the WCAG/mobile/calculator-restraint contracts. Proposal 3 has a genuine clinical edge-case risk that is manageable with the stated condition. Proposal 4 is a behavioral add with low visual impact.

**Next step if approved:** dispatch `design-prototyper` to fork `pathway-evt-interactive-demo-v2-content-density.html` into `pathway-evt-interactive-demo-v3-warmth.html` with these specific changes. V opens both v2 and v3 side-by-side to compare. The prototyper's brief should specify: (1) add step icons inline with eyebrow text, slate-500, no background container; (2) add two LearningPearl placeholders per step, collapsible, default-closed, appearing after first selection in that step; (3) add provisional verdict pill at top of Step 3 body for the Anterior LVO / 0–6h / NIHSS 12 demo path using neuro-50 tokens; (4) annotate auto-scroll as a behavioral note (cannot be demoed in static HTML). The prototyper must NOT change the rail, the branch chips, the cascade-clear notice, the accordion option anatomy, or the drawer.

---

*Authored by: ui-architect (2026-05-15). Read-only research task — no code touched.*
*Sources of record: EvtPathway.tsx (1630 lines), CollapsibleSection.tsx, LearningPearl.tsx, pathway-evt-interactive-demo-v2-content-density.html, PATHWAY_SPEC.md (870 lines), 2026-05-15-flowchart-pathway-design-research.md (432 lines).*
