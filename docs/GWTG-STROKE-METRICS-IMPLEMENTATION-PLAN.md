# Get With The Guidelines (GWTG) Stroke Metrics – Implementation Plan

**Purpose:** Record GWTG-aligned stroke metrics in the Stroke Code Basics workflow in a seamless way and surface them in a final note for the EMR.

**Agents involved:** Medical Scientist (definitions, targets), Data Architect (schema), UI Architect / Mobile-First Developer (capture UX), Content Writer (labels, note template), Calculator Engineer (derived times, targets).

---

## 1. Medical Scientist – GWTG Definitions & Targets

**Source:** AHA/ASA 2026 + GWTG-Stroke quality measures.

| Metric | Definition | Target / Note |
|--------|------------|----------------|
| **LKW / LKN** | Time patient was last known in normal neurological state. Wake-up: document "unknown" or last seen normal before sleep. Clock restarts if symptoms fully resolve then recur. | Required for eligibility; document as time or "unknown". |
| **Time of symptom discovery** | When symptoms were first noted by patient or witness. | Optional; important for wake-up strokes. |
| **Hospital arrival (door) time** | Time patient arrived at ED or care transferred from EMS to ED. | Single timestamp; used as reference for door-to-X. |
| **Neurologist evaluation time** | When neurologist first evaluated the patient. | Single timestamp; one-tap "Record now" ideal. |
| **CT ordered** | Time imaging was ordered/initiated. | — |
| **CT first image** | Time of first image acquisition. | GWTG: CT initiation ≤25 min from door (urban); ≤45 min interpretation (rural). |
| **CT interpreted** | Time imaging was interpreted. | — |
| **Door-to-needle** | Hospital arrival → tPA bolus. | ≤60 min (national); ≤45 min optimal; ≤30 min best. |
| **LKW-to-needle** | LKW → tPA bolus. | Must be ≤4.5 h for standard IV tPA; arrive by 3.5 h, treat by 4.5 h for GWTG. |
| **Door to groin puncture** | Door → groin puncture (thrombectomy). | — |
| **First device deployment** | Time of first device deployment. | — |
| **First reperfusion** | Time of first reperfusion. | — |

**Validation (Medical Scientist):** All time windows and targets above match AHA/ASA 2026 and GWTG-Stroke; no invented cutoffs.

---

## 2. Data Architect – Schema (GWTG Metrics)

**Single source of truth:** One `GWTGMilestones` (or extended `milestones`) object in workflow state; timestamps as `Date | null`; optional fields for thrombectomy.

```typescript
// Extended milestones (workflow-level state)
interface GWTGMilestones {
  // Reference time (set once at start or when user taps "Patient arrived")
  doorTime: Date | null;

  // From Step 1 (or derived)
  lkwTime: Date | null;           // From Step 1 clock; null if LKW unknown
  symptomDiscoveryTime: Date | null;  // Optional

  // Neurologist
  neurologistEvaluationTime: Date | null;

  // Imaging (Step 2)
  ctOrderedTime: Date | null;
  ctFirstImageTime: Date | null;
  ctInterpretedTime: Date | null;
  // Keep doorToCT as minutes for backward compat, or derive from doorTime + ctFirstImageTime

  // Treatment (Step 2)
  tpaBolusTime: Date | null;      // Or derive from doorTime + doorToNeedleMinutes
  doorToNeedleMinutes?: number;   // Existing

  // Thrombectomy (optional, Step 2 or 4)
  groinPunctureTime: Date | null;
  firstDeviceTime: Date | null;
  firstReperfusionTime: Date | null;
}
```

**Step 1 data extension:** Add `lkwTimestamp: Date | null` (and optionally `symptomDiscoveryTime: Date | null`) so the note can print actual LKW time, not only "X hours ago."

**Backward compatibility:** Keep existing `doorToData`, `doorToCT`, `doorToNeedle` (Date or minutes) until we migrate; then derive from `doorTime` + stored times where possible.

---

## 3. UI / Mobile-First – Seamless Capture Strategy

**Principles:** Minimal taps; "Record now" where possible; optional fields collapsible; no duplicate entry.

| Metric | Where to capture | UX |
|--------|------------------|-----|
| **Door time** | Start of workflow (or first time user opens Code mode). | Single action: "Patient arrived" / "Use as door time" that sets `doorTime = new Date()` and starts timer. If timer already started, treat timer start as door time unless we add an explicit "Set door time" in settings. **Recommendation:** Add optional "Set door time" in timer bar (default: timer start = door time); allow "Change door time" (time picker) for corrections. |
| **LKW / LKN** | Step 1 (existing). | Keep current clock picker; on complete, also pass `lkwTimestamp: Date` (from lkwHour/lkwMinute/lkwPeriod + today) or `null` if LKW unknown. |
| **Symptom discovery** | Step 1. | Optional row: "Time of symptom discovery" with "Same as LKW" checkbox or time picker; collapse under "More times" on mobile. |
| **Neurologist evaluation** | Step 1 or global. | One "Record neurologist evaluation time" button (sets to now). Place in Step 1 header or in timer bar. |
| **CT ordered / first image / interpreted** | Step 2. | Option A: Three "Record now" buttons (e.g. "CT ordered", "First image", "Interpreted") that stamp time. Option B: One "CT first image (min from door)" + optional "CT interpreted (min)" for backward compat; plus optional "CT ordered – now" if we want all three. **Recommendation:** Three quick "Record now" buttons; show elapsed min from door next to each. |
| **Door-to-needle / tPA bolus** | Step 2 (existing). | Keep current "Door-to-needle (min)" input; optionally add "Record tPA bolus now" that sets `tpaBolusTime = new Date()` and computes door-to-needle from door time. |
| **Thrombectomy times** | Step 2 or Step 4. | Only show if user indicated thrombectomy (e.g. CTA ordered + LVO). Section "Thrombectomy times (optional)" with three "Record now" buttons: Groin puncture, First device, First reperfusion. |

**Mobile:** All "Record now" buttons min 44px; group optional times in an expandable "GWTG times" or "More times" section so the main flow stays short.

---

## 4. Content Writer – Labels and Note Template

**Labels (short for UI):**
- Door time: "Hospital arrival (door)"
- LKW: "Last known well (LKW)"
- Symptom discovery: "Time of symptom discovery"
- Neurologist: "Neurologist evaluation"
- CT: "CT ordered" / "CT first image" / "CT interpreted"
- tPA: "tPA bolus" / "Door-to-needle"
- EVT: "Groin puncture" / "First device" / "First reperfusion"

**Tooltips (GWTG wording):** Use the definitions from §1 in a single line per metric (e.g. "Time patient arrived at ED or care transferred from EMS").

**Final note template (GWTG-aligned):** Structure the EMR note so it matches the 7 categories the user listed (LKW, symptom discovery, door, neurologist, imaging times, treatment times, thrombectomy times). Include targets where relevant (e.g. "Door-to-needle: 42 min (target ≤60)").

---

## 5. Implementation Phases (Order of Work)

### Phase 1 – Foundation (door time, LKW timestamp, note shape)
1. **Data:** Extend workflow state: add `doorTime: Date | null` (default: `timerStartTime` when workflow starts). Add `lkwTimestamp: Date | null` and optional `symptomDiscoveryTime` to Step 1 payload.
2. **Step 1:** From LKW clock compute `lkwTimestamp` (Date) on complete; pass in `Step1Data`. Add optional "Time of symptom discovery" (checkbox "Same as LKW" or time picker); pass through.
3. **Timer bar:** Add "Door time" display (and optional "Set door time" / "Change" for corrections). Clarify in UI that "Elapsed" is from door time.
4. **CodeModeStep3 note:** Extend `generateEMRNote()` to a GWTG-style section: LKW (time or "unknown"), symptom discovery (if present), door time, then imaging and treatment. Keep existing content; reorder and add headings to match GWTG.

### Phase 2 – Imaging and neurologist
5. **Neurologist evaluation:** One "Record neurologist evaluation time" button (e.g. in Step 1 or timer bar); store in milestones; include in note.
6. **Step 2 – Imaging:** Add three optional "Record now" actions: CT ordered, CT first image, CT interpreted. Store as `ctOrderedTime`, `ctFirstImageTime`, `ctInterpretedTime` in milestones (or Step2Data). Show minutes-from-door next to each. Keep existing "Door-to-CT (min)" for backward compat or replace by computed value from door + ctFirstImageTime.
7. **Note:** Add imaging subsection with CT ordered / first image / interpreted and targets (e.g. "CT first image: 22 min from door (target ≤25)").

### Phase 3 – Treatment and derived metrics
8. **Step 2 – tPA:** Optionally add "Record tPA bolus now" that sets `tpaBolusTime = new Date()`; compute door-to-needle and LKW-to-needle; show "Arrive by 3.5h, treat by 4.5h" (met/unmet) from LKW and tPA time.
9. **Note:** Add LKW-to-needle; add "Arrive by 3.5h, treat by 4.5h" and door-to-needle target (≤60 / ≤45 / ≤30) in the treatment section.

### Phase 4 – Thrombectomy
10. **Step 2 or 4:** If thrombectomy path (e.g. CTA ordered + LVO), show optional "Thrombectomy times" with three "Record now" buttons: groin puncture, first device, first reperfusion. Store in milestones.
11. **Note:** Add "Thrombectomy" section with door-to-groin, first device, first reperfusion (and minutes from door where useful).

### Phase 5 – Polish
12. **Content Writer:** Add tooltips and short GWTG definitions for each metric; final pass on note template.
13. **Mobile-First:** Ensure all new buttons are 44px; optional sections collapsible; test on small viewport.
14. **Medical Scientist:** Confirm all targets and definitions against 2026 guidelines and GWTG-Stroke.

---

## 6. File-Level Plan

| File | Changes |
|------|--------|
| **StrokeBasicsWorkflowV2.tsx** | Extend `milestones` (or new `gwtgMilestones`) with doorTime, lkwTimestamp, symptomDiscoveryTime, neurologistEvaluationTime, ctOrdered/FirstImage/Interpreted, tpaBolusTime, groinPuncture/firstDevice/firstReperfusion. Pass doorTime into Step 1/2/3; default doorTime = timerStartTime on start. Optional "Set door time" in timer bar. |
| **CodeModeStep1.tsx** | Add optional "Time of symptom discovery" (Same as LKW or picker). On complete, compute and pass `lkwTimestamp: Date \| null` (from clock or null if unknown). |
| **CodeModeStep2.tsx** | Add "Record now" for CT ordered, first image, interpreted; optional thrombectomy times (groin, first device, reperfusion). Receive `onRecordMilestone` for new keys. Optionally "Record tPA bolus now" and pass tpaBolusTime. |
| **CodeModeStep3.tsx** | Extend `MilestonesInput` and props with new timestamps. Rewrite `generateEMRNote()` into GWTG structure (LKW, symptom discovery, door, neurologist, imaging, treatment, thrombectomy); compute and display door-to-needle, LKW-to-needle, targets. Add "Copy GWTG note" if we keep two note formats. |
| **New (optional)** | `GWTGMilestonesContext` or a small `useGWTGMilestones()` hook to avoid prop drilling if many steps need read/write. |

---

## 7. Risk and Scope Control

- **Scope:** Implement Phase 1 + Phase 2 first (door time, LKW timestamp, symptom discovery, neurologist, imaging breakdown, note structure). Then Phase 3 (treatment/derived), then Phase 4 (thrombectomy).
- **Backward compatibility:** Existing "Door-to-CT (min)" and "Door-to-needle (min)" inputs can remain; new timestamps supplement or replace them once derived values are in place.
- **Optional fields:** All new metrics except door time and LKW can be optional so the workflow does not block completion.

---

## 8. Success Criteria

- Door time and LKW (as time or "unknown") are clearly set and visible.
- One-tap "Record now" for neurologist, CT ordered/first image/interpreted, and (if applicable) tPA bolus and thrombectomy events.
- Final note matches GWTG structure and includes all captured metrics with targets where applicable.
- Mobile: new actions meet 44px touch target; optional sections collapsible.
- Medical Scientist sign-off: targets and wording match AHA/ASA 2026 and GWTG-Stroke.

---

**Next step:** Confirm this plan (or adjust scope/phases), then implement Phase 1 and Phase 2 as the first deliverable.
