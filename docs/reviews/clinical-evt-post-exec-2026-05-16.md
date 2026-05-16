# Clinical review (post-execution) — EVT pathway surgical patch

**Decision:** approve-with-conditions. Ship.
**Reviewer:** clinical-reviewer
**Date:** 2026-05-16

## Scope

- **Claims touched:** A3 basilar mRS ≥2 IDD; A8 large-core 50–100 mL IIb removal; A9 core >100 mL softening; A13 dominant M2 0–6h gate + >6h IDD; B7 skip-IVT pearl; B4 GA vs procedural sedation; B5 adjunctive IA post-mTICI 2b/3; B6 pre-EVT tirofiban Class III; A4/A5/A6 HERMES attribution; mRS two-tier IIa/IIb; TNK 0.4 mg/kg Class III note.
- **Surfaces changed:** `src/pages/EvtPathway.tsx` only — branch result objects, `details`/`reason` strings, badge map, LearningPearl content, Provisional banner.

## Semantic validity

**CLIN-2 verbatim phrase audit — all 5 confirmed verbatim:**

| Phrase | Location | Match |
|---|---|---|
| "insufficient data to determine" | line 260–262 (A3 reason/details/exclusionReason) | Verbatim |
| "diminished treatment benefit" + "cerebral edema" + "hemicraniectomy" | line 519–520 (A9) | All 3 verbatim |
| "benefits are uncertain" | line 573–575 (A13) | Verbatim |
| "a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended" | line 1265 (B7 pearl) | Verbatim |
| "not well established" | line 296 (A1 basilar IIb branch) | Verbatim |

**Ship-blockers (4) implemented correctly:** A3, A8, A9, A13 all confirmed at cited locations.

**New pearls present:** B7 (line 1264–1265), B4 GA vs sedation (line 1570–1571), B5 adjunctive IA (line 1574–1575), B6 tirofiban (line 1578–1579), TNK 0.4 mg/kg Class III (line 1170).

**HERMES attribution corrected:** lines 397 + 478 carry corrective clause "HERMES enrolled ASPECTS ≥6 only and does not extend to this ASPECTS 3–5 stratum" with RESCUE-Japan LIMIT/ANGEL-ASPECT/SELECT2/TENSION/LASTE attribution.

**DVO terminology** augmented (not replaced): lines 193, 195, 572, 582.

**Two-tier prestroke mRS at 0–6h preserved** (mRS 2 IIa B-NR Rec 5 line 339; mRS 3-4 IIb B-NR Rec 6 line 354).

**Never-drift categories:** all 5 preserved (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints).

## Freshness

Per scope-reduction note: CLIN-1 (`last_reviewed` refresh) deferred to W5.2. `src/lib/citations/registry.ts` does not exist; `check:claims` confirms this is expected.

## Required follow-ups (non-blocking)

1. **Provisional result banner (lines 1197–1207)** — pre-existing feature, not modified by this commit. Visual prominence borders on verdict-pill territory; recommend ui-architect re-look. Not blocking.
2. **CLIN-1 deferred to W5.2** — when `registry.ts` lands, refresh `last_reviewed: "2026-05-16"` on all §4.7 citations with §13.6 six-step checklist.
3. **Humanizer pass on new prose** — to be re-confirmed during commit; verbatim PDF clauses exempt.

## Decision

**approve-with-conditions. Ship.**

- All 5 CLIN-2 verbatim phrases preserved character-for-character at the expected line locations.
- All 4 ship-blockers correctly implemented; 4 new pearls present with correct COR/LOE labels.
- No mandatory-block conditions triggered.
