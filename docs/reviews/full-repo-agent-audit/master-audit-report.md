# Master Audit Report — NeuroWiki Full-Repo Agent Swarm Audit

**Date:** 2026-05-08  
**Branch:** main  
**Commit at audit start:** 9627e0e  
**Audit type:** Class D full-repo audit + Class E clinical review (read-only)  
**Agents invoked:** 15 (all Core 6 + all Contextual per CLAUDE.md §11)

---

# Executive Summary

NeuroWiki is a well-structured clinical decision support SPA with sound routing architecture, careful trial data modeling, and a thoughtful citation governance schema. The app builds cleanly, typechecks cleanly, and routes correctly.

**Three categories dominate the findings:**

1. **Security (P0):** A real SSH private key (ed25519, associated with `nurvepc@gmail.com`) is committed in git history. This must be revoked and scrubbed before any further action. No clinical content was compromised, but the key itself is exposed to anyone with repo access.

2. **Clinical governance gap (P0):** The entire citation claim governance system (CLAUDE.md §13.2–13.7) is infrastructure-only. `registry.ts` is missing, `CLAIM_REGISTRY` is an empty stub, zero `data-claim` tags exist in JSX. The clinical content is largely accurate (Green/Yellow by medical-scientist and clinical-reviewer), but it is ungoverned — there is no automated safety net for content drift.

3. **Performance (P1):** The `TrialPageNew.tsx` component is 7,469 lines and generates an 837 kB raw / 172 kB gzip bundle chunk. The main `index` chunk is 589 kB. These are the dominant LCP risks on mobile.

---

## Top 10 Issues

| # | Issue | Severity | Agent |
|---|---|---|---|
| 1 | SSH private key committed to git history | **P0 SECURITY** | system-architect |
| 2 | Citation registry (`registry.ts`) missing; all clinical claims ungoverned | P0 | evidence-verifier |
| 3 | NNT bypass gate: 8 JSX sites ignore `suppressNNT` flag; ordinal-shift trials display invalid NNT | P0 | trial-statistician |
| 4 | DOAC pearl tagged Class III but contains a permissive recommendation — internally contradictory badge | P0 | clinical-reviewer |
| 5 | Tenecteplase labeled "preferred for LVO" — exceeds AHA/ASA 2026 (which says equivalent, not preferred) | P0 | clinical-reviewer |
| 6 | Google Analytics fires before any cookie consent — GDPR violation | P0 | compliance-legal |
| 7 | NIHSS calculator has no in-page disclaimer | P0 | compliance-legal |
| 8 | No Privacy Policy, Terms of Use, or Accessibility Statement routed page | P0 | compliance-legal |
| 9 | Drug dosing (tPA/TNK) displayed in stroke code workflow without adjacent per-use disclaimer | P0 | compliance-legal |
| 10 | TrialPageNew.tsx = 7,469 lines → 837 kB chunk; main index = 589 kB | P1 | performance |

---

## Top 10 Recommended Fixes

| # | Fix | Class | Agent to Lead |
|---|---|---|---|
| 1 | Revoke SSH key; remove from git and scrub history | — (security emergency) | V (key owner) must revoke first |
| 2 | Ship W5.2: create `registry.ts` + populate `claims.ts` | Class D-clinical | medical-scientist + clinical-reviewer |
| 3 | Fix NNT render sites: gate `calculations?.nnt != null` behind `!stats.suppressNNT` | Class E | trial-statistician → clinical-reviewer |
| 4 | Re-tag DOAC pearl from Class III to Class IIb | Class E | medical-scientist + clinical-reviewer |
| 5 | Fix tenecteplase wording on IvTpa.tsx | Class E | medical-scientist + clinical-reviewer |
| 6 | Implement cookie consent gate before GA fires | Class D | compliance-legal → ui-architect |
| 7 | Add NIHSS in-page disclaimer | Class C | content-writer + ui-architect |
| 8 | Create Privacy Policy page | Class C | content-writer + ui-architect |
| 9 | Decompose `TrialPageNew.tsx` + lazy-load chart archetypes | Class D | system-architect → ui-architect |
| 10 | Add `tsc --noEmit` to pre-commit hook | Class C | quality-assurance |

---

## What Was Cleaned

**Nothing was changed in source files.** All cleanup actions were either denied at permission gate or intentionally deferred to V review. The audit produced only documentation artifacts. See [cleanup-log.md](cleanup-log.md).

---

## What Remains Risky

- SSH private key in git history (P0 — must revoke before any other work)
- Clinical claim tagging entirely absent (all content ungoverned)
- Two block-level clinical findings (DOAC Class III tag, TNK "preferred" wording)
- Google Analytics without consent (GDPR violation)
- Missing Privacy Policy page (GDPR violation)
- Drug dosing in stroke workflow without adjacent disclaimer
- 837 kB trial page chunk (mobile LCP risk)
- Zero tests (no safety net for any formula or routing regression)

---

# Audit Coverage

| Area | Agent | Status | Artifact |
|---|---|---|---|
| App architecture, routing, data flow | system-architect | Complete | [system-architect.md](agents/system-architect.md) |
| UI consistency, design tokens, components | ui-architect | Complete | [ui-architect.md](agents/ui-architect.md) |
| Mobile UX, 375px viewport, touch targets | mobile-first-developer | Complete | [mobile-first-developer.md](agents/mobile-first-developer.md) |
| Clinical content quality and accuracy | medical-scientist | Complete | [medical-scientist.md](agents/medical-scientist.md) |
| Citation registry, DOI/PMID, claim mapping | evidence-verifier | Complete | [evidence-verifier.md](agents/evidence-verifier.md) |
| Statistical display, NNT, archetypes | trial-statistician | Complete | [trial-statistician.md](agents/trial-statistician.md) |
| Clinical safety gate | clinical-reviewer | Complete | [clinical-reviewer.md](agents/clinical-reviewer.md) |
| Calculator formulas, edge cases, safety | calculator-engineer | Complete | [calculator-engineer.md](agents/calculator-engineer.md) |
| Tests, build, TypeScript, routes | quality-assurance | Complete | [quality-assurance.md](agents/quality-assurance.md) |
| Accessibility, ARIA, keyboard, focus | accessibility-specialist | Complete | [accessibility-specialist.md](agents/accessibility-specialist.md) |
| Bundle size, lazy loading, Core Web Vitals | performance | Complete | [performance.md](agents/performance.md) |
| SEO, metadata, structured data, sitemap | seo-specialist | Complete | [seo-specialist.md](agents/seo-specialist.md) |
| Compliance, GDPR, disclaimers, PHI | compliance-legal | Complete | [compliance-legal.md](agents/compliance-legal.md) |
| Content voice, clarity, AI-fingerprint | content-writer | Complete | [content-writer.md](agents/content-writer.md) |
| Docs organization, TASKS.md, ROADMAP | librarian | Complete | [librarian.md](agents/librarian.md) |

---

# Critical Findings

## P0: Must Fix Before Clinical Trust

| ID | Finding | Agent | Location |
|---|---|---|---|
| SEC-1 | SSH private key (ed25519, nurvepc@gmail.com) committed to git root | system-architect | `eval "$(ssh-agent -s)"` |
| CIT-1 | `registry.ts` missing; `CLAIM_REGISTRY = {}`; zero data-claim tags in JSX | evidence-verifier | `src/lib/citations/` |
| NNT-1 | 8 JSX render sites bypass `suppressNNT` gate; ordinal-shift trials show invalid NNT | trial-statistician | `src/pages/trials/TrialPageNew.tsx:540,939,1175…` |
| CLIN-1 | DOAC pearl `evidenceClass: 'III'` contradicts its own permissive recommendation | clinical-reviewer | `src/data/strokeClinicalPearls.ts:166–176` |
| CLIN-2 | Tenecteplase "preferred for LVO" exceeds AHA/ASA 2026 scope (equivalent, not preferred) | clinical-reviewer | `src/pages/guide/IvTpa.tsx:62` |
| GDPR-1 | Google Analytics fires before any user consent (GDPR Article 7 violation) | compliance-legal | `index.html:117–123` |
| COMP-1 | No Privacy Policy, Terms of Use, or Accessibility Statement page | compliance-legal | (no route exists) |
| COMP-2 | tPA/TNK dosing displayed in stroke code workflow without adjacent per-use disclaimer | compliance-legal | `CodeModeStep1.tsx:352–361`, `CodeModeStep2.tsx:229–236` |
| COMP-3 | NIHSS calculator has no in-page disclaimer | compliance-legal | `src/pages/NihssCalculator.tsx` |

## P1: Should Fix Soon

| ID | Finding | Agent | Location |
|---|---|---|---|
| PERF-1 | TrialPageNew chunk = 837 kB raw; main index = 589 kB | performance | `src/pages/trials/TrialPageNew.tsx` |
| DATA-1 | Home.tsx transitively imports full `trialData.ts` (9,781 lines) via scenarios → trialListData | system-architect | `src/pages/Home.tsx` → `src/data/scenarios.ts` |
| ARCH-1 | Two parallel agent registries: `agents/` (root, legacy) vs `.claude/agents/` (canonical) | system-architect | `agents/` root directory |
| ARCH-2 | Orphaned worktrees contain stale governance docs — surfaced by grep/file-search | system-architect | `.claude/worktrees/agent-ab9d815f*/`, `vibrant-dewdney*/` |
| ACC-1 | NIHSS NihssItemCard.tsx has no radiogroup semantics — P0 accessibility failure | accessibility-specialist | `src/components/NihssItemCard.tsx` |
| ACC-2 | DisclaimerModal + GlobalTrialModal have no `role="dialog"`, no focus trap | accessibility-specialist | `src/components/DisclaimerModal.tsx`, `GlobalTrialModal.tsx` |
| UI-1 | TrialPageNew.tsx is 7,469-line monolith with per-trial JSX — no consistent template | ui-architect | `src/pages/trials/TrialPageNew.tsx` |
| UI-2 | Dark mode broken for entire trials subtree (BottomLineDrawer, TeachingWell, SubgroupWell) | ui-architect | `src/components/trials/` |
| QA-1 | Zero test files; no test runner configured | quality-assurance | Entire repo |
| QA-2 | `tsc --noEmit` not in pre-commit hook; type regressions can reach main | quality-assurance | `.husky/pre-commit` |
| SEO-1 | Duplicate title between `/guide/stroke-basics` and `/pathways/stroke-code` | seo-specialist | `src/config/routeManifest.ts:381, 444` |
| SEO-2 | Sitemap lists 6 pathway pages under `/calculators/...` URLs (redirect targets) — crawlers 404 | seo-specialist | `public/sitemap.xml` |
| MOB-1 | Touch targets below 44px: TrialLegendCard star (~18px), NihssCalculator LVO button (~12px), 4 modal close buttons (32px) | mobile-first-developer | Multiple |
| MOB-2 | `safe-area-inset-bottom` invalid CSS class in StrokeBasicsWorkflowV2 | mobile-first-developer | `src/pages/guide/StrokeBasicsWorkflowV2.tsx:772` |
| CALC-1 | NIHSS RACE tooltip states "85% sensitivity for LVO" but code uses 85% as probability only at RACE 7-9 | calculator-engineer | `src/pages/NihssCalculator.tsx` |
| CALC-2 | ABCD2 tier-collapsing hides per-score gradient; missing discrimination caveat (Wardlaw 2015) | calculator-engineer | `src/data/abcd2ScoreData.ts` |
| CLIN-3 | NINDS pearl: percentages lack "Part 2" qualifier; sICH definition window missing | clinical-reviewer | `src/data/strokeClinicalPearls.ts:96–110` |
| CLIN-4 | "When in doubt, treat" in mimics pearl exceeds AHA/ASA scope | clinical-reviewer | `src/data/strokeClinicalPearls.ts:189–198` |
| STAT-1 | 7 NI trials (DIRECT-MT, DEVT, SWIFT-DIRECT, SKIP, DIRECT-SAFE, ASTER, ASTER2) on DeltaBand (superiority archetype) | trial-statistician | `src/data/trialData.ts` |
| STAT-2 | ARD displayed without CI for NINDS, DAWN, DEFUSE-3, CHOICE primary stat tiles | trial-statistician | `src/data/trialData.ts` |

## P2: Cleanup / Quality

| ID | Finding | Agent |
|---|---|---|
| CON-1 | ABCD2 interpretation strings are placeholder-quality — no named citations, no numbers | content-writer |
| CON-2 | `buildHouseConclusion()` generates identical closing sentence for DAWN and SOCRATES | content-writer |
| CON-3 | Thrombolytic naming inconsistency (alteplase/tPA/IV tPA/IV thrombolysis) across codebase | content-writer |
| DOC-1 | 40+ docs at `docs/` root need organizing into subdirs | librarian |
| DOC-2 | Root-level duplicate: `2026-AHA-Stroke-guideline.md` duplicates `docs/` copy | librarian |
| DOC-3 | Orphaned root files: `GEO-ANALYSIS.md`, `SEO-AUDIT-REPORT.md`, `UI_UX_NEUROWIKI_AUDIT.md`, `ORCHESTRATION.md` | librarian |
| STAT-3 | DEFUSE-3 `primaryEndpoint` shows mRS 0-2 (secondary) not mRS shift (primary per NEJM 2018) | trial-statistician |
| SEO-3 | 7 titles over 60 characters; 14+ descriptions over 160 characters | seo-specialist |
| SEO-4 | Trial `MedicalScholarlyArticle` schema underpopulated (no author, datePublished, doi) | seo-specialist |
| COMP-4 | "Do not give tPA/TNK" is prescriptive directive language; should be hedged | compliance-legal |
| ACC-3 | `text-slate-400` on white fails 4.5:1 contrast (WCAG 1.4.3) | accessibility-specialist |
| ACC-4 | MedicalTooltip only opens on hover, not keyboard focus (WCAG 1.4.13) | accessibility-specialist |
| PERF-2 | `reactSnap.include` pre-renders redirect routes — wasted build time | system-architect |
| PMID | ~89% of trial entries in trialData.ts missing PMID | evidence-verifier |

---

# Clinical Safety Findings

## Citation Issues

- **Registry entirely missing** — `registry.ts`, `CLAIM_REGISTRY`, `data-claim` tags: all absent. All clinical content is ungoverned by the §13.5 system.
- **No `last_reviewed` populated** anywhere in codebase.
- **PMID coverage**: only ~11% of trial entries in `trialData.ts` (~10/89).
- **DOI coverage**: strong — 100% in list/catalog meta files, ~82% in `trialData.ts`.
- **~10 orphan trials** in `trialData.ts` not in the list/catalog — may not appear on trials index page.

## Calculator Risks

- **NIHSS**: Unscored items default to 0 silently (no "incomplete" indicator). RACE tooltip mixes sensitivity and probability.
- **ABCD2**: Tier-collapsing hides within-tier gradient. No Wardlaw 2015 discrimination caveat.
- **ICH Score**: Score 5/6 display "100% 30-day mortality" without small-sample badge (n=1 derivation, extrapolated).
- **HAS-BLED**: Classification thresholds appear to follow ESC AF guidelines, not Pisters 2010 — source not cited.

## Guideline Risks

- AHA/ASA 2026 file content accuracy confirmed. DOI `10.1161/STR.0000000000000513` may be a placeholder shared with 2019 update — verify resolution.
- Door-to-needle target inconsistency: `IvTpa.tsx` says <45 min; pearls say <60 min target / <30 min excellence.

## Language Risks

- DOAC pearl Class III tag contradicts permissive content (block-level).
- Tenecteplase "preferred for LVO" exceeds AHA/ASA scope (block-level).
- "When in doubt, treat" in mimics pearl is stronger than AHA/ASA wording.
- ESCALE-III/3–4.5h window section attributes to "modern guidelines" without naming them.
- Neuron-loss and 4% delay figures presented as measured biological constants (model-derived).

---

# Code Quality Findings

## Dead Code

- `agents/` root directory (duplicate of `.claude/agents/`) — governance confusion risk
- `AGENTS.md` root (superseded by `.claude/agents/`)
- `ORCHESTRATION.md` root (superseded by `.claude/meta/`)
- `audit/` directory (only `audit-checklist.md` — not using `docs/reviews/`)
- SSH key files with shell-command filenames (see SEC-1)

## Duplicated Code

- `sanitizeLegacyTrialContent`, `formatTrialArm`, `buildTrialSummaryItems` are data utilities inside a page component (`TrialPageNew.tsx`) — should be in `src/utils/trialContent.ts`
- Near-identical hub hero components: Guide, Calculators, Pathways, Trials
- `navHref` copy-pasted between `DesktopRail` and `MobileBottomNav`
- 153 inline `style={}` objects bypassing Tailwind token system across 27 component files

## Type Issues

- TypeScript `strict: true` not enabled
- 9 `as any` casts found in analytics and pathway pages
- No `@ts-ignore` suppressions (positive)

## Test Gaps

- Zero test files anywhere in the repo
- No Vitest, Jest, or Playwright configured
- Priority order for tests: NIHSS scoring, ASPECTS scoring, ICH Score, ABCD2 scoring, stroke dosing utility, hooks (useFavorites, useRecents)

## Routing Issues

- `pathways-stroke-code` and `stroke-basics` both map to `<StrokeBasics />` without annotation
- `reactSnap.include` pre-renders redirect targets (`/calculators/evt-pathway` etc.)
- `src/pages/Wiki.tsx`, `ResidentGuide.tsx`, `ResidentToolkit.tsx` exist without confirmed routes

---

# UI/UX Findings

## Mobile

- Touch targets: TrialLegendCard star ~18px, NihssCalculator LVO button ~12px, 4 modal close buttons 32px — all below 44px minimum
- `safe-area-inset-bottom` is invalid CSS class in stroke workflow (iOS home indicator gap)
- NIHSS text-[8px] and text-[9px] labels are below legibility floor
- StrokeBasicsWorkflowV2 sticky header: `top-16` (64px) with MobileHeader at 60px leaves 4px gap
- `scrollMarginTop: '163px'` hardcoded — breaks when QuickReferenceCard visible in study mode

## Accessibility

- NIHSS `NihssItemCard.tsx`: option buttons are plain `<button>` in `<div>`, no `role="radiogroup"`, no `aria-labelledby`, no `role="radio"`, no `aria-checked`, no `aria-live` on score total — Level A failure
- `DisclaimerModal` and `GlobalTrialModal`: no `role="dialog"`, no `aria-modal`, no focus trap, no focus return
- `GrottaBarChart` bar segments: pure `<div>` with `onClick`, no ARIA — inaccessible
- `text-slate-400` on white: fails 4.5:1 contrast ratio
- `MedicalTooltip`: opens on hover only, not keyboard focus

## Calculator Flow

- Calculator pages lack uniform disclaimer footer (NIHSS, ROPE, Heidelberg, Boston CAA missing)

## Trial Data Display

- TrialPageNew.tsx: no consistent visual template — each trial block is hand-authored
- Dark mode broken for entire trials component subtree
- 7 NI trials rendered on DeltaBand (superiority archetype)
- ARD displayed without CI on NINDS, DAWN, DEFUSE-3, CHOICE primary stat tiles

## Navigation

- Desktop rail and DesktopTopBar lack dark mode variants

---

# Performance Findings

## Bundle Risks

| Chunk | Raw | Gzip | Root cause |
|---|---|---|---|
| TrialPageNew | 837 kB | 172 kB | Monolithic 7,469-line component + all chart archetypes bundled |
| index | 589 kB | 148 kB | Home page transitively imports all 9,781 lines of trialData.ts |
| react-vendor | 230 kB | 73 kB | Normal (React 19 + Router + Recharts) |

## Data Loading Risks

- All 9,781 lines of `trialData.ts` are eagerly imported by `trialListData.ts` which is imported by `scenarios.ts` which is imported by `Home.tsx`. This means every visitor's first page load carries the entire trial corpus.
- `trialPayload.ts` uses dynamic `import()` correctly for trial detail pages — replicate this on the home path.

## Lazy Loading

- All page components correctly use `React.lazy()`.
- Chart archetypes (`DeltaBandChart`, `GrottaBarChart`, `BenchmarkThresholdChart`) are eagerly bundled into `TrialPageNew` chunk — should be internally lazy.
- `react-markdown` + `remark-gfm` bundled into the trial page chunk.

## Core Web Vitals Risks

- **LCP**: HIGH — 172 kB gzip chunk blocks trial page first render (~9 sec on slow 3G)
- **CLS**: MEDIUM — async chart loads without placeholders
- **INP**: MEDIUM — heavy JS parse/compile of 837 kB on main thread

## Top Performance Fixes

1. Lazy-load chart archetypes internally within TrialPageNew — est. ~80–120 kB gzip savings
2. Lazy boundary on home-route trial imports (break trialListData → trialData coupling) — est. ~120–150 kB reduction on home chunk
3. Split `guideContent.ts` by guide article — ~30–50 kB gzip savings
4. Move `react-markdown` to internal lazy import — ~15–20 kB gzip
5. Total potential recovery: ~400–500 kB gzip + 40–60% LCP improvement

---

# SEO / Public-Facing Findings

## Metadata

- Duplicate title: `/guide/stroke-basics` and `/pathways/stroke-code` share identical title string
- 7 route titles exceed 60 characters
- 14+ route descriptions exceed 160 characters
- `trials-hub` description is 285 characters

## Sitemap

- 6 pathway pages listed under `/calculators/...` URLs (redirect targets) — all 404 for crawlers
- `STATIC_SITEMAP_ROUTES` export exists but is not used to validate or generate the sitemap — manual drift

## Structured Data

- `MedicalScholarlyArticle` schema on trial pages has no `author`, `datePublished`, or `doi`
- Organization schema uses favicon as logo (below 112px minimum) and empty `sameAs`
- `/pathways` hub has no structured data (returns `null` explicitly)

## Internal Linking

- ABCD2 calculator node is orphaned (no inbound edges in link-graph.json)
- 13 guide article nodes reference no other pages
- `pathway/stroke/step-2` referenced by calc/ich-score and calc/gcs but does not exist as a node

---

# Cleanup Performed

None. All cleanup was deferred for V approval or requires Class D/E workflow. See [cleanup-log.md](cleanup-log.md).

---

# Cleanup Not Performed

| Issue | Why Not Changed | Required Reviewer | Suggested Next Step |
|---|---|---|---|
| SSH private key in git history | Requires key revocation first, then destructive history rewrite | V (key owner) | Revoke key on GitHub immediately |
| Orphaned worktrees | Permission denied | V approval | `rm -rf .claude/worktrees/agent-ab9d815fae22ee79d .claude/worktrees/vibrant-dewdney-4f0ed7` |
| project_tree.txt stale snapshot | Permission denied | None | `git rm project_tree.txt` |
| Duplicate root MD files | Canonical version unclear | librarian | Confirm canonical, then `git rm` root copies |
| NNT render site bypass | Clinical logic — Class E required | trial-statistician + clinical-reviewer | Gate sites behind `!stats.suppressNNT` |
| DOAC Class III mislabel | Clinical content — Class E required | clinical-reviewer | Re-tag after AHA/ASA 2026 §4.6 verification |
| TNK "preferred" wording | Clinical content — Class E required | clinical-reviewer | Change to "equivalent first-line" |
| Cookie consent before GA | Architecture change — Class D | compliance-legal → ui-architect | Conditional GA loading |
| Privacy Policy page | Content creation required | content-writer + ui-architect | New route + copy |
| NI trial archetype mismatch | New archetype required — Class D-clinical + ADR | trial-statistician | Author NIMarginChart |
| registry.ts / W5.2 | Pending feature work | medical-scientist | Next clinical sprint |
| Zero test files | Vitest setup required | quality-assurance | Class D: test infrastructure |

---

# Recommended Next PRs

## PR 1 — P0 Security (immediate — before any other work)

**Title:** `security: remove committed SSH private key`  
**Actions:** Revoke key on GitHub. `git rm "eval..."` + `git filter-repo` to scrub history.  
**Class:** Security emergency — not a standard class.

## PR 2 — P0 Clinical Safety Batch (Class E)

**Title:** `clinical(pearls): fix DOAC Class III mislabel and TNK wording`  
**Actions:** Re-tag DOAC pearl `evidenceClass` to `'IIb'`. Change TNK "preferred" to "equivalent first-line". Address NINDS Part 2 qualifier. Fix mimics pearl "when in doubt, treat."  
**Class:** E — full evidence-verifier + medical-scientist + clinical-reviewer workflow required.

## PR 3 — P0 Trial Statistics (Class E)

**Title:** `clinical(trials): fix NNT bypass gate for ordinal-shift trials`  
**Actions:** Gate all 8 `calculations?.nnt != null` JSX sites behind `!stats.suppressNNT`. Strip `calculations.nnt` from ordinal-shift trial data objects.  
**Class:** E — clinical-reviewer + trial-statistician sign-off required.

## PR 4 — P0 Compliance Blockers (Class D)

**Title:** `fix(compliance): cookie consent before GA + NIHSS disclaimer + dosing disclaimer`  
**Actions:** Implement cookie consent banner with conditional GA loading. Add NIHSS in-page disclaimer. Add dosing disclaimer adjacent to tPA/TNK displays in stroke code workflow.  
**Class:** D — compliance-legal → ui-architect + content-writer.

## PR 5 — P0 Compliance: Privacy Policy + Legal Pages (Class C)

**Title:** `feat(legal): add Privacy Policy, Terms of Use, Accessibility Statement routes`  
**Actions:** Create `/privacy`, `/terms`, `/accessibility` routes with correct copy.  
**Class:** C — content-writer + ui-architect.

## PR 6 — P1 Test Coverage (Class D)

**Title:** `test: add Vitest + Phase 1 calculator scoring tests`  
**Actions:** Set up Vitest. Tests for NIHSS, ASPECTS, ICH Score, ABCD2, stroke dosing utility. Target: 50+ tests, 70% calculator coverage.  
**Class:** D — quality-assurance.

## PR 7 — P1 Citation Registry W5.2 (Class D-clinical)

**Title:** `feat(citations): ship registry.ts + seed CLAIM_REGISTRY`  
**Actions:** Create `registry.ts` with at minimum AHA/ASA 2026 guideline and key landmark trial citations. Populate `claims.ts`. Add `tsc --noEmit` to pre-commit.  
**Class:** D-clinical — medical-scientist authors, clinical-reviewer gates.

## PR 8 — P1 Performance (Class D)

**Title:** `perf: lazy-load chart archetypes + break trialData home-route coupling`  
**Actions:** Internal lazy import for chart archetypes in TrialPageNew. Dynamic boundary in trialListData to break full trialData import on home route.  
**Class:** D — system-architect review → ui-architect + quality-assurance.

## PR 9 — P2 Accessibility Batch (Class C)

**Title:** `fix(a11y): NIHSS radiogroup semantics + modal focus management + GrottaBar ARIA`  
**Actions:** Add `role="radiogroup"` + `aria-checked` + `aria-live` to NihssItemCard. Add `role="dialog"` + focus trap + focus return to DisclaimerModal and GlobalTrialModal. Add `role="img"` + `aria-label` to GrottaBarChart segments.  
**Class:** C — accessibility-specialist.

## PR 10 — P2 Governance Cleanup (Class D)

**Title:** `chore(governance): remove agents/ legacy dir + orphaned worktrees + root MD pollution`  
**Actions:** `git rm -r agents/`. Remove orphaned worktrees from disk. Move root-level audit docs to `docs/audits/`.  
**Class:** D — system-architect + librarian.

---

# Verification Results

## npm run build
**Result: PASS** (with chunk size warnings)

| Chunk | Raw | Gzip |
|---|---|---|
| TrialPageNew | 837.10 kB | 172.44 kB |
| index | 589.11 kB | 148.77 kB |
| react-vendor | 230.71 kB | 73.73 kB |

## npm run typecheck
**Result: PASS** — no TypeScript errors

## npm run check:claims
**Result: PASS with WARNING** — `src/lib/citations/registry.ts` not found; freshness check skipped

## npm run check:routes
**Result: PASS** — 39 routes validated

## npm run lint
**Result: NOT AVAILABLE** — no lint script in package.json

## npm test
**Result: NOT AVAILABLE** — no test runner configured

---

# Merge Recommendation

**Not ready — for the following reasons:**

1. SSH private key is committed in git history and must be revoked and scrubbed before any push.
2. Two block-level clinical findings (DOAC Class III tag, TNK "preferred" wording) must be resolved before clinical content can be trusted.
3. NNT bypass at 8 render sites must be fixed before ordinal-shift trials display correctly.
4. Google Analytics GDPR violation and missing Privacy Policy must be addressed before any EU-accessible deployment.

Once PRs 1–5 are completed, re-classify as "Safe with monitoring."
