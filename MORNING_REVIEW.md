# Morning review — overnight session 2026-05-14 → 2026-05-15

**Read this first. Then `LIVE_VERIFY_GUIDE.md` for spot-checks against the live site.**

---

## TL;DR

**Shipped autonomously tonight (10 commits):**
- 10 W8.2 trial rebuilds (ECASS III → B_PROUD) + 10 §17.2 clinical-review artifacts
- Logo swap (icon-192.png replaces inline "N" badge) on mobile + desktop chrome
- Feedback floating button restored (was orphaned — defined but never mounted)
- Tidbit Health refs scrubbed from privacy/terms/accessibility + DesktopRail footer
- 7 new trial questions added (basilar EVT, ICH surgery, MSU dispatch, ICAS stenting, TNK vs alteplase, direct-vs-bridging, CHANCE-2 → DAPT question)
- SEO Bucket A quick wins (2 route title trims, CHA₂DS₂-VASc in schema, 2 sitemap flag fixes, homepage canonical alignment)

**Plans waiting for your approval (Class D — I declined to autoship):**
- Smart search bar architecture (1.5–2 days, MiniSearch + new overlay component)
- Pathways unified shell + interpretation bottom bar (Class D refactor, scope TBC from audit)
- SEO Bucket B/C items (FAQ schema expansion, og:image defaults, Edge Middleware SSR titles, dynamic sitemap generation)

**Blocking / questions for you:** see Section 1 below.

---

## Section 1 — Decisions waiting for V

### 1.1 GDPR/CCPA contact path (low urgency)

You removed `info@tidbithealth.in` from privacy/terms/accessibility. All three pages now point users to the in-app feedback button as the contact channel. The feedback button delivers to the operator inbox via Resend, so the route works functionally.

**Regulatory wrinkle:** GDPR + CCPA require a discoverable contact path for data-deletion requests. The in-app feedback button satisfies this functionally but is less discoverable than a posted email.

**Decision needed (when you have time):**
- **A. Leave as-is.** Feedback button satisfies the obligation. Lowest effort.
- **B. Add a dedicated `/contact` route** with a form (no email exposed). ~30 min build.
- **C. Provide a public operator name + email** that isn't tidbithealth.in. Tell me what to put back.

### 1.2 Smart search bar — Class D, need approval before build

The plan agent returned a complete architecture (full text in §2 below). Headline:

- **Recommended library:** MiniSearch (10 KB gzipped, BM25-ish ranking, prefix + fuzzy + per-field boost)
- **Index size:** ~250 docs (42 routes + 89 trials + 6 questions + calculators + pathways + guide H1s)
- **Build-time corpus generation** via a Vite plugin, lazy-loaded on first overlay open
- **Component tree:** 9 new files under `src/components/search/` + `src/lib/search/`
- **Trigger:** ⌘K / Ctrl+K / `/` global hotkey + existing search-button stubs in MobileHeader + DesktopTopBar rewired
- **Bundle cost:** +8 KB (lazy)
- **Effort:** 1.5–2 days, ~650 LOC, single new dependency (`minisearch`)
- **a11y:** combobox + listbox pattern, ⌘K-style focus trap, prefers-reduced-motion respected

**Decision needed:** approve / revise / hold. Recommend approve as-is; this is the cleanest architecture for a CSR SPA without backend infra.

### 1.3 Pathways unified shell + interpretation bottom bar — Class D

Audit running while you read this. Will land at `docs/audits/2026-05-14/pathways-design-audit.md` and `pathways-clinical-audit.md` before this file's final commit. The headline questions for you when you wake:

- Build a new `PathwayShell.tsx` analog to `CalculatorShell.tsx`, or extend CalculatorShell with a `variant: 'pathway'` mode?
- BottomLineDrawer is currently trial-result-specific. Refactor it to accept generic prose, or fork to `PathwayBottomDrawer`?
- All 6 pathways at once (single PR), or one-at-a-time (canary first)?

I recommend: extend CalculatorShell (avoid forking) + generic BottomDrawer + canary on one pathway first (probably EvtPathway since it's the most-used).

### 1.4 SEO Bucket B (content) + Bucket C (architectural) — pick what to fund

From the SEO audit (full text in §3 below):

**Bucket B (Class C-clinical, requires V approval):**
- B1. Trial page titles can exceed 60 chars in some cases; add a `truncateTitle()` helper.
- B2. **FAQPage schema gap on high-volume guide pages** (meningitis, GBS, vertigo, ICH management) — would need 3 FAQ Q&A pairs per page, authored by content-writer + medical-scientist. Highest-value structured-data win.
- B3. Calculator/pathway routes mostly lack `og:image`. Either add `image: DEFAULT_IMAGE` per route, or change `Seo.tsx` to fall back globally. Latter is a 1-line code change.

**Bucket C (Class D, architect required):**
- C1. **CSR-only title injection** means link-preview bots see only the homepage shell title. Vercel Edge Middleware can inject per-route titles server-side without a full SSR migration. Moderate complexity. Recommend.
- C2. Sitemap drift — `public/sitemap.xml` is manually maintained but `sitemapRoutes.ts` derives it programmatically. Add a build-time generator. Class D. Low urgency now that the static file is up-to-date as of tonight's wave.

**Decision needed:** which of B1-B3 / C1-C2 to schedule. Recommend: B3 (1-line) tonight; B2 next; C1 when time allows.

---

## Section 2 — Smart search plan (full agent output)

> Recommendation: **MiniSearch.** The corpus (≈250 records once trials + routes + questions + guide H1s are merged) needs both prefix matches ("nih" → NIHSS) *and* fuzzy typo tolerance ("thrombec" → Thrombectomy guide and EVT pathway), plus per-field boosting so a trial *title* hit outranks a coincidental *pearl* hit. Fuse handles fuzz but is weaker for token-based queries; a trie is fast but you'd reinvent BM25 and typo tolerance. MiniSearch's 4 KB premium is paid by removing the need for any hand-tuning of scores.

### Component tree (new, all under `src/components/search/` + `src/lib/search/`)
```
SearchProvider.tsx        Context: { open, setOpen, query, results, recents }
SearchOverlay.tsx         Portal'd full-screen modal (mobile) / centered dialog (desktop)
SearchInput.tsx           Controlled input, 60ms debounce
SearchResultsList.tsx     Grouped role="listbox"
SearchResultItem.tsx      One row, role="option", aria-selected
SearchEmptyState.tsx      Recent searches + popular shortcuts
useSearchIndex.ts         Lazy-builds MiniSearch on first open
useKeyboardNav.ts         ↑/↓/Enter/Esc handling + roving tabindex
useGlobalHotkey.ts        ⌘K / Ctrl+K / "/" global listener
```

### Index shape
```ts
export type SearchKind = 'trial' | 'calculator' | 'pathway' | 'guide' | 'question' | 'route';
export interface SearchDoc {
  id: string; kind: SearchKind; title: string;
  subtitle?: string; body?: string; keywords?: string[];
  path: string; icon?: string; popularity?: number;
}
```

### Build-time corpus
A Vite plugin emits `src/generated/searchCorpus.json` from routeManifest + trialData + trial-questions + pathway/guide hand-mapped tables. Lazy-loaded on first overlay open. Total ~30 KB JSON / ~8 KB gzipped.

### Score formula
`MiniSearch BM25 × (1 + popularity/200) × recency boost from localStorage LRU (top 8 recent ids get +0.2)`

### Result rendering
Group by kind: **Trials → Calculators → Pathways → Guides → Questions → Other routes.** Each group is `<li role="group">` with sticky muted header. Rows: icon, title, subtitle, kind chip.

### a11y
- Combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`
- ↑/↓ wraps via clamps; PageUp/PageDown jumps groups
- Enter → navigate + close; Esc → close
- ⌘K / Ctrl+K opens; `/` opens unless input focused
- prefers-reduced-motion disables overlay slide

### Effort
- Files edited: 3 (`MobileHeader.tsx`, `DesktopTopBar.tsx`, `Layout.tsx`)
- Files added: 9 (`search/` folder above + 2 lib files + generated JSON)
- ~650 LOC, 1.5–2 days, **+1 dependency (minisearch)**
- Vitest spec: assert "nih" → NIHSS rank #1, "tpa" → IV-tPA rank #1, "evt" → both Thrombectomy guide + EVT pathway

---

## Section 3 — SEO audit (architecture context + Bucket B/C detail)

**Architecture:** Client-side `Seo.tsx` imperatively sets `document.title`, meta tags, `<link rel="canonical">`, and JSON-LD on every route navigation. `index.html` holds homepage static metadata as pre-JS fallback. Works for users + Googlebot (which renders JS). Risk: link-preview bots that don't render JS see only the shell title.

**Shipped tonight (Bucket A — 4 of 5 items; A5 deferred):**
- A1: 2 route titles trimmed to ≤60 chars
- A2: CHA₂DS₂-VASc added to schema.ts CALC_NAMES
- A3: includeInSitemap added to pathways-gca + pathways-migraine
- A4: sitemap.xml homepage `<loc>` normalized + lastmod bumped to 2026-05-14
- A5 DEFERRED: PATHWAYS_HUB_SCHEMA — `/pathways` hub returns null from getSchemaForRoute. Authoring needed; not a 1-line fix.

**Bucket B (Class C — your approval):**
- **B1.** Trial titles unbounded — add a `truncateTitle()` clip in `src/seo/routeMeta.ts`. Borderline cases exist (NOR-TEST 2 at 58). Not urgent.
- **B2.** **Highest-value gap: FAQPage schema only on 8 routes.** Guide pages like `/guide/meningitis`, `/guide/gbs`, `/guide/vertigo`, `/guide/ich-management` have zero FAQPage JSON-LD. Author 3 Q&A pairs per page. Class C-clinical, needs medical-scientist + clinical-reviewer per the co-fire rule.
- **B3.** og:image absent from most calculator/pathway routes. Either set `image: DEFAULT_IMAGE` per route or add fallback in `Seo.tsx` (1-line code change). Recommend the latter.

**Bucket C (Class D — architect + plan):**
- **C1.** CSR title injection means JS-disabled bots + link-preview bots see homepage shell title for all routes. Vercel Edge Middleware can inject per-route titles server-side from `routeManifest.ts` without a full SSR migration. Moderate complexity. Recommend pursuing.
- **C2.** Static sitemap.xml will drift from programmatic `sitemapRoutes.ts`. Add a build-time generator. Class D. Defer.

---

## Section 4 — Pathways audit (agent output pending — will be appended before final commit)

`docs/audits/2026-05-14/pathways-design-audit.md` and `pathways-clinical-audit.md` will exist when the audit agent completes. Section will summarize when ready.

---

## Section 5 — Other items noticed (not in original brief)

- **Bayesian archetype already exists** (`primaryDesign: 'bayesian-superiority'`, DAWN at line 4657, renderer at TrialPageNew.tsx:249). ENRICH was migrated to this archetype tonight; no new archetype build was needed despite the original brief asking for "Archetype I (Bayesian)". Saved you a Class D task.
- **B_PROUD `designDisclaimer` schema field added** (TrialMetadata interface). UI rendering is a separate ui-architect task — the spec at TRIALS_SPEC §1.6 has the exact Tailwind, but no component reads the field yet. First trial to use it; B_PROUD is the only entry with this field populated.
- **DEFUSE-3 + DAWN DOIs were swapped in repo** (DEFUSE-3 was carrying DAWN's DOI and vice versa). Fixed tonight in commit `1b5dfc3`. Anyone clicking through the DOI link would have landed on the wrong paper.
- **ANGEL-ASPECT live p-value was off by an order of magnitude** (`<0.001` vs actual `0.004`). Fixed tonight in commit `fe47db2`.
- **ENRICH first author was wrong** (Hanley DF, who led MISTIE III, vs actual Pradilla G). Fixed tonight in commit `3a4c956`.
- **INSPIRES first author + year were wrong** (Zhao 2024 vs actual Gao 2023). Fixed tonight in commit `1346cf2`.

---

## Section 6 — Humanizer scan results

Ran a sweep for common AI-fingerprint phrases (leverage, seamless, robust, "in today's", "it is crucial", "delve into", "moreover", "essentially", "notably", "fundamentally", etc.). Findings:

- **Clean of hard AI-isms** — no hits for the top-tier list (leverage/seamless/cutting-edge/etc.)
- **A few softer phrases** present in clinical context where they're functional rather than stylistic ("essentially identical" = "no meaningful difference"; "notably lower" = comparative; "robust finding" = strength assessment). These read as clinical phrasing, not AI tells.
- **No commit needed.** The site's clinical voice is already in good shape per the humanizer skill.
- **Recommendation:** humanizer can be deployed selectively when authoring new prose, not as a sweep. The existing content is sound.

---

## Section 7 — Status of overnight queue (final)

| # | Task | Status | Commit / Plan / Block |
|---|---|---|---|
| W8.2 (1) | ECASS III rebuild | shipped | 77cb895 |
| W8.2 (2) | NINDS + Marler pearl fix | shipped | 87d73cd |
| W8.2 (3) | INSPIRES + CHANCE-2 | shipped | 1346cf2 |
| W8.2 (4) | ATTENTION + BAOCHE | shipped | ee0e74f |
| W8.2 (5) | SELECT2 + ANGEL-ASPECT | shipped | fe47db2 |
| W8.2 (6) | DEFUSE-3 + DAWN | shipped | 1b5dfc3 |
| W8.2 (7) | ORIGINAL | shipped | 3dc0ec3 |
| W8.2 (8) | SAMMPRIS | shipped | bcbdfd4 |
| W8.2 (9) | ENRICH | shipped | 3a4c956 |
| W8.2 (10) | B_PROUD | shipped | 53af7dd |
| Phase A (1) | Tidbit Health scrub + logo + feedback button | shipped | 16c0d07 |
| Wave 1 | 7 new trial questions + SEO Bucket A | shipped | b28211c |
| Search bar | Plan complete; **needs V approval** | plan only | §1.2 |
| Pathways design | Audit running; **plan output pending** | _running_ | §1.3 |
| Pathways clinical | Audit running; **findings doc pending** | _running_ | §1.3 |
| Humanizer | Scan done; site clean | no commit needed | §6 |
| SEO Bucket B/C | Findings filed; **need V approval** | plan only | §3 |

---

## How to use this file

1. Read TL;DR.
2. Triage Section 1 decisions in order of urgency (search bar = decide first; GDPR contact = decide whenever).
3. Spot-check live site with `LIVE_VERIFY_GUIDE.md`.
4. Look at `git log --oneline 0790a05..HEAD` in your terminal to see every commit that landed tonight.
5. If anything looks broken: hard refresh first (Cmd+Shift+R). If still broken, screenshot console + URL and start a new session — I'll triage via `/incident`.

*Last update: overnight session, final commit pending pathways audit completion.*
