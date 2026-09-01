# Architect review — §4.6.3 recheck: Path C vessel-attribution split

**Decision:** approve-with-conditions
**Reviewed:** plan + implementation
**Reviewer:** system-architect (model: claude-opus-5)
**Date:** 2026-09-01

## Rationale
One additive state field, one file, no new dependency, no boundary crossed, no state hoisted above its only reader. The encoding follows the file's own idiom rather than inventing a third way to model a multi-step gate, and the safety-critical coherence direction is provably closed: there is no reachable state in which `isCriteriaComplete` reports Path C finished while `getResult` returns null. The one structural defect is the mirror of that: `isCriteriaComplete` gained a guard that `getResult` did not, so the two functions are no longer structurally identical, and the only thing preventing that asymmetry from producing an affirmative Eligible verdict on an incomplete section is an invariant living two components away in `PathwayCategoryRow`. Unreachable today, wrong silently the day someone adds a clear-answer control to a row that already reopens for revision. One line closes it.

## Rubric
| # | Item | Score |
|---|---|---|
| 1 | Duplication risk | concern (pre-existing; adds a 14th verdict literal and a 4th Path C row) |
| 2 | Boundary integrity | pass |
| 3 | Composability | pass |
| 4 | State locality | pass |
| 5 | Dependency weight | pass |
| 6 | Migration exit | pass (clean `git revert`, one file) |

## Finding 1 — completeness/verdict coherence
`isCriteriaComplete` has nine gates, `getResult` had eight; the missing one was `cLvo === true && cLvoTerritory === null`.

Direction A (complete-but-no-verdict) is closed provably: every state making `isCriteriaComplete` true maps onto a `getResult` branch returning a verdict.

Direction B (verdict-but-not-complete) was open in principle and unreachable in practice, because the only writers of territory are the row (never passes null) and `clearCriteriaAnswers` (nulls `cPenumbra` in the same call). The consequence had it ever been constructed is not cosmetic: Step 3 would render locked, but `onResultChange` is an effect on `result` rather than on completeness, and `copySummary` guards only on `!result`, so an Eligible EMR block could be exported with nothing on screen to contradict it.

**Resolved by condition A1 (applied).**

## Finding 2 — stale `cLvoTerritory` is not a leak, and no reset should be added
Flipping LVO yes → territory other → LVO no is shadowed in both memos by `cLvo === false` being the first gate. Territory is not an input to `getPathStage`, so it cannot influence routing, and every user-driven mutation that can change `pathStage` already calls `clearCriteriaAnswers()`. A reset-on-parent-change would DIVERGE from the file's uniform first-failing-gate-wins idiom (`setARecognition` does not clear `aDwiSmall`; `setBCtpCore` does not clear `bCtpMismatch`; `setCLvoEvt` does not clear `cLvoBarrier`) and would break the reopen-and-revise behaviour. **Not adopted, deliberately.**

## Finding 3 — two fields versus a widened union
Shipped encoding is correct. A union has no member to write on row 1 for "yes, territory not yet asked", so it would need a fifth member plus a collapse function: same count of representable-but-meaningless states, worse readability, and a rewrite of ten clinical control-flow edges the clinical reviewer just signed off. The illegal pair is ruled out by gate ordering instead. **Condition A2 records the trade-off in-code (applied).**

## Finding 4 — consistency with existing multi-step gates
Follows the pattern on every axis: one field per question declared beside its siblings; a nullable string union matching `cLvoBarrier`, `onsetMode`, `imagingModality` and the `MigrainePathway` precedent; a compound render gate matching Path B; `defaultOpen` matching every other row and satisfying `PathwayCategoryRow`'s documented invariant.

## Finding 5 — duplication (pre-existing, recorded not refactored)
The boolean row adapter is copied ~10 times (candidate `PathwayYesNoRow`); the verdict object literal is now 14 copies whose optional-field discipline both `buildEmrText` and `onResultChange` depend on. The new neutral verdict gets that discipline right, but by hand.

## Note — interaction with C6 (9 h → 4.5 h)
No new coupling with `getPathStage`. Cost lands in the two consumer memos, whose Path C chain is now nine gates over six fields, forked twice by hand. Recommendation for C6: extract `evaluatePathC(state): { complete, verdict }` as one pure function consumed by both memos before widening the window; that makes asymmetry unrepresentable and the result exhaustively unit-testable. Precedent: `headacheResultV4.invariants.test.tsx`.

## Required follow-ups
- **A1** guard symmetry in the result memo — **applied**
- **A2** encoding trade-off recorded in-code — **applied**
- **A3** §15 acceptance entry + §16 rollback note in TASKS.md — **applied**
- **A4** `getCriteriaSummary()` label for the 'other' terminal — **applied** (the mismatch was introduced by this change)
- **A5** tech-debt entry: boolean row adapter (~10 copies) and 14 verdict literals — logged
- **A6** routes to C6: `ExtendedIVTPathway.tsx` Path C Eligible details hard-codes "9 to 24 hours" and the "operates from 9 hours" clause, both false once C6 lands; prefer the `evaluatePathC` extraction first — logged

## Blocking issues
None.
