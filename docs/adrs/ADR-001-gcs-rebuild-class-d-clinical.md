# ADR-001 — GCS Calculator Rebuild as Class D-clinical Reference Implementation

**Date:** 2026-04-17
**Status:** Accepted

## Context

`GlasgowComaScaleCalculator.tsx` was built before CALCULATOR_SPEC.md existed. It used:
- Grid-card layout (Archetype 2 pattern — wrong)
- `border-2` for selected-state styling (spec prohibits this)
- `dark:` classes throughout (~30 instances — spec prohibits this)
- An inline interpretation section instead of a Portal bottom drawer
- A 4-tier severity model (`'mild' | 'moderate' | 'severe' | 'deep_coma'`)
- An incorrect severity threshold: `total >= 14` classified as mild (correct: `>= 13` per ACRM 1993 and Teasdale & Jennett 1974 consensus)
- A truncated citation title and missing `pubmedId`

CALCULATOR_SPEC.md v1.1 defines Archetype 1 (vertical radio list with `divide-y divide-slate-200`, `.selected-option` left-border accent, Portal drawer) as the canonical pattern. GCS required a full rebuild to reach compliance.

The `system-architect` agent (W3.4) is not yet implemented. This rebuild serves as the first live exercise of the full Class D-clinical workflow (CLAUDE.md §6), establishing a repeatable reference pattern for the remaining 7 calculator rebuilds.

Wave 5 deviation: `CLAIM_REGISTRY` and `src/lib/citations/registry.ts` do not yet exist. The clinical-reviewer works against inline citations in `gcsScoreData.ts` for this PR. This deviation is documented in the clinical review artifact.

## Decision

Rebuild GCS against CALCULATOR_SPEC v1.1 using the full Class D-clinical workflow:

1. **7 parallel sub-agents** (ui-architect, medical-scientist, content-writer, mobile-first-developer, qa-engineer, accessibility-specialist, seo-specialist) produced pre-flight planning artifacts
2. **Conflict resolution log** synthesized before any code written:
   - Not-testable checkboxes: KEEP — clinically essential per Teasdale & Jennett 1974 (T suffix for verbal-not-testable); checkbox-above-radiogroup pattern is spec-compatible
   - Drawer stat format: GCS range band ("GCS 13–15") not a percentage — GCS has no intrinsic mortality figure
   - amber-700: used for moderate tokens, overriding ICH reference's amber-600 defect
   - 3-tier severity: `'low' | 'moderate' | 'high'` (GCS 13–15 / 9–12 / 3–8)
3. **Architect review artifact** produced at `docs/reviews/architect-review-gcs-rebuild.md`
4. **Execution of 4 file changes:** component, data, routeManifest, link-graph
5. **Clinical-reviewer gate** post-execution per §17.2

Key clinical corrections in this rebuild:
- Severity threshold: `total >= 14` → `total >= 13` (ACRM 1993, Teasdale & Jennett 1974)
- 4-tier → 3-tier severity collapse (aligns with CALCULATOR_SPEC §6)
- `GCS_CITATION.pubmedId` added: `'4136544'`
- Full citation title restored: `'Assessment of coma and impaired consciousness: a practical scale'`
- All interpretation copy cited to named sources (Teasdale & Jennett 1974, ACRM 1993, Hemphill et al. 2001)
- Nullable inputs: all three GCS fields now `| null` to distinguish unselected from minimum-score selections

## Consequences

**Easier:**
- GCS serves as the reference implementation for all remaining calculator rebuilds (NIHSS, ASPECTS, HAS-BLED, ABCD2, RoPE, Heidelberg, Boston Criteria)
- The 7-agent pre-flight swarm pattern is validated end-to-end: swarm → synthesis → architect review → execution → clinical gate → commit
- `amber-700` is established as the correct moderate-severity token across all calculators going forward
- `createPortal` + `position: fixed` + `bottom: calc(var(--tab-bar-height) + ...)` is the validated drawer pattern for production

**More difficult:**
- The not-testable checkbox feature is GCS-specific and cannot be shared with other calculators via a generic Archetype 1 pattern without Phase 3 claim-surface support
- The `stubs` array in `link-graph.json` requires ongoing maintenance as new nodes are added in subsequent rebuilds
- The `system-architect` role (W3.4) must be implemented before the next Class D task to remove the ui-architect stand-in arrangement

## Scope

- `src/pages/GlasgowComaScaleCalculator.tsx` — full rewrite
- `src/data/gcsScoreData.ts` — type corrections, threshold fix, citation fix, new result fields
- `src/config/routeManifest.ts` — GCS meta title (47→53 chars) and description (186→158 chars)
- `docs/link-graph.json` — nodes: `calc/gcs`, `calc/nihss`, `article/ich-management`; stubs: `pathway/stroke/step-2`, `trial/hemphill-2001`, `guideline/aha-ich-2022`
