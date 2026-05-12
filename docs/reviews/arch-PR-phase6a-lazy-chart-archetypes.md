# Architect review — Phase 6A: Lazy-load chart archetypes in TrialPageNew

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-12

## Rationale
The plan is structurally sound and matches existing conventions: the `React.lazy(() => import(...).then(m => ({ default: m.Named })))` shape already used in `src/App.tsx` for named-export modules is reused verbatim, so no third pattern is introduced. Boundaries are respected — `MarkdownSection.tsx` is a new presentational wrapper in the existing `src/components/trials/` namespace, and clinical data files are explicitly excluded. No new dependency is added; `react-markdown`, `remark-gfm`, and recharts are already in `package.json` and merely move from the eager graph to async sub-chunks. The migration exit is cheap: 2 files touched, no shared abstraction renamed, no schema change, revert is a single-file git revert. Two structural concerns: (a) `src/components/trials/SubgroupWell.tsx` also imports `GrottaBarChart` statically, so depending on Rollup's chunk-graph behavior the archetype module may still be reachable from an eager path inside the TrialPageNew chunk — the post-build chunk verification must explicitly confirm this; (b) `DeltaBandChart` has ~60+ call sites in TrialPageNew.tsx, and wrapping each individually creates high surface area for omission bugs — a single outer `<Suspense>` per chart-heavy section is strongly preferred. Neither concern is blocking.

## Required follow-ups
- After `npm run build`, verify the archetype chunks are actually split out and `TrialPageNew` main chunk is <500 kB. If `SubgroupWell.tsx`'s static import of `GrottaBarChart` keeps the archetype module in the parent chunk, decide whether to lazy-load it there too or accept the smaller-than-expected reduction. Record before/after chunk sizes in the PR description.
- Hoist `<Suspense fallback={<ChartFallback />}>` to enclose contiguous chart-heavy regions rather than wrapping each of the ~60+ instances individually. Same fallback UX, far less surface area for omission bugs.
- `MarkdownSection.tsx` public interface must be `{ content: string }` only. The component-overrides map moves inside the wrapper — do not re-leak react-markdown types into the parent module.
- Include a one-line rollback note in the PR body per §14: "revert commit; no data migration."
- No clinical content is touched; `-clinical` flag does not apply; no routing to `clinical-reviewer` required.

## Blocking issues
None.
