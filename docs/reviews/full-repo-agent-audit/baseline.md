# Phase 0 — Baseline Snapshot

**Date:** 2026-05-08  
**Branch:** main  
**Commit:** 9627e0e docs(claude): v3.3 — add Rule 8: all work on main, no worktrees  

---

## Git State

```
Branch: main (clean — no uncommitted changes)

Recent commits:
9627e0e docs(claude): v3.3 — add Rule 8: all work on main, no worktrees
a0096d7 docs(reviews): commit orphaned Batch 3 Wave 2 review artifacts + NEUROWIKI update
0cb720a chore(ci): agent governance modernization 2026 — merge claude/vibrant-dewdney-4f0ed7
665c233 chore(ci): make guard-clinical-edit.mjs advisory-only (exit 0)
e756125 chore(ci): modernize agent governance for 2026 Claude Code — Class D
```

---

## npm run build

**Result: PASS with warnings**

```
✓ built in 2.21s
```

**Chunk size warnings (CRITICAL):**

| Chunk | Raw | Gzip |
|---|---|---|
| TrialPageNew-Bi9aV_wE.js | 837.10 kB | 172.44 kB |
| index-DZB_kYA7.js | 589.11 kB | 148.77 kB |
| react-vendor-2DhBOhCp.js | 230.71 kB | 73.73 kB |
| index-W3QjXB5H.js | 117.75 kB | 36.25 kB |
| EmBillingCalculator-JCgZ28Ri.js | 87.91 kB | 22.17 kB |
| guideContent-CwcGPEBm.js | 85.76 kB | 27.65 kB |
| EvtPathway-CQpAy5Du.js | 74.09 kB | 16.88 kB |
| StrokeGuidelineMindmap-BQe3Ntgg.js | 71.17 kB | 19.66 kB |
| StrokeBasics-CWQ-1izu.js | 57.98 kB | 14.43 kB |
| ExtendedIVTPathway-BDMymI2m.js | 41.28 kB | 10.79 kB |

The TrialPageNew chunk (837 kB raw) is the single biggest performance risk in the app.

---

## npm run typecheck

**Result: PASS (no errors)**

```
> neurowiki@0.0.0 typecheck
> tsc --noEmit
(no output = clean)
```

---

## npm run check:claims

**Result: PASS with WARNING**

```
[check-claims] WARNING: src/lib/citations/registry.ts not found — freshness check skipped.
               Expected before W5.2 lands.
[check-claims] All checks passed. ✓
```

**Note:** `registry.ts` is missing. The CLAIM_REGISTRY in `claims.ts` is an empty stub.
No `data-claim` attributes exist anywhere in JSX (grep confirmed zero results).
The entire claim tagging system (CLAUDE.md §13.3–13.5) is infrastructure-only —
no clinical content has been tagged yet.

---

## npm run check:routes

**Result: PASS**

```
Validated 39 static routes with manifest-driven routing.
```

---

## npm run lint

**Result: NOT AVAILABLE** — no `lint` script in package.json.

---

## npm test

**Result: NOT AVAILABLE** — no test runner configured, zero test files found in repo.

---

## Key Baseline Risks

| Risk | Severity | Details |
|---|---|---|
| TrialPageNew.tsx = 7,469 lines | CRITICAL | Single component = 837 kB bundle chunk |
| trialData.ts = 9,781 lines | HIGH | Entire trial dataset in one file, shipped to client |
| citation registry.ts missing | HIGH | W5.2 not yet shipped; no citation IDs in any component |
| No data-claim tags in JSX | HIGH | Phase 1 claim tagging not implemented |
| Zero test files | HIGH | No unit, integration, or e2e tests anywhere |
| No lint script | MEDIUM | TypeScript catches type errors; style drift undetected |
| index-DZB_kYA7.js = 589 kB | MEDIUM | Large main bundle |
