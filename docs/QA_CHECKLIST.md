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
1. **Fix B-1** — wire the ICH "complete" button to a real terminal state, or remove it. (Class C; bleed branch is clinical-adjacent — flag `-clinical` if copy/feedback text is added.)
2. **Fix B-2 / B-3** — either implement print on the two inline accordions (mirror the modal Print pattern) or remove the dead buttons. (Class C.)
3. **Resolve S-1** — decide backdrop-close behavior for the two pathway modals and make it consistent. (Class B/C.)
4. **Resolve S-2** — migrate the residual `material-icons-outlined` glyphs in `StrokeIchProtocolStep` + the two accordions to lucide-react, matching the rest of the workflow. (Class B.)
5. **Cleanup** — remove orphaned `Step1Data.eligibilityChecked`, `_generateNote`, and the unused `isLearningMode` prop. (Class B.)
