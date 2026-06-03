# Architect review — PR #trial-title-heading-extraction

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude opus 4)
**Date:** 2026-06-03

## Rationale

This is Phase 2 of the extraction sanctioned in arch-PR-trial-header-bar-extraction.md condition #2, delivered as its own PR with all 41 `tm`-aliased variant titles enumerated as required. The change collapses 105 byte-identical `<h1>` blocks in `src/pages/trials/TrialPageNew.tsx` into one presentational `<TrialTitleHeading>` — textbook duplication removal, not a third way to do the same thing. `src/components/trials/TrialTitleHeading.tsx` sits beside its Phase 1 sibling `TrialHeaderBar`, so boundary integrity and the established convention hold: the component takes primitive props, the markup is reproduced verbatim (className and `{title}: {subtitle}` body unchanged), and no `trialMetadata`-derived clinical text is hoisted. I verified all 1167 diff lines: every removed line is title-`<h1>` markup, every added line is a single `<TrialTitleHeading>` call, all four enumerated colors appear at their stated frequencies, and surrounding JSX (`{tm.questionLede}` conditional, question ledes, source rows) is untouched. The codemod's back-referenced `(?<var>trialMetadata|tm)` capture is the key safety property — title and subtitle must reference the *same* object or the block is skipped, so the dual var-name pass-through is provably safe (both are the same per-branch metadata object, just under a local alias). The `{` / `}` guard on the captured color expression correctly rejects any color value that is not a flat JSX expression.

The one structural judgment call is passing the *resolved color expression* through as a `color` prop rather than a tone enum. This is the same un-lifting principle that kept `categoryBadgeLabel` at the call site in Phase 1, and it is the right call for *this* PR: it keeps the diff purely mechanical and the render byte-identical, which is exactly what makes the clinical byte-diff verification tractable. The cost is real but bounded — the component does not own its color vocabulary, so the `isPositive`/`isHarm` → cobalt/ink/maroon mapping stays scattered across 15 call sites and the same four-color tuple is re-typed at each branch. That is a leaky abstraction worth naming, but not worth blocking: lifting it now would convert a mechanical, render-identical diff into a semantic one and undercut the verification strategy. It belongs in a follow-up tone-enum cleanup once the mechanical extraction has landed and been confirmed clean. The risk profile is identical to Phase 1 (single-file, many-site, silent-render-change exposure) and is mitigated the same way — codemod-generated (not hand-edited), idempotent with `--limit` batching, and byte-diff verifiable.

## Required follow-ups (conditions — all must hold)

1. Land via the codemod in batches (`--limit`), gates green per batch; do not hand-edit the 105 sites. The codemod is idempotent, so a partial run is safe to resume.
2. Before batch 1, extend the existing Phase 1 render snapshot test to assert the page-title `<h1>` (text + resolved color) for one sampled trial ID per color variant: a plain `'#1746A2'` site, an `isPositive ? '#1746A2' : '#1e293b'` site (e.g. BEST-MSU), a plain `'#1e293b'` site (e.g. ENCHANTED), and an `isHarm ? '#7f1d1d' : '#1e293b'` site (e.g. OPTIMAL-BP, NOR-TEST 2). Byte-diff rendered HTML on 2–3 representatives pre/post.
3. Confirm the three excluded headers remain untouched in the final file: the expanded multi-line EXTEND `<h1>`, the "Trial Not Found" error `<h1>`, and the catalog-fallback `<h1>` with the year span. The codemod regex does not match them by design; verify post-run that all three still render.
4. Rollback note in the PR body — single-file `git revert` of the codemod commit(s); component file deletion is trivial. Required for Class D.
5. Clinical-reviewer gate before merge: this is `-clinical`-flagged because the touched file is a clinical surface (`src/pages/trials/`). The structural pass confirms no `trialMetadata`-derived title/subtitle text changed; the clinical gate must ratify that independently. Route to clinical-reviewer per §6 Class D-clinical.
6. File a follow-up tech-debt item (not this PR): replace the color-as-prop with a `tone` enum (`positive | neutral | harm` → resolved color) once this mechanical extraction is confirmed clean, so the component owns its color vocabulary and the four-color tuple stops being re-typed at every call site.

## Blocking issues

None. Conditions above are non-blocking but mandatory before merge.
