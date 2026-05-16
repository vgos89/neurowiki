# SE Pathway UX Audit — Clinical Workflow Improvement

**Date:** 2026-05-16
**Auditor:** ui-architect
**Skills loaded:** design-tokens · design:design-system · design:design-critique · performance
**Source files read:**
- `src/pages/StatusEpilepticusPathway.tsx` (463 lines)
- `docs/specs/PATHWAY_SPEC.md` (v1.4 — Pattern A reference)
- `docs/specs/mockups/pathway-evt-interactive-demo-v3-warmth.html`
- `docs/evidence-packets/2026-05-15-status-epilepticus-pathway-PDF-VERIFIED.md`
- `docs/research/2026-05-15-flowchart-pathway-design-research.md`
**Scope:** Clinical-workflow improvement audit on existing `StatusEpilepticusPathway.tsx`
**Output mode:** Read-only audit; no source files edited

---

## Executive summary

1. **Pattern A would substantially help SE.** The vertical rail + category-row accordion pattern (PATHWAY_SPEC §3) is the right structure for SE because stage transitions are the dominant decision point, not option selection within a stage. The current CollapsibleSection accordion stack creates orientation confusion at the bedside — a clinician in a code cannot tell at a glance which stage they are in without reading the section header text.

2. **Highest-leverage workflow fix: make the calculated dose impossible to miss.** The dose string is rendered at 4xl font inside a card, but it is only reachable after selecting a benzo agent AND marking a dose given AND seeing a status outcome. At the Stage 2 (Urgent Control) step, the dose appears at line 366 inside a scroll-container below the comorbidity panel — easily missed when stress is high. A one-line dose chip anchored to the step header would cut retrieval time from ~8 seconds to ~1 second.

3. **Weight entry is the pathway's critical bottleneck.** Weight lives in Step 1 behind a full-screen card with extra contextual text (line 225-229). If the clinician skips or mis-taps the weight, every downstream dose is wrong — and the pathway gives no visible warning when weight is 0. SE is the pathway most reliant on weight-based dosing: 12 of 12 drugs calculated from weight.

4. **The NCSE/CSE toggle is a clinical safety issue (not a UX issue).** The toggle at line 234 leads NCSE patients into a convulsive SE algorithm. This is flagged as HIGH in the evidence dossier (finding #2). The UX implication: NCSE should be an off-ramp at Step 1 with a clear "different pathway" message, not a visual toggle that stays in the same flow.

5. **Would Pattern A help?** Yes, for steps 1-3. Not a full replacement for Stage 2's comorbidity grid (which needs its own adapted input pattern). The numeric dose readout in Step 2 and Step 4 needs an SE-specific adaptation of the `cat-input-row` pattern to display a calculated result, not an input. Overall: Pattern A adoption recommended with three SE-specific adaptations detailed below.

---

## Method

Audit dimensions assessed:

1. Time pressure and operability speed — estimated time-to-first-benzo walkthrough
2. One-thumb operability — button placement, bottom-bar CTA positioning, touch targets
3. Stage transition clarity — how obviously the UI communicates which stage is active
4. Dose calculation surface — where weight entry is, how doses are displayed
5. Visual hierarchy under stress — first-fixation target analysis
6. Pattern A applicability — per-element assessment against PATHWAY_SPEC §3
7. Comparison with EVT v3 design — wins to adopt, SE wins to preserve
8. SE-specific workflow gaps — timer, escalation triggers, EEG prompt timing

Research synthesis grounding: all workflow recommendations are anchored to the 13 design principles from `docs/research/2026-05-15-flowchart-pathway-design-research.md` and the PATHWAY_SPEC v1.4 behavioral spec.

---

## Findings (severity-ordered, workflow-focused)

### F-01 — CRITICAL: No persistent dose display during Stage 1 benzo delivery

**What's slow or unclear at bedside:** The calculated benzo dose (e.g. "4 mg IV") lives inside a card that only appears after the clinician selects an agent (line 286-317). During the seconds between agent selection and the card appearing (scroll-smooth animation + 300ms auto-scroll delay at line 167), the dose is not visible. More critically, once the clinician taps "Mark First Dose Given" (line 291), the dose card transitions into the "First dose administered" state — and the dose string is no longer rendered in a prominent position. To re-check the dose during a second dose decision, the clinician must remember it.

**Why it costs time:** In a room where a nurse is drawing up medication and asking "how much?", the ~6-second latency from agent-selection to dose-visible (auto-scroll + animation) is the worst-case scenario. If the card has scrolled past, the dose may require another ~4 seconds of manual scroll to find.

**Where in code:** `stage1DoseRef` scroll at line 166-169; dose card at lines 286-317; `text-4xl font-black` dose display at line 288.

**Recommended change:** Render a compact dose pill in the sticky header (or immediately below the benzo agent selector) that persists for the duration of the Stage 1 step. Format: `Lorazepam 4 mg IV` in `text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full`. This follows PATHWAY_SPEC §5.3 `collapsedStat` pattern — a "what are we giving right now" readout that never requires scrolling to find.

**Class:** C

---

### F-02 — CRITICAL: Weight input placement creates a single point of failure for all downstream doses

**What's slow or unclear at bedside:** Weight is collected at Step 1 (lines 225-229) in a large `text-xl` number input inside a `p-6 rounded-xl border shadow-sm` card. If the clinician proceeds without entering weight (the `disabled` check at line 255 only blocks the CTA button — but the weight field has no inline validation visible), `calculateDose()` returns `"Enter weight"` for all agents. This string appears at `text-4xl font-black` (line 288) — prominent, but the string "Enter weight" is easy to read past in a stressful environment without registering it as an error.

**Why it costs time:** A nurse who reads "Enter weight 60 kg" from the screen and draws up the wrong amount is a patient safety event. The visual weight of `text-4xl font-black text-slate-900` makes the literal string "Enter weight" look as authoritative as a real dose.

**Where in code:** `calculateDose()` at line 21 returns `"Enter weight"` when `weight <= 0`; dose display at line 288 renders this in `text-4xl font-black`; weight input at lines 225-229.

**Recommended change (two-part):**
1. When `weight === 0`, render the dose area as a red/amber warning state — not a `text-4xl` string. Use `text-sm text-amber-700 font-semibold bg-amber-50 px-4 py-3 rounded-lg border border-amber-200` with copy "Enter patient weight to calculate dose."
2. Show the current weight value in every dose card header — e.g., `For 70 kg patient:` — so the clinician can verify weight correctness at every stage without navigating back.

**Class:** C

---

### F-03 — HIGH: Stage transitions are not spatially obvious

**What's slow or unclear at bedside:** The four CollapsibleSection components (lines 214-441) use an accordion pattern where all sections are always present in the DOM, each with a step number badge and a title. When `activeSection === 1` (Benzodiazepines), the header for section 2 (Urgent Control) is visible above and section 1 is collapsed below — but the visual differentiation between "active" and "not yet reached" relies entirely on the `isActive` prop of `CollapsibleSection`, which we cannot see without reading that component's implementation.

**Why it costs time:** Per PATHWAY_SPEC §3.3, active vs. completed vs. locked steps should be differentiated by node state (filled cobalt / hollow ring / slate hollow) and eyebrow opacity. The current implementation uses an accordion model (PATHWAY_SPEC §11 anti-pattern #4) where the active step visually competes with adjacent sections. A clinician who opens the wrong section does not get an error — they see content. Under time pressure, opening the wrong accordion and reading Stage 1 content while in Stage 2 is a plausible error.

**Where in code:** CollapsibleSection usage at lines 214, 261, 329, 391. PATHWAY_SPEC §4 specifies single-active-step view; §11 anti-pattern #4 explicitly forbids CollapsibleSection per step.

**Recommended change:** Migrate to Pattern A — single-active-step view with vertical rail. Locked steps render only their eyebrow at 50% opacity and an italic "Awaiting Stage N" body (PATHWAY_SPEC §3.5). This is the EVT rebuild target and SE should follow the same pattern.

**Class:** C (part of the Pattern A rebuild swarm)

---

### F-04 — HIGH: The Stage 2 comorbidity grid (lines 346-353) is cognitively ambiguous under time pressure

**What's slow or unclear at bedside:** The comorbidity toggle grid uses `k.toUpperCase()` to render keys directly from the `Comorbidities` object: `HYPOTENSION`, `RESPIRATORY`, `CARDIAC`, `LIVER`, `PANCREATITIS`, `PREGNANCY`, `RENAL`, `CARBAPENEM`. These are camelCase object keys turned into all-caps strings — not clinical labels. A clinician scanning this grid at speed may not immediately parse "CARBAPENEM" as "patient is currently on carbapenem antibiotics (affects valproate level)."

**Why it costs time:** The clinical implication of each toggle is not visible in the selected state — the user must toggle it on, then scroll to the recommendation card to see how it affected drug selection. Selecting 2-3 comorbidities and then reading the downstream effect is a multi-scroll interaction at a stage where the patient has already failed benzo therapy.

**Where in code:** Comorbidity map at lines 346-353; `{k.toUpperCase()}` label render; warning strings displayed at lines 363 (`text-xs text-amber-700`) only after recommendation generation.

**Recommended change:** Replace the key-derived labels with explicit clinical labels. Add a short inline consequence note to each toggle in its active state. Example: when `CARBAPENEM` is active, show inline "Lowers valproate levels — avoid VPA" in `text-[11px] text-amber-700` below the button label. This follows PATHWAY_SPEC §3.7.1 two-line stacked option anatomy — consequence description below the label, not beside it.

**Class:** C-clinical (label changes touch clinical copy; consequence notes need citation)

---

### F-05 — HIGH: No seizure onset timer or elapsed-time display

**What's slow or unclear at bedside:** SE management is explicitly time-staged: Stage 1 = 0-5 min, Stage 2 = 5-30 min, Stage 3 = 30+ min. The pathway header (lines 191-192) shows no timer. There is no elapsed-time input anywhere in the flow. A clinician arriving mid-code cannot use the pathway to confirm which stage is appropriate without independently tracking seizure onset time.

**Why it costs time:** Without a visible time anchor, the clinician must either track onset externally (another cognitive burden at the bedside) or assume the pathway's stage labels are correct. The Stage 1 alert banner reads "Stage 1: Early Status (0-5 min)" (line 273) but does not ask when the seizure started. This means the pathway can show Stage 1 content to a patient who is already in minute 25 of SE.

**Recommended change:** Add a "Seizure onset" time input at Step 1 alongside the weight field. Format: a duration selector (minutes ago — 0-5 / 5-30 / 30-60 / >60 / Unknown). Use the tri-button pattern from PATHWAY_SPEC §4.2. When onset > 5 minutes, the pathway skips directly to Stage 2 (Urgent Control) with a branch chip "Onset >5 min — Stage 2" visible on the rail. This is also the most clinically important branch point in the SE pathway: the EVT dossier (Section 2A) confirms the 5-minute threshold as the treatment-now trigger.

**Class:** C-clinical (onset threshold is clinical logic; requires evidence-verifier + medical-scientist sign-off for the skip-to-stage-2 auto-advance rule)

---

### F-06 — HIGH: No visible escalation trigger at Stage 2 transition

**What's slow or unclear at bedside:** When the clinician taps "Persists (Refractory)" at the Stage 1 outcome decision (line 310), the flow advances to Stage 2. There is a red alert banner at Stage 2 (line 339-342) that reads "Stage 2: Established SE (5-30 min). Seizure persisting despite adequate benzos. Risk of neuronal injury increases." But there is no checklist prompt asking whether benzos were adequately dosed (the most common cause of Stage 2 failure according to the evidence dossier, Section B: "Underdosing = #1 cause of treatment failure").

**Why it costs time:** A clinician who underdosed the benzo will advance to Stage 2 thinking the benzo "failed" when it was never given at the correct dose. The pathway does not surface this gatekeeping question before advancing.

**Recommended change:** Add an inline gate before the Stage 2 agent selector: a two-question checklist:
1. "Was the full weight-based benzo dose given?" (Yes / No — if No, redirect to repeat Stage 1 dose)
2. "Was a second dose given if first failed?" (Yes / No)

This maps to the `Step3Checklist` pattern already present in the code (lines 65, 134) but that checklist is used in Stage 3, not Stage 2. Move this gating logic to Stage 2 entry. The evidence basis is Glauser 2016 (TIER 0 — binds): "Underdosing is the most common cause of BZD failure."

**Class:** C-clinical (new clinical logic branch; Class E if it auto-redirects based on answer)

---

### F-07 — MEDIUM: Stage 2 override select uses a native HTML select (anti-pattern)

**What's slow or unclear at bedside:** Lines 370-379 render a native `<select>` element for Stage 2 agent override. PATHWAY_SPEC §3.7 anti-patterns explicitly state "Do NOT use a native HTML `<select>` element." On iOS, a native select opens a system bottom-sheet picker that is slow (animation, scroll wheel, Done button) and visually disconnected from the pathway context.

**Why it costs time:** On an iPhone in a code, the native picker requires three taps to change a value: tap the select → scroll the wheel → tap Done. The category-row accordion pattern (PATHWAY_SPEC §3.7) requires two: tap the row → tap the option. More critically, the native picker does not show the selected option's clinical implication — only the label.

**Where in code:** Lines 370-379, `<select className="w-full p-4 bg-white border border-slate-300 rounded-xl text-base font-bold">`.

**Recommended change:** Replace with a Pattern A category-row accordion. The "Auto-Recommend" option becomes the pre-selected value. Other agents are accordion options with two-line stacked anatomy (PATHWAY_SPEC §3.7.1): agent name above, key comorbidity-fit note below (e.g., "Levetiracetam — Standard (ESETT)" / "Avoid if severe psychiatric history").

**Class:** C

---

### F-08 — MEDIUM: Stage 3 refractory options render full static text instead of dose-focused display

**What's slow or unclear at bedside:** The Stage 3 infusion options (lines 411-424) each show a subtitle line with dose ranges in plain text: "Load: 0.2 mg/kg. Maint: 0.1-2 mg/kg/hr." These are not calculated from the patient weight. The calculated load only appears after selection in a separate card (lines 427-431, `calculateDose(stage3Agent, patient.weight)`). During the selection phase, the clinician sees generic ranges, not their patient's actual load dose.

**Why it costs time:** At refractory SE (Stage 3), the patient is likely seizing continuously and may need rapid intubation. The 3-4 second gap between selecting an agent and seeing the calculated dose (scroll + animation) is meaningful. The static ranges in the option subtitle also carry incorrect values — the evidence dossier (Section D) flags that the ketamine load in `calculateDose()` at line 33 (1.5-4.5 mg/kg) exceeds Vossler 2025's range (1-2.5 mg/kg).

**Where in code:** Lines 411-424; `calculateDose()` for stage3 at lines 31-34.

**Recommended change:** Once weight is entered (Step 1), render the calculated load dose inline in each Stage 3 option button — before selection. Example: `Midazolam Infusion — Load: ${calculateDose('midazolam_inf', weight)}` visible in the option's description line (two-line stacked, PATHWAY_SPEC §3.7.1). This eliminates the post-selection scroll step entirely.

**Class:** C

---

### F-09 — MEDIUM: "Copy Summary" triggers an `alert()` confirmation dialog (line 160)

**What's slow or unclear at bedside:** `copySummary()` at line 160 calls `alert("Note copied to clipboard.")` after copying. On mobile, `alert()` creates a modal dialog that blocks the entire screen, requires a tap to dismiss, and briefly draws attention away from the patient. At Stage 3, this happens at the highest-acuity moment of the encounter.

**Why it costs time:** The modal dialog itself costs ~1.5 seconds to read, process, and dismiss. The PATHWAY_SPEC §2 copy button pattern shows "Copy" text only — no confirmation dialog. The EVT v3 demo uses CSS-based transient feedback (brief opacity change on the button) which does not interrupt the flow.

**Where in code:** Line 160, `alert("Note copied to clipboard.")`.

**Recommended change:** Replace `alert()` with a 2-second toast using the existing `showFavToast` pattern (lines 454-457). Reuse the existing `fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white` toast for "Note copied."

**Class:** B

---

### F-10 — MEDIUM: Progress bar uses inline style (token violation) and semantic mismatch

**What's slow or unclear at bedside:** The progress bar at lines 203-211 uses `style={{ width: '${((activeSection + 1) / 4) * 100}%' }}` — an inline style for layout. The design-tokens skill explicitly forbids inline styles for layout. Beyond the token violation, the progress bar is semantically wrong for a branching pathway: Stage 1 success does not put the clinician "25% through the pathway" — it ends the pathway. The bar reads "1/4 sections" even at Stage 1 success.

**Where in code:** Lines 203-211.

**Recommended change:** The vertical rail (Pattern A) replaces the progress bar entirely. Node states (filled cobalt / hollow ring / slate hollow) communicate the same information with less visual overhead and correct branching semantics. If a progress bar is retained pre-Pattern-A, the width transition should use a Tailwind fraction class rather than inline style.

**Class:** C (progress bar elimination is part of Pattern A rebuild; the token violation is B if isolated)

---

### F-11 — MEDIUM: No EEG escalation prompt at Stage 3 entry

**What's slow or unclear at bedside:** Stage 3 (Refractory) requires continuous EEG monitoring (cEEG) — this is stated in the evidence dossier (Section D) as mandatory and also in the existing "Intubation & Continuous EEG required" text at line 405. But this text is rendered inside the dark `bg-slate-900` hero card alongside the stage name. It reads as a label, not an action prompt.

**Why it costs time:** A clinician may select a Stage 3 infusion agent without having activated the cEEG order. The EEG call needs to happen simultaneously with or before infusion initiation — not as an afterthought at the bottom of a visual card.

**Recommended change:** Add an explicit action checklist at Stage 3 entry using the same `Step3Checklist` pattern already in the code (lines 65, 134). Items: (1) Neurology notified / already primary; (2) Anesthesia/ICU for intubation; (3) cEEG monitoring ordered. Each item is a tap-to-check checkbox. The checklist gates the infusion agent selector — it renders only after all items are checked, or after a "Skip checklist" tap with a visible warning. This matches the evidence dossier Section D: "EEG: cEEG-guided. Target seizure suppression minimum."

**Class:** C-clinical (ICU escalation and cEEG are actionable clinical recommendations; evidence basis is Vossler 2025 + Mullhi 2025)

---

### F-12 — LOW: Sticky bottom CTA bar conflicts with iOS safe area on multiple steps

**What's slow or unclear at bedside:** The fixed bottom CTA at Step 1 (lines 253-257) and Step 2 (lines 382-387) use `bottom-[4.5rem]` as the offset on mobile. This is a hardcoded value that assumes a specific tab bar height. The design-tokens skill specifies the correct pattern as `pb-[env(safe-area-inset-bottom,0px)]` with `--tab-bar-height` CSS variable. The current code also uses `shadow-[0_-4px_10px_rgba(0,0,0,0.05)]` — an arbitrary shadow value forbidden by the no-arbitrary-values rule.

**Where in code:** Lines 253, 382; `bottom-[4.5rem]`; `shadow-[0_-4px_10px_rgba(0,0,0,0.05)]`.

**Recommended change:** Replace `bottom-[4.5rem]` with `bottom-[calc(var(--tab-bar-height,0px)+env(safe-area-inset-bottom,0px))]` on both CTA bars. Replace the arbitrary shadow with `shadow-sm` (if permitted by the design system for elevation contexts) or the canonical portal shadow pattern from `CalculatorDrawer`.

**Class:** B (token-only fix, no clinical logic change)

---

### F-13 — LOW: Favorite button lacks min-h-[44px] enforcement

**What's slow or unclear at bedside:** The favorite button at lines 194-199 uses `p-3 rounded-full` — no explicit `min-h-[44px]`. On iPhone SE (375px), the tappable area of a `p-3` button on a 24px icon is approximately 42×42px — 2px below the WCAG 2.5.5 target size advisory and the design-tokens skill's mandatory minimum.

**Where in code:** Lines 194-199.

**Recommended change:** Add `min-h-[44px] min-w-[44px]` to the favorite button class string.

**Class:** B

---

### F-14 — LOW: References section only shows when `activeSection === 3` (Stage 4)

**What's slow or unclear at bedside:** The references block (lines 443-452) renders only at the bottom of Stage 4. A clinician at Stage 1 or 2 who wants to cite the ESETT trial to a colleague cannot find it. The pathway also only cites AES 2016, ESETT 2019, and `SE_CONTENT.stage2Note` — missing RAMPART (PMID 22335736), Vossler 2025, and Rubinos 2024, all flagged as needed in the evidence dossier Section 7.

**Where in code:** Lines 443-452; conditional on `activeSection === 3`.

**Recommended change:** Move references to the drawer's expanded content (PATHWAY_SPEC §5.4 step 6: "Citation + disclaimer"). They should always be accessible via the drawer, not conditional on reaching the final stage.

**Class:** C-clinical (citation additions are Class E; moving citation location is Class C)

---

## Pattern A applicability for SE

### Elements that transfer cleanly

**Vertical rail with node states.** SE has exactly four stages. The cobalt-filled / hollow-ring / slate-hollow node pattern (PATHWAY_SPEC §3.2) maps directly: completed stage = cobalt dot; active stage = hollow cobalt ring; future stage = slate hollow. SE stages are sequential and exclusive (you cannot be in Stage 3 if Stage 2 has not been attempted), which is the exact state model Pattern A was designed for.

**Branch chips.** SE produces meaningful branch chips after every stage outcome: "Lorazepam 4 mg IV — Stopped" (Stage 1 success) or "Lorazepam 4 mg IV x2 — Refractory" (Stage 1 failure). These chips serve the Klein RPD principle (Principle 4 of research synthesis) — the treating team can see at a glance what has been given without consulting the EMR.

**Locked step body with italic placeholder.** SE's dependency chain is stronger than EVT's — Stage 2 cannot meaningfully render without knowing Stage 1 outcome. The "Awaiting Stage 1 outcome" placeholder is clinically accurate, not just a UX convention.

**Category-row accordion for comorbidities.** The 8-comorbidity toggle grid (lines 346-353) maps well to category-row accordions: one row per comorbidity factor, with a chevron expanding to show why it matters. This replaces the current grid of unlabeled pill-toggles.

**Persistent CalculatorDrawer.** SE has a clear verdict at each stage: "Stage 1 — Benzo responsive / Stage 2 — Recommend [agent] [dose]". This maps to the `collapsedStat` pattern in PATHWAY_SPEC §5.3. The drawer should show the current recommended action at all times, not just at final stage.

### Elements that need SE-specific adaptation

**Numeric input pattern (PATHWAY_SPEC §4.4).** SE needs the numeric input pattern for weight — but SE also needs to *output* a calculated dose into the same visual register. The `cat-input-row` pattern shows an input field; SE needs a `cat-output-row` variant that shows a calculated result in the same slot (non-editable, but visually prominent). Token suggestion: `cat-input-field` styling with `bg-red-50 border-red-200 text-red-700 font-bold` when the value is a dose, not an input.

**Outcome tri-buttons (not just input tri-buttons).** SE uniquely requires "Stopped / Persists" outcome buttons at the end of each stage — these are not input fields, they are clinical state transitions. The Pattern A tri-button (PATHWAY_SPEC §4.2) was designed for Yes/No/Unknown input questions, not for outcome recording. SE needs a distinct "outcome row" pattern: two full-width buttons (Stopped — emerald; Persists — red) with 48px height, below the dose display, that advance the rail state on tap.

**Multi-agent sequential tracking.** EVT asks one question per category; SE requires tracking two sequential drug choices (Stage 1 benzo + Stage 2 ASM) plus their outcomes. The branch chip for SE would be two-line: "Lorazepam 4 mg IV x2 / Levetiracetam 2100 mg IV" — longer than the EVT chip format but still ≤40 chars if abbreviated correctly.

### Elements that don't fit or need rethinking

**The "auto-recommend" agent selector.** Pattern A category rows assume the user picks an option. The SE Stage 2 recommendation is computed (not user-picked first) — the recommended agent is derived from comorbidity inputs. The correct Pattern A adaptation is to show the computed recommendation in the `cat-row-completed` style (cobalt left bar, neuro-50 background, agent name + reason) by default, with a tap-to-override option that opens the accordion. This is a new pattern not in the current PATHWAY_SPEC but follows from the same design principles.

---

## Time-to-treatment estimate

**Scenario:** New SE patient arrives. Resident grabs phone, opens SE pathway. Patient weight: 70 kg. IV access established. Seizure started approximately 3 minutes ago.

**Current UI — step-by-step with estimated times:**

| Action | Current UX | Est. seconds |
|---|---|---|
| Open app, navigate to SE Pathway | Tap pathway from hub | 8s |
| Read Step 1 header + tap weight field | Large card renders, tap number input | 4s |
| Type weight "70" on keyboard | iOS number keyboard | 5s |
| Tap "Convulsive SE" (already set) | No tap needed — default is convulsive | 0s |
| Tap "IV Access Established" (already set) | No tap needed — default is IV | 0s |
| Tap "Glucose Checked" | Tap checkbox button | 2s |
| Tap "Proceed to Stage 1" | Fixed bottom CTA | 2s |
| Read benzo stage — see grid of 3 agents | Render complete | 2s |
| Tap "Lorazepam" | 3-col grid, reasonable target | 2s |
| Wait for dose card scroll animation | auto-scroll 300ms + transition | 1s |
| Read "4 mg IV (0.1 mg/kg, max 4mg)" at 4xl | Dose card rendered | 2s |
| **Total to first benzo dose known** | | **~28 seconds** |

**Assessment against 60-second goal:** 28 seconds to know the first benzo dose is technically within goal, but this is under ideal conditions (no hesitation, immediate weight recall, no accidental mis-taps). Real-world friction adds at minimum 15-20 seconds (finding the app, mistyping weight, re-reading the comorbidity labels). A realistic estimate is **40-55 seconds to first dose knowledge** — at the edge of the 60-second threshold.

**Target with Pattern A rebuild:** The goal is ≤20 seconds to first dose knowledge. With a persistent dose chip in the header (F-01), weight surfaced as the first and only Step 1 input with autofocus, and pre-calculated doses visible in the benzo agent selector before tapping, this is achievable.

---

## Comparison with EVT v3 design

### EVT v3 wins SE should adopt

**Rail with branch chips.** EVT v3 communicates "what has been decided" via chips on the cobalt rail segment. SE needs this more urgently than EVT: at a code with attending + resident + nurses + pharmacy, the branch chip "Lorazepam 4 mg x2 — Refractory" is the shared mental model that allows everyone to understand what stage of management has been reached without verbal recap.

**Inline LearningPearl blocks (v3 addition).** EVT v3 adds collapsed `<details>` pearl blocks beside each step, providing clinical context for residents without slowing experts (collapsed by default). For SE, this would be particularly useful at the Stage 2 comorbidity step — a pearl explaining why valproate is avoided in pregnancy is more useful inline than as a warning string that appears after the comorbidity toggle is already activated.

**Step icon in the eyebrow.** EVT v3 renders a small inline SVG icon beside each step eyebrow (14×14, `slate-500`, no container). For SE, this helps instant recognition: a syringe icon for Stage 1 Benzos, a pill icon for Stage 2 Agents, an EEG-wave icon for Stage 3 Refractory. Recognition over recall (Principle 11 of research synthesis; Nielsen H#6).

**Category-row accordion over grid buttons for comorbidities.** EVT uses category-row accordions (PATHWAY_SPEC §3.7) for all multi-option selections. SE's comorbidity grid (8 buttons) should migrate to this pattern — one row per comorbidity factor with a descriptive consequence note below (two-line stacked per PATHWAY_SPEC §3.7.1).

**CalculatorDrawer instead of inline result cards.** EVT v3 routes all recommendations to `CalculatorDrawer`. SE currently renders dose recommendation inline inside each CollapsibleSection. Moving to the drawer means the dose recommendation is always visible regardless of scroll position — critical for SE where the clinician may be looking at the patient while a nurse reads the phone screen.

**Auto-scroll to next unanswered category row.** EVT v3 adds auto-scroll after `setField()`. For SE, this maps to auto-scroll to the outcome buttons ("Stopped / Persists") after the benzo agent is selected and the dose card is shown.

### SE-specific wins to preserve (not in EVT)

**The `generateEMRText()` function (lines 138-158).** EVT v3 has a header Copy button but no EMR-ready text generator. SE's `generateEMRText()` produces a structured note including agent, dose, number of doses, and outcome for each stage — this is clinically valuable and should be preserved in the Pattern A rebuild. The output content can be surfaced via the CalculatorDrawer expanded view (PATHWAY_SPEC §5.4) rather than via the `alert()` clipboard action.

**The `getRecommendedAgent()` function (lines 97-118).** The computed drug recommendation based on comorbidity contraindications is SE's most clinically sophisticated feature. EVT does not have an equivalent (EVT eligibility is computed from patient data, not drug selection). This function should be preserved in the Pattern A rebuild but refactored per the evidence dossier (ESETT equivalence for lev/fos/vpa; lacosamide removal from Stage 2 dropdown).

**The two-outcome button pattern per stage.** EVT has a single forward-progress CTA; SE needs two CTAs per stage (Stopped / Persists — Refractory). This is SE-specific. The red/emerald two-button pattern at Stage 1 (lines 299-300) and Stage 2 (lines 384-385) is the right clinical structure, though it needs Pattern A styling (outcome row below dose display, not in a fixed bottom bar).

---

## Recommended workflow improvements for the rebuild

The following list is ordered by clinical impact and intended as direct input to the Pattern A rebuild plan.

### Priority 1 — Critical before any other change

1. **Persistent dose chip in header or step-anchored position** (F-01). When a benzo agent is selected, show the calculated dose string in the step's visible zone — not only in a scrollable card below. When weight is missing, show a distinct warning state instead of "Enter weight" in dose-sized font (F-02).

2. **Seizure onset input at Step 1 with auto-advance logic** (F-05). Duration selector (0-5 min / 5-30 min / 30+ min / Unknown). If onset >5 min, the pathway skips Stage 1 to Stage 2 and renders a branch chip "Onset >5 min — Stage 1 bypassed." This is the most impactful single change for correct stage assignment.

3. **Weight validation gate** (F-02). The "Proceed to Stage 1" CTA is already disabled at `weight === 0` (line 255). Add a visible inline error state on the weight input when the user tries to proceed: `border-red-400 bg-red-50` with helper text "Weight required for dose calculation."

### Priority 2 — High impact for code workflow

4. **Pattern A rail + single-active-step view** (F-03). Migrate from CollapsibleSection accordion to vertical rail with locked-step bodies. This is the foundational structural change and enables findings F-01, F-07, F-08.

5. **Stage 2 benzo-adequacy gate before agent selector** (F-06). Two-question checklist confirming full benzo dose given. This is the most important clinical safety workflow addition.

6. **Stage 3 EEG/escalation checklist** (F-11). Three-item checklist (neurology, anesthesia/ICU, cEEG) gating the infusion agent selector. Present in the existing code pattern (`Step3Checklist`) but not used at Stage 3 entry.

7. **Inline pre-calculated doses in Stage 3 agent buttons** (F-08). Once weight is entered, each Stage 3 option shows the patient-specific calculated load in the button's description line — no post-selection scroll required.

### Priority 3 — Medium impact, lower effort

8. **Comorbidity label humanization** (F-04). Replace `k.toUpperCase()` with explicit clinical labels and inline consequence notes on active state. Example labels: Hypotension / Respiratory Compromise / Cardiac (AV Block) / Liver Disease / Pancreatitis / Pregnancy / Renal Impairment / Carbapenem Use.

9. **Native select replacement** (F-07). Replace `<select>` with category-row accordion for Stage 2 agent override.

10. **Remove `alert()` from Copy action** (F-09). Replace with existing toast pattern.

### Priority 4 — Token compliance and polish

11. **Bottom CTA safe-area fix** (F-12). Replace `bottom-[4.5rem]` with CSS variable pattern.

12. **Favorite button touch target** (F-13). Add `min-h-[44px] min-w-[44px]`.

13. **References to drawer content** (F-14). Move citations to CalculatorDrawer expanded view; add RAMPART, Vossler 2025, Rubinos 2024.

### SE-specific additions not in current code (new features)

14. **Stage-time labels on branch chips.** Each stage chip should include estimated time elapsed, formatted as "Stage 1 — 0:00 → 0:05." If a timer is not feasible, at minimum show the stage time window in the chip: "Benzos — 0-5 min window."

15. **NCSE off-ramp at Step 1** (evidence dossier F-02, HIGH finding). The current NCSE toggle leads into the convulsive SE algorithm — a clinical safety issue. SE should present NCSE as a distinct branch that renders a "NCSE management differs — see NCSE guidance" card and halts the convulsive pathway. This is Class E (clinical logic change) and requires its own swarm.

16. **Maintenance dose note below load dose.** For Stage 2 and Stage 3 agents, the dose card shows the load dose only. Add a second line for maintenance: "Maintenance: 60 mg PO BID (adjust for renal)" below the IV load. This follows the `cat-option-desc` pattern and is formatted in `text-[11px] text-slate-500`.

---

## Direct answer to V

The existing SE pathway is **partially clinically usable** — it correctly captures the stage flow, the ESETT drug selection logic, and produces weight-based doses. But it has three workflow failure modes that reduce bedside utility: (1) the dose requires scroll to see after agent selection, which is 4-8 seconds of friction in a high-stakes moment; (2) there is no seizure onset time input, so the pathway cannot confirm whether the clinician is in the right stage; and (3) the comorbidity toggle labels use camelCase object keys that are not clinical labels. The highest-leverage single fix — one that could be a Class C commit without the full Pattern A rebuild — is adding a persistent dose chip immediately below the benzo agent selector so the dose is always visible once an agent is tapped, eliminating the scroll-to-see-dose friction that is the pathway's most acute bedside failure point.

---

## @ui-architect — Sign-off

**Spec cited:** `docs/specs/PATHWAY_SPEC.md` §2 (header), §3.2-3.7 (rail+nodes), §4.2-4.4 (inputs), §5.1-5.4 (drawer), §6 (tier tokens), §8 (touch targets), §11 (anti-patterns). Research synthesis at `docs/research/2026-05-15-flowchart-pathway-design-research.md` Principles 4, 6, 7, 9, 12.

**Layout decisions:**
- Persistent dose chip anchored to step zone: uses `text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full` (severity tokens for active clinical state — design-tokens skill "Severity tokens" row)
- Branch chips: `text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full` (PATHWAY_SPEC §3.4 visual register)
- Outcome buttons: full-width 48px, emerald-500 / red-600 — these are action buttons, not severity tokens applied to drawer chrome, so emerald is appropriate here (the "stop/continue" action, not an eligibility verdict)
- Category-row for comorbidities: PATHWAY_SPEC §3.7 + §3.7.1 two-line stacked with consequence description below
- Weight validation state: `border-red-400 bg-red-50` on the input + `text-sm text-red-600 mt-1` helper — per design-tokens skill "Severity tokens" (`minor`→`severe` border/bg pattern)

**Deviations from spec:**
- PATHWAY_SPEC §4.2 tri-button is specified for Yes/No/Unknown inputs; this audit recommends a two-button outcome pattern (Stopped/Persists) for post-dose recording — a new SE-specific pattern not yet in the spec. The spec will need a §4.7 "Outcome row" sub-section before the rebuild.
- PATHWAY_SPEC §4.4 numeric input is specified for user inputs; SE needs a "calculated result" display in the same row. A §4.8 "Dose result row" sub-section is needed.

**Risks flagged:**
- F-05 (seizure onset auto-advance) is listed as C-clinical but may warrant Class E review if the "skip Stage 1 if onset >5 min" logic is implemented as automatic state transition rather than a visual recommendation only. The evidence basis (5-minute treatment threshold from Glauser 2016 / ILAE 2015) is unambiguous, but the auto-advance behavior is new clinical logic — escalate to medical-scientist + clinical-reviewer before implementing.
- F-06 (benzo adequacy gate) is Class E if it uses the answer to redirect clinical flow. Currently recommended as Class C-clinical (a checklist prompt, not a hard gate).
- NCSE off-ramp (finding #15 in recommended improvements) is Class E by definition — new clinical branch with distinct management logic.

**Status:** ready (read-only audit complete; no source files edited)
