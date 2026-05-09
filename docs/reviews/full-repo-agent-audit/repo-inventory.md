# Phase 1 — Repo Inventory

**Date:** 2026-05-08  
**Branch:** main  

---

## Framework & Stack

| Item | Value |
|---|---|
| Framework | Vite 6.2 + React 19 + TypeScript 5.8 |
| Routing | React Router DOM 7 (library mode, SPA, client-side only) |
| Styling | Tailwind CSS v4 + shadcn/ui primitives |
| Icons | Lucide React + Material Icons |
| Charts | Recharts 3.8 |
| Markdown | react-markdown + remark-gfm |
| Hosting | Vercel (static build) |
| Pre-rendering | react-snap (puppeteer-based, 39 routes in config) |
| Pre-commit hooks | Husky v9 → check:claims + check:routes |

---

## Top-Level File Structure

```
neurowiki/
├── src/                    # Application source
├── public/                 # Static assets (icons, robots.txt, sitemap.xml, manifest.json)
├── docs/                   # Documentation, ADRs, reviews, specs
├── scripts/                # Build/validation scripts
├── api/                    # Vercel serverless functions (feedback, npi lookup)
├── functions/              # Netlify functions (likely deprecated — see below)
├── .claude/                # Agent governance, commands, skills, hooks
├── agents/                 # DUPLICATE agent directory at root (legacy)
├── audit/                  # Legacy audit scratch (.gitkeep only)
├── services/               # Empty directory (dead)
├── .debug/                 # Debug logs (1 file — trial route audit)
├── TASKS.md                # Task ledger
├── PRD.md                  # Product decisions
├── CLAUDE.md               # Governance contract
├── AGENTS.md               # Legacy agent manifest (superseded by .claude/agents/)
├── ORCHESTRATION.md        # Legacy orchestration doc (superseded by .claude/meta/)
├── GEO-ANALYSIS.md         # Legacy analysis (root level — should be in docs/)
├── SEO-AUDIT-REPORT.md     # Legacy SEO audit (root level — should be in docs/)
├── UI_UX_NEUROWIKI_AUDIT.md # Legacy UI audit (root level — should be in docs/)
├── 2026-AHA-Stroke-guideline.md # Guidelines reference (root level — should be in docs/)
├── "eval $(ssh-agent -s)"  # DANGEROUS: accidentally committed file with this name
├── "eval $(ssh-agent -s)".pub # DANGEROUS: accidentally committed SSH pubkey file
└── .claude/worktrees/      # Two orphaned worktrees (ab9d815f, vibrant-dewdney)
```

---

## Routing Structure

Routes defined centrally in `src/config/routeManifest.ts` + `src/App.tsx`.  
Route validator: `scripts/validateRouteManifest.mjs` (39 routes validated).

| Route Group | Count | Notes |
|---|---|---|
| Home | 1 | `/` |
| Calculators hub | 1 | `/calculators` |
| Individual calculators | 12 | NIHSS, ASPECTS, ICH, ABCD2, HAS-BLED, ROPE, CHA2DS2-VASc, GCS, Heidelberg, Boston-CAA, EM-Billing, EVT-pathway (pathway routes in calculator namespace) |
| Pathways hub | 1 | `/pathways` |
| Individual pathways | 7 | GCA, ELAN, EVT, late-IVT, SE, Migraine, Stroke-Code |
| Guide hub | 1 | `/guide` |
| Individual guide pages | 15 | StrokeBasics, IvTpa, Thrombectomy, AcuteStrokeMgmt, SE, ICH, Meningitis, GBS, MG, MS, SeizureWorkup, AlteredMS, Headache, Vertigo, Weakness |
| Trials hub | 1 | `/trials` |
| Trial detail pages | Dynamic | `/trials/:slug` — driven by trialListData; not static routes |
| Dev-only | 1 | `/dev/rct-chain-test` (DEV only) |
| AHA 2026 Guideline | 1 | `/guide/aha-2026-guideline` |

**Note:** Trial detail pages use a dynamic route (`/trials/:slug`) served by `TrialPageNew.tsx`. Not counted in the 39 static routes.

---

## Clinical Data Files

| File | Lines | Purpose | Risk Level |
|---|---|---|---|
| `src/data/trialData.ts` | 9,781 | All trial metadata (schemas + data) | HIGH — entire file is clinical content |
| `src/data/trialListData.ts` | 438 | Trial index/catalog for listing | HIGH |
| `src/data/trialCatalogMeta.ts` | 178 | Legacy catalog metadata | HIGH |
| `src/data/trialPayload.ts` | 46 | Dynamic trial payload loader | MEDIUM |
| `src/data/trialVisualizations.ts` | 314 | Chart/viz data for trials | HIGH |
| `src/data/guideContent.ts` | 1,486 | Guide article content strings | HIGH |
| `src/data/strokeClinicalPearls.ts` | 824 | Clinical pearls for Study Mode | HIGH |
| `src/data/aha2026StrokeGuideline.ts` | 1,129 | AHA/ASA 2026 guideline data | HIGH |
| `src/data/abcd2ScoreData.ts` | ~200 | ABCD2 calculator data | HIGH |
| `src/data/gcsScoreData.ts` | ~200 | GCS calculator data | HIGH |
| `src/data/hasBledScoreData.ts` | ~200 | HAS-BLED calculator data | HIGH |
| `src/data/ichScoreData.ts` | ~200 | ICH Score calculator data | HIGH |
| `src/data/ropeScoreData.ts` | ~200 | ROPE score data | HIGH |
| `src/data/heidelbergBleedingData.ts` | ~200 | Heidelberg classification data | HIGH |
| `src/data/bostonCriteriaCaaData.ts` | ~200 | Boston Criteria CAA data | HIGH |
| `src/data/cha2ds2VascData.ts` | ~200 | CHA2DS2-VASc data | HIGH |
| `src/data/trial-questions.ts` | ~500 | Trial-linked quiz questions | HIGH |
| `src/data/medicalGlossary.ts` | ~300 | Medical tooltip glossary | MEDIUM |
| `src/data/scenarios.ts` | ~200 | Clinical scenario data | HIGH |
| `src/data/pathways.ts` | ~100 | Pathway metadata | MEDIUM |
| `src/data/calculators.ts` | ~150 | Calculator metadata index | MEDIUM |

---

## Calculator Files

| Calculator | Page File | Data File | Notes |
|---|---|---|---|
| NIHSS | `src/pages/NihssCalculator.tsx` | embedded | Complex multi-item scoring |
| ASPECTS | `src/pages/AspectScoreCalculator.tsx` | embedded | Region-based scoring |
| ICH Score | `src/pages/IchScoreCalculator.tsx` | `ichScoreData.ts` | |
| ABCD2 | `src/pages/Abcd2ScoreCalculator.tsx` | `abcd2ScoreData.ts` | |
| HAS-BLED | `src/pages/HasBledScoreCalculator.tsx` | `hasBledScoreData.ts` | |
| ROPE Score | `src/pages/RopeScoreCalculator.tsx` | `ropeScoreData.ts` | |
| CHA2DS2-VASc | `src/pages/Cha2ds2VascCalculator.tsx` | `cha2ds2VascData.ts` | |
| GCS | `src/pages/GlasgowComaScaleCalculator.tsx` | `gcsScoreData.ts` | ADR-001 |
| Heidelberg | `src/pages/HeidelbergBleedingCalculator.tsx` | `heidelbergBleedingData.ts` | ADR-004 |
| Boston CAA | `src/pages/BostonCriteriaCaaCalculator.tsx` | `bostonCriteriaCaaData.ts` | |
| EM Billing | `src/pages/EmBillingCalculator.tsx` | embedded | 87.9 kB chunk (large) |
| EVT Pathway | `src/pages/EvtPathway.tsx` | embedded | 74 kB chunk |

---

## Trial Files

| File | Purpose |
|---|---|
| `src/data/trialData.ts` | Full trial metadata (9,781 lines — ALL trials in one file) |
| `src/data/trialListData.ts` | Trial index for list/catalog view |
| `src/data/trialCatalogMeta.ts` | Legacy catalog with DOI/year metadata |
| `src/data/trialPayload.ts` | `loadTrialPayload()` dynamic loader |
| `src/data/trialVisualizations.ts` | Chart data for visualization components |
| `src/pages/trials/TrialPageNew.tsx` | 7,469-line single-file trial renderer |
| `src/components/trials/` | Trial sub-components (BottomLineDrawer, TeachingWell, SubgroupWell, etc.) |
| `src/components/trials/archetypes/` | Chart archetypes (DeltaBandChart, GrottaBarChart, BenchmarkThresholdChart) |

---

## Citation Registry Files

| File | Status | Notes |
|---|---|---|
| `src/lib/citations/schema.ts` | EXISTS | Types only (Citation, CitationSourceType, ClaimRegistry) |
| `src/lib/citations/claims.ts` | EXISTS (stub) | `CLAIM_REGISTRY = {}` — empty, W5.2 not shipped |
| `src/lib/citations/claim.ts` | EXISTS | `claim()` helper for Phase 2 surface tagging |
| `src/lib/citations/registry.ts` | **MISSING** | Not created; check-claims warns about this |

**Critical finding:** No `data-claim` attributes exist anywhere in JSX. Phase 1 clinical claim tagging is unimplemented. The entire clinical content governance system is infrastructure-only — the citation registry and claim mapping are stubs.

---

## Agent/Governance Files

| Location | Contents | Status |
|---|---|---|
| `.claude/agents/` | 15 agent briefs (Core 6 + Contextual 10, minus Meta 3) | CANONICAL — used by Claude Code |
| `.claude/commands/` | 8 slash commands (status, focus, park, classify, plan-feature, audit-citations, pr-ready, rollback) | ACTIVE |
| `.claude/skills/` | 6 skill folders (accessibility-audit, clinical-trial-audit, humanizer, performance, stroke-guidelines, trial-statistics) | ACTIVE |
| `.claude/meta/` | 3 meta docs (pm-agent, orchestrator, build-engineer) | ACTIVE |
| `.claude/rules/` | 2 rule files (clinical-review-templates.md, clinical-surfaces.md) | ACTIVE |
| `.claude/hooks/` | 4 hooks (clinical-stop-check, guard-clinical-edit, risky-bash-guard, validate-clinical-agent-output) | ADVISORY (exit 0) |
| `agents/active/` | **DUPLICATE** — older agent briefs at root `/agents/active/` | LEGACY/STALE |
| `agents/dormant/` | compliance-legal, performance-optimizer | LEGACY |
| `AGENTS.md` (root) | Legacy agent manifest | SUPERSEDED by .claude/agents/ |
| `ORCHESTRATION.md` (root) | Legacy orchestration doc | SUPERSEDED by .claude/meta/ |

---

## Scripts and Hooks

| Script | Purpose | Status |
|---|---|---|
| `scripts/check-claims.ts` | Citation registry validator (freshness, registry lookup) | ACTIVE — runs in pre-commit |
| `scripts/validateRouteManifest.mjs` | Route manifest consistency validator | ACTIVE — runs in pre-commit |
| `scripts/verifyTrials.js` | Trial data verification | EXISTS — not in package.json scripts |
| `scripts/claude-hooks/` | 4 Claude Code hooks (advisory) | ACTIVE but exit 0 |
| `.husky/pre-commit` | Runs check:claims + check:routes | ACTIVE |

---

## Tests

**Zero test files found.** No unit tests, no integration tests, no e2e tests.  
No test runner (Jest, Vitest, Playwright) configured.  
No test script in package.json.

---

## Build/Config Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite build config (with rollup-plugin-visualizer for analyze mode) |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.js` | Tailwind config |
| `vercel.json` | Vercel SPA rewrite rules |
| `netlify.toml` | Netlify config (likely unused — hosted on Vercel) |
| `package.json` | Deps + scripts |
| `index.html` | App entry point |
| `src/App.tsx` | React router + lazy loading |

---

## Suspected Dead / Orphaned Files

| File/Dir | Why Suspected Dead | Action Required |
|---|---|---|
| `netlify.toml` + `netlify/functions/` | App hosted on Vercel; Netlify config unused | Confirm then delete — Class B |
| `functions/api/` | Appears duplicate of `api/` (Vercel functions) | Investigate |
| `services/` | Empty directory | Delete — Class B |
| `audit/` | Only `.gitkeep` | Delete — Class B |
| `agents/` (root) | Duplicates `.claude/agents/`; legacy | Archive/delete — Class D |
| `AGENTS.md` (root) | Superseded by `.claude/agents/` | Delete or redirect — Class B |
| `ORCHESTRATION.md` (root) | Superseded by `.claude/meta/` | Delete or redirect — Class B |
| `"eval $(ssh-agent -s)"` | Accidentally committed file | **Delete immediately — Class B** |
| `"eval $(ssh-agent -s)".pub` | Accidentally committed SSH pubkey | **Delete immediately — Class B** |
| `.claude/worktrees/agent-ab9d815f*/` | Orphaned worktree | Remove from filesystem — Class B |
| `.claude/worktrees/vibrant-dewdney*/` | Orphaned worktree | Remove from filesystem — Class B |
| `src/pages/dev/RCTChainTest.tsx` | DEV-only page, gated by import.meta.env.DEV | Keep — dev utility |
| `src/pages/Wiki.tsx` | No route in routeManifest.ts for `/wiki` | Investigate |
| `src/pages/ResidentGuide.tsx` | Not found in routeManifest — may be unmapped | Investigate |
| `src/pages/ResidentToolkit.tsx` | Not found in routeManifest — may be unmapped | Investigate |
| `src/pages/QuestionDetailPage.tsx` | Not found as static route — may be dynamic | Investigate |
| `index.css`, `index.tsx` (root) | Root-level — likely legacy (src/main.tsx is entry) | Investigate |
| `types.ts` (root) | Root-level types — may duplicate src/ | Investigate |
| `metadata.json` (root) | Purpose unclear | Investigate |
| `project_tree.txt` (root) | Stale snapshot | Delete — Class B |

---

## Risky Files Requiring Clinical Review Before Edit

Per CLAUDE.md §13.3 / `.claude/rules/clinical-surfaces.md`:

- `src/data/trialData.ts`
- `src/data/trialCatalogMeta.ts`
- `src/data/trials/` (all files)
- `src/lib/citations/`
- `src/pages/guide/` (all files)
- `src/pages/calculators/` (all calculator pages)
- `src/components/calculators/` (all calculator components)
- `src/components/article/` (all article components)
- `src/data/strokeClinicalPearls.ts`
- `src/data/aha2026StrokeGuideline.ts`
- `src/data/guideContent.ts`

Any edit to these files is Class C-clinical minimum. Algorithm/threshold changes are Class E.

---

## Duplicate / Overlapping Files

| Issue | Files | Risk |
|---|---|---|
| Agent briefs in two locations | `.claude/agents/*.md` vs `agents/active/*.md` | Governance confusion |
| SEO report duplicated | `SEO-AUDIT-REPORT.md` (root) + `docs/SEO-STRATEGY-IMPLEMENTATION.md` | Stale root copy |
| Performance audit duplicated | `docs/PERFORMANCE-AUDIT-REPORT.md` + `docs/PERFORMANCE_AUDIT.md` | Redundant |
| Stroke guideline duplicated | `2026-AHA-Stroke-guideline.md` (root) + `docs/2026-AHA-Stroke-guideline.md` | One is a copy |
| Trial verification duplicated | `docs/TRIAL_DATA_VERIFICATION_COMPLETE.md` + `docs/TRIAL_VERIFICATION_REPORT.md` | Redundant |
| `trialCatalogMeta.ts` vs `trialListData.ts` | Both export trial catalog data | Partial overlap |
