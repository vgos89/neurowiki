# Architect review — W5.3 claim scanner

**Decision:** approve-with-conditions
**Reviewed:** plan + existing scripts + schema.ts + claims.ts + claim.ts + validateRouteManifest.mjs
**Reviewer:** system-architect (model: claude-sonnet-4-6)
**Date:** 2026-04-20

## Rationale

The W5.3 claim scanner is the enforcement layer for the citation governance system introduced in W5.1. The plan correctly identifies four checks (unregistered claim IDs, surface cross-check, citation freshness, exit codes) and the architectural decisions reduce to three non-trivial choices: execution model, parsing strategy, and registry absence handling. The preferred execution model is Option C — add `tsx` as a minimal devDep and write the scanner as `check-claims.ts`, matching the filename specified in CLAUDE.md §13.5. The parsing strategy for Phase 1 surfaces is regex (sufficient, zero-new-dep for logic, fast enough for pre-commit); Phase 2 AST integration must be designed in from the start as a pluggable handler slot. Registry absence should be handled gracefully with a skip-with-message approach, allowing W5.3 to ship independently of W5.2. Three conditions apply (see below), none blocking.

## Decisions

### Decision 1 — Execution model

**Chosen: Option C** — Add `tsx` as a minimal devDep; write `scripts/check-claims.ts` as TypeScript; invoke via `npx tsx scripts/check-claims.ts` (or `npm run check:claims` with a package.json script for discoverability).

Rationale: CLAUDE.md §13.5 specifies the filename as `check-claims.ts`. Option C is the only path that honors the spec without introducing wrapper plumbing. `tsx` is ~1.5 MB, widely used, well-maintained, and does not affect the runtime bundle (devDep only). The `ts.transpileModule` pattern from `validateRouteManifest.mjs` is appropriate when loading TS modules at runtime from within an already-running ESM context; it is not appropriate as a baseline execution model for a new `.ts` entry point. Recommend adding `"check:claims": "tsx scripts/check-claims.ts"` to `package.json` scripts; the pre-commit hook calls `npm run check:claims`.

### Decision 2 — Parsing strategy

**Chosen: Regex for Phase 1; architecture must accommodate Phase 2 AST handlers.**

Phase 1 surfaces (`jsx`, `data`) have narrow, unambiguous patterns:
- `data-claim="claim-id"` — static JSX attribute; regex pattern: `/data-claim=["']([a-z0-9-]+)["']/g`
- `claimId:\s*["']claim-id["']` — object field in data files
- `claim\(.*?,\s*["']([a-z0-9-]+)["']\)` — computed surface helper call

These are regex-safe. False positive risk is low (claim IDs are `kebab-case`; the patterns are specific enough not to fire on non-claim code). AST would add significant complexity for Phase 1 with no reliability gain. Phase 2 surfaces (`computed`, `markdown`, `json`) require more careful matching that benefits from AST — the scanner must expose a `handlers: Map<surface-type, ScanHandler>` slot that Phase 2 handlers fill without touching Phase 1 logic.

### Decision 3 — File structure

**Chosen: Single file**, ~150–200 lines, with clearly marked internal sections:
1. Config / paths
2. Phase 1 regex patterns (with Phase 2 handler slot comment)
3. File-system glob helpers
4. Scan logic (collect tags from files)
5. Registry cross-check (Checks 1 + 2)
6. Freshness check (Check 3)
7. Output formatter
8. Main entry + exit

If the file grows past 400 lines or Phase 2 adds AST dependencies, extract to `scripts/lib/`.

### Decision 4 — Registry absence handling

**Chosen: Skip-with-message.** If `src/lib/citations/registry.ts` does not exist, log a warning to stderr and skip Check 3 (freshness). Checks 1 and 2 still run. Exit 0 if Checks 1 and 2 pass. This allows W5.3 to ship independently of W5.2 and allows the pre-commit hook to be active before the registry is populated.

Log message: `[check-claims] WARNING: src/lib/citations/registry.ts not found — freshness check skipped. Expected before W5.2 lands.`

## Rubric

**1. Duplication risk — PASS.**
No existing script scans claim tags. `validateRouteManifest.mjs` validates route definitions; no overlap. The dynamic-load pattern (ts.transpileModule) is reused, not duplicated — the scanner uses it to load CLAIM_REGISTRY, not to re-implement route validation.

**2. Boundary integrity — PASS.**
Scanner lives in `scripts/`. It reads `src/lib/citations/claims.ts` and `src/lib/citations/registry.ts` via dynamic load (ts.transpileModule + base64 import), which is the established pattern in this repo. It does not modify source files. Its only outputs are stdout/stderr and an exit code. The import path from `scripts/` into `src/` goes through the transpile step, not direct ESM import — this is correct given Node.js cannot resolve `"bundler"` moduleResolution paths directly.

**3. Composability — PASS-WITH-CONDITION.**
Phase 1 regex approach is composable if and only if Phase 2 handler slots are documented and reserved in the initial implementation. Condition: the scanner must include a commented Phase 2 handler block at the scan-dispatch layer showing where `computed`, `markdown`, and `json` handlers will hook in. Without this, Phase 2 will require structural rewrite rather than additive change.

**4. State locality — PASS.**
All state is local to the main function. Regex constants are module-level but immutable. No global mutation. Side effects are stdout/stderr + exit code only.

**5. Dependency weight — PASS.**
One new devDep (`tsx`). No new runtime deps. Logic uses only Node.js builtins (`fs`, `path`) and the already-present `typescript` package for dynamic registry loading.

**6. Migration exit — PASS.**
The scanner is an enforcement layer. If reverted, the pre-commit hook falls back to no claim-checking (or a stub). The registry, schema types, and `claim()` helper are unaffected. `git revert` on the W5.3 commit is clean and side-effect-free.

## Required follow-ups

1. **Phase 2 handler slot:** Include a commented `PHASE_2_HANDLERS` block in the initial implementation showing where `computed`, `markdown`, and `json` handlers hook in. This is a condition on the composability rubric item.

2. **`npm run check:claims` script:** Add to `package.json` alongside the `tsx` devDep. The W5.4 pre-commit hook should call `npm run check:claims`, not invoke `tsx` directly, so the invocation is discoverable and overridable.

3. **Test fixtures:** Place minimal fixture files in `scripts/test-fixtures/` for both passing and failing scenarios. The QA engineer will specify these; the implementation must accommodate them.

4. **Registry.ts absence message:** Include the skip-with-message behavior in the W5.3 TASKS.md entry so future sessions don't treat the warning as a bug.

## Blocking issues

None.
