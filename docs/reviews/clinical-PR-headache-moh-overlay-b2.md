# Clinical review — Class D Stage 4: MOH overlay (§8.2) + B-2 red-flag change

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-08
**Class:** D (structural, ADR-2026-07-06 Stage 4 — final stage) + B-2 safety-layer change
**Architect artifact:** [arch-headache-subtypes-moh-overlay.md](arch-headache-subtypes-moh-overlay.md) (condition 4: overlay must be a distinct structure, not a phenotype)

## Scope
- **Claims touched:** `clinic-headache-ichd3-moh` (new).
- **Citations affected:** `ichd3-2018` (`quoted_text` += verbatim §8.2 A/B/C + overuse thresholds + "code alongside"; `section` += 8.2).
- **Surfaces changed:** structured data (`Overlay` type + `detectOverlays` + 2 MOH chips; `RED_FLAG_CHIPS`/picker/workup maps with `rf-painkiller-overuse` removed), computed strings (overlay banner + note), question flow (`b-moh` branch), claim marker.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`, `src/components/pathways/headache/HeadacheSafetyScreen.tsx`, `src/pages/ClinicHeadachePathwayV4.tsx`.

## Semantic validity
- **§8.2 faithful.** The overlay gate `(moh-overuse-simple-ge-15 OR moh-overuse-specific-ge-10) && freq-ge-15-per-month && pattern-ge-3-months` correctly encodes criterion A (headache ≥15 d/mo) + criterion B (regular acute-drug overuse for >3 months, at the correct class-specific threshold). Chip labels reproduce the source drug-class lists + thresholds exactly (simple analgesics ≥15 d/mo per §8.2.3; triptans/ergots/opioids/combination/multiple ≥10 d/mo per §8.2.1/.2/.4/.5/.6). `quoted_text` gained the verbatim §8.2 A/B/C + threshold + "code alongside" text. No never-drift violation; the "plan a withdrawal strategy / code alongside" note is management guidance, not an over-claimed efficacy statement. The `pattern-ge-3-months` (labeled ≥3 months) proxy for ">3 months" is the pre-existing engine-wide convention (identical to ctth-A, cm-A, hc-A, ndph-A, hypnic-C), not new drift.
- **Coded ALONGSIDE the primary (architect condition 4).** MOH is a genuinely distinct structure — a separate `Overlay` type + `detectOverlays` pass beside `evaluateHeadachePhenotypes`, rendered as an "Overlay · code alongside the primary" banner — and a test asserts it never appears in the phenotype output. It codes *with* the primary (e.g. "chronic migraine + MOH"), never instead of it.

## B-2 safety correctness
`rf-painkiller-overuse` is removed **symmetrically** from both `RED_FLAG_CHIPS` and the `SNNOOP10_FLAGS` picker; the bidirectional C1 drift-guard (picker set == `RED_FLAG_CHIPS`, with size equality) proves only painkiller-overuse was dropped and **all 15 genuine danger flags remain intact and selectable**. Because `anyRedFlagActive` returns true on any member of `RED_FLAG_CHIPS`, a patient with painkiller overuse **plus** a genuine danger flag (e.g. thunderclap) still short-circuits to secondary-cause workup on that other flag — overuse simply no longer *by itself* forces an imaging emergency, which is correct (MOH is reversible, managed by withdrawal + preventive initiation, not a secondary-cause workup).

## Citation accuracy & freshness
`ichd3-2018` resolves (PMID 29368949); `section` includes 8.2; the claim resolves and `quoted_text` supports it. `last_reviewed: 2026-05-25`, window 24 months → within window; §8.2 read verbatim this session; no §13.6 refresh triggered.

## Rationale
A faithful §8.2 encoding delivered as a genuine overlay (coded alongside the primary, never a phenotype), with a clinically correct and safety-safe B-2 change (all danger flags intact; overuse-plus-danger still routes to workup). No fabricated criteria, no never-drift drift, claim binds and resolves.

## Required follow-ups
- None blocking. **Non-blocking (optional future iteration):** the red-flag short-circuit branch of `HeadacheResultV4.tsx` does not render `overlays` — a patient who trips a danger flag AND meets MOH criteria sees only the workup screen. Clinically defensible (workup precedence; the overuse chip cannot itself trip the flag), but surfacing the MOH overlay alongside the workup content once secondary causes are excluded would avoid losing the reversible complication from view. Tracked, not a merge condition.

## Verification state at gate time
- `npx vitest run` → 261/261 (8 new: MOH overlay present/absent variants, MOH-is-overlay-not-phenotype, B-2 removal); `tsc --noEmit` clean; `check:humanizer` PASS; `check:claims` pass; production build 171/171 prerendered.
