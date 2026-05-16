# Migraine Pathway UX Audit — Clinical Workflow Improvement

**Date:** 2026-05-16
**Auditor:** ui-architect
**Skills loaded:** design-tokens · design:design-system · design:design-critique · performance
**Scope:** Clinical-workflow audit on existing `MigrainePathway.tsx` against `PATHWAY_SPEC.md` v1.4, EVT v3 Pattern A reference, clinical dossier (Robblee 2025 AHS guideline), and design research synthesis.
**Source files read:**
- `src/pages/MigrainePathway.tsx` (787 lines)
- `docs/specs/PATHWAY_SPEC.md` v1.4
- `docs/specs/mockups/pathway-evt-interactive-demo-v3-warmth.html`
- `docs/evidence-packets/2026-05-15-migraine-pathway-PDF-VERIFIED.md`
- `docs/research/2026-05-15-flowchart-pathway-design-research.md`

---

## Executive summary

MigrainePathway.tsx is a 787-line, five-step linear wizard that covers the core "headache cocktail" use case reasonably well in structure but has ten distinct layout violations against PATHWAY_SPEC.md v1.4, three clinically significant defaults that do not match Robblee 2025 (the governing Level A guideline), and several workflow friction points that slow clinicians at the point of greatest time pressure — Step 3 (cocktail selection) in the ED.

The pathway uses a horizontal numbered step strip (indigo), not Pattern A (vertical decision-tree rail). The sticky header uses a large indigo `<h1>`, a Skull icon-tile, and a mobile-specific bottom footer bar — all three are anti-patterns per spec §11. There is no persistent interpretation drawer; instead, the plan is assembled invisibly and revealed only at Step 5.

The most urgent workflow issue is not visual: the default antiemetic in `CocktailState` is `'metoclopramide'` (line 123), but Robblee 2025 Table 3 lists **prochlorperazine as Level A — Must Offer** and metoclopramide as Level B. Every clinician who skips the antiemetic selection gets the lower-evidence default silently. This is a clinical logic issue that the clinical reviewer must gate, but it surfaces visually as a UX problem because the UI does not signal that the preselected value is a default.

The second most urgent UX issue is cocktail assembly: the plan only becomes visible at Step 5, after the clinician has clicked through four steps. There is no live-order preview. In a real ED workflow, the attending may need to read the cocktail to a nurse while still mid-pathway. The lack of a persistent visible summary is the biggest single clinical-workflow friction point in the current design.

**Finding count:** 22 distinct findings (4 critical-workflow, 9 spec-violation, 5 clinical-UX, 4 differential-routing).

---

## Method

1. Read `MigrainePathway.tsx` in full, mapping every component to PATHWAY_SPEC.md sections.
2. Cross-referenced clinical dossier Section 4 (audit grid) for every drug/dose interaction in the UI against Robblee 2025 verified findings.
3. Applied the 13 design principles from the research synthesis (Sweller, Bates, Shneiderman, Klein RPD, Nielsen, Norman) to each step's interaction pattern.
4. Compared the EVT v3 Pattern A mockup CSS/HTML structure against the current MigrainePathway component layout.
5. Severity ordering: Critical-workflow > Spec-violation > Clinical-UX > Differential-routing.

---

## Findings (severity-ordered, workflow-focused)

### CW-1 — CRITICAL: No persistent live order summary (Step 1–4 are blind)
**Location:** `MigrainePathway.tsx` lines 122–139 (state) and lines 742–767 (Step 5 only).
**Problem:** `generateSummary()` is called only at Step 5 (line 751). During the entire cocktail-selection step (Step 3, lines 438–663), the clinician is toggling drugs and doses with no visible output. The order summary exists only in memory. At the bedside, a nurse may ask "what are we giving?" before the clinician has reached Step 5. There is no answer available from the UI.
**Spec reference:** PATHWAY_SPEC.md §5 hard rule — the persistent interpretation drawer (`CalculatorDrawer`) must show a live summary as State B (partial inputs, muted bar) updating as values are toggled. The `generateSummary()` function already has the logic; it is never wired to the drawer.
**Research basis:** Bates 2003 commandment #2 "anticipate needs in real time"; Klein RPD — the clinician needs to read the situation, not reconstruct it on demand.
**Severity:** Critical-workflow.

### CW-2 — CRITICAL: `copySummary()` uses `alert()` (line 276)
**Location:** `MigrainePathway.tsx` line 276.
**Problem:** `alert("Plan copied to clipboard.")` is a browser-native blocking dialog. At the bedside this is a hard interruption that freezes the screen and requires a manual dismiss before the clinician can continue. It is also non-dismissable by keyboard alone on some mobile browsers.
**Spec reference:** PATHWAY_SPEC.md §2 — the copy action is in the header; feedback is the header copy button's transient visual confirmation, not a blocking alert.
**Research basis:** AHRQ alert-fatigue — interruptive alerts erode trust even when accurate.
**Severity:** Critical-workflow.

### CW-3 — CRITICAL: Antiemetic default is metoclopramide (Level B), not prochlorperazine (Level A)
**Location:** `MigrainePathway.tsx` line 123 — `antiemetic: 'metoclopramide'`.
**Problem:** The initial `CocktailState` silently preselects metoclopramide. Robblee 2025 Table 3 (Headache 2026;66:53–76) lists **Prochlorperazine IV 10–12.5 mg as Level A — Must Offer** and Metoclopramide IV 10 mg as Level B — Should Offer. A clinician who proceeds without consciously reviewing the antiemetic selection gets the lower-evidence agent. The UI presents these as equivalent radio buttons with no evidence-level differentiation.
**Dossier reference:** Section 4 row 2, verdict AGENT-CHOICE-OFF, severity HIGH.
**Clinical impact:** This is a UX-surfaced clinical logic error. The fix has two parts: (a) change the default in `CocktailState` from `'metoclopramide'` to `'prochlorperazine'` (clinical reviewer must gate this), and (b) add an evidence-level badge ("Level A" vs "Level B") on the antiemetic option rows so any default is legible.
**Severity:** Critical-workflow (clinical logic gate required).

### CW-4 — CRITICAL: Step 4 Response gate requires clicking "Refractory" before second-line appears — no time cue
**Location:** `MigrainePathway.tsx` lines 667–737.
**Problem:** The Step 4 UI shows "Patient Status (1 hour post-cocktail)" but the "1 hour" timeframe is only visible in the card heading. There is no countdown or explicit "set a 1-hour timer" affordance. More critically: the second-line rescue panel only appears after the user clicks "Refractory" in this step. If the nurse returns at 90 minutes and the attending hasn't touched the app, the pathway is stuck on Step 4 with no second-line visible. The second-line drugs (valproate, magnesium) must be available to read without re-entering the app flow.
**Research basis:** Bates commandment #3 "fit into the user's workflow" — the re-engagement pattern must handle real-world time gaps.
**Severity:** Critical-workflow.

---

### SV-1 — SPEC VIOLATION: Horizontal numbered step strip instead of Pattern A vertical rail
**Location:** `MigrainePathway.tsx` lines 320–332.
**Problem:** The pathway renders a horizontal dots strip with numbered circles (1–5) and a horizontal progress line. PATHWAY_SPEC.md §3 (v1.1+) abolishes this pattern. Pattern A replaces it with a vertical connector rail, cobalt nodes (completed/active/locked), and inline branch chips between steps.
**Spec reference:** PATHWAY_SPEC.md §3, §3.9 — "The horizontal dots strip (previous §3 draft) was rejected."
**Tokens violated:** The strip uses `bg-indigo-500`, `border-indigo-500`, `text-indigo-600` — no `indigo-*` tokens exist in the design system. Only `neuro-*` and `slate-*` are permitted.
**Severity:** Spec-violation.

### SV-2 — SPEC VIOLATION: Sticky header is an h1 with icon-tile and no eyebrow/name stack
**Location:** `MigrainePathway.tsx` lines 295–317.
**Problem:** The header is a `<div className="mb-8 flex items-start justify-between">` — it is NOT sticky. It contains a large `<h1 className="text-2xl md:text-3xl font-black ...">`, a `p-2 bg-indigo-100 text-indigo-700 rounded-lg` icon tile with `<Skull>`, and a bare star button. None of these match the spec.
**Spec reference:** PATHWAY_SPEC.md §2 — sticky header must be `sticky top-0 z-40 bg-white/95 backdrop-blur-md`. Left cluster: back arrow SVG + two-line stack (eyebrow `PATHWAY` + pathway name). Right cluster: star + reset + copy-pill. No icon-tile. No full `<h1>` in the header. No `font-black`. No `bg-indigo-*`.
**Tokens violated:** `bg-indigo-100`, `text-indigo-700`, `font-black`, `text-2xl`, `text-3xl` — all out of spec.
**Severity:** Spec-violation.

### SV-3 — SPEC VIOLATION: No CalculatorDrawer — no persistent interpretation surface
**Location:** `MigrainePathway.tsx` — no import of `CalculatorDrawer` anywhere.
**Problem:** The pathway hand-rolls all its result display at Step 5. There is no `CalculatorDrawer` component in use.
**Spec reference:** PATHWAY_SPEC.md §5 hard rule — "Pathways MUST NOT hand-roll a drawer. The component already handles portal, fixed positioning above `--nav-rail-width`, z-[55], collapsed/expanded shadows, and State A/B/C semantics."
**Severity:** Spec-violation.

### SV-4 — SPEC VIOLATION: max-w-3xl page wrapper instead of max-w-2xl
**Location:** `MigrainePathway.tsx` line 292 — `max-w-3xl mx-auto`.
**Problem:** Spec §9 and §1 both require `max-w-2xl mx-auto px-5`.
**Severity:** Spec-violation (layout).

### SV-5 — SPEC VIOLATION: Step 2 care-setting cards use border-2 with emerald/indigo colors
**Location:** `MigrainePathway.tsx` lines 408–419.
**Problem:** The three care-setting buttons use `border-emerald-500 bg-emerald-50` and `border-indigo-500 bg-indigo-50` for selected state. Spec §4.2 defines the canonical selected state as `border-neuro-500 bg-neuro-50 text-neuro-700`. `border-2` is explicitly forbidden by the design-tokens skill ("No border-2"). The `emerald-*` and `indigo-*` tokens do not exist in the neuro design system.
**Severity:** Spec-violation.

### SV-6 — SPEC VIOLATION: Step 3 uses a bottom fixed footer bar on mobile
**Location:** `MigrainePathway.tsx` lines 655 and 422 — `fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur ...`.
**Problem:** The step-level back/next CTA is implemented as a mobile-sticky footer bar using `fixed bottom-[4.5rem]`. This conflicts with the tab bar's own fixed positioning and the CalculatorDrawer's portal. Spec §5 delegates all persistent-bottom-surface ownership to CalculatorDrawer. Pathway steps MUST NOT add their own fixed-bottom bars.
**Severity:** Spec-violation.

### SV-7 — SPEC VIOLATION: lucide-react ArrowLeft and ChevronRight in use
**Location:** `MigrainePathway.tsx` line 3 — imports `ArrowLeft, ChevronRight` from `lucide-react`.
**Problem:** PATHWAY_SPEC.md §2 hard rule (§11 anti-pattern #3): "use the canonical SVG, NOT `lucide-react`'s `ArrowLeft`." §4.6 specifies the shared `Chevron` component from `src/components/calculators/Chevron.tsx`, NOT lucide's `ChevronRight`.
**Severity:** Spec-violation.

### SV-8 — SPEC VIOLATION: Step 3 safety toggles use shadow-sm, border-2 not specified in tokens
**Location:** `MigrainePathway.tsx` lines 278–288 — `SafetyToggle` component uses `shadow-inner` and `px-3 py-3 rounded-lg`.
**Problem:** `shadow-inner` is not in the token set. Spec §2.4 + design-tokens skill: no `shadow-sm`, no arbitrary shadow values on interactive elements. The toggle should follow the tri-button token set: `rounded-full border border-neuro-500 bg-neuro-50 text-neuro-700` for selected, `rounded-full border border-slate-200 bg-white text-slate-700` for unselected.
**Severity:** Spec-violation.

### SV-9 — SPEC VIOLATION: Step 1 red-flag "Proceed" button uses bg-indigo-600
**Location:** `MigrainePathway.tsx` lines 395, 428, 549, 658, 732.
**Problem:** The primary CTAs throughout use `bg-indigo-600 hover:bg-indigo-700`. The correct token is `bg-neuro-500 hover:bg-neuro-600` (design-tokens skill, copy button row). `indigo-*` does not exist in the neuro palette.
**Severity:** Spec-violation (pervasive — every CTA in the pathway).

---

### CU-1 — CLINICAL-UX: No evidence-level labels on antiemetic options
**Location:** `MigrainePathway.tsx` lines 502–524.
**Problem:** The three antiemetic options (metoclopramide / prochlorperazine / ondansetron) are presented as visually equal radio buttons. The dossier establishes a clear Level A vs Level B vs lower hierarchy. A clinician scanning quickly has no signal that prochlorperazine has stronger evidence. The ondansetron caveat ("Less effective for pain") is shown only in a 12px sub-label that is easily missed.
**Recommended fix:** Add a badge inline with each option label. Example: `Level A` in a neuro-50 pill on prochlorperazine, `Level B` on metoclopramide, and a visible amber "Allergy/QT concern only" indicator on ondansetron. This is a UX affordance for evidence hierarchy, not a clinical logic change — but it must clear clinical reviewer gate.
**Severity:** Clinical-UX.

### CU-2 — CLINICAL-UX: Dexamethasone role is ambiguous — recurrence prevention vs. acute pain confusion
**Location:** `MigrainePathway.tsx` lines 560–584.
**Problem:** The current sub-label reads "Prevents recurrence (rebound) within 72h. Single dose only." Robblee 2025 introduced a split: dexamethasone for **acute pain** is now Level C (May Offer) while **recurrence prevention** retains Level B (Should Offer) from 2016. The current label conflates these two indications. A clinician reading the label thinks dexamethasone is "only for recurrence prevention" and may skip it for acute pain even when it could still be offered under Level C.
**Dossier reference:** Section 4 row 7 / Section C of clinical questions.
**Severity:** Clinical-UX (dossier notes this is correctly framed for recurrence but misleading about acute pain role).

### CU-3 — CLINICAL-UX: GONB (Greater Occipital Nerve Block) is entirely absent
**Location:** MigrainePathway.tsx — no mention anywhere of nerve blocks.
**Problem:** Robblee 2025 Table 3 lists GONB as **Level A — Must Offer**. It is not in the first-line cocktail, not in add-ons, and not in second-line rescue. The entire intervention category is absent from the pathway. A clinician using this tool as decision support will not be reminded to offer the highest-evidence intervention for refractory ED migraine.
**Dossier reference:** Section 5 finding #1, severity HIGH.
**Recommended UX placement:** GONB should appear in the Step 2 add-ons section as a Level A badge item with a brief rationale. Its indication (ED setting, nerve block available) can be gated by a simple checkbox: "Nerve block available at this facility."
**Severity:** Clinical-UX (clinical reviewer must gate the content; UX must surface the slot).

### CU-4 — CLINICAL-UX: Step 5 plan text uses a monospace dark card — not copy-ready for orders
**Location:** `MigrainePathway.tsx` lines 744–768.
**Problem:** The generated plan renders in a dark `bg-slate-900 text-white` card with monospace font and a gradient blur decoration. While visually dramatic, this creates accessibility problems (the text is on a near-black background, contrast needs verification) and it makes the text hard to share via screenshot. More critically, there is no structured "order-ready" format — the text uses dashes and capitalized headers that do not match most EHR order formats.
**Research basis:** Bates commandment #7 — "simple interventions work best." The most actionable plan is one that can be read aloud or copy-pasted directly into an order field.
**Recommended fix:** Replace the dark card with a white bordered card using `bg-white border border-slate-100 rounded-xl p-4`. Render the plan as `<dl>` rows (drug / dose / route / frequency) rather than concatenated strings. Keep the copy button.
**Severity:** Clinical-UX.

### CU-5 — CLINICAL-UX: Ketorolac dose set (15/30/45 mg) has a non-standard ceiling
**Location:** `MigrainePathway.tsx` lines 538–554.
**Problem:** The 45 mg option is filtered out for age >65 or weight <50 kg (line 541), but 45 mg is itself a non-standard ED ceiling. Robblee 2025 Level B specifies **30–60 mg**. The standard high-dose ED option is 60 mg, not 45 mg. The correct set is 15/30/60, with 30 as the most common, 15 for elderly/low-weight, 60 as the maximum.
**Dossier reference:** Section 4 row 5, severity MEDIUM.
**Severity:** Clinical-UX (clinical reviewer must gate the dose change).

---

## Pattern A applicability for Migraine

Pattern A (vertical decision-tree rail with nodes, branch chips, cascade-clear) fits Migraine well in structure but requires adaptations for three migraine-specific characteristics.

### Where Pattern A fits directly

**Step 1 (Safety / Red Flags):** The seven red-flag checkboxes map to a Pattern A "multi-select safety screen" step. The current boolean-toggle approach is fine; the step can be rendered as a single Pattern A step with category rows for each red flag using a Yes/No tri-button. The stop-card (red-flag present) becomes a branch-chip outcome state. The branch chip after Step 1 would read: `No red flags · Proceed` or (if flagged) route to a terminal "STOP" state — matching the EVT "Avoid" drawer state.

**Step 2 (Care Setting):** Three-option branch is a natural Pattern A category row with accordion. Selected option becomes the branch chip: `Adequate home response` or `Incomplete/Vomiting`. The "Adequate home response" branch terminates (discharge recommendation in the drawer) while "Incomplete" and "Vomiting" unlock Step 3. This is structurally identical to EVT's LVO-window branch.

**Step 3 (Safety Profile):** The safety profile panel is a separate concern from Pattern A's linear step concept. It feeds constraints into the cocktail (Step 3b). In the rebuild, the safety profile should be extracted as a persistent sidebar panel or a pre-Step-3 screening step, not merged into the cocktail step. The current pattern (safety panel + cocktail selection on the same step) violates Mayer's segmenting principle and Bates commandment #8 (do not ask for more than you need in one pass).

**Step 4 (Response):** The binary Improved/Refractory branch is a natural Pattern A single-question step: one category row, two options. The branch chip after Step 4 reads: `Improved · Plan complete` or `Refractory · 90 min`. This is simpler than EVT imaging and maps cleanly.

### Where Pattern A requires migraine-specific adaptation

**Cocktail visualization (Step 3b) does not map to Pattern A's category-row accordion model.** Migraine treatment is a multi-drug parallel selection, not a sequential decision tree. The cocktail has four simultaneous components (benadryl, antiemetic, ketorolac, dexamethasone) each of which is enabled/disabled by the safety profile. A single-active-step Pattern A step cannot cleanly represent four parallel drug decisions without either (a) one category row per drug with a dose accordion, or (b) a structured table/list with toggle rows.

**Recommendation:** Use a hybrid approach. Within a single Pattern A step labeled "COCKTAIL," render four category rows (one per drug family) using the accordion pattern. Each row label is the drug class ("Antiemetic," "NSAID," "Steroid," "Antihistamine"), the selected option is the specific drug + dose, and the accordion contains the available choices. Safety-disabled drugs collapse their accordion and render their row in a "Contraindicated — {reason}" state (no chevron, muted label, red pill badge on the right). This matches Pattern A's "iOS Settings" category-row anatomy and handles the parallel-drug selection without forking the flow.

**Add-ons (sumatriptan, magnesium, valproate) can be a second step: "ADD-ONS."** Each add-on is one category row: "Triptan (optional)," "Magnesium (optional)," "Valproate (optional)." Safety-disabled add-ons render as above.

**Safety profile must be its own step (Step 2b or a collapsible panel), not inline with cocktail.** Mixing 11 safety toggles with drug selection on the same step creates the cognitive load problem Sweller identified: the user must mentally hold the safety state while reading drug options. Separating them into sequential steps (safety first, then cocktail) matches the 4C/ID scaffolding principle.

### Pattern A verdict for Migraine

Pattern A is applicable with the hybrid model. The recommended step structure for the rebuild is:

```
Step 1: RED FLAGS       (7 boolean rows → Stop/Continue branch)
Step 2: CARE SETTING    (3-option accordion → Discharge/Continue branch)
Step 3: SAFETY PROFILE  (11 safety toggles as category rows, feeds Steps 4–5)
Step 4: COCKTAIL        (4 parallel category rows with dose accordions)
Step 5: ADD-ONS         (3 optional category rows)
Step 6: RESPONSE        (1 binary category row → Plan/Rescue branch)
Step 7: RESCUE          (2–3 optional category rows — only if Refractory)
Step 8: PLAN            (Drawer State C, live order summary)
```

This is 7 active steps versus the current 5, but each step is simpler. The step count should be hidden behind the rail's progressive disclosure — locked steps are present but visually quiet.

---

## Cocktail visualization — best-practice patterns

The migraine cocktail is the core output of this pathway. The current approach defers it entirely to Step 5. The rebuild must make it persistent and visible.

### Live cocktail summary in the drawer (State B)

While the clinician is in Step 4 (COCKTAIL), the `CalculatorDrawer` should render in State B with a `collapsedStat` reading the current drug count and route:

- Initial: `Cocktail · 4 agents pending`
- After antiemetic selected: `Prochlorperazine · +3 to confirm`
- After all four: `Full cocktail · Tap to review orders`

State C (after Response step completes) shows the full expandable order list.

### Order-ready format inside the drawer (State C expanded)

The expanded drawer should render the cocktail as structured order rows, not concatenated strings. Each row:

```
Drug name          Route    Dose      Frequency / Notes
Prochlorperazine   IV       10 mg     x1, repeat q8h PRN (max 3)
Ketorolac          IV       30 mg     x1, repeat at 8h PRN (max 2 doses)
Dexamethasone      IV       10 mg     x1 — for recurrence prevention
Diphenhydramine    IV       50 mg     x1 — akathisia prophylaxis
```

This is the "copy to clipboard" format that matches EHR order sets. Structured rows are more scannable than the current dashed-text monospace output.

### Evidence badges on drug rows

Each drug in the cocktail should carry an inline evidence badge:

- Prochlorperazine: `Level A` in a neuro-50 pill
- Ketorolac: `Level B`
- Dexamethasone: `Level B (recurrence)` in amber-50
- Diphenhydramine: `Level C (EPS prevention)` in slate-50

These badges are informational, not interactive. They occupy the right side of the drug row. They give the evidence-literate clinician immediate orientation without requiring them to tap for more detail.

---

## Safety screening UX

### Current state

The safety profile (lines 441–469) is a dense panel inside Step 3 with an 11-toggle grid and one dropdown. Toggles use the `SafetyToggle` component, which applies `shadow-inner` and `border` but not the canonical tri-button token set. The renal function selector is a native HTML `<select>` — spec §3.7 anti-pattern ("Do NOT use a native HTML `<select>` element").

### What is working

The automatic safety-state check on drug selection (the `useEffect` at line 189) is excellent UX. When a safety toggle changes, contraindicated drugs are automatically removed from the cocktail and a removal alert fires. This is the right behavior and should be preserved in the rebuild.

The removal alert (lines 336–345) is a fixed-position toast in a good location. Its token violations (`bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl`) should be normalized to the spec severity token set (high tier: `bg-red-50 border border-red-200 text-red-700`), but the pattern is sound.

### What must change in the rebuild

The safety profile should be its own Pattern A step (Step 3). Each of the 11 safety factors becomes a category row with a Yes/No tri-button. The renal function row uses a band-button group (Normal / eGFR 30–50 / eGFR <30 / Dialysis). This eliminates the native `<select>`, brings the step into Pattern A conformance, and separates safety assessment from drug selection.

The "interaction" between safety state and drug availability should be communicated in the cocktail step via the category row's "Contraindicated" state — a muted row with a red badge reading the reason. This replaces the current floating toast for routine contraindication display (the toast is still appropriate for retroactive removal when safety state changes mid-cocktail selection).

### Pregnancy edge case

The dossier (Section E) notes that the current pathway **disables sumatriptan in pregnancy** but Burch 2024 lists triptans as **first-line rescue in pregnancy**, particularly SC sumatriptan. The current UI silently removes sumatriptan without offering a "Pregnancy rescue — SC sumatriptan with caution" pathway. The rebuild should downgrade this from a hard disabled to a contextual warning row with a "Pregnancy rescue use" expansion note. This requires clinical reviewer gate.

---

## Care-setting branch — does it read clearly?

### Current state

Step 2 presents three large cards (lines 408–419):
1. "Adequate response to home therapy"
2. "Incomplete / Inconsistent response"
3. "Severe Nausea / Vomiting"

The "Adequate response" branch shows a static text outcome ("Discharge / Outpatient Management.") in the button bar on the right. There is no visual separation between "this branch exits the pathway" and "this branch continues." A clinician who selects "Adequate" and sees a text message — not a "Continue" button — may not immediately understand that the pathway has concluded for this patient.

### What is working

The logic is correct. "Adequate" = discharge, others = proceed to cocktail. The conditional CTA (discharge message vs. continue button) is a sound branch pattern.

### What must change

In Pattern A, "Adequate response" should become a terminal branch that triggers the drawer's State C with `tierLabel: "Discharge"` and `collapsedStat: "Home therapy adequate"`. The drawer headline reads "Discharge with outpatient follow-up" and the expanded content gives the outpatient plan (rebound prevention counseling, follow-up). This matches how the EVT pathway handles its ineligibility branches — the decision is final, the drawer shows the outcome.

The "Incomplete" and "Vomiting" options should be merged into a single "ED Treatment Required" branch, because their management is identical (proceed to cocktail). Splitting them into two separate cards adds a decision that has no consequence in the current pathway — both options lead to Step 3. If vomiting is relevant it should appear as a safety profile input that changes route selection (PO vs IV/IM), not as a separate care-setting branch.

---

## Recurrence prevention — surfacing dexamethasone at the right moment

### Current state

Dexamethasone is presented as the fourth item in the Step 3 cocktail panel, pre-selected at 10 mg. This is good placement — it is visible during cocktail assembly. However:

1. The sub-label reads "Prevents recurrence (rebound) within 72h. Single dose only." The word "recurrence" is clinical jargon. A resident may not immediately connect this to the patient's next-day rebound headache risk.
2. The dose options are 4 mg and 10 mg. The 4 mg option is sub-therapeutic per Robblee Table 2 (8–16 mg). The clinical dossier flags this as severity MEDIUM.
3. Dexamethasone for recurrence prevention is a distinct indication from dexamethasone for acute pain. The pathway currently presents only the recurrence-prevention context. Robblee 2025 permits Level C (May Offer) for acute pain — the UI should not actively suppress this.

### Recommended UX fix

Rename the dose row to show the clinical goal clearly: "Dexamethasone — Recurrence prevention (Level B)" for the discharge-prevention dose, with a note "Also may offer for acute pain relief (Level C)." Change the dose options from 4/10 to 8/10/16 (clinical reviewer must approve). The 10 mg default is correct and should remain. At Step 5 (Plan), dexamethasone should appear in the discharge instructions section, not just the cocktail section — surfacing it at discharge as well as at cocktail time reinforces the recurrence-prevention purpose.

---

## Differential routing (cluster, MOH, indo, TN) — how to surface

The dossier (Section 6) specifies four differential branches that are currently absent. These are real clinical use cases: a patient with autonomic features may have cluster headache, not migraine; a patient with daily headache and heavy analgesic use may have MOH; a patient with strictly unilateral continuous pain may have hemicrania continua.

### Recommended Pattern A implementation

**Pre-pathway differential screen (new Step 0):** Before Step 1 (red flags), add an explicit differential routing step with four pattern questions:

| Question | Branch |
|---|---|
| "Severe unilateral orbital/supraorbital pain, autonomic features (tearing, nasal congestion), restlessness, lasts 15–180 min" | Cluster headache card |
| "Strictly side-locked, continuous or paroxysmal autonomic headache, ≥5 attacks/day or constant waxing/waning" | Indomethacin-responsive screen |
| "Paroxysmal electric-shock pain, seconds, trigeminal distribution, triggered by touch" | Trigeminal neuralgia card |
| "None of the above — episodic migraine or unclear" | Continue to red-flag screen |

This step uses a single-select (four-option band) rather than checkboxes. It routes immediately on selection, using Pattern A's cascade logic. The cluster, indo, and TN cards render inside the drawer as terminal State C outcomes with their respective management. This does not require a new route — all branches stay within the pathway component.

**MOH screening at Step 7 (Plan/Discharge):** Separate from the pre-pathway screen, the MOH question belongs at discharge. After the plan is assembled, a Pattern A "discharge check" step asks: "Is this patient's headache frequency ≥15 days/month AND using abortive medications >10 days/month?" Yes → MOH counseling card in the plan. No → standard plan.

### Visual rendering of differentials in Pattern A

Each differential outcome uses a branch chip that reads the diagnosis name (e.g., "Cluster headache — separate protocol"), and the drawer renders in State C with the differential's management summary. For cluster: "High-flow O2 6–12 L/min via NRB + SC Sumatriptan 6 mg" (Robblee Level A, Burish Table 6-3). The clinician gets the cluster management without leaving the pathway surface.

Differentials should NOT open a new route or a modal. They should be terminal branches within the same pathway rail, using the drawer as the output surface. This matches the EVT "Avoid EVT" terminal branch pattern.

---

## Comparison with EVT v3 design

### Wins from EVT v3 to adopt in Migraine

| EVT v3 Pattern | Migraine applicability |
|---|---|
| Vertical rail with cobalt nodes + branch chips | Directly adoptable; Step 0–6 maps cleanly |
| CalculatorDrawer as persistent live summary | High priority — cocktail summary must be live |
| Category-row accordion with two-line stacked options | Adoptable for antiemetic selection and dose options |
| Evidence badge inline with option description | Adopt for Level A/B labeling on antiemetics |
| Step eyebrow + icon (v3 addition) | Adopt — each migraine step has a clear clinical phase |
| Cascade-clear transient inline notice | Adopt — especially relevant when safety profile changes |
| Branch chip as tap-targetable button | Adopt — clinician may re-examine safety profile |
| Auto-scroll to next unanswered category row | Adopt — reduces friction in the cocktail step |

### Migraine-specific wins to preserve

| Current MigrainePathway pattern | Keep? | Notes |
|---|---|---|
| Automatic drug removal on safety state change (lines 189–221) | Yes | Good safety logic, should be preserved in rebuild |
| Safety removal toast with specific drug names | Yes | Adapt tokens; the pattern is correct |
| `checkEligibility()` helper per drug | Yes | Centralized eligibility logic is clean; move to data file |
| Red-flag full-screen stop card (lines 386–392) | Yes | The hard stop is appropriate; use drawer State C with high tier tokens |
| Refractory second-line conditionality (line 707) | Yes | Show second-line only if not used in first pass — preserve this logic |
| Multi-dose option for ketorolac/magnesium/valproate | Yes | Dose selection within a category-row accordion is valid Pattern A |

### What EVT v3 does that Migraine uniquely cannot adopt as-is

1. **EVT has 4 steps with ~3 category rows each** (12 total inputs). Migraine has 11 safety factors + 4 cocktail drugs + 3 add-ons + 2 response states = ~20 inputs. This is above the research synthesis Principle 12 ceiling of "≤4 categories per step." The hybrid 7-step model recommended above keeps individual steps at ≤4 categories.

2. **EVT's branch chips summarize numeric/categorical inputs** (ASPECTS score, NIHSS band). Migraine's branch chips summarize a boolean safety profile, which produces a verbose chip if all 11 factors are listed. The solution: the Step 3 (Safety) branch chip should read a compact summary: e.g., "Pregnant · Renal eGFR <30" (list only positive flags, "No contraindications" if all clear).

3. **EVT has one output tier** (Eligible/Consult/Avoid). Migraine has a multi-drug cocktail output. The drawer State C for Migraine must display structured order rows, not a single eligibility label. This is a new pattern within Pattern A — the drawer as an "order builder" rather than an "eligibility signal."

---

## Recommended workflow improvements for the rebuild

Ordered by clinical-workflow impact.

### Priority 1 — Wire live cocktail to CalculatorDrawer State B

`generateSummary()` already has the correct logic. Route its output to `CalculatorDrawer`'s `collapsedStat` prop during Steps 4–5 (cocktail and add-ons). This eliminates the Step 5 reveal and makes the cocktail visible throughout the workflow. This is a Class C change.

### Priority 2 — Fix antiemetic default to prochlorperazine + add Level A/B badges

Change line 123 from `antiemetic: 'metoclopramide'` to `antiemetic: 'prochlorperazine'`. Add evidence-level badge text to each antiemetic option's sub-label. This requires clinical reviewer gate (Class E-clinical) but is a minimal code change.

### Priority 3 — Replace copySummary alert() with spec-compliant feedback

Remove line 276's `alert()`. Replace with a 1.5-second visual state change on the copy button (`bg-neuro-500` → `bg-emerald-600` with checkmark for 1.5s). This is a Class B fix.

### Priority 4 — Rebuild to Pattern A with hybrid cocktail step structure

Full rebuild using the 7-step model described above. Adopts vertical rail, nodes, branch chips, CalculatorDrawer, `max-w-2xl`, `neuro-*` tokens, and the cocktail-as-category-rows hybrid. This is Class D.

### Priority 5 — Add GONB as Level A option in cocktail add-ons

Add a "Nerve block" category row in the add-ons step, gated by a "Procedure available" checkbox. Renders "Greater Occipital Nerve Block — Level A (Robblee 2025)" with a brief technique note in the accordion description. This requires clinical reviewer gate (Class E-clinical).

### Priority 6 — Add differential routing screen (Step 0)

Add the four-option pre-pathway differential screen (cluster / indo-responsive / TN / migraine). Terminal branches use drawer State C with appropriate management cards. Class D-clinical (new clinical branch content).

### Priority 7 — Fix ketorolac ceiling (60 mg) and dexamethasone low dose (8 mg minimum)

Clinical reviewer gate required. Replace 45 mg option with 60 mg. Replace 4 mg dexamethasone option with 8 mg. Class E-clinical.

### Priority 8 — MOH discharge screen

Add a two-question MOH screen at the end of the plan step. Renders a counseling card in the drawer plan output if criteria are met. Class D-clinical.

---

## Direct answer to V

**ED time pressure:** The pathway's biggest friction is that the cocktail is invisible until Step 5. Fix by wiring `generateSummary()` to the CalculatorDrawer during Steps 3–4. The second friction is the `alert()` on copy, which is a one-line fix.

**Cocktail visualization:** Needs two changes: (a) live in drawer from Step 4 onward, and (b) structured order rows (`<dl>` rows per drug) rather than monospace dashed text in a dark card. The evidence badges (Level A/B) on each drug row are the differentiating clinical UX win.

**Safety screening UX:** The auto-deselect logic is the best feature in the pathway and must survive the rebuild. The safety toggles themselves need to become Pattern A category rows with Yes/No tri-buttons (no native `<select>`). The renal function band becomes a 4-option band button. The removal toast adapts its tokens.

**Care-setting branch:** Merge "Incomplete" and "Vomiting" into a single "ED Treatment Required" branch (they have identical consequences). "Adequate home response" becomes a terminal drawer State C output, not a text message in the button bar.

**Recurrence prevention:** Dexamethasone is already in the cocktail at the right moment. The UX fix is the dose range (8/10/16, not 4/10) and a clearer label distinguishing its recurrence-prevention indication from its acute-pain Level C indication.

**Pattern A applicability:** Verdict is Applicable with a hybrid model. The 7-step structure with a "cocktail step" that uses category-row accordions for parallel drug selection is the correct adaptation. Pattern A fits Migraine better than the current wizard because the rail communicates the safety-profile-to-cocktail dependency visually through branch chips.

**Differential routing:** Add Step 0 (4-option differential screen) and MOH screen at Step 7. These route to drawer State C terminal cards. Cluster is the most clinically urgent (Level A oxygen is missed for every cluster patient currently managed through this pathway). TN and indo-responsive are lower volume but diagnostically consequential.

**Comparison with EVT v3:** Adopt the rail, nodes, chips, drawer, cascade-clear, and category-row accordion from EVT v3. The migraine-specific win to preserve is the automatic drug-removal logic on safety state change — this is more sophisticated than anything in the EVT pathway and should become the reference pattern for other safety-sensitive pathways.

---

## @ui-architect — Sign-off

**Spec cited:** PATHWAY_SPEC.md v1.4 §1, §2, §3, §3.2, §3.4, §3.6, §3.7, §3.7.1, §4.2, §5, §5.1, §5.3, §5.4, §6, §7, §8, §9, §11 (anti-pattern table items 1–15)
**Layout decisions:** No layout changes made — this is a read-only audit. All decisions above are recommendations for the rebuild swarm.
**Deviations from spec:** None — audit scope only.
**Risks flagged:**
- Antiemetic default change (Priority 2) is Class E-clinical. Medical scientist and clinical reviewer must gate before any code change.
- Ketorolac dose ceiling and dexamethasone low-dose fix (Priority 7) are Class E-clinical. Same gate.
- Sumatriptan-in-pregnancy downgrade from disabled to warning is Class E-clinical. Must not proceed without clinical reviewer co-sign.
- GONB addition (Priority 5) introduces a new clinical intervention category. This is Class E-clinical with a new clinical surface (the GONB accordion description text is a claim surface per `.claude/rules/clinical-surfaces.md`).
- The 7-step rebuild (Priority 4) crosses `src/pages/MigrainePathway.tsx` and would likely add `src/data/migrainePathwayData.ts` (new file) and import `CalculatorDrawer` — this is Class D minimum, D-clinical if any clinical content changes.
**Status:** ready
