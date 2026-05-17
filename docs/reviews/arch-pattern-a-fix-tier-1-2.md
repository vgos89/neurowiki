# Architect review — Pattern A fix Tier 1 + Tier 2

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-16

## Rationale

The plan is structurally sound and well-scoped. Tier 1 fixes are local edits to four primitive files, each with a clean spec citation and a small blast radius. Tier 2 is a repeated 6-change sweep across three pathway header blocks that all currently render the same out-of-spec anatomy — applying the same edit three times is the right call given the headers haven't diverged enough to warrant a new shared `PathwayHeader` primitive yet, and the orchestrator was right to defer that extraction. The composability question on Copy resolves trivially: all three target files already expose `copySummary` with the same name and `() => void` shape — no standardization work needed.

The plan has three real risks, all addressable as conditions rather than blockers:

1. The A-4 type-narrowing change (`variant: 'danger'` removed from `CategoryOption`) **will break the TypeScript compile** at five known call sites unless those five edits ship in the same commit as the primitive change.
2. Tier 1 followed by a separate Tier 2 push leaves the live site in a half-fixed visual state for the Vercel deploy window (≥60s per Gate 6).
3. The A-1 rail fix (switch from absolute-positioned zero-height div to `border-l` on the column) must ship together with the A-2 node-centering fix; the audit already bundles them.

The drawer-migration dependency check (Tier 4/5 overwriting Tier 2 work) comes back clean: the spec puts the Copy button in the **header** (§2), not in the drawer. Tier 2 Copy work is not wasted.

## Rubric scores

| # | Item | Score | Rationale |
|---|---|---|---|
| 1 | Duplication risk | pass | Plan retires duplicate step indicators in favor of the single rail. Net negative duplication. |
| 2 | Boundary integrity | pass | Primitive changes stay in primitives; pathway changes stay in pages. |
| 3 | Composability | concern | Per-file header × 3 instead of `PathwayHeader` primitive — acceptable for now, flag for follow-up. |
| 4 | State locality | pass | No state changes; `copySummary` stays per-pathway. |
| 5 | Dependency weight | pass | No new deps; lucide `ArrowLeft` removed; use inline SVG for Lightbulb. |
| 6 | Migration exit | concern | 7 files combined — above §6 5-file threshold but mechanical, `git revert`-safe, no flag needed for chrome-only changes. |

## Required follow-ups (conditions for approve)

1. **Ship Tier 1 + Tier 2 as a single commit.** The A-4 primitive type change requires same-commit updates to five call sites to compile; shipping Tier 1 alone leaves the header visually broken during the Vercel deploy window.

2. **Five `variant: 'danger'` call sites must update simultaneously with A-4:**
   - `src/pages/EvtPathway.tsx` line 1150 (mrs option `'no'`)
   - `src/pages/EvtPathway.tsx` line 1202 (mevoDependent `'yes'`)
   - `src/pages/EvtPathway.tsx` line 1410 (mass effect 0–6h)
   - `src/pages/EvtPathway.tsx` line 1511 (mass effect 6–24h)
   - `src/pages/StatusEpilepticusPathway.tsx` line 601 (ESETT `opt.status === 'avoid'`)

   Note: the `Result.variant` field at `EvtPathway.tsx:159` and `ExtendedIVTPathway.tsx:40` is a separate type and is NOT affected by A-4. Similarly, `ElanPathway.tsx` / `ExtendedIVTPathway.tsx` `SelectionCard` local `variant` props are unrelated.

3. **A-1 + A-2 ship atomically.** Removing `style={{ height: '0' }}` without applying the negative `margin-left` to center the node produces a visible rail with an off-center dot — worse than the current invisible-rail state. Treat as one edit.

4. **Park follow-up: extract `PathwayHeader` primitive after Tier 5 lands.** Anatomy is identical across all three pathways now; next edit pass triggers extraction.

5. **A-3 PathwayLearningPearl icon: inline SVG, not lucide.** Continuing the inline-SVG convention used by `STEP_ICONS` in `PathwayRail.tsx` (line 18 comment). A 14px sparkle or lightbulb path is ~5 lines.

6. **Spec confirms B-1 (header dot removal):** §3.9 — "The horizontal strip is abolished; there is no strip element in the header or immediately below it."

7. **Spec confirms B-4 (`text-[15px] font-semibold`):** §2 line 61 — full class is `text-[15px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5`. Don't forget `mt-0.5 leading-tight tracking-tight`.

8. **Spec confirms B-5 (PATHWAY eyebrow):** §2 lines 58–60. Eyebrow class `text-[10px] font-bold text-slate-400 uppercase tracking-widest`, content is the plain string `PATHWAY` — never the clinical-area name.

9. **Spec confirms B-6 (Copy pill):** §2 lines 74–79. Exact class: `ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]`. Label is plain text `Copy`, no icon. All three pathways have `copySummary: () => void` — wire directly.

10. **Gate 6 live verify required.** Touches `src/pages/` + `src/components/pathways/`. After push, WebFetch `/pathways/evt` (canary) and confirm 200 + sensible content. One of three pathways sufficient at this risk class.

## Blocking issues

None. All ten conditions are pre-execution check-the-box items, not structural blockers.
