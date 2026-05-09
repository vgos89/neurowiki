# System Architecture Audit — NeuroWiki

**Reviewer:** system-architect (claude-sonnet-4-6)  
**Date:** 2026-05-08  
**Scope:** Full-repo structural audit (read-only). Findings are hypothesis-tier input to future plans.

## Overall Rating: YELLOW

The runtime architecture is sound — manifest-driven static routing with code-split lazy pages, a dedicated dynamic trial route, route-validation in pre-commit, and a citation governance schema designed in advance of population. Yellow flags are organizational: legacy directory parallels (`agents/` vs `.claude/agents/`), unmaintained worktrees inside `.claude/`, root-level audit-MD sprawl, an outsized monolith page (`TrialPageNew.tsx` ~7,469 LoC), and a citation infrastructure that is **architecturally complete but operationally empty** (`registry.ts` missing, `CLAIM_REGISTRY = {}`). Nothing is a runtime block. Everything is a maintainability tax that compounds as content and contributors grow.

---

## Findings

### Routing

**R1 — `stroke-basics` and `pathways-stroke-code` both map to `<StrokeBasics />` (P2)**  
Two distinct URLs render the same component with no annotation. Legitimate for SEO surface reuse, but when they diverge (different intro copy, different layout zone) the regression will be invisible. Recommended fix: annotate `ROUTE_COMPONENTS` with the intentional duplicate, or create a thin `<StrokeCodePathway />` wrapper so the divergence point is structural.

**R2 — `reactSnap.include` lists redirected routes (P2)**  
`package.json` pre-renders `/calculators/evt-pathway`, `/calculators/late-window-ivt`, `/calculators/elan-pathway`, `/calculators/se-pathway`. Every one of these is a `<Navigate>` redirect in `App.tsx`. React-snap produces static HTML that immediately client-bounces — wasted prerender and possible duplicate-content SEO signal. The `validateRouteManifest.mjs` already blocks these from re-entering the static manifest; the `reactSnap.include` list never got the same memo. Recommended fix: programmatically derive `reactSnap.include` from `STATIC_SITEMAP_ROUTES`.

**R3 — Routing pattern itself is sound (Pass)**  
Manifest-as-source-of-truth, `STATIC_ROUTE_DEFINITIONS` driving `<Routes>` via `.map`, dynamic routes appended explicitly, lookup helpers derived from one array. The validator enforces meta completeness, layout-spec fields, no pathway-route leakage. Good guardrails.

---

### Data Architecture

**D1 — `Home.tsx` transitively static-imports the full `TRIAL_DATA` (P1)**  
Trace: `src/pages/Home.tsx` → `src/data/scenarios.ts` → `src/data/trialListData.ts` → `src/data/trialData.ts` (9,781 lines). Even though `trialListData.ts` only calls `findTrialById(...)`, the entire `TRIAL_DATA` object literal is reachable from the home-route chunk. Vite/Rollup will not tree-shake a dynamically-accessed object literal. Net effect: the landing page bundle pays for the full trial corpus.  
`TrialPageNew` avoids this correctly via `trialPayload.ts` dynamic `import()` — replicate that pattern on the home/scenarios path.

**D2 — `trialData.ts` (9,781 LoC) and `TrialPageNew.tsx` (7,469 LoC) are both monoliths (P1)**  
`TrialPageNew` handles 79 trials across four+ display archetypes. Clinical interpretation copy, layout decisions, and data normalization (`sanitizeLegacyTrialContent`, `formatTrialArm`, `buildTrialSummaryItems`) all live in the page file. Every clinical-reviewer pass on a trial navigates 7.5k lines. Recommended fix (Class D): extract trial archetype dispatch into a `<TrialArchetype trial={...} />` component family, push `sanitize*` utilities into `src/utils/trialContent.ts`, let `TrialPageNew` become a layout shell.

**D3 — Trial payload loader is the right pattern (Pass)**  
`src/data/trialPayload.ts` parallel-loads guide content + metadata + visualizations on first navigation. Correct seam. Keep; replicate for home/scenarios path.

---

### File Organization

**F1 — Data sanitation logic in `src/pages/` (P2)**  
`sanitizeLegacyTrialContent`, `formatTrialArm`, `buildTrialSummaryItems` in `TrialPageNew.tsx` are pure data utilities, not page concerns. Boundary integrity miss. Recommended fix: move to `src/utils/trialContent.ts` alongside `src/utils/trialNarrative.ts`.

**F2 — `src/pages/` naming vs. SPA reality (P3, tracked in CLAUDE.md §21)**  
No action needed beyond keeping the note alive. Cheap mitigation: a dir-level comment in `src/pages/` explaining it is SPA route components, not Next.js pages.

**F3 — `src/pages/guide/` and `src/pages/trials/` subdivision is fine (Pass)**

---

### Citation Governance

**C1 — `registry.ts` missing; `CLAIM_REGISTRY` is empty (P1, expected per ADR-002)**  
`src/lib/citations/` has schema, helper, and stub. `registry.ts` does not exist. `check-claims.ts` accommodates this with a warning and skips Check 3 (freshness). Architecturally correct as a phasing strategy. Risk: until W5.2 lands, all clinical PRs rely entirely on clinical-reviewer honor-system review with zero machine-checked metadata. Tolerable at current PR volume; not tolerable past ~10 clinical contributors.

**C2 — `claim()` helper is a no-op at runtime by design (Pass)**  
Returns text unchanged, dev-warns on unregistered IDs. Correct — the build-time scanner is the enforcement layer.

**C3 — Phase 2 claim surfaces not enforced (P2, expected)**  
`check-claims.ts` ships only `jsx`, `data`, `computed` handlers. Markdown (`<!-- @claim:`) and JSON (`claim_id`) are in the spec but not scanned. If a contributor authors a claim into a markdown file, the hook will not catch it. When W5.2 lands, ship the markdown handler minimum.

---

### Dead Code / Dead Directories

**X1 — Two parallel agent registries: `agents/` vs `.claude/agents/` (P1)**  
Root `agents/active/` and `agents/dormant/` describe a legacy "Core 7 + Contextual" model. `.claude/agents/` is the canonical 15-file set per CLAUDE.md §11. Root `agents/` was never deleted after migration. Risk: a future contributor edits the wrong one and assumes the change is live. Recommended fix (Class D): delete `agents/` entirely, or convert `agents/README.md` to a single-line redirect stub.

**X2 — `.claude/worktrees/` contains two orphaned agent runs (P1)**  
`.claude/worktrees/agent-ab9d815fae22ee79d/` and `.claude/worktrees/vibrant-dewdney-4f0ed7/` each contain near-complete repo snapshots with stale CLAUDE.md, agents/, ADRs. `.gitignore` excludes them from VCS but they are on disk. CLAUDE.md §5 Rule 8 bans future worktree creation. These predate that rule. Stale governance docs surface in grep/file-search. Recommended fix: `rm -rf .claude/worktrees/agent-ab9d815fae22ee79d .claude/worktrees/vibrant-dewdney-4f0ed7`.

**X3 — Root-level audit/spec MD sprawl (P2)**  
At repo root (not in `docs/`): `SEO-AUDIT-REPORT.md`, `UI_UX_NEUROWIKI_AUDIT.md`, `GEO-ANALYSIS.md`, `ORCHESTRATION.md`, `AGENTS.md`, `2026-AHA-Stroke-guideline.md`. Most have a `docs/`-located twin. Move or delete.

**X4 — `audit/` directory contains only `.gitkeep` + stale checklist (P3)**  
Either populate or delete. Every recent audit has gone to `docs/reviews/`.

**X5 — `agents/dormant/compliance-legal.md` duplicates active agent (P2)**  
Compliance-legal exists in `.claude/agents/compliance-legal.md`. The dormant copy will drift. Subsumed by X1.

---

### Pre-commit Coverage

**P1 — Hook runs `check:claims` + `check:routes` only; two critical gaps (P2)**  

Missing:
- `tsc --noEmit` — not run pre-commit. CLAUDE.md §20 requires it before `/pr-ready`, but a type regression can land on `main` under Rule 8 ("all work on `main`"). **Highest-value addition.**
- `vite build` — broken build can push to remote. Add to pre-push minimum.
- No lint step — no ESLint config detected. No enforced correctness checks beyond TypeScript.
- Phase 2 claim surfaces unenforced (markdown, JSON).

**P2 — §13.3 unrecognized-surface rule is convention-only (P2)**  
The hook cannot detect "clinical-looking text on an unrecognized surface" by definition. The only durable fix is the human gate (clinical-reviewer). Document this explicitly.

---

### API Boundary

**A1 — `api/feedback.ts` and `api/npi.ts` as Vercel serverless (Pass)**  
Both are thin proxies. No business logic, no auth state, no PHI. Correct pattern.

**A2 — Env vars not validated at startup (P3)**  
`api/feedback.ts` returns 500 on missing env vars. A `/api/healthz` endpoint would surface misconfiguration before users hit it.

---

### Long-Term Risks (Top 5)

1. **Trial corpus cannot scale on the `trialData.ts` monolith.** At ~120 LoC/trial, 200 trials = ~25k lines. Combined with D1 (home transitively imports it), this is the dominant home-route bundle weight.

2. **`TrialPageNew.tsx` will accumulate archetype branches faster than it can refactor.** Past 10k lines, no clinical-reviewer can hold the file in their head; Class E reviews become unreliable.

3. **Citation governance is paperwork-only until W5.2.** Every clinical PR before `registry.ts` is populated relies on human review with zero machine-checked metadata. The longer this persists, the more "approved without citations" precedent accumulates.

4. **Two parallel agent rosters will silently diverge.** A contributor will edit the wrong one. The wrong one will get committed and pulled into context by a file-search tool.

5. **Route key reuse without annotation layer (R1) plus prerender drift (R2) signals slow erosion of "manifest is source of truth."**

---

## Required Follow-ups (No Implementation in This Audit)

| # | Class | Action |
|---|---|---|
| 1 | D | Delete `agents/` directory and `.claude/worktrees/` orphans |
| 2 | D | Lazy boundary on home-route trial imports |
| 3 | D | Decompose `TrialPageNew` into archetype dispatch + utilities |
| 4 | D | Sync `reactSnap.include` to `STATIC_SITEMAP_ROUTES` |
| 5 | C | Add `tsc --noEmit` to pre-commit (or pre-push) |
| 6 | — | W5.2 (registry population) is the highest-leverage clinical-governance task on the board |
| 7 | C | Introduce ESLint with react-hooks plugin |
| 8 | — | Route citation-governance findings (C1, C3) to clinical-reviewer |
