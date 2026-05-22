# ADR — GuidelineSummaryCard composition pattern

**Status:** accepted
**Date:** 2026-05-22
**Class:** D (architectural; sets pattern for multi-PR rollout)
**Author:** orchestrator (with architect §17.1 input from `arch-citation-aha-2026-4.9-2026-05-22.md`)

## Context

The 2026 AHA/ASA Acute Ischemic Stroke Guideline (Prabhakaran et al., Stroke 2026;57) provides a clean clinical answer for roughly 17 of the 23 trial questions currently live at `/trials/q/*`. We are adding a `<GuidelineSummaryCard>` to the top of each trial-question page that surfaces the relevant recommendation(s) with COR/LOE, verbatim text, and inline links to the trials cited in the supportive text.

The complication: a single summary card can cite **multiple guideline sections** (e.g., the `minor-stroke-choice` question maps to §4.6.1 thrombolysis decision + §4.8 antiplatelet DAPT, and the `anticoagulation` question maps to §4.9 anticoagulants + supportive text references in §4.6.5 thrombolysis-with-DOACs). The current `Citation` schema (`src/lib/citations/schema.ts`) declares `section?: string` — singular. The registry ID convention `aha-asa-2026-<section>` also bakes one-section-per-entry into the key.

The system-architect's §17.1 review (`docs/reviews/arch-citation-aha-2026-4.9-2026-05-22.md`) flagged this and recommended an ADR to lock in the composition pattern before Phase 1 implementation.

## Decision

**Compose multi-section guideline references at the claim level, not the citation level.**

Each guideline summary card is backed by **one new claim** in `src/lib/citations/claims.ts` whose `citation_ids` array lists every guideline section the card cites. Each cited section remains its own `Citation` entry in the registry with a singular `section` field. The card UI iterates the claim's `citation_ids` and renders one badge/section block per resolved citation.

Example:

```typescript
// src/lib/citations/claims.ts
'minor-stroke-choice-guideline-summary': {
  id: 'minor-stroke-choice-guideline-summary',
  citation_ids: [
    'aha-asa-2026-4.6.1',  // thrombolysis decision-making (disabling vs nondisabling)
    'aha-asa-2026-4.8',    // DAPT for NIHSS ≤3 noncardioembolic AIS
  ],
  surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
  description: 'Composite AHA/ASA 2026 guidance for the minor-stroke treatment choice: IVT for disabling deficits in the 4.5h window per §4.6.1; DAPT for nondisabling NIHSS ≤3 noncardioembolic per §4.8.',
},
```

## Alternatives considered and rejected

**(b) Widen `Citation.section` to `string | string[]`.** Allows one citation entry to span sections. Rejected because:
- Breaks the kebab-case `aha-asa-2026-<section>` ID convention. Either the ID becomes ambiguous (which section anchors it?) or we adopt a different ID convention, forcing a full registry rename.
- Complicates UI rendering — a single citation badge with multiple sections is visually noisy.
- The `ClaimEntry.citation_ids: string[]` machinery already supports many-to-many composition; widening the citation schema is duplicative.

**(c) Introduce a `CitationGroup` aggregate type.** Heaviest option. Would add a new type, a new registry, scanner support, hook handling. Rejected because the existing claim-level array already gives us the join. Adding a third structural concept just to express "these citations belong together" is over-engineering when claims already do that job.

## Consequences

**Positive:**
- No schema change. The existing `Citation.section?: string` (singular) and `ClaimEntry.citation_ids: string[]` (many) types already support this pattern.
- Each guideline section remains an independently-citable entity. If `§4.6.1` is later updated by an AHA/ASA focused update, the freshness/`last_reviewed` workflow operates per section, not per summary card.
- The pre-commit claims hook (`scripts/check-claims.ts`) needs no modification — it already validates `citation_ids: string[]` arrays.

**Negative:**
- Claim IDs proliferate. We'll have ~17 new `<question-slug>-guideline-summary` claims, one per pilot question. This is appropriate (each card is a distinct claim surface with distinct verifiable content) but bloats `claims.ts`.
- The `GuidelineSummaryCard` rendering layer must handle the heterogeneous shape — a card with one citation looks different from a card with three. Visual treatment must scale.

**Operational:**
- Phase 1 implementation begins with one pilot card (`anticoagulation` question, citing only `aha-asa-2026-4.9`). Single-citation case validates the rendering layer.
- Phase 2 expands to 5–8 high-traffic questions, including at least one multi-citation example (recommended: `minor-stroke-choice` for §4.6.1 + §4.8) to validate the multi-citation rendering before broader rollout.
- Phase 3+ completes the remaining 9–11 questions in batches.

## Implementation reference

Pilot file structure:

```
src/components/trials/GuidelineSummaryCard.tsx   # presentation primitive
src/data/guidelineSummariesByQuestion.ts          # question-slug → claim-id map
src/lib/citations/claims.ts                       # new <slug>-guideline-summary entries
```

The summary content (verbatim quoted_text, COR, LOE, section name) is resolved at render time from `CITATION_REGISTRY[citationId]`. The card itself contains no clinical text — it renders whatever the registry holds. This keeps the claim-author flow inside the registry / `aha2026StrokeGuideline.ts` reference data, where it can be audited.

`data-claim="<slug>-guideline-summary"` tags the wrapper element so the pre-commit scanner can verify the claim ID resolves.

## Open questions (deferred to implementation review)

- Should the card show all citations inline, or collapse to a single primary citation with "see also" chips? Visual decision; defer to V on first pilot.
- Should "linked trials" within the card body deep-link to `/trials/<slug>` or open the trial modal? Routing decision; defer to UI implementation.
- How does the card handle a question with NO guideline match (e.g., `crao-management`)? Render nothing; do not show an empty card. The mapping file simply omits those questions.

## References

- Architect §17.1: `docs/reviews/arch-citation-aha-2026-4.9-2026-05-22.md`
- Source guideline: Prabhakaran et al., Stroke 2026;57:e00-e00. DOI: 10.1161/STR.0000000000000513
- Existing structured data: `src/data/aha2026StrokeGuideline.ts` (1,129 lines, all sections covered)
- Claim schema: `src/lib/citations/schema.ts`
- Claim registry: `src/lib/citations/claims.ts`
