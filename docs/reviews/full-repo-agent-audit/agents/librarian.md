# Librarian Audit — NeuroWiki Documentation Organization & Task Ledger Health

**Date:** 2026-05-08  
**Audited by:** librarian (full-repo-agent-audit swarm)  
**Scope:** TASKS.md, ROADMAP.md, docs/ organization, stale/duplicate docs, review artifacts, link-graph maintenance

---

## Overall Documentation Health Rating

**Red / High Risk**

The documentation ecosystem is suffering from organizational decay rather than content decay. The task ledger (TASKS.md) is well-maintained and coherent, but the broader docs/ directory has accumulated significant cruft: duplicate files, stale audit reports from pre-migration eras, root-level pollution, and inconsistent organization patterns. The link graph is maintained but underutilized for dependency checking.

**Key risk:** New developers and AI agents will struggle to find authoritative sources due to file duplication and scattered organization. Governance files (CLAUDE.md, AGENTS.md) are split across root and docs/; audit artifacts are ad-hoc named and scattered.

---

## 1. TASKS.md Health — Green

**Status:** Well-maintained and coherent.

**Strengths:**
- All four canonical sections present: ACTIVE (empty, correct), BLOCKED (empty, correct), PENDING, PARKING LOT, CONFIRMED CLEAN (implied in merged PRs), POST-MORTEMS (section exists in code, no entries yet)
- Task classification discipline active: every entry has Class (A/B/C/D/E), status markers (`[x]`, `[ ]`, `blocked:`, `reverted`), user-visible goal, files touched, acceptance checks
- No inconsistencies detected between PENDING and CONFIRMED CLEAN: merged work is properly logged with commit SHAs
- PARKING LOT format correct: 25 parked items with dates and parent-task context
- W5.2 in-progress status is explicit: Phase 1 complete, Phases 2–4 pending, decision points clearly stated
- ROADMAP.md items trace back to TASKS.md: Layer 2 items (Stroke Pathway) have matching TASKS.md entries with commit tracking

**No action needed on TASKS.md itself.** It is being maintained correctly.

---

## 2. ROADMAP.md Coherence — Green

**Status:** Aligned with TASKS.md; layer structure clear.

**Strengths:**
- Five-layer facelift model is coherent: Foundation (COMPLETE), Layer 2–5 in sequence
- Layer 2 (Stroke Pathway) maps directly to TASKS.md PENDING entries with commit tracking
- Phase 2+ (Stability, Scale, Moat) deferred correctly; no confusion between in-flight layers and future phases
- Blocking conditions properly stated (Layer 3 blocked until Layer 2 complete, etc.)

**No action needed on ROADMAP.md.**

---

## 3. docs/ Organization — Red / High Priority

**Current state:**
- 40+ `.md` files at root of docs/
- No subdirectories for audit reports, specs, design artifacts (except minimal structure)
- Many files should be in subdirectories but are at root level

### File Inventory by Category

**Properly organized:**
- `docs/adrs/` (6 ADRs + templates) — correct placement
- `docs/reviews/` (43 review artifacts) — mostly correct, but see below for naming issues
- `docs/audits/` (2 audit reports) — correct, but see below for outdated peers at root

**At root level (should be moved):**
- `docs/CALCULATOR_GUIDELINES.md` — belongs in `docs/specs/`
- `docs/design_audit.md` — belongs in `docs/audits/` (2026-01-19 audit)
- `docs/design_system.md` — belongs in `docs/specs/`
- `docs/STROKE_BASICS_DESIGN_ARTIFACT.md` → belongs in `docs/specs/mockups/`
- `docs/STROKE_BASICS_MOBILE_DESIGN.md` → belongs in `docs/specs/mockups/`
- `docs/STROKE_BASICS_REDESIGN_PLAN.md` → belongs in `docs/specs/`
- `docs/MOCKUPS.md` → belongs in `docs/specs/`
- `docs/FRAMEWORK_COMPONENTS.md` — root-level audit (pre-migration, see §4)
- `docs/ISSUES_DETECTED.md` — audit artifact (unorganized)
- `docs/FEEDBACK_SETUP.md` — procedural doc (belongs in `docs/procedures/` or `.claude/`)
- `docs/INTERLINKING_REPORT.md` — audit artifact (belongs in `docs/audits/`)
- `docs/TOOLTIP_SYSTEM.md` — design artifact (belongs in `docs/specs/`)
- `docs/CHANGELOG-2026-GUIDELINES.md` — changelog (belongs in `docs/changelog/` or root)
- `docs/post-stroke-anticoagulation-timing.md` — clinical spec (belongs in `docs/specs/clinical/`)
- And 13 more audit/design files

**Root level (should move to docs/):**
- `AGENTS.md` — governance file, currently at root; should migrate to `docs/AGENTS.md` (though CLAUDE.md §11 suggests agents are in `.claude/agents/`)
- `GEO-ANALYSIS.md` — audit from 2026-03-10 (should be `docs/audits/2026-geo-analysis.md`)
- `SEO-AUDIT-REPORT.md` — audit (should be `docs/audits/2026-seo-audit-report.md`)
- `UI_UX_NEUROWIKI_AUDIT.md` — audit (search not found; check if it exists)
- `ORCHESTRATION.md` — governance/procedural (unclear purpose; likely pre-migration)
- `2026-AHA-Stroke-guideline.md` — exists at both root AND `docs/2026-AHA-Stroke-guideline.md` — duplicate

**Likely stale (pre-migration):**
- `docs/project_structure.md` — last updated 2026-01-19; refers to legacy folder structure with `components/` at root, `functions/` for Netlify, legacy `pages/` folder. This does NOT match current Vite + React Router 7 layout. Stale.
- `docs/FRAMEWORK_COMPONENTS.md` — unknown last-update date; likely pre-migration artifact
- `docs/DEPENDENCIES_AUDIT.md` — unknown age; need to verify against current package.json

---

## 4. Stale Docs — Red / P1 Priority

**Confirmed stale (content drift from current architecture):**

| File | Last updated | Issue | Action |
|---|---|---|---|
| `docs/project_structure.md` | 2026-01-19 | Describes legacy folder structure (root-level `components/`, `functions/`, pre-Router7 `pages/`). Current: Vite SPA, src/ structure is different. | Archive to `docs/legacy/` or delete + regenerate if needed |
| `docs/FRAMEWORK_COMPONENTS.md` | unknown | References pre-migration component hierarchy. No clear update date. | Search for references; archive if no active consumers |
| `docs/CHANGELOG-2026-GUIDELINES.md` | unknown | Guideline-change tracking; verify if this is actively maintained or frozen | Check git log for recent edits; archive if frozen |

**Likely stale (audit reports from 2–4 months ago):**

| File | Date | Likely status |
|---|---|---|
| `docs/design_audit.md` | 2026-01-19 | Pre-facelift; design system has evolved (cobalt, Layer 2 stroke rebuild) | Review or archive |
| `docs/INTERLINKING_REPORT.md` | unknown | Audit of internal linking; check if link-graph now supersedes this | Check if this is still referenced anywhere |
| `docs/ISSUES_DETECTED.md` | unknown | Generic issue tracker; unclear if it's a snapshot or live document | Clarify status; if snapshot, archive with date |

**Unable to confirm without git log depth:** Many audit reports lack datelines. Recommend adding a git log grep pass.

---

## 5. Duplicate Docs — Red / P1 Priority

**Confirmed duplicates:**

| File 1 | File 2 | Status | Action |
|---|---|---|---|
| `docs/PERFORMANCE_AUDIT.md` | `docs/PERFORMANCE-AUDIT-REPORT.md` | Both exist; different content (first is v1 legacy, second is v2 Cloudflare). Not true duplicates. | Clarify which is canonical. `docs/PERFORMANCE-AUDIT-REPORT.md` appears newer (2026-02-03 vs unknown). Consider deprecating the legacy `PERFORMANCE_AUDIT.md` or merge. |
| `docs/TRIAL_DATA_VERIFICATION_COMPLETE.md` | `docs/TRIAL_VERIFICATION_REPORT.md` | Cannot confirm without reading both fully; names suggest duplication. | Check if one is a snapshot and one is ongoing. |
| `docs/2026-AHA-Stroke-guideline.md` (root) | `docs/2026-AHA-Stroke-guideline.md` (docs/) | **Confirmed duplicate.** Both paths found. | Delete root copy. Keep `docs/2026-AHA-Stroke-guideline.md`. |
| `docs/EVT-PATHWAY-AUDIT-REPORT.md` | `docs/EVT-PATHWAY-PROGRESSION-AUDIT.md` | Names suggest different scopes (one may be progress report of the other). | Check dates and scope; merge or clarify which is canonical. |

**Likely duplicates (filename analysis only, not confirmed by reading):**

- `PERFORMANCE_AUDIT.md` vs `PERFORMANCE-AUDIT-REPORT.md` (confirmed distinct content)
- `docs/STROKE_BASICS_DESIGN_ARTIFACT.md` vs `docs/STROKE_BASICS_REDESIGN_PLAN.md` (check if one is result of the other)
- `docs/EVT-PATHWAY-AUDIT-REPORT.md` vs `docs/EVT-PATHWAY-PROGRESSION-AUDIT.md` (check scope overlap)

---

## 6. Root-Level Pollution — Red / P2 Priority

Files that should be in docs/ but are at project root:

| File | Type | Action |
|---|---|---|
| `AGENTS.md` | Governance | Keep at root (referenced by CLAUDE.md §11 as project entry point) OR migrate to `docs/AGENTS.md` and update README. Current: at root, but CLAUDE.md references it. Status: OK at root. |
| `GEO-ANALYSIS.md` | Audit report | Move to `docs/audits/2026-geo-analysis.md` |
| `SEO-AUDIT-REPORT.md` | Audit report | Move to `docs/audits/2026-seo-audit-report.md` |
| `UI_UX_NEUROWIKI_AUDIT.md` | Audit report (if exists) | Move to `docs/audits/2026-ui-ux-audit.md` |
| `ORCHESTRATION.md` | Governance/procedures | Clarify purpose; likely should be archived or moved to `.claude/meta/` or `docs/` |
| `2026-AHA-Stroke-guideline.md` | Clinical spec | Delete (duplicate of `docs/` version). Keep `docs/2026-AHA-Stroke-guideline.md`. |

**Note:** Check `.gitignore` for `.claude/worktrees/` — this is correctly ignored and should not be committed (rule in CLAUDE.md §5 Rule 8).

---

## 7. Review Artifact Hygiene — Yellow / P2 Priority

**Status:** Review artifacts exist and follow the §17 template mostly, but naming convention is inconsistent.

**Naming analysis:**

✅ Correct format (follows `arch-PR<#>-<slug>.md` or `clinical-PR<#>-<slug>.md`):
- `arch-PR-W5-1-citation-schema.md`
- `clinical-PR-W7.0-predecessor-stubs.md`
- `arch-batch3-wave2-data-population.md` ⚠ — uses `batch` not `PR#`
- `clinical-batch3-wave2-data-population.md` ⚠ — uses `batch` not `PR#`

⚠ Non-standard naming (should be `PR#-slug`):
- `arch-batch3-wave1-schema-extensions.md` — uses `batch` not `PR#`
- `clinical-wave3-batch2-renderer.md` — mixed format
- `arch-wave2-ivt-schema.md` — uses `wave` not `PR#`
- And ~15 others using ad-hoc wave/batch naming instead of PR numbers

**Template compliance:**

✅ Reviewed artifact samples are complete:
- `arch-batch3-wave2-data-population.md`: has Decision, Reviewed, Reviewer, Date, Rationale, Required follow-ups, Blocking issues sections ✓
- `clinical-batch3-wave2-data-population.md`: has Decision, Reviewer, Date, Scope, Semantic validity, Citation accuracy, Freshness, Rationale sections ✓

⚠ Issue: Some older artifacts may not follow the updated §17.1/§17.2 template. Recommend a spot-check pass.

**Action:** Standardize naming on next review-artifact generation. Current inconsistency is acceptable but should be cleaned up when the archive is reorganized.

---

## 8. NEUROWIKI.md Currency — Green

**Status:** Current and authoritative.

**Strengths:**
- Updated recently (implied by references to 2026-05-08 Wave 3 trial data schema)
- Serves as master context document per design: "What This App Is", users, features, tech stack, design direction
- Schema documentation (Trial Data Wave 3) is accurate and referenced in TASKS.md
- No product/architecture drift detected

**Minimal action needed.** This is the right place for this document.

---

## 9. link-graph.json Maintenance — Yellow / P2 Priority

**Current state:**
- Generated 2026-05-06 (two days ago; reasonably current)
- 48 nodes (1 hub, 16 articles, 5 calculators, 26 trials) with outbound/inbound references
- `docs/LINK_GRAPH.md` auto-generated from JSON (correct pattern per CLAUDE.md §20)

**Issues detected:**

1. **Broken reference:** `trial/mr-asap-trial` is referenced by `trial/right-2-trial` but has no node in the graph.
   - Status: Mr. ASAP trial likely exists in trialData.ts but not registered in link-graph.json
   - Impact: Low (internal consistency check); users are unaffected if the trial page routes correctly
   - Action: Update link-graph.json to include `trial/mr-asap-trial` and any other trials missing from the index

2. **Orphan node:** `calc/abcd2` is registered but has no outbound or inbound references (marked "pre-existing orphan" in LINK_GRAPH.md)
   - Status: ABCD2 calculator exists but is not referenced by any page or vice versa
   - Impact: Low; likely intentional (standalone tool)
   - Action: Clarify intent; if ABCD2 is meant to be a nav entry point, reference it from `hub/guide` or another hub

3. **Stub status:** LINK_GRAPH.md notes 4 stubs "not yet routable". These should be in the JSON or flagged with `isStub: true` field.
   - Status: Unclear which 4 are stubs (JSON doesn't mark them)
   - Action: Add `isStub?: true` field to link-graph.json for unreleased nodes

**Recommendation:** After next major release, run a sweep to audit trial/page node coverage against trialData.ts and router.tsx to catch naming/ID mismatches.

---

## 10. Audits and Findings Tracking — Yellow / P2 Priority

**Current state:**

Two current audit artifacts exist:
- `docs/audits/2026-language-audit.md` (2026-05-06) — comprehensive prose audit of trialData.ts for em-dashes, AI phrasing, sentence drift
- `docs/audits/2026-trial-design-audit.md` (2026-05-06) — trial page visual/content audit

**Issues:**

1. **Audit findings not fully tracked in TASKS.md:** The language audit flags 95 em dashes and 40 double-hyphens in user-facing prose (see audit §1). These are deferred to W8.3 (planned, not active) in TASKS.md. Status: correctly parked but execution plan is vague.

2. **Older audit artifacts scattered:** GEO-ANALYSIS.md (2026-03-10), SEO-AUDIT-REPORT.md (unknown date) are at root level, not organized in `docs/audits/`.

3. **Audit naming inconsistency:** Current convention uses `2026-<domain>-audit.md` (good). Older style uses `<DOMAIN>-AUDIT-REPORT.md` (root level). Inconsistent.

**Action:** 
- After root-cleanup, standardize audit naming on `docs/audits/YYYY-MM-DD-<domain>.md`
- Verify that all audit findings have a corresponding task in TASKS.md (see W8.1, W8.2, W8.3 already do this)
- Archive pre-2026-04 audit reports to `docs/legacy/audits/` if they're snapshot-style and no longer active

---

## Summary: Findings by Severity

### P0 (Block merges / Prevent decisions)
**None.** TASKS.md and ROADMAP.md are coherent. No governance inconsistencies that require immediate resolution.

### P1 (Fix in next cleanup session)
1. **Move root-level audit reports to docs/audits/**
   - `GEO-ANALYSIS.md` → `docs/audits/2026-geo-analysis.md`
   - `SEO-AUDIT-REPORT.md` → `docs/audits/2026-seo-audit-report.md`
   - `UI_UX_NEUROWIKI_AUDIT.md` → `docs/audits/2026-ui-ux-audit.md` (if exists)

2. **Delete confirmed duplicate at root level**
   - Delete `/2026-AHA-Stroke-guideline.md` (keep `docs/2026-AHA-Stroke-guideline.md`)

3. **Archive or clarify stale documents**
   - `docs/project_structure.md` (2026-01-19) — archive to `docs/legacy/` or regenerate for current stack
   - `docs/FRAMEWORK_COMPONENTS.md` — search for references; archive if no consumers
   - `docs/CHANGELOG-2026-GUIDELINES.md` — add last-updated date; clarify if active or frozen

4. **Organize design and spec documents**
   - Move 15+ design/spec/audit files from `docs/` root into proper subdirs:
     - `docs/specs/` for design systems, calculator guidelines, mockups
     - `docs/audits/` for audit reports
     - `docs/legacy/` for archived pre-migration docs

### P2 (Improve workflow but not urgent)
1. **Standardize review artifact naming** (next batch of reviews)
   - Migrate wave/batch naming to `PR#` format
   - Rationale: facilitates git blame and PR linking

2. **Update link-graph.json completeness**
   - Add missing trial nodes (e.g., `trial/mr-asap-trial`)
   - Mark stub nodes explicitly with `isStub: true`

3. **Clarify root-level governance files**
   - Decide: keep `AGENTS.md` at root or move to `docs/AGENTS.md`
   - Archive or migrate `ORCHESTRATION.md` (clarify purpose)

---

## Top 5 Documentation Cleanup Tasks

1. **Create docs/ subdirectory structure and migrate files (P1, ~2 hours)**
   - Create: `docs/audits/`, `docs/specs/`, `docs/legacy/`
   - Move: 20+ files from root and scattered docs/ into proper dirs
   - Update: any internal cross-references

2. **Delete confirmed duplicates (P1, ~15 min)**
   - Delete `/2026-AHA-Stroke-guideline.md`
   - Confirm and delete TRIAL_VERIFICATION duplicates if applicable

3. **Archive pre-2026-04 audit and design docs (P1, ~1 hour)**
   - Move `docs/project_structure.md`, `docs/FRAMEWORK_COMPONENTS.md` to `docs/legacy/`
   - Verify no active references before archiving

4. **Standardize audit naming and ensure TASKS.md tracking (P1, ~30 min)**
   - Rename audit files to `docs/audits/YYYY-MM-DD-<domain>.md` format
   - Ensure every audit has a corresponding TASKS.md entry (W8.x series already does this for recent audits)

5. **Link graph audit and completion (P2, ~1 hour)**
   - Add missing trial nodes to link-graph.json
   - Mark stubs with `isStub: true` or separate `stubs` array
   - Regenerate `docs/LINK_GRAPH.md`
   - Verify against trialData.ts for full coverage

---

## Files Ready for Safe Deletion

**After moving/archiving, confirm deletion:**

- `docs/PERFORMANCE_AUDIT.md` (legacy; keep `docs/PERFORMANCE-AUDIT-REPORT.md` if it's v2)
- `/2026-AHA-Stroke-guideline.md` (confirmed duplicate; keep `docs/` version)
- `docs/TRIAL_DATA_VERIFICATION_COMPLETE.md` (if confirmed duplicate of `TRIAL_VERIFICATION_REPORT.md`)

**Do not delete without spot-checking:**

- `docs/FRAMEWORK_COMPONENTS.md` — search `grep -r "FRAMEWORK_COMPONENTS"` first
- `docs/INTERLINKING_REPORT.md` — check if any README or nav references it

---

## Files Requiring Move (Root → docs/)

**Audit reports:**
- `GEO-ANALYSIS.md` → `docs/audits/2026-geo-analysis.md`
- `SEO-AUDIT-REPORT.md` → `docs/audits/2026-seo-audit-report.md`
- `UI_UX_NEUROWIKI_AUDIT.md` → `docs/audits/2026-ui-ux-audit.md` (if found)

**Design/spec documents:**
- See §3 table for 15+ files in `docs/` root needing moves to `docs/specs/` or `docs/audits/`

**Governance:**
- `ORCHESTRATION.md` — clarify purpose and destination (`.claude/meta/` or `docs/procedures/`?)

---

## No Changes Needed

- ✅ `TASKS.md` — well-maintained
- ✅ `docs/ROADMAP.md` — aligned with TASKS.md
- ✅ `docs/NEUROWIKI.md` — current
- ✅ `docs/adrs/` — properly organized
- ✅ `docs/reviews/` — artifacts exist and follow templates (naming improvement only)
- ✅ `.claude/` — governance files properly scoped
- ✅ `CLAUDE.md` — this IS the contract; no changes needed (it owns TASKS.md, ROADMAP.md, docs/ governance per §12)

---

## Conclusion

**Documentation is healthy at the task and specification level** (TASKS.md, ROADMAP.md, NEUROWIKI.md, adrs/, reviews/) **but suffers from organizational decay at the filesystem level.** The primary work is cleanup and consolidation, not re-authoring. Root-level pollution and scattered audit artifacts create cognitive overhead for new developers and agents.

**Recommended post-flight action:** Schedule a 2–3 hour "docs cleanup" Class B/C task to:
1. Move files to proper subdirs
2. Delete confirmed duplicates
3. Archive pre-2026-04 snapshots
4. Standardize naming conventions
5. Update LINK_GRAPH.json for completeness

No clinical content or governance decisions are at risk. The core knowledge base is sound.
