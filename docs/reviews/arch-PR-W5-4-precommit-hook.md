# Architect review — W5.4 pre-commit hook

**Decision:** approve
**Reviewed:** plan + current repo state
**Reviewer:** system-architect (model: claude-sonnet-4-6)
**Date:** 2026-04-20

## Rationale

The pre-commit hook is a justified, low-risk, high-value addition to NeuroWiki's enforcement infrastructure. It bridges a critical gap: `check:claims` exists but has no triggering mechanism, creating a false sense of coverage (CLAUDE.md §13.1). By making both checks mandatory at commit time, the hook enforces clinical safety metadata (the hard gate) and architectural consistency (route integrity) with zero developer friction — both scripts are fast (<100ms combined) and their failures are immediately actionable. The hook is composable (future hooks can be added without modification), has a clean exit path (can be disabled with `git commit --no-verify` if needed), and depends only on `husky`, a standard, well-maintained tool. The decisions below place clinical safety first (per §4 hierarchy), use unconditional execution to avoid false negatives, and establish a durable precedent for future enforcement.

## Decisions

### Decision 1 — Run order

**Chosen:** check:claims first, then check:routes.

CLAUDE.md §4 decision hierarchy places clinical safety above architectural consistency. The claims check enforces metadata completeness and citation freshness — a clinical safety boundary. Route validation enforces architectural cleanliness — important but secondary. Running claims first ensures the most critical failures surface and stop the commit immediately. A claim tagged with a bad citation ID is a medical problem; a missing route is a developer problem.

### Decision 2 — Conditional vs unconditional execution

**Chosen:** Unconditional — run both scripts on every commit regardless of which files changed.

The risk of conditional execution outweighs the negligible cost of unconditional runs. Both scripts are fast (regex-based, <100ms combined). Conditional logic would require `git diff --cached --name-only` filtering. But this creates a false-negative window: if only `src/lib/citations/claims.ts` or `src/lib/citations/registry.ts` changes (a registry update without any `src/` content change), check:claims would not run — potentially letting a forward-surface mismatch through (CLAUDE.md §13.3). Unconditional execution is simple, fast, and safe.

### Decision 3 — Docs-only and .claude/-only commits

**Chosen:** Run on all commits; no exemptions.

Both scripts complete in <100ms. Running them on docs-only or `.claude/`-only commits adds no meaningful burden. Exemptions would require commit-classification logic at hook level — complexity for no real gain. Uniform execution keeps the hook simple and the safety invariant unambiguous.

### Decision 4 — Husky setup

**Chosen:** Husky v9+. `npm install --save-dev husky`, `npx husky init`, add `"prepare": "husky"` to package.json.

Husky v9 is the stable, widely-adopted standard for Node.js Git hook management. The `"prepare"` script ensures hooks register automatically on `npm install` for all contributors. The hook file is a plain shell script — no Node.js runtime at hook-execution time. Lightweight (~200KB), no runtime cost, clean exit paths. No alternative (lint-staged, manual `.git/hooks/`) adds value for this use case.

## Rubric

**1. Duplication risk — PASS.**
No existing pre-commit hook; no CI equivalent for these checks. Both scripts exist but have no triggering mechanism — the hook is their first enforcement point.

**2. Boundary integrity — PASS.**
Hook runs two npm scripts and exits. Does not build, does not modify files, does not run tests. It is a metadata gate only.

**3. Composability — PASS.**
Future hooks (pre-push test suite, pre-push build) go in `.husky/pre-push` without touching `.husky/pre-commit`. CI can call the same npm scripts independently. The hook is a thin shell wrapper, not a build system.

**4. State locality — PASS.**
Both scripts are read-only. No files modified, no stages changed. Output is diagnostic only. Exit code is the only side effect.

**5. Dependency weight — PASS.**
Husky v9 is ~200KB, devDep only. Justified immediately by enabling the §13.5 clinical safety gate.

**6. Migration exit — PASS.**
Three clean exit paths: (a) `git commit --no-verify` for emergency bypasses; (b) `npm uninstall husky` + remove `"prepare"` script; (c) edit or delete `.husky/pre-commit` directly. No cascading changes required.

## Required follow-ups

- Verify `.husky/pre-commit` is executable after install (`chmod +x` if needed — husky v9 handles this on POSIX but verify).
- If check:claims becomes slower as claim density grows, profile and consider moving to pre-push with a lightweight pre-commit stub. For now, sub-100ms is not a concern.

## Blocking issues

None.
