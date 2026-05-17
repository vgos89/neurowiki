# Architect review — Pattern A fix · ExtendedIVTPathway rebuild (Commit 2, single-commit)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-17

## Rubric scoring

| # | Item | Score | Rationale |
|---|---|---|---|
| 1 | Duplication risk | concern | Retires bespoke `CompactSelectionCard` (lines 153–209, 14 call sites) + result rendering through CalculatorDrawer. Net negative. But: TIER_TOKENS reaches **4** inlined copies (EVT + Migraine + new ExtendedIVT + PathwayBottomDrawer source). Quadruplication extends the open extraction debt — must remain on the books. |
| 2 | Boundary integrity | pass | Drawer is UI primitive; `result.reason`/`details` move into it as children. `getPathStage`, `result` useMemo, TRIALS registry, `trialList` untouched. Clinical text preserved by construction. |
| 3 | Composability | pass | All primitives consumed already exist + battle-tested. ExtendedIVT is the 4th pathway — validation case. No new primitives. PathwayHeader from Commit 1 is a clean header-shape consumer. |
| 4 | State locality | pass | No state hoisting. `activeSection`, `lkwTimestamp`, `onsetMode`, all path A/B/C answers stay. New `drawerExpanded` lives at drawer call site. |
| 5 | Dependency weight | pass | No new external dependencies. |
| 6 | Migration exit | concern | Single-file (~1325 → ~1400 LOC est.) but high surface delta. Revert clean as `git revert`. PathwayHeader consumer reverts cleanly if Commit 1 ships first. Needs explicit rollback note. |

## Rationale

The shape fits, and this is the easiest of the four pathway rebuilds — every primitive being consumed is already battle-tested by EVT (Tier 4), Migraine (Tier 5), and SE (Tier 1). Tier 5 Migraine shipped a comparable single-commit rebuild and stayed clean.

Three structural facts about this file shape the conditions:

**1. No cascade-event infrastructure exists.** ExtendedIVT uses `clearCriteriaAnswers()` bulk-wipe pattern (12 call sites) instead of EVT's field-level cascade model. PathwayCascadeNotice would fire on bulk resets, not field-level changes. **Skip PathwayCascadeNotice entirely** — SE Tier 1 precedent.

**2. State B (provisional verdict) applicability is limited.** `result` only computes when `isSetupComplete && pathStage` is true; path-specific criteria are required for the verdict. There is no "decided enough to read a provisional, imaging pending" state. **Use State A and State C only. Skip State B.**

**3. Auto-computed time badges are clinical-pattern surfaces.** Lines 889–904 (wake-recognition badge) and 955–973 (sleep-midpoint badge) render emoji glyphs (✅/❌) with color-cued borders. These should become **§4.7 Outcome Row instances** — same pattern, no emoji, badge-shaped, token-cued color.

## Required follow-ups (conditions for approve)

1. **No PathwayCascadeNotice.** ExtendedIVT uses `clearCriteriaAnswers()` bulk-wipe; no field-level cascade surface to annotate. SE Tier 1 precedent.

2. **Drawer States: A + C only, no State B.** Verdict goes from "no inputs/pending" (A) directly to "full verdict" (C). Skip `stateBTappable`. Document in PR body and flag to clinical-reviewer.

3. **TIER_TOKENS inlined at call site (4th copy).** Accept inlined quadruplication. Extend the existing extraction follow-up: "Extract TIER_TOKENS to `src/lib/pathways/tierTokens.ts` after PathwayBottomDrawer.tsx retirement — now applies to EVT + Migraine + ExtendedIVT call sites (3 inlined copies to consolidate)."

4. **Auto-time-badge surfaces (lines 889–904, 955–973) become §4.7 Outcome Rows.** Drop emoji glyphs per §4.7 anti-pattern. Use icon (`Check` / `AlertTriangle`) + token-cued color (emerald within-window, red outside).

5. **TRIALS registry preserved byte-for-byte.** Confirm in PR body: `TRIALS` constant (lines 50–58), all journal/year/cor strings, `trialList(names)` (lines 146–151) round-trip unchanged. THAWS = `Stroke 2020`, ECASS-4 = `Int J Stroke 2019`, TIMELESS = `NEJM 2024 cor: '—'`, TRACE-III = `NEJM 2024 cor: '2b'`. These corrections (commits f6426a2, c44f92f) are load-bearing.

6. **CLIN-2 verbatim phrase inventory** before execution:
   - All 11 `result.reason` + 11 `result.details` strings in the useMemo (lines 380–469) — exact-quote claims like "ICA or MCA (M1/M2) occlusion 9 to 24 hours from last known well", "core ≥ 70 mL", "EXTEND trial excluded patients with core ≥ 70 mL", "TRACE-III's inclusion was restricted to ICA/M1/M2"
   - All `LearningPearl` content (WAKE-UP, EXTEND, Path C Trials pearls) — trial-name + year + journal triples + statistics ("53.3% vs 41.8%", "adjusted RR 1.44 (95% CI 1.01–2.06; P=0.04)", "NNT ≈ 17")
   - §4.6.2/§4.6.3 agent-preference tooltip strings (lines 1217, 1220) — guideline-section citations

7. **`getPathStage` and `result` useMemo preserved byte-for-byte.** Both are clinical interpretation logic. JSX shell only. State explicitly: "Lines 80–144 and 376–475 untouched."

8. **`sectionRefs` decision** — Tier 4 condition 3 precedent (delete the auto-scroll effect; don't leave dangling refs). Same approach.

9. **`isInModal` / `hideHeader` / `onResultChange` props preserved.** ExtendedIVT is consumed by other surfaces (`IVTResult` external type at lines 23–28). Embedded consumers must not regress.

10. **Single-commit feasibility: yes, with hard ordering dependency on Commit 1.** State in PR body: "Depends on Commit 1 (PathwayHeader). Merge order: Commit 1 → this commit."

11. **`max-w-3xl` → `max-w-2xl`** (lines 640 + 647) per spec §9.

12. **No `alert()` migration needed** — confirmed absent.

13. **Bespoke `CompactSelectionCard` deleted once unused** (lines 153–209). Confirm dead-code removal in same commit.

14. **Rollback note in PR body.** "Single-file change. `git revert <SHA>` restores prior render shape in one step. TIER_TOKENS 4-copy debt remains on extraction follow-up."

15. **Route the §17.2 clinical-reviewer artifact** for: CLIN-2 preservation (condition 6), TRIALS preservation (condition 5), `getPathStage`/`result` preservation (condition 7), State A/C-only drawer design (condition 2), auto-time-badge re-skinning (condition 4). **Class D-clinical.**

## Blocking issues

None.

---

**Files inspected**
- `src/pages/ExtendedIVTPathway.tsx` (full, lines 1–1323)
- `src/pages/EvtPathway.tsx` (lines 85–253 — TIER_TOKENS + types pattern)
- `src/components/pathways/PathwayRail.tsx`, `PathwayCategoryRow.tsx`, `PathwayLearningPearl.tsx`, `PathwayBranchChip.tsx`, `PathwayCascadeNotice.tsx`, `PathwayCocktailSummary.tsx`, `PathwayBottomDrawer.tsx`
- `docs/reviews/arch-pattern-a-fix-tier-4.md`, `arch-pattern-a-fix-tier-5.md`
- `src/components/pathways/PathwayHeader.tsx` — **does not exist yet; ships in Commit 1**. Hard ordering dependency flagged in condition 10.
