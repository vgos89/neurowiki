# Architect review — Extended IVT pathway: Path C reorder + sICH caution

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-07-19
**Scope:** `src/pages/ExtendedIVTPathway.tsx` (Class E). Three edits — (1) territory-agnostic Path A size wording, (2) Path C 9–24h reorder so LVO is asked before penumbra + setup-level LVO clarifier, (3) single guideline-level sICH caution on every Eligible verdict plus a TRACE-III numeric line on Path C.

## Rationale

All three edits are confined to `ExtendedIVTPathway.tsx` and its render logic. The sole other consumer, `src/components/article/stroke/ExtendedIVTPathwayModal.tsx`, imports and re-renders `ExtendedIVTPathway` (lines 19, 94-98) rather than duplicating any copy, so no edit needs mirroring and duplication risk is clean. No boundary is crossed, no dependency added, blast radius is one file. EDIT 2 is the only structurally interesting change: the reorder touches two order-sensitive `useMemo` short-circuit blocks. Three of the five locations the plan named do not read the `cPenumbra`/`cLvo` ordering and require no change. The material risk is semantic, not structural: swapping which question is asked first changes which "Not Eligible" reason surfaces for a patient who is both non-LVO and non-penumbra (today "No salvageable penumbra"; after the swap the non-LVO verdict). That, plus EDIT 1 rewording and EDIT 3 caution text, are clinical-content judgments routed to clinical-reviewer.

## The concrete reorder change-list (EDIT 2)

**Must change — order-sensitive:**

1. **JSX, lines 1090-1127.** Move the `cLvo` question block (1110-1127) above the `cPenumbra` block (1090-1108). `cLvo`, currently gated `{cPenumbra === true && (…)}`, becomes unconditional within Path C; `cPenumbra` becomes gated on `{cLvo === true && (…)}`. The C-LVO sub-branch at line 1130 (`cPenumbra === true && cLvo === true`) is order-independent — keep both predicates. Add the "beyond 9h a qualifying LVO is required" setup clarifier adjacent to the COR-2b amber callout at lines 1085-1088.

2. **`isCriteriaComplete` Path C branch, lines 352-360.** Reorder early exits so the first-asked question gates first:
   - `if (cLvo === false) return true;` first
   - then `if (cLvo === null || cPenumbra === null) return false;`
   - then `if (cPenumbra === false) return true;`
   - remainder (`cLvoEvt` / `cLvoBarrier` / `cExpertise`) unchanged.

3. **`result` `useMemo` Path C branch, lines 437-444.** Same reorder:
   - non-LVO verdict (440-444) moves to top of branch
   - then `if (cLvo === null || cPenumbra === null) return null;`
   - then no-penumbra verdict (438)
   - Both early-exit verdict objects remain reachable; only evaluation order flips.

**Named in plan but does NOT need to change (verified):**
- `getPathStage` (89-153): never reads `cPenumbra`/`cLvo`; Path C availability is purely time/onset-derived. No change.
- Auto-advance `useEffect` (495-502): depends only on `isSetupComplete` and `pathStage`. No change.
- `getCriteriaSummary` (520-526): returns static `'Path C · Late LVO'`. No change.
- Also inert: `clearCriteriaAnswers` (529-533) resets both regardless of order; `buildEmrText` reads only `result.*`.

**Verdict correctness after swap:** the non-LVO verdict becomes the first early exit and stays correct; the no-penumbra verdict is only reachable after `cLvo === true`, which is clinically coherent (penumbra asked only once LVO confirmed). Behavioral delta for clinical sign-off: a both-negative patient exits on the LVO reason instead of the penumbra reason.

## EDIT 1 assessment

Display-only. The line 899 header string drives nothing; `aDwiSmall` is set purely by `onChange` (line 910). Caveat: the same "1/3 of the MCA territory" framing repeats in `result.details`/`reason` (line 392) and the option description (line 906). All three must be made territory-agnostic together to avoid copy drift.

## EDIT 3 placement

Put the single sICH caution in the drawer body, immediately adjacent to the existing contraindication callout at lines 1472-1480, gated on the same `result.eligible`. One insertion point. The inline result card was retired 2026-05-22; the drawer (`data-drawer="content-extivt"`, 1427-1482) is the canonical recommendation surface, and all three eligible verdicts render through this one `result.eligible` block. Do NOT also place it in the inline Dosing block (1240-1285); that splits safety messaging and mixes it with dosing. The TRACE-III numeric line is Path C only — gate on `result.path === 'C-LVO'`.

## Required follow-ups

- Route the clinical portions of all three edits to clinical-reviewer before execution (Class E gate).
- Resolve the MCA-phrasing consistency across lines 899 / 392 / 906 in the same EDIT 1 change.
- Keep the C-LVO sub-branch predicate at line 1130 explicitly `cLvo === true && cPenumbra === true` after the reorder to avoid stale-gating.
- The new sICH caution is a guideline-level clinical claim needing a citation-registry entry, `last_reviewed`, and a `data-claim` tag. The existing callout at 1476 carries no `data-claim` — confirm scanner coverage for this static-JSX surface.

## Blocking issues

None.
