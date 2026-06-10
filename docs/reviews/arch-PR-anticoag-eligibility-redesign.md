# Architect review — PR (Anticoagulant/Antiplatelet IVT-Eligibility Redesign of PatientContextPanel)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-06-10

## Rationale
Replacing the coarse `Anticoag` multi-select + single shared `lastAnticoagDose` timestamp with per-drug decision inputs is the right surface and a sound data-model shape: the new fields are additive/optional (backward-compatible at the type level) and the consumer surface is small and fully enumerated (NihssCalculator, CodeModeStep1 via extraRows, MrsPickerModal type-only, plus cases/types.ts + cases/format.ts persistence). Two conditions keep it from a clean approve: (1) the per-chip gates (DOAC <48h, INR ≤1.7, LMWH <24h, UFH aPTT) and the caution notes are clinical interpretation, not neutral data capture — this is Class E / `-clinical`, not pure-structural D, and routes to clinical-reviewer; (2) the persistence layer has no read-time migration, so old IndexedDB cases carrying `anticoag: ['none', …]` would print a stray "none" token via format.ts, and the dropped `lastAnticoagDose` would silently vanish. Both are resolvable with plan-level decisions; no architectural rewrite needed.

## Required follow-ups (resolutions adopted)
1. **Re-grade to Class E / `-clinical`; route thresholds + caution-note prose to clinical-reviewer.** ADOPTED — handled via medical-scientist claim authoring + clinical-reviewer gate.
2. **Read-time normalization for old saved cases.** ADOPTED — drop `'none'` from the anticoag array at the read boundary (NIHSS restore + format.ts); retain `lastAnticoagDose` on `SavedCaseData.patientContext` as a deprecated read-only field (no data loss; reversal-timing data preserved). No destructive IndexedDB migration; additive new fields need no schema-version bump (precedent: types.ts additive fields).
3. **`SavedCaseData.patientContext` gains the new fields; format.ts + NIHSS save/restore move in lockstep.** ADOPTED.
4. **Do NOT narrow shared `MRSGrade` (MrsPickerModal needs grade 6 for outcome scoring).** ADOPTED — introduce `PrestrokeMrsGrade = 0|1|2|3|4|5` for the pre-stroke field only; leave `MRSGrade` (0–6) intact.
5. **Derive conditional sub-input visibility per render (not stored booleans).** ADOPTED — mirror the existing `showLastDoseRow` pattern.
6. **Gate the new IVT-eligibility caution UI behind the existing `showThrombolysisTiming` opt-in** so Stroke Code keeps its own engine authoritative and the shared panel is not coupled to NIHSS-specific thrombolysis logic. ADOPTED.
7. No new dependencies. PASS.

## Blocking issues
None. Approve once follow-ups 1–4 and 6 are reflected in the build and the clinical-reviewer gate passes.
