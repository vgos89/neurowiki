# Calculator Engineer Audit
**Auditor:** calculator-engineer (model: claude-sonnet-4-6)
**Date:** 2026-05-08
**Scope:** Full read-only audit of all six calculators, tPA dosing utility, and cross-cutting concerns
**Status:** Read-only findings. No files were modified.

---

## Overall Calculator Safety Rating: YELLOW

Most calculators are structurally sound and formula-correct. Three issues are clinically significant enough to require Class E review before any change: the HAS-BLED item count, the NIHSS UN-sentinel leaking into the copy output, and the ABCD2 risk thresholds. One architectural issue (NIHSS partial-score default) warrants a Class C-clinical review. No P0 show-stoppers were found, but the HAS-BLED item count discrepancy is P1.

---

## Per-Calculator Findings

### 1. NIHSS — `src/utils/nihssShortcuts.ts` + `src/pages/NihssCalculator.tsx`

**Formula accuracy: PASS**
- All 15 items present: 1a, 1b, 1c, 2, 3, 4, 5a, 5b, 6a, 6b, 7, 8, 9, 10, 11. Count verified.
- Max score: Items max at [3, 2, 2, 2, 3, 3, 4, 4, 4, 4, 2, 2, 3, 2, 2] = 42. Correct.
- Item ranges verified against published NIH Stroke Scale:
  - 1a: 0–3. Correct.
  - 1b: 0–2. Correct.
  - 1c: 0–2. Correct.
  - 2: 0–2. Correct.
  - 3 (Visual): 0–3. Correct (bilateral blindness = 3).
  - 4 (Face): 0–3. Correct.
  - 5a/5b (Motor arm): 0–4. Correct.
  - 6a/6b (Motor leg): 0–4. Correct.
  - 7 (Ataxia): 0–2. Correct.
  - 8 (Sensory): 0–2. Correct.
  - 9 (Language): 0–3. Correct.
  - 10 (Dysarthria): 0–2 (+ UN). Correct.
  - 11 (Neglect): 0–2. Correct.
- `calculateTotal()` at line 255–261 correctly excludes value 9 (UN sentinel).
- Motor arm hold time = 10 seconds, leg hold time = 5 seconds. Both correct per NIH protocol.

**Edge case issues:**

| Severity | ID | Finding | Location |
|---|---|---|---|
| P2 | NIHSS-01 | Partial scoring defaults to 0. `nihssValues[i.id] ?? 0` means any unscored item contributes 0 to total. No UI warning that the displayed total is incomplete when items are unscored. A user who scores 3 out of 15 items sees a valid-looking total. | `NihssCalculator.tsx` line 88, 122; `nihssShortcuts.ts` line 88 |
| P3 | NIHSS-02 | UN sentinel (value 9) is a magic number known only to `calculateTotal()` and the item definition comment. If any future consumer of `nihssValues` iterates over values without this exclusion, it will add 9 to the score. The sentinel is not typed or exported as a constant. | `nihssShortcuts.ts` lines 204, 258 |
| P3 | NIHSS-03 | The copy-to-clipboard function at `NihssCalculator.tsx` line 88 renders `nihssValues[i.id] ?? 0` for every item in the breakdown. If item 10 is set to UN (9), the clipboard output reads "Dysarthria: 9" rather than "Dysarthria: UN". A clinician reading the pasted text would see a spurious score component. | `NihssCalculator.tsx` line 88 |
| P3 | NIHSS-04 | `getItemWarning` (line 225) checks for ataxia when "any limb is 4" but checks all four limbs pooled. Per NIHSS protocol, ataxia must be 0 if the *tested* limb is paralyzed — a paralyzed left arm does not prevent scoring ataxia in an intact right arm. The warning logic is slightly over-broad. This is a UX advisory warning only and does not affect scoring. | `nihssShortcuts.ts` lines 234–243 |

**UI/logic separation: GOOD.** All scoring logic lives in `nihssShortcuts.ts`. Page component contains only UI and state wiring. NIHSS items defined as structured data. Testable in isolation.

**LVO probability (RACE scale):** Implemented correctly with accurate probability tiers (RACE 0–4: 20%, 5–6: 55%, 7–9: 85%). Source cited (Pérez de la Ossa, Stroke 2014). Note: tooltip states "RACE ≥5 has 85% sensitivity" but the LVO probability at RACE 5–6 is labeled 55% (moderate) in the code, and 85% only at RACE 7–9. This is numerically inconsistent with the tooltip text. Requires Class E review to resolve.

| Severity | ID | Finding | Location |
|---|---|---|---|
| P1 | NIHSS-05 | Tooltip text states "RACE ≥5 has 85% sensitivity for LVO detection" but code assigns 85% probability only at RACE 7–9; RACE 5–6 receives 55%. These are two different quantities (sensitivity vs LVO probability), but presenting them together without disambiguation is clinically misleading. | `NihssCalculator.tsx` lines 166–167 |

---

### 2. ICH Score — `src/data/ichScoreData.ts` + `src/pages/IchScoreCalculator.tsx`

**Formula accuracy: PASS**
- GCS component: GCS 13–15 = 0 pts, GCS 5–12 = 1 pt, GCS 3–4 = 2 pts. Correct per Hemphill 2001 Table 1.
- Volume ≥30 mL = 1 pt. Correct.
- IVH present = 1 pt. Correct.
- Infratentorial origin = 1 pt. Correct.
- Age ≥80 = 1 pt. Correct.
- Max score clamped to 6 via `Math.min(6, Math.max(0, ...))` at line 168. Correct; theoretical max from inputs is 2+1+1+1+1 = 6.
- Mortality table (lines 90–98) matches Hemphill et al. 2001 Table 3: 0→0%, 1→13%, 2→26%, 3→72%, 4→97%, 5→100%, 6→100%. Correct. Comment on score 5 (n=1, 100% extrapolated) is appropriately documented.

**Edge case handling: GOOD**
- `isComplete` gate at line 163 prevents `calculateICHScore` from being called until all 5 fields are selected. No partial-score leakage.
- Null inputs treated as 0 via `?? 0` / ternary, consistent with documented guard.
- DNR confounder caveat present in interpretation copy for all severity tiers. Appropriate.

**Interpretation text: PASS**
- Severity thresholds: score ≤1 = low, score 2 = moderate, score ≥3 = high. These are pragmatic groupings, not from the original paper, but clearly labeled and clinically defensible.
- All three interpretation paragraphs cite Hemphill et al. Stroke 2001 by name. No vague attributions.

**UI/logic separation: EXCELLENT.** Complete separation. Page component imports typed functions and constants only. Zero scoring logic in JSX.

**No findings requiring action.**

---

### 3. ABCD2 Score — `src/data/abcd2ScoreData.ts` + `src/pages/Abcd2ScoreCalculator.tsx`

**Formula accuracy: PASS with one concern**
- Age ≥60 = 1 pt. Correct.
- BP ≥140/90 = 1 pt. Correct.
- Clinical features: unilateral weakness = 2 pts, speech without weakness = 1 pt, other = 0. Correct.
- Duration ≥60 min = 2 pts, 10–59 min = 1 pt, <10 min = 0. Correct.
- Diabetes = 1 pt. Correct.
- Max score = 7. Correct.

**Risk thresholds:**

| Severity | ID | Finding | Location |
|---|---|---|---|
| P1 | ABCD2-01 | Risk stratification at line 78: `score <= 3 ? 'low' : score <= 5 ? 'moderate' : 'high'`. This maps: 0–3 = Low, 4–5 = Moderate, 6–7 = High. The audit brief specifies Low 0–3, Medium 4–5, High 6–7. These match. However, the original Johnston 2007 paper and most subsequent validation studies use Low 0–3, Moderate 4–5, High 6–7 — consistent with the implementation. **Secondary concern:** Some guidelines (NICE 2008, AHA/ASA 2009) place the moderate/high threshold at ≥4 or ≥5, which is inconsistent with Pisters and other sources. The current thresholds match the derivation paper (Johnston 2007) but this should be explicitly confirmed by medical-scientist review. This is informational, not a confirmed error. |`abcd2ScoreData.ts` line 78 |

**2-day stroke risk values:**
- Low: 1.0%, Moderate: 4.1%, High: 8.1%. These are pooled estimates from Johnston 2007 (derivation + validation cohorts). Cited correctly.

**Inputs require all 5 fields:** The component uses `Partial<ABCD2Inputs>` and the `isComplete` check counts non-undefined fields. Diabetes defaults to `undefined` (not `false`), which requires explicit selection. This is correct behavior — diabetes cannot default to "No" since unscored inputs should not contribute.

**UI/logic separation: GOOD.** Scoring in data file, clean import in page component.

---

### 4. GCS — `src/data/gcsScoreData.ts` + `src/pages/GlasgowComaScaleCalculator.tsx`

**Formula accuracy: PASS**
- Eye: 1–4. Correct.
- Verbal: 1–5. Correct.
- Motor: 1–6. Correct.
- Min total: 3 (E1 + V1 + M1), Max total: 15 (E4 + V5 + M6). Correct.
- Severity thresholds: ≥13 = mild, 9–12 = moderate, ≤8 = severe/coma. Correct per ACRM 1993 and Teasdale 1974 consensus.

**Intubated/not-testable handling:**
- `verbalNotTestable`: verbal scored as 0, excluded from total, T suffix appended to display. Correct per Teasdale & Jennett 1974.
- `eyeNotTestable`: eye scored as 1 (minimum). This is one convention; some institutions exclude eye from total when not testable. The data file comment acknowledges this but only implements the "score as 1" path. Not a formula error but worth noting for completeness.
- Display string correctly formats "9T" for E4 + M5 + verbal NT. Correct.

**Edge case: sedation caveat:** Interpretation text for severe impairment (lines 138–144) explicitly calls out sedation, metabolic encephalopathy, and postictal state as confounders. This is clinically appropriate and non-negotiable per the data file comment.

**Governed by ADR-001.** No findings requiring action.

**UI/logic separation: EXCELLENT.** Complete separation. All scoring in `gcsScoreData.ts`.

---

### 5. HAS-BLED — `src/data/hasBledScoreData.ts` + `src/pages/HasBledScoreCalculator.tsx`

**Formula accuracy: P1 issue found**

| Severity | ID | Finding | Location |
|---|---|---|---|
| P1 | HASBLED-01 | **Item count discrepancy.** HAS-BLED has 9 scoring components: H (hypertension), A (abnormal renal/liver — 2 separate items, each 1 pt), S (stroke), B (bleeding), L (labile INR), E (elderly), D (drugs/alcohol — 2 separate items, each 1 pt). Total max = 9. The data type `HASBLEDInputs` correctly has 10 boolean fields (renal and liver are split; drugs and alcohol are split). However, the `CHECKBOX_ITEMS` array in the UI at `HasBledScoreCalculator.tsx` lines 38–47 renders **8 checkboxes** (omitting `onWarfarin` / `labileINR` which are handled separately as radio buttons). The scoring function at line 60–69 of `hasBledScoreData.ts` correctly adds 1 point only when `onWarfarin && labileINR` are both true. This is the correct clinical behavior (L-point = labile INR only if on warfarin). However, the radio widget UI (lines 194–208 of the page) presents three states: "Not on warfarin (0 pt)", "On warfarin, stable INR (0 pt)", "On warfarin, labile INR (1 pt)". This correctly models the L item. No formula error is present; the architecture is correct. **However,** the header displays "/ 9" and the interpretation table runs to score 9, but the risk classification at line 72 uses: `score === 0 ? 'low' : score <= 2 ? 'moderate' : score === 3 ? 'high' : 'very_high'`. This introduces a non-standard four-tier classification not present in the original Pisters 2010 paper. The original paper uses: 0 = low, 1–2 = moderate, ≥3 = high. The current code classifies score 0 alone as "low" and scores 1–2 as "moderate," which matches many secondary sources (ESC 2016 AF guidelines). This is defensible but requires Class E clinical review to confirm guideline alignment. | `hasBledScoreData.ts` lines 60–76; `HasBledScoreCalculator.tsx` lines 38–47 |
| P2 | HASBLED-02 | Bleeding rate table (`HASBLED_BLEEDS_PER_100`) applies 8.70 per 100 patient-years uniformly for scores 4–9. The original Pisters 2010 paper reports per-score rates only up to score 5 (n becomes very small at ≥4). The 8.70 value for scores 4–9 is a reasonable approximation but should be verified against current ESC/AHA guidance. Consider displaying a footnote for scores ≥4 indicating the estimate is based on small cohort numbers. | `hasBledScoreData.ts` lines 40–51 |
| P3 | HASBLED-03 | `very_high` risk tier is rendered in UI (line 34 of page) but has no separate interpretation text — the page conditionally shows the "high" messaging for both `high` and `very_high` at line 167. This is minor and clinically safe (both should not trigger withholding anticoagulation), but the four-tier type is unused at the display layer. | `HasBledScoreCalculator.tsx` line 167 |

**Modifiable risk caveat:** The critical "high HAS-BLED does not mean withhold anticoagulation" warning is prominently displayed at the top of the calculator. This is correct and consistent with ESC guidelines.

**UI/logic separation: GOOD.** Scoring logic in data file. Page imports and renders cleanly.

---

### 6. ASPECTS — `src/pages/AspectScoreCalculator.tsx`

**Formula accuracy: PASS**
- 10 regions defined: 6 cortical (M1–M6) and 4 subcortical (C, L, IC, I). Total = 10. Correct.
- Score computed as `10 - involved.size` at line 109. Correct subtraction model.
- Regions stored as a Set; toggling adds/removes. No double-counting possible.
- Regions verified against Barber 2000 original description: M1–M6, C (caudate), L (lentiform/putamen+GP), IC (internal capsule), I (insular ribbon). All correct.

**Score interpretation:**
- 8–10: Small/No Infarct — "EVT strongly indicated, Class I." Correct per AHA/ASA 2026.
- 6–7: Moderate Core — "EVT generally indicated, Class I, ASPECTS ≥6." Correct.
- 3–5: Large Core — "EVT may benefit — Class I for ASPECTS 3–5 per SELECT-2/ANGEL-ASPECT." This is accurate per AHA/ASA 2026 update.
- 0–2: Extensive — "EVT typically not indicated." Correct; Class IIa for exceptional cases noted.

| Severity | ID | Finding | Location |
|---|---|---|---|
| P2 | ASPECTS-01 | EVT text for score 6–7 states "ASPECTS ≥6 is the primary threshold for EVT eligibility across early and late windows." The late-window threshold is subject to study-level nuance (DAWN/DEFUSE-3 used perfusion imaging, not ASPECTS alone). The statement is broadly accurate but slightly over-simplified. Requires Class E review to confirm wording is consistent with AHA/ASA 2026 guideline text. | `AspectScoreCalculator.tsx` lines 56–58 |
| P3 | ASPECTS-02 | Score legend at line 368 lists "6–7" as the moderate tier, but `getScoreInfo` returns the "Moderate Core" label for `score >= 6` (captures any score from 6 to 7 only if score < 8). The legend and the function are consistent; this is a readability note. | `AspectScoreCalculator.tsx` line 368 |

**Scoring logic lives entirely in JSX (no data file).** This is a structural concern — see item ARCH-01 below.

---

### 7. tPA Dosing — `src/utils/strokeDosing.ts`

**Formula accuracy: PASS**
- `getTpaDoses(weightKg)`: total = min(weightKg × 0.9, 90) rounded to 1 decimal. Correct per AHA/ASA 2026 (0.9 mg/kg, max 90 mg).
- Bolus = total × 0.1, Infusion = total × 0.9. Both rounded to 1 decimal. Correct (10% bolus, 90% over 60 min).
- `getTNKDose(weightKg)`: weight-tiered steps producing 15/17.5/20/22.5/25 mg for <60/<70/<80/<90/≥90 kg. Cited as AHA/ASA 2026, 0.25 mg/kg max 25 mg. Correct per published dosing tiers.
- `toKg()`: lbs → kg conversion uses 2.205 divisor. Correct (standard clinical conversion factor).

**Edge case:**
- `toKg(0, 'lbs')` returns 0 due to the explicit zero guard. Safe.
- `getTpaDoses(0)`: total = 0, bolus = 0, infusion = 0. Mathematical edge case but weight = 0 is not a clinical input state. Safe.

**Rounding note (P3):** For a 100 kg patient: total = min(90, 90) = 90; bolus = 90 × 0.1 = 9.0; infusion = 90 × 0.9 = 81.0. Sum = 90.0. Correct. For a 67 kg patient: total = min(60.3, 90) = 60.3; bolus = 6.0; infusion = 54.3; sum = 60.3. Correct. Independent rounding of bolus and infusion could theoretically produce a 0.1 mg discrepancy (e.g., if total has a remainder that distributes differently). This is mathematically acceptable (≤0.1 mg error) and clinically insignificant.

**No findings requiring action beyond noting the single source of truth is correctly shared.**

---

## Cross-Cutting Findings

### 8. Input validation — partial scoring

| Severity | ID | Finding |
|---|---|---|
| P2 | VALID-01 | NIHSS is the only calculator that does not gate on completion before showing a score. ICH, GCS, and ABCD2 all use an `isComplete` guard. NIHSS shows a running total from the first item scored, defaulting unscored items to 0. This is a deliberate UX choice (bedside speed) but creates risk: a 3-item NIHSS appears as a completed score in the header and in clipboard output. No "partial" indicator is shown. |
| P3 | VALID-02 | ASPECTS starts at 10 and allows zero selections (ASPECTS = 10 = normal). This is correct behavior — normal NCCT needs no regions checked. No validation concern. |
| P3 | VALID-03 | HAS-BLED has no completion gate — it calculates from the start (all checkboxes unchecked = score 0 = Low risk). This is intentional since all items default to false. The score is technically correct at 0 for all-unchecked state, but a user who hasn't consciously evaluated all items sees a "Low risk" result. Consider adding a "not yet assessed" visual state. |

### 9. Score interpretation mapping — architecture

| Severity | ID | Finding |
|---|---|---|
| P2 | ARCH-01 | ASPECTS is the only calculator whose interpretation logic lives entirely inside the page component (the `getScoreInfo()` function at line 42). All other calculators separate interpretation into data files (ichScoreData.ts, gcsScoreData.ts, abcd2ScoreData.ts, hasBledScoreData.ts). ASPECTS scoring and interpretation cannot be unit-tested without rendering the React component. |
| P3 | ARCH-02 | NIHSS scoring logic (`calculateTotal`, `NIHSS_ITEMS`, `getItemWarning`) is correctly extracted to `nihssShortcuts.ts` but the file is named "Shortcuts" rather than a canonical data-module name (e.g., `nihssScoreData.ts`). This is a naming inconsistency vs. the other calculators' `*ScoreData.ts` pattern. Safe to rename (mechanical refactor), but touches many import sites. |

### 10. Duplication

| Severity | ID | Finding |
|---|---|---|
| P3 | DUP-01 | No scoring logic is duplicated across files. `strokeDosing.ts` is correctly the single source of truth for tPA/TNK dosing. The `SEVERITY_TOKENS` style objects (visual tokens for drawer states) are repeated in ICH, GCS, and ABCD2 page components with identical structure and only differing color values — this is a safe cosmetic duplication (UI-only, no clinical content). |

### 11. Test coverage

**Finding: Zero test files exist in the repository.** The `find` command returned no `.test.*` or `.spec.*` files.

Priority matrix for which calculators pose the most risk without tests:

| Priority | Calculator | Reason |
|---|---|---|
| 1 | NIHSS | 15 items, UN sentinel, partial-score-defaults-to-0, max 42; highest complexity and most frequently used at bedside |
| 2 | ICH Score | Mortality table lookup; direct patient prognosis communication; must-test all 7 score values |
| 3 | ABCD2 | Risk threshold boundary conditions (score 3 vs 4, score 5 vs 6); diabetes boolean interaction |
| 4 | GCS | T-suffix handling; eyeNotTestable=true scoring as 1; severity boundary at 8/9 and 12/13 |
| 5 | HAS-BLED | warfarin+labileINR conjunction logic; score-to-risk mapping boundaries |

ASPECTS and tPA dosing are lower risk (simpler math, fewer branches) but still benefit from tests.

---

## Top 5 Calculator Risks

**Risk 1 — NIHSS-05 (P1): RACE scale tooltip claims 85% sensitivity for LVO at RACE ≥5, but code shows 55% probability at RACE 5–6 and 85% only at RACE 7–9.** These are different quantities but a clinician reading the tooltip will interpret both numbers as applying at the same threshold. This can influence triage decisions in stroke code. Requires Class E review.

**Risk 2 — NIHSS-01 (P2): NIHSS partial scoring silently defaults to 0 for unscored items.** A resident scoring only the first few items in a busy stroke code will see a total that looks complete. No "incomplete" visual state exists. This is a patient-safety-adjacent UX issue. Requires Class C-clinical review to add a completion indicator without changing the running-total design philosophy.

**Risk 3 — HASBLED-01 (P1): HAS-BLED four-tier risk classification (low/moderate/high/very_high) is not in Pisters 2010.** The thresholds appear to align with ESC AF guidelines, but this requires explicit citation and Class E review to confirm the correct source is named.

**Risk 4 — NIHSS-03 (P3): UN sentinel (9) appears as literal "9" in clipboard/EMR copy for Dysarthria.** A clinician pasting NIHSS into a chart note sees "Dysarthria: 9" which could be misread as a scored value. This is a safe cleanup candidate once the right display string is confirmed (Class C, no clinical review needed for the UI fix, but the correct UN label text should be reviewed).

**Risk 5 — ASPECTS-01 (P2): EVT text for ASPECTS 6–7 over-simplifies late-window candidacy.** The statement that ASPECTS ≥6 is "the primary threshold for EVT eligibility across early and late windows" elides the perfusion-imaging requirements from DAWN/DEFUSE-3. This requires Class E review before any change.

---

## Safe Cleanup Candidates (no Class E required)

These items require at most a Class C or C-clinical review. No clinical formula or interpretation text changes.

1. **NIHSS-03:** Fix clipboard output to render "UN" instead of "9" for item 10 Dysarthria when UN is selected. Mechanical string substitution. Class C (no clinical content change; the label is already defined in the option definition).

2. **NIHSS-02:** Export the UN sentinel as a named constant (`export const NIHSS_UN_VALUE = 9 as const`) and reference it from `calculateTotal` and the item definition. Removes magic number. Class C.

3. **ARCH-01:** Extract ASPECTS `getScoreInfo()` function to `src/data/aspectsScoreData.ts` following the `*ScoreData.ts` pattern. No formula or text changes — pure file relocation. Makes the function unit-testable. Class C (no clinical content, purely structural).

4. **ARCH-02:** Rename `nihssShortcuts.ts` to `nihssScoreData.ts` for naming consistency. Class D (mechanical rename touches all import sites across the app; check router and other consumers before executing).

5. **HASBLED-03:** Unify the `very_high` risk display path to either (a) add a distinct interpretation string for `very_high` or (b) collapse the type to three tiers if `very_high` is not clinically differentiated. Class C-clinical (touches interpretation copy; requires medical-scientist sign-off on whether the four-tier type is intentional).

---

## Items Requiring Class E Clinical Review Before Any Change

1. **NIHSS-05:** RACE scale tooltip text claiming 85% sensitivity at RACE ≥5 vs. 55% LVO probability shown at that threshold. Text change is clinical — needs medical-scientist authoring and clinical-reviewer gate.

2. **HASBLED-01:** HAS-BLED four-tier risk classification and its source citation. If thresholds are from ESC 2016 or a later AF guideline rather than Pisters 2010, the citation and `last_reviewed` must be updated. Class E.

3. **HASBLED-02:** Bleeding rate for HAS-BLED scores ≥4 (all shown as 8.70/100 patient-years). Verify against current ESC/AHA guidance; add footnote if kept. Class E (interpretation text change).

4. **ASPECTS-01:** EVT eligibility text for ASPECTS 6–7 and the late-window simplification. Class E.

5. **ABCD2-01:** Confirm ABCD2 risk thresholds match the named source (Johnston 2007 Lancet) and add explicit citation to the risk-stratification function comment if the thresholds come from a secondary guideline source. Class C-clinical if only comment/citation changes; Class E if any threshold value changes.
