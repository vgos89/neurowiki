# Phase 3 — Cleanup Log

**Date:** 2026-05-08  
**Branch:** main

---

## Cleanup Performed

None. All cleanup actions were deferred at permission gate or intentionally held for V approval.

---

## Cleanup Not Performed

| Issue | File(s) | Why Not Changed | Required Reviewer | Suggested Next Step |
|---|---|---|---|---|
| **CRITICAL: SSH private key committed to git** | `eval "$(ssh-agent -s)"`, `eval "$(ssh-agent -s)".pub` | Requires V explicit action: (1) revoke key on GitHub first, (2) remove files, (3) scrub from git history — not a safe auto-action | V (key owner) | Revoke key in GitHub Settings > SSH Keys immediately. Then `git rm` + `git filter-repo` to scrub history. Force-push required. |
| Orphaned worktrees on disk | `.claude/worktrees/agent-ab9d815f*/`, `.claude/worktrees/vibrant-dewdney*/` | Permission denied at bash execution | V approval | `rm -rf .claude/worktrees/agent-ab9d815fae22ee79d .claude/worktrees/vibrant-dewdney-4f0ed7` |
| `project_tree.txt` stale snapshot | `project_tree.txt` (root) | Permission denied at bash execution | None (safe) | `git rm project_tree.txt && git commit -m "chore: remove stale project snapshot"` |
| Duplicate root-level `2026-AHA-Stroke-guideline.md` | Root copy vs `docs/2026-AHA-Stroke-guideline.md` | Requires confirming which copy is canonical before deletion | librarian | `git rm 2026-AHA-Stroke-guideline.md` if `docs/` copy is canonical |
| Root-level audit MD sprawl | `GEO-ANALYSIS.md`, `SEO-AUDIT-REPORT.md`, `UI_UX_NEUROWIKI_AUDIT.md`, `ORCHESTRATION.md`, `AGENTS.md` | File moves require verification of canonical status | librarian | Move to `docs/audits/` and `docs/` per repo-inventory |
| Duplicate legacy agent directory | `agents/` (root) | Requires git rm -r — has governance implication | system-architect | Class D: `git rm -r agents/ && git commit -m "chore(governance): remove legacy agent dir"` |
| `netlify.toml` + `netlify/functions/` | Root + `netlify/` | Requires confirming Vercel is the only host | V | Confirm then `git rm -r netlify.toml netlify/` |
| NNT bypass at 8 render sites in TrialPageNew | `src/pages/trials/TrialPageNew.tsx` | Clinical logic — requires Class E workflow (evidence-verifier + clinical-reviewer) | trial-statistician + clinical-reviewer | Class E task: gate `calculations?.nnt != null` sites behind `!stats.suppressNNT` |
| DOAC pearl Class III mislabel | `src/data/strokeClinicalPearls.ts:166–176` | Clinical content — requires Class E workflow | clinical-reviewer | Class E: re-tag `evidenceClass` from `'III'` to `'IIb'` after verifying AHA/ASA 2026 §4.6 |
| Tenecteplase "preferred for LVO" wording | `src/pages/guide/IvTpa.tsx:62` | Clinical recommendation strength — requires Class E workflow | clinical-reviewer | Class E: change to "equivalent first-line per AHA/ASA 2026" |
| ASPECTS `getScoreInfo()` in JSX | `src/pages/AspectScoreCalculator.tsx` | Could move to data file without clinical impact, but architectural change requires plan | calculator-engineer | Class C: move scoring logic to `src/data/aspectsScoreData.ts` |
| NIHSS missing in-page disclaimer | `src/pages/NihssCalculator.tsx` | Non-clinical text, but needs content-writer sign-off for wording | content-writer | Class C: add `<CalcDisclaimer />` footer component |
| Cookie consent before Google Analytics | `index.html:117–123` | Architecture change required; needs ui-architect plan | compliance-legal → ui-architect | Class D: implement conditional GA loading behind consent callback |
| Missing Privacy Policy page | No routed page exists | Content + routing — requires content-writer + ui-architect | compliance-legal | Class C: create `/privacy` route with Privacy Policy copy |
| 7 NI trials on DeltaBand archetype | `src/data/trialData.ts` (multiple entries) | Display archetype change — requires Class D-clinical, new archetype component | trial-statistician → medical-scientist | Class D-clinical: author NIMarginChart archetype; ADR required |
| `registry.ts` missing (W5.2) | `src/lib/citations/` | Pending feature work — in TASKS.md as W5.2 | medical-scientist + clinical-reviewer | Ship W5.2: create `registry.ts` + populate `claims.ts` |
| Zero test files | Entire repo | Requires setting up Vitest + test runner | quality-assurance | Class D: Vitest setup + Phase 1 calculator tests |
