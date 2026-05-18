# Clinical batch 5 — quick pearls authoring doc

**Date:** 2026-05-19
**Class:** E-clinical
**Author:** medical-scientist
**Status:** ready_for_clinical_reviewer

## Scope

Batch 5 adds scannable decision-point quick pearls in `src/data/strokeClinicalPearls.ts`. Each new quick pearl links to a deep pearl (full evidence and trial framing) already authored and shipped in Batch 3B (commit 7f4d1cb) and verified in `docs/evidence-packets/stroke-code-batch3b-2026-05-19.md`. No new clinical claims are introduced; quick pearls condense already-verified deep-pearl content into a glanceable bedside form.

## Pearls authored

### step-1.quick

| Quick pearl ID | Anchor deep pearl | Anchor trial(s) | Class / Level | Source |
|---|---|---|---|---|
| `tnk-class-i-quick` | `act-trial` | AcT 2022 | Class 1, LOE A | AHA/ASA 2026 §4.6.2 |
| `late-window-tnk-quick` | `trace-iii-trial`, `timeless-trial` | TRACE-III 2024, TIMELESS 2024 | Class 2b, LOE B-R (TRACE-III); negative (TIMELESS) | AHA/ASA 2026 §4.6.3 |

### step-2.quick

| Quick pearl ID | Anchor deep pearl | Anchor trial(s) | Class / Level | Source |
|---|---|---|---|---|
| `large-core-evt-quick` | `select2-trial`, `angel-aspect-trial`, `tension-trial`, `laste-trial` | SELECT-2, ANGEL-ASPECT, TENSION 2023; LASTE 2024 | Class 1, LOE A (ASPECTS 3–5); Class 2a, LOE B-R (ASPECTS 0–2) | AHA/ASA 2026 §4.7.2 |
| `posterior-circulation-evt-quick` | `baoche-trial`, `attention-trial` | ATTENTION 2022, BAOCHE 2022 | Class 1, LOE A | AHA/ASA 2026 §4.7.3 |

### step-5.quick

| Quick pearl ID | Anchor deep pearl | Anchor trial(s) | Class / Level | Source |
|---|---|---|---|---|
| `post-evt-bp-avoid-intensive-quick` | `optimal-bp-trial` | OPTIMAL-BP 2023 | Class III: Harm, LOE A | AHA/ASA 2026 §4.3 |
| `post-evt-bp-under-120-quick` | `enchanted2-mt-trial` | ENCHANTED2/MT 2022 | Class III (harm direction), LOE B | AHA/ASA 2026 §4.3 |

## Skipped (per brief)

- **step-6 DVT prophylaxis (CLOTS-3 / IPC):** skipped. Per brief, only author if a `step-6.quick` IPC entry is needed; existing Step-5 orders already cover DVT prophylaxis with CLOTS-3 (`clots3-trial` in step-5.deep). No duplication added.

## Statistical framing — preserved per `trial-statistics` skill

- **AcT** is noninferiority — quick pearl frames as "equivalent" / "alternative," no NNT shown.
- **TRACE-III** is binary superiority — NNT (~11) appropriate and shown in deep pearl; quick pearl uses "~1 in 11" plain-English form.
- **TIMELESS** is ordinal shift, negative — quick pearl says "no benefit," no NNT.
- **SELECT-2, ANGEL-ASPECT, TENSION, LASTE** are ordinal-shift designs — no NNT in quick pearls; pearls cite Class/Level only.
- **ATTENTION, BAOCHE** are binary superiority — quick pearl uses mortality and mRS 0–3 figures, no NNT (per brief's tight character budget).
- **OPTIMAL-BP** is binary superiority — NNH ≈ 7 is appropriate and shown.
- **ENCHANTED2/MT** is ordinal shift — no NNT/NNH; OR for major disability quoted.

## Constraints honored

- No existing pearl modified; ADD-only.
- No new ClinicalPearl interface fields; existing fields only.
- All content ≤180 chars in `content` field.
- All claims trace to Batch 3B deep pearls and the evidence-verifier packet at `docs/evidence-packets/stroke-code-batch3b-2026-05-19.md`.
- Voice matches existing quick pearls — verb-forward, no preamble, clinician-to-clinician.

## Files touched

- `src/data/strokeClinicalPearls.ts` — 6 new entries added to existing `quick` arrays in step-1, step-2, step-5.

## Routing

Ready for clinical-reviewer.
