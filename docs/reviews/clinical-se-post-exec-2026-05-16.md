# Clinical review — SE Pathway surgical patch (post-execution)

**Decision:** approve-with-conditions. Ship.
**Reviewer:** clinical-reviewer
**Date:** 2026-05-16

## Scope

- **Claims touched:** ESETT equivalence (Stage 2 rewrite), NCSE route-out, lacosamide cap 400 mg + AV-block contraindication, RAMPART fixed-dose IM midazolam, ketamine load 1–2.5 mg/kg, phenobarbital 15 mg/kg, cardiac flag split, Glauser stage time labels, Stage 4 super-refractory checklist, NORSE/FIRES advisory, eclampsia branch, empiric thiamine/pyridoxine.
- **Surfaces changed:** `src/pages/StatusEpilepticusPathway.tsx` only — static JSX, computed strings (`getEsettOptions`, `calculateDose`, `calculateBzdFixedDose`), interpretation copy, references block.

## Semantic validity

**All 6 CLIN-2 verbatim phrases confirmed at cited lines:**

| Phrase | Location | Match |
|---|---|---|
| "levetiracetam, fosphenytoin, and valproate are equivalent for benzodiazepine-refractory status epilepticus" | line 130 (pearl), 416 (rendered) | Verbatim |
| "NCSE without coma is an active condition but does not mandate ICU-level care or anesthetic infusion" | line 295 | Verbatim |
| "lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker" | line 139 (warning), 530 (ECG note) | Verbatim |
| "Intramuscular midazolam in a fixed dose of 10 mg (>40 kg) or 5 mg (13–40 kg) was at least as effective as intravenous lorazepam" | line 26 (comment), 356 (rendered) | Verbatim |
| "insufficient evidence" | line 546 (Stage 4 framing) | Verbatim |
| "Benzodiazepine escalation is NOT first-line for eclamptic seizures" | line 288 | Verbatim |

**Ship-blockers (2) implemented correctly:**
- **A1 ESETT rewrite:** `getRecommendedAgent` replaced with `getEsettOptions` (lines 126–154). Three-card equivalence grid (lev/fos/VPA), no hierarchical ranking. Lacosamide moved to Stage 3 add-on (lines 522–531). PASS.
- **A2 NCSE toggle:** `convulsive: boolean` field removed (line 17). Replaced with read-only "Convulsive SE only" label + Vossler 2025 NCSE route-out card (lines 293–296). PASS.

**Other Class E items verified:**
- A3 lacosamide 400 mg cap + ECG gate (lines 52, 527, 530)
- A4 RAMPART fixed-dose 10/5 mg bands + <13 kg fallback (lines 27–34)
- Phenobarbital 15 mg/kg (line 54)
- Ketamine 1–2.5 mg/kg (line 58)
- Cardiac flag split: `cardiacAvBlock` AVOID phenytoin/fosphenytoin/lacosamide; `cardiacElderly` caution only (lines 132–145)
- Stage time labels per Glauser 2016: 0–5 / 5–20 / 20–40 / 40+ min (lines 330, 332, 410, 494) — NOT Rubinos 10–30/30–60
- B1 Stage 4 framed as workup/checklist with "insufficient evidence" verbatim (lines 541–555); "consider" verbs only
- B2 NORSE/FIRES advisory at Stage 3 with 72h window (lines 500–503)
- B3 Eclampsia magnesium 4g over 5–10 min → 1g/h verbatim from Mullhi 2025 (line 288); obstetric backstop limitation surfaced inline
- B4 Pyridoxine **50–100 mg IV** range (line 287) — corrected from planning doc's "100 mg"

**Never-drift categories:** all 5 preserved (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints).

## Freshness

`last_reviewed` refresh deferred to W5.2 per same precedent as EVT post-exec commit (registry doesn't exist; `check:claims` confirms expected).

## Required follow-ups (non-blocking)

1. **`last_reviewed` refresh** — deferred to W5.2.
2. **Obstetric-guideline backstop for B3 eclampsia branch** — ACOG/RCOG primary citation required before next eclampsia content change. Limitation surfaced inline this commit.
3. **Humanizer pass on new prose** — verify via `check:humanizer` if available.
4. **Claim tagging per §13.4** — claim IDs to register in `src/lib/citations/claims.ts` once registry exists.

## Decision

**approve-with-conditions. Ship.**

- All 6 CLIN-2 verbatim phrases render verbatim at cited lines.
- Both ship-blockers (A1 ESETT equivalence rebuild, A2 NCSE terminal route-out) resolved without drift.
- Stage 4 framed correctly with "insufficient evidence"; Pyridoxine 50–100 mg range correct; Glauser TIER 0 stage times used.
