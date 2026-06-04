# Stroke Pathway — Connectivity Audit & Manual QA Checklist

**Date:** 2026-06-03
**Scope:** Every interactive control, modal/drawer, tab transition, and inter-step data hand-off across the stroke-code workflow and the stroke decision-pathway pages.
**Method:** Static source trace of all 28 stroke-pathway files (read in full), cross-checked against the orchestrator wiring. Three disjoint file sets traced in parallel; broken-control findings re-verified by hand against the source.
**Nature:** Audit only — no code was changed. Broken controls are logged below as follow-up candidates for separate triage; they are NOT fixed in this pass.

---

## 1. Surface map (what was audited)

**Stroke-code workflow (the multi-step bedside flow):**
- `src/pages/guide/StrokeBasicsWorkflowV2.tsx` — orchestrator (owns step state + all per-step data)
- `CodeModeStep1.tsx` (vitals/LKW/NIHSS/weight) · `CodeModeStep2.tsx` (CT/treatment/LVO) · `CodeModeStep3.tsx` (summary + EMR note) · `CodeModeStep4.tsx` (post-tPA orders) · `StrokeIchProtocolStep.tsx` (bleed branch)

**Modals / drawers / reference cards:**
- `ThrombolysisEligibilityModal` · `ProtocolModal` (shared) + 3 wrappers (`HemorrhageProtocolModal`, `OrolingualEdemaProtocolModal`, `TpaReversalProtocolModal`) · `DeepLearningModal` (Study Mode) · `ThrombectomyPathwayModal` · `ExtendedIVTPathwayModal` · `PathwayRecommendationDrawer` · `QuickReferenceCard` · inline `HemorrhageProtocol` · inline `PostTPAOrders`

**Decision-pathway pages + shared inputs:**
- `ExtendedIVTPathway.tsx` · `EvtPathway.tsx` · `ElanPathway.tsx`
- `LKWTimePicker` · `CompactVitals` · `NihssCalculatorEmbed` · `TimestampBubble` · `StrokeCardGrid` · `SectionPearls` · `PearlDetailView`

**Verdict:** The Step 1→4 happy path and all three pathway pages are correctly wired end to end — every collected input feeds its decision/EMR output, every result is reachable, all navigation resolves to real routes. Three dead controls were found, all on secondary/branch surfaces. Details below.

---

## 2. Findings summary

| Severity | Count | Where |
|---|---|---|
| **BROKEN** (dead control, no handler) | 3 | ICH-complete button; 2× "Print" buttons |
| **SUSPECT** (works, but worth a human click-test or a design call) | 6 | backdrop-close inconsistency; 2× icon-font risk; 2× UX calls; vestigial state |
| **Orphaned data** (written/set, never read — not user-facing) | 3 | `eligibilityChecked` field; `_generateNote`; `isLearningMode` prop |

---

## 3. BROKEN controls (verified by hand)

### B-1 — "Mark ICH protocol complete" does nothing
- **File:** `StrokeIchProtocolStep.tsx:67-74` (button) → orchestrator `StrokeBasicsWorkflowV2.tsx:689`
- **What:** The button's `onClick={onComplete}`, but the orchestrator passes `onComplete={() => { /* no-op */ }}`. On the hemorrhage (bleed) branch the clinician reaches this button, clicks it, and **nothing happens** — no state change, no advance, no toast, no visual feedback.
- **Impact:** Dead-end on the ICH branch. The only way forward is the "Edit" summary cards or "Start New Code". Looks broken to a user.
- **Fix shape (for follow-up):** either give it a real completion state (toast + collapse/advance) or remove the button if the ICH step is intentionally terminal.

### B-2 — "Print Emergency Protocol" button has no handler
- **File:** `HemorrhageProtocol.tsx:65-68`
- **What:** Styled red button with a print icon, **no `onClick`**. Clicking does nothing.
- **Impact:** Dead control inside the inline hemorrhage-protocol accordion.

### B-3 — "Print Order Set" button has no handler
- **File:** `PostTPAOrders.tsx:117-120`
- **What:** Same pattern — styled button with printer icon, **no `onClick`**. Dead.
- **Impact:** Dead control inside the inline post-tPA orders accordion. (Note: the *modal* protocol surfaces have working Copy-to-EMR + Print; only these two *inline* accordions have dead print buttons.)

---

## 4. SUSPECT — confirm by click-test or design call

- **S-1 — Backdrop-click does not close two modals.** `ThrombectomyPathwayModal.tsx:55` and `ExtendedIVTPathwayModal.tsx:59` close only via the X, Escape, or the footer "Return to Stroke Workflow" button — clicking the dark backdrop does NOT close them. Every other modal (`ProtocolModal`, `ThrombolysisEligibilityModal`, `DeepLearningModal`) closes on backdrop click. Decide whether this inconsistency is intentional.
- **S-2 — Material Icons may render as literal text.** `StrokeIchProtocolStep.tsx` (lines 30/40/72) and the two inline accordions (B-2/B-3 buttons) use `material-icons-outlined` font classes while the rest of the workflow migrated to lucide-react. If the Material Icons font isn't loaded on those lazy chunks, the glyphs render as raw words ("check_circle", "print", "info"). Visual click-test on the bleed branch confirms.
- **S-3 — Pathway-modal verdict is dropped if the callback is omitted.** `ThrombectomyPathwayModal.tsx:44` only forwards the EVT verdict when `onRecommendation` is supplied. The Stroke-Code orchestrator *does* pass it (confirmed wired), so this is fine today — but any future caller that mounts the modal without `onRecommendation` silently loses the verdict.
- **S-4 — Study Mode detail "Close" closes the whole panel.** `DeepLearningModal.tsx:409` — in the pearl detail view, "Back" returns to the list and "Close" closes the entire Study Mode drawer. Both resolve (not broken); confirm that "Close" dismissing the whole panel (vs. just the detail layer) is the intended UX.
- **S-5 — Vestigial eligibility state.** `ThrombolysisEligibilityModal.tsx:131` — `extendedContraindications` state exists and is folded into the verdict, but no UI control ever writes it (`EXTENDED_WINDOW_CHIPS` is intentionally empty since the ECASS-3 modernization). Harmless; flag if a chip is ever expected to populate it.
- **S-6 — `CompactVitals` emits nothing to a parent.** `CompactVitals.tsx` holds glucose/BP in purely local state with no `onChange` callback — it is a display-only advisory widget and **cannot gate any pathway eligibility logic**. Confirm that is intended (i.e. no pathway is meant to read BP/glucose from this widget).

---

## 5. Orphaned data (not user-facing; cleanup candidates)

- `Step1Data.eligibilityChecked` — written by Step 1 (always `false`) and persisted to sessionStorage, but never read downstream; the real gate uses a separate `eligibilityChecked` prop. Dead payload.
- `CodeModeStep4._generateNote` — `CodeModeStep4.tsx:508` stashes the note generator on the component function; nothing reads it (Step 3 builds its own orders section). Orphaned.
- `HemorrhageProtocol` `isLearningMode` prop — declared, never read in the body. Vestigial.

---

## 6. Manual QA checklist — run before each release

> Run on a real device at 375px (mobile) and 1280px (desktop). Check each box when the observed result matches.

### 6.1 Stroke-code workflow — happy path (no bleed)
- [ ] Open `/guide/stroke-basics` → header shows "Stroke Code", Code/Study toggle, favorite star. Tap star → fills amber and persists on reload.
- [ ] **Step 1:** enter LKW (~2h ago via the time picker), BP (140/90), glucose (100), weight (70 kg). Tap "Calc" → NIHSS modal → score → "Apply" → NIHSS field populates.
- [ ] CTA reads "Check tPA Eligibility" → tap → eligibility modal opens → complete → "Save & Return" → CTA flips to "Save & Continue".
- [ ] Tap "Save & Continue" → auto-advances to Step 2; Step 1 collapses to a summary card.
- [ ] **Step 2:** "Stamp CT Time" → shows "✓ CT Stamped" and disables. Select "No acute hemorrhage". Pick "tPA". Check "CTA ordered" → LVO segment appears → pick "Yes" → "EVT Pathway" button appears → tap → thrombectomy modal opens → complete → a Thrombectomy Assessment card appears.
- [ ] "Save & Continue" → auto-advances to Step 3.
- [ ] **Step 3:** Clinical Summary shows entered NIHSS/BP/glucose/weight + Treatment + LVO=Yes; EMR Note preview contains LKW, door times, CT result, orders, and the thrombectomy recommendation.
- [ ] "Copy to EMR" → "Copied" + toast. "Print" → a print window opens with the note.
- [ ] **Orders:** toggle order checkboxes → the "Orders Placed" list and EMR note update live (no Save needed). Post-tPA orders are present because tPA was chosen.
- [ ] "Code Documented" panel + "Start New Code" appear → tap → confirm dialog → page reloads clean.

### 6.2 Stroke-code workflow — bleed branch
- [ ] New code → Step 2 → select "ICH detected" → hemorrhage modal opens → Save & Continue.
- [ ] Step 3 renders the ICH protocol list.
- [ ] ⚠️ **Known issue B-1:** "Mark ICH protocol complete" does nothing when clicked. Confirm still broken / no feedback.
- [ ] ⚠️ **Known issue S-2:** check whether the ICH step icons render as glyphs or as literal words ("check_circle" etc.).

### 6.3 Modals & protocols
- [ ] **tPA eligibility:** tap a hard-stop chip → banner turns red "CONTRAINDICATED"; tap again → reverts. Relative chip only → amber. (i) info icon expands detail without toggling the chip. "Copy to EMR" copies the verdict. Closes via X, backdrop, and Escape.
- [ ] **Hemorrhage / Orolingual / tPA-reversal protocol modals:** each opens, title/steps render, "Copy to EMR" copies numbered steps + references, closes via X / backdrop / Escape.
- [ ] **Thrombectomy & Extended-IVT modals:** run embedded pathway to a verdict → verdict propagates to the Stroke-Code summary card. ⚠️ **Known S-1:** backdrop click does NOT close these two — confirm intended; X / Escape / footer button do close.
- [ ] **Study Mode (DeepLearningModal):** toggle evidence-class chips → "Showing X of Y" updates. "Clear all" → empty state → "Reset filters" restores. "Show trials only" filters. Tap a pearl → detail opens → "Back" returns to list; "Close" closes the panel (⚠️ S-4 — confirm whole-panel close is intended).
- [ ] **Inline accordions:** PostTPAOrders — check boxes update the header count + strikethrough; "Why?" reveals rationale without checking the box; Check All / Clear All work. ⚠️ **Known issues B-2/B-3:** "Print Emergency Protocol" and "Print Order Set" buttons do nothing.
- [ ] **QuickReferenceCard:** collapse/expand toggle works and persists across reload.

### 6.4 Extended IVT pathway (`/pathways/ivt-extended`)
- [ ] **Path A (0–4.5h known LKW):** LKW ~2h ago → criteria all clear → result = standard IVT eligible.
- [ ] **Path B (4.5–9h mismatch):** LKW ~6h ago → satisfy perfusion mismatch → extended-window result with trial citation.
- [ ] **Path C (wake-up/unknown):** LKW picker → "Unknown" or "Slept & woke with symptoms" → wake-up recognition auto-sets → MRI DWI-FLAIR positive → wake-up MRI-guided result.
- [ ] **Guards:** LKW >9h → "outside" result; skip LKW → "lkw-required" gate (no false eligible).
- [ ] NextSteps links (`/guide/iv-tpa`, `/pathways/evt`, `/trials/q/late-window-selection`) load. Favorite toggles + persists. Back arrow returns to source.

### 6.5 EVT pathway (`/pathways/evt`)
- [ ] **LVO anterior early (0–6h, ASPECTS ≥6):** LVO/Anterior/0–6h → NIHSS ≥6 → ASPECTS 8 (type it, or "Calculate ASPECTS →" modal → score → Confirm → field auto-fills) → Class I EVT recommended; drawer reaches State C.
- [ ] **LVO anterior late (6–24h, ASPECTS <6):** CTP fields appear → enter core + mismatch volume → mismatch ratio auto-derives → DAWN/DEFUSE-3 verdict.
- [ ] **Large-core branch (ASPECTS 3–5):** mass-effect + hypodensity rows appear → both "No" + age <80 → Class I large-core approval; set hypodensity "Yes" → verdict shifts.
- [ ] **Basilar:** LVO/Basilar → pc-ASPECTS input appears → enter 7 + NIHSS ≥10 → strongest basilar recommendation.
- [ ] **MeVO:** salvageable "Yes" + low risk → cautious-benefit verdict + MeVO risk/evidence box.
- [ ] **Drawer states:** muted (State A) → "Provisional" (State B) → verdict (State C). "Copy to EMR" toast; "Start Over" resets; favorite toggles; trial links open.

### 6.6 ELAN pathway (`/pathways/elan`)
- [ ] **Minor stroke, no HT:** onset date → minor severity → HT "No" → early DOAC (day 3–4) verdict.
- [ ] **Major stroke / HT:** severe severity + HT "Yes" → delayed DOAC (day 6–7) verdict.
- [ ] Drawer expand → copy + ShareButton. Start Over resets. Favorite toggles. NextSteps (`/trials/elan-study`, `/trials/timing-trial`, `/trials/optimas-trial`) load. Back uses navigation source.

---

## 7. Recommended follow-ups (separate, triage required — NOT done here)
1. ~~**Fix B-1**~~ — **DONE 2026-06-03 (commit de96423).** ICH "complete" button now toggles a real terminal state + status text.
2. ~~**Fix B-2 / B-3**~~ — **DONE 2026-06-03 (commit de96423).** Both print buttons wired to handlers that re-emit existing protocol/order text.
3. **Resolve S-1** — decide backdrop-close behavior for the two pathway modals and make it consistent. (Class B/C.)
4. **Resolve S-2** — migrate the residual `material-icons-outlined` glyphs in `StrokeIchProtocolStep` + the two accordions to lucide-react, matching the rest of the workflow. (Class B.)
5. **Cleanup** — remove orphaned `Step1Data.eligibilityChecked`, `_generateNote`, and the unused `isLearningMode` prop. (Class B.)

---
---

# Part 2 — Connectivity Audit: non-stroke pathways + calculator pages

**Date:** 2026-06-03
**Scope:** Every interactive control across the surfaces the Part 1 stroke audit did NOT cover — the three non-stroke decision-pathway pages and all 13 medical-calculator pages, plus their shared calculator UI controls.
**Method:** Static source trace, each file read in full. Three disjoint file sets traced in parallel; every BROKEN/SUSPECT finding re-verified by hand against the source.
**Nature:** Audit only — no code changed. Findings below are follow-up candidates for separate triage.

## P2.1 Surface map
- **Non-stroke pathways (3):** `StatusEpilepticusPathway.tsx`, `MigrainePathway.tsx`, `ClinicHeadachePathway.tsx`
- **Calculators (13):** NIHSS, GCS, ASPECTS, ICH Score, Heidelberg, mRS, ABCD², HAS-BLED, RoPE, Boston-CAA, CHA₂DS₂-VASc, ASCVD, EM Billing
- **Shared calculator controls:** CalculatorHeader, CalculatorDrawer, CalculatorToast, CalculatorFooter, ShareButton, BackArrow, MrsPickerModal

## P2.2 Findings summary
| Severity | Count | Where |
|---|---|---|
| BROKEN | 4 | ClinicHeadachePathway (3 no-op chips) + StatusEpilepticusPathway (1 wrong-setter) |
| SUSPECT | 5 | ClinicHeadache (cascade undo, debug strip), Migraine (loose Step-2 gate), ASCVD (Share/Save), shared drawer/modal Escape |
| ORPHANED | 4 | Migraine InfoTooltip, ASCVD copy-confirm, EM-Billing time-activities |

**All 13 calculators' core scoring/copy/share/reset wiring: CLEAN.** No dead scoring inputs, no broken copy/reset. The calculator findings are peripheral (an unused state var, one page missing the Share/Save props the others have).

## P2.3 BROKEN (control does nothing when used)
- **P-1 `StatusEpilepticusPathway.tsx:654` — Stage 2 "Seizure Stopped" button calls the WRONG state setter.** It runs `setStage1Success(true)` instead of `setStage2Success(true)`. Effect: clicking the green "seizure stopped" outcome in Stage 2 re-flips the already-resolved Stage 1 result, never records that the second-line agent worked, leaves Stage 2 completion unsatisfied, and the generated EMR note omits the Stage 2 "(Responsive)" line. **Clinical-adjacent — Class C-clinical to fix** (the sibling "Persists — Refractory" button at :661 is correctly wired, so this is a one-word setter swap, but it changes a pathway/EMR output).
- **P-2 / P-3 / P-4 `ClinicHeadachePathway.tsx:449, :517, :596` — three "branch summary" chips have empty no-op onClick** (`() => {}`). Tapping the collapsed step-summary chip does nothing; a code comment claims the browser handles scroll but no anchor/scroll is attached. Same class of bug as Part 1's B-1. (Class C — the migraine/SE equivalents re-open their step; these three should match.)

## P2.4 SUSPECT (works partially / inconsistently)
- **P-5 `ClinicHeadachePathway.tsx:1041–1146` — a "Diagnostic (temporary)" debug strip ships to end users.** Marked "V-requested 2026-05-27, REMOVE ONCE TUNING IS COMPLETE." It renders the phenotype-evaluator internals on every completed headache interview. Functionally fine, but it's developer tuning UI visible to clinicians. **Decision needed: is tuning done? If so, remove it.** (Class C-clinical — it's on a clinical pathway page.)
- **P-6 `ClinicHeadachePathway.tsx:430–438` — cascade "Undo" doesn't undo.** `onUndo` is wired identically to `onDismiss` (`() => setCascade(null)`); it only hides the banner and does NOT restore fields that `clearDownstream` already wiped. The Migraine page does this correctly (snapshot restore) — headache should match. (Class C.)
- **P-7 `MigrainePathway.tsx:539` — Step-2 completion gate is looser than intended.** The `careSetting !== null` guard is effectively always-true once any branch is touched, so Step 2 can read "complete" without a care setting chosen in the migraine branch. Navigation still works; completion state is just permissive. (Class C-clinical — verify intended.)
- **P-8 `AscvdRiskCalculator.tsx:385` — Share/Save likely absent.** This page invokes `CalculatorHeader` without the `shareText`/`onShareResult`/save props the other 12 calculators pass, so its header Share/Save actions probably do nothing. (Class C — confirm against CalculatorHeader internals before fixing.)
- **P-9 (shared) `CalculatorDrawer.tsx:172` + `MrsPickerModal.tsx:31` — no Escape-key / backdrop dismiss.** The drawer closes only via its toggle handle; the mRS picker modal closes via X/backdrop/Done but has no Escape handler or focus trap. Consistent design, not dead wiring, but an accessibility gap. (Class B/C — accessibility-specialist call.)

## P2.5 ORPHANED (defined but never used — dead code, no user impact)
- **P-10 `MigrainePathway.tsx:146` — `InfoTooltip` component defined but never rendered.**
- **P-11 `AscvdRiskCalculator.tsx:307` — `copyConfirm`/`setCopyConfirm` set in `handleCopy` but never rendered** (the copy itself still works; only the success indicator is dead).
- **P-12 `EmBillingCalculator.tsx:2000` — time-activities checkboxes write `state.timeActivities` but no `generate*` output function reads it**, so those selections never reach the copied billing output.

## P2.6 Recommended follow-ups (Part 2 — separate triage)
1. **Fix P-1** — swap `setStage1Success` → `setStage2Success` on the SE Stage 2 "Seizure Stopped" button. Smallest fix, highest value (corrects a pathway/EMR output). Class C-clinical.
2. **Fix P-2/P-3/P-4** — wire the three headache branch chips to re-open their step (match migraine/SE), or remove them. Class C.
3. **Decide P-5** — remove the headache debug strip if tuning is complete. Class C-clinical.
4. **Fix P-6** — make headache cascade Undo restore fields (snapshot pattern, like migraine). Class C.
5. **Confirm P-7 / P-8** — tighten migraine Step-2 gate if intended; add Share/Save props to ASCVD if intended. Class C.
6. **Cleanup P-10/P-11/P-12** — remove dead InfoTooltip + copyConfirm; either wire EM-Billing time-activities into output or remove the checkboxes. Class B.
7. **Accessibility P-9** — decide Escape/backdrop dismiss for the shared drawer + mRS modal. Class B/C.
