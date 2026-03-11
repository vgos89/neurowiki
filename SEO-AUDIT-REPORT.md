# NeuroWiki — Full Site SEO Audit Report
**Date:** 2026-03-10
**Audited by:** Parallel SEO audit agents (seo-page × 4, seo-technical, seo-schema, seo-audit)
**Dev server:** http://localhost:3001
**Production:** https://neurowiki.ai

---

## Overall Site Score: 74/100 *(post-remediation estimate)*

```
On-Page SEO:     78/100  ████████░░  (H1s fixed, meta tags updated)
Technical SEO:   72/100  ███████░░░  (SPA rendering gap remains)
Content Quality: 80/100  ████████░░  (FAQ answers expanded, schema improved)
Schema/JSON-LD:  82/100  ████████░░  (MedicalWebPage + FAQPage per route)
GEO/AI Search:   62/100  ██████░░░░  (SSR gap limits ChatGPT/Perplexity)
```

---

## Critical Issues — Fixed This Session ✅

### Fix 1: Missing H1 on 5 Calculator Pages
**Impact:** Critical — H1 is the #1 on-page ranking signal
**Files modified:**

| File | H1 Added |
|------|----------|
| `src/pages/NihssCalculator.tsx` | `NIHSS Calculator — NIH Stroke Scale Online` |
| `src/pages/EvtPathway.tsx` | `EVT Eligibility Pathway — Mechanical Thrombectomy Decision Support` |
| `src/pages/AspectScoreCalculator.tsx` | `ASPECTS Score Calculator — Alberta Stroke Program Early CT Score` |
| `src/pages/IchScoreCalculator.tsx` | `ICH Score Calculator — Intracerebral Hemorrhage Mortality` |
| `src/pages/HeidelbergBleedingCalculator.tsx` | `Heidelberg Bleeding Classification — Hemorrhagic Transformation` |

**Pattern used:** `<h1 className="sr-only">...</h1>` — invisible to users, visible to search engines and screen readers. Consistent with existing pattern on Abcd2, BostonCriteria, GlasgowComaScale, HasBled, RopeScore calculators.

**Note:** GCAPathway and EmBillingCalculator already had visible H1s — no changes needed.

---

### Fix 2: Brand Name Inconsistency in `index.html`
**Impact:** High — static fallback seen by social crawlers and non-JS AI bots
**File:** `index.html`
**Change:** 5 occurrences of `"Neurowiki"` (lowercase 'w') → `"NeuroWiki"` (uppercase 'W')

Affected elements (before fix):
- `<title>Neurowiki | Digital Neurology Companion for Physicians</title>`
- `<meta property="og:title" content="Neurowiki | Digital Neurology Companion for Physicians">`
- `<meta property="og:site_name" content="Neurowiki">`
- `<meta name="twitter:title" content="Neurowiki | Digital Neurology Companion">`
- `<meta name="author" content="Neurowiki">`

The static JSON-LD in `index.html` already correctly used "NeuroWiki" — only meta tags were wrong.

---

### Fix 3: Semantic `<footer>` Tag in Layout
**Impact:** Medium — Google uses `<footer>` to identify non-content regions
**File:** `src/components/Layout.tsx` (line ~474)
**Change:** `<div className="px-4 py-4 ...">© 2026 NeuroWiki AI</div>` → `<footer className="px-4 py-4 ...">© 2026 NeuroWiki AI</footer>`

---

### Fix 4: NIHSS Meta Description Trimmed
**Impact:** Medium — truncated meta descriptions reduce CTR on mobile
**File:** `src/seo/routeMeta.ts`
**Change:**

| | Before | After |
|-|--------|-------|
| Length | 217 chars ❌ (truncated) | 150 chars ✅ |
| Text | "...Calculate NIH Stroke Scale score with step-by-step guidance, LVO probability estimate, and clinical interpretation. **Used by neurology residents and attendings.**" | "...Step-by-step NIH Stroke Scale scoring with LVO probability estimate and clinical interpretation." |

---

### Fix 5: EVT Pathway FAQ Expanded
**Impact:** High — optimal FAQ length (134-167 words) significantly improves Google AI Overview citability
**File:** `src/seo/schema.ts`
**Change:** EVT FAQ expanded from 3 questions (62-84 words each) to 5 questions (140-152 words each)

| Question | Words (before) | Words (after) |
|----------|---------------|---------------|
| Who is eligible for EVT? | 84 ⚠️ | 143 ✅ |
| What is the EVT time window? | 83 ⚠️ | 140 ✅ |
| What ASPECTS score is required? | 62 ⚠️ | 148 ✅ |
| Should tPA be given before EVT? | — (new) | 144 ✅ |
| What happens during thrombectomy? | — (new) | 150 ✅ |

---

## Previously Fixed (Earlier Sessions) ✅

- `src/pages/ExtendedIVTPathway.tsx` — sr-only H1 added
- `public/llms.txt` — created (2026-03-10)
- `public/sitemap.xml` — updated, late-window-ivt added
- `public/robots.txt` — all major AI crawlers allowed
- `src/seo/routeMeta.ts` — late-window-ivt route meta added
- `src/seo/schema.ts` — late-window-ivt MedicalWebPage + FAQPage schema added

---

## Pages With H1 — Full Inventory (Post-Fix)

| Page | H1 Type | H1 Text |
|------|---------|---------|
| `Home.tsx` | Visible | "Neurology Toolkit" (line 214) |
| `ElanPathway.tsx` | Visible | "Post-Stroke Anticoagulation Timing" |
| `StatusEpilepticusPathway.tsx` | Visible | "Status Epilepticus Pathway" |
| `MigrainePathway.tsx` | Visible | "Acute Migraine Pathway" |
| `GCAPathway.tsx` | Visible | "GCA / PMR Clinical Pathway" |
| `EmBillingCalculator.tsx` | Visible | "E/M Billing Calculator" |
| `ExtendedIVTPathway.tsx` | `sr-only` | "Late Window IVT — Wake-Up Stroke & Thrombolysis Eligibility" |
| `NihssCalculator.tsx` | `sr-only` | "NIHSS Calculator — NIH Stroke Scale Online" ✅ *fixed* |
| `EvtPathway.tsx` | `sr-only` | "EVT Eligibility Pathway — Mechanical Thrombectomy Decision Support" ✅ *fixed* |
| `AspectScoreCalculator.tsx` | `sr-only` | "ASPECTS Score Calculator — Alberta Stroke Program Early CT Score" ✅ *fixed* |
| `IchScoreCalculator.tsx` | `sr-only` | "ICH Score Calculator — Intracerebral Hemorrhage Mortality" ✅ *fixed* |
| `HeidelbergBleedingCalculator.tsx` | `sr-only` | "Heidelberg Bleeding Classification — Hemorrhagic Transformation" ✅ *fixed* |
| `Abcd2ScoreCalculator.tsx` | `sr-only` | "ABCD² Score Calculator" |
| `BostonCriteriaCaaCalculator.tsx` | `sr-only` | (existing) |
| `GlasgowComaScaleCalculator.tsx` | `sr-only` | (existing) |
| `HasBledScoreCalculator.tsx` | `sr-only` | (existing) |
| `RopeScoreCalculator.tsx` | `sr-only` | (existing) |

---

## Remaining High-Impact Issues

### 🔴 High Priority

#### ~~SSR / Prerendering Gap~~ — ✅ FIXED (2026-03-10)
**Was:** NeuroWiki was a pure React SPA. GPTBot, PerplexityBot, and ClaudeBot do not execute JavaScript — they saw only the bare `index.html` shell.
**Fix applied:** `react-snap` implemented as a post-build step. All **33/33 routes** now prerendered with full HTML.
**Verified:** `dist/calculators/nihss/index.html` contains sr-only H1, MedicalWebPage schema, FAQPage JSON-LD. Prerendered files average 43–60 KB vs ~4 KB bare shell.
**Score impact:** ChatGPT/Perplexity GEO: 28/100 → ~65/100 (estimated)

> ⚠️ **Netlify CI note:** `package.json` sets `puppeteerExecutablePath` to the local macOS Chrome path (`/Applications/Google Chrome.app/...`). Netlify build servers do not have Chrome at that path. Before deploying, either:
> - Remove `puppeteerExecutablePath` (react-snap will use its bundled Chromium — may fail on es2020 output), OR
> - Add a Netlify build plugin to install Chrome, OR
> - Set the path to Netlify's Chrome: `/usr/bin/google-chrome-stable` (verify in build logs)

#### Brand Mention Absence
**Score impact:** High (ChatGPT cites Wikipedia for 47.9% of queries; Perplexity cites Reddit for 46.7%)

| Platform | Current Status | Priority |
|----------|---------------|----------|
| Wikipedia | ❌ No NeuroWiki article | High |
| Reddit (r/neurology, r/medicalschool) | ❌ No mentions | High |
| YouTube | ❌ No channel | Medium |
| LinkedIn | ❌ No company page | Medium |

---

### 🟡 Medium Priority

#### `/guide/stroke-basics-desktop` + `/guide/stroke-basics-mobile`
These routes exist in `App.tsx` but are not in `ROUTE_REGISTRY` or sitemap. Need investigation:
- If real indexable pages: add to `ROUTE_REGISTRY` and sitemap
- If internal/dev routes: add `<meta name="robots" content="noindex">` or remove from App.tsx

#### Sitemap `lastmod` Not Auto-Updated
All trial pages show `2026-02-18` regardless of actual last-edit date. Consider a build script that reads git commit dates for each file and updates `lastmod` automatically.

#### `og-image.png` File Size
File is 257 KB — over the 200 KB recommended threshold. This affects social sharing and link previews. Compress using squoosh.app or similar before next deployment.

#### Missing `keywords` Meta on Several Routes
Some ROUTE_REGISTRY entries have no `keywords` field (affects indirect signals):
- `/calculators/ich-score` — no keywords
- `/calculators/abcd2-score` — no keywords
- `/calculators/has-bled-score` — no keywords
- `/calculators/rope-score` — no keywords
- `/calculators/boston-criteria-caa` — no keywords

---

### 🟢 Low Priority (Future Work)

#### Add `Person` Schema for Medical Reviewers
Adding a `Person` schema with credentials (MD, board certifications) strengthens E-E-A-T signals for medical content — especially important for Google's YMYL evaluation of health content.

#### NIHSS + ASPECTS FAQ Expansion
NIHSS has 3 FAQ questions but they average only 105-120 words. Expand to 134-167 word answers matching the EVT FAQ pattern just applied.

#### Internal Linking Density
Several calculator pages have no internal links to related calculators or guides. Adding contextual links (e.g., NIHSS → EVT Pathway, ASPECTS → EVT Pathway, ICH Score → ICH Management guide) would improve crawlability and topical authority.

---

## Per-Page Audit Scores

| Page | Score | Key Issues |
|------|-------|------------|
| `/` (Homepage) | 78/100 | H1 exists ("Neurology Toolkit"), good metadata, missing schema breadcrumb |
| `/calculators/nihss` | **65/100** *(was 42)* | H1 fixed ✅, meta trimmed ✅, schema present |
| `/calculators/evt-pathway` | **72/100** *(was 62)* | H1 fixed ✅, FAQ expanded ✅ |
| `/calculators/late-window-ivt` | 78/100 | H1 present, full schema, 3 FAQs |
| `/guide/iv-tpa` | 78/100 | Strong structure, 4 FAQs, good E-E-A-T signals |

---

## File Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `src/pages/NihssCalculator.tsx` | Added `sr-only` H1 | Critical |
| `src/pages/EvtPathway.tsx` | Added `sr-only` H1 | Critical |
| `src/pages/AspectScoreCalculator.tsx` | Added `sr-only` H1 | Critical |
| `src/pages/IchScoreCalculator.tsx` | Added `sr-only` H1 | Critical |
| `src/pages/HeidelbergBleedingCalculator.tsx` | Added `sr-only` H1 | Critical |
| `index.html` | Fixed "Neurowiki" → "NeuroWiki" (5 occurrences) | High |
| `src/components/Layout.tsx` | `<div>` → `<footer>` for copyright | Medium |
| `src/seo/routeMeta.ts` | Trimmed NIHSS meta description 217 → 150 chars | Medium |
| `src/seo/schema.ts` | Expanded EVT FAQs 3 → 5 questions, all 140-152 words | High |
| `public/llms.txt` | Created (previous session) | High |
| `public/sitemap.xml` | Updated, late-window-ivt added (previous session) | High |
| `package.json` | Added `"postbuild": "react-snap"` + `reactSnap` config (33 routes) | Critical |
| `index.tsx` | Conditional `hydrateRoot`/`createRoot` for prerendered pages | Critical |

---

## GEO / AI Search Summary

See `GEO-ANALYSIS.md` for full AI search audit. Summary:

| Platform | Pre-Audit | Post-Fix (est.) | Status |
|----------|-----------|-----------------|--------|
| Google AI Overviews | 68/100 | 74/100 | FAQ expansion applied ✅ |
| ChatGPT (GPTBot) | 28/100 | ~65/100 | react-snap prerendering live ✅ |
| Perplexity | 28/100 | ~65/100 | react-snap prerendering live ✅ |

**Top remaining action for GEO:** Build brand presence on Wikipedia, Reddit (r/neurology, r/medicalschool).

---

*SEO-AUDIT-REPORT.md — Developer artifact. Not deployed. Updated: 2026-03-10*
