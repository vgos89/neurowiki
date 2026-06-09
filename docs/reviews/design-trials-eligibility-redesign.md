# Design review — trial eligibility card redesign + trials-page consistency

**Decision:** approve (owner-approved mockup → implemented)
**Date:** 2026-06-09
**Reviewers:** ui-architect (audit + design + implementation), accessibility-specialist (approve), mobile-first-developer (approve-with-conditions)
**Mockup (owner-approved):** `docs/specs/mockups/trials-eligibility-criteria-redesign.html`

## Why
Owner reviewed the live trials page: the full-criteria disclosure rendered as a SEPARATE bottom block in a different format (plain bullets, grouped h4 labels, NO ✓/✕), clashing with the curated Included/Excluded ✓/✕ columns. Owner wanted the full criteria to expand IN-PLACE within the Included/Excluded columns, in the SAME ✓/✕ format. Plus a whole-page design-consistency audit, mockup-first before code.

## Audit (ui-architect) — key findings
1. **Criteria card format mismatch (primary)** — separate bottom block, different visual language. FIXED.
2. Hardcoded `text-[#1746A2]` instead of `text-neuro-500` (token). FIXED.
3. Group labels / arm `dt` labels at `text-slate-500` instead of the canonical eyebrow `text-slate-400`. FIXED.
4. Trial Design / Safety eyebrow sub-labels missing `font-bold` (19 instances). FIXED.
5. Bedside Pearl blocks using inline styles instead of token classes (~103 + 3 harm variants). FIXED (token-equivalent: neuro-50=#EEF2FF, neuro-500=#1746A2, neuro-700=#0E2D6B — no color shift).
6. Placeholder card `rounded-2xl border-slate-200` + `text-blue-600`. FIXED → `rounded-xl border-slate-100` + `text-neuro-500`.

## Approved design (owner choices)
- **Per-column toggles (Option B):** each of Included / Excluded has its own "Show all N criteria" accordion; expanding one does not force the other. Preserves balance when one side is much longer.
- Full criteria expand IN-COLUMN in the SAME ✓ (emerald-500) / ✕ (red-400) row format; group labels render as `text-slate-400` eyebrows; provenance moved to an always-visible card footer.
- Scope: criteria fix + the safe consistency cleanups (all token-equivalent, no clinical content change).

## Implementation
- `EligibilityCriteriaCard.tsx` rewritten: per-column accordions (two independent `useState`+`useId`), `FullCriteriaList` with ✓/✕ in-column, provenance footer; old single bottom-block + `CriteriaGroupList` removed. **One shared component → fixes all 29 enriched trials at once.**
- `InterventionArmsAccordion.tsx`: token cleanups (ring/label/note shade, panel top-padding).
- `TrialPageNew.tsx`: Bedside Pearl inline→token, eyebrow font-bold, placeholder card cleanup.
- `src/data/trialData.ts`: UNTOUCHED — presentation-only; no criteria/arm/stats data changed.

## Sign-offs
- **Accessibility (approve):** two per-column toggles with unique `useId` regions, `aria-expanded`/`aria-controls`; `hidden` correct for inline disclosure; Enter/Space; reduced-motion honored; contrast pass. Fixes: added `focus-visible:ring-inset` (prevent ring clip under card `overflow-hidden`) + column-specific `aria-label` ("Show all N inclusion criteria" / "...exclusion...").
- **Mobile (approve-with-conditions):** 375px — stacked layout, ≥44px toggle targets, clean wrap of long expanded criteria, Bedside Pearl token swap no overflow. Provenance link tap area enlarged to ~30px (acceptable for a non-workflow reference link; promote to 44px if footer is ever redesigned).
- **Live-verified (DAWN):** per-column toggles ("Show all 11" / "Show all 26"), inclusion expanded → 11 ✓ in-column grouped (General/Imaging), no separate block, provenance footer present.

## Gates
tsc clean; build 171/171; claims/routes/card-meta pass.

## Follow-up (parked)
Optional `aria-labelledby` on the ✓/✕ `<ul>` lists pointing to their column heading (best-practice, not a WCAG AA violation).

## Study Arms style — decision (2026-06-09)
Owner reviewed Study Arms against the How-to-read / How-to-interpret teaching wells (mockup: `docs/specs/mockups/trials-study-arms-style-options.html`). **Decision: keep Study Arms as a content-section card** (white card + eyebrow, matching Population / Outcome / Trial Design / Safety). The cobalt-left-border "well" style stays reserved for interpretation/teaching accordions. The two are intentionally distinct (factual trial content vs interpretation guidance), so no code change. Do not re-open without a new owner decision.
