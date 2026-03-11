# NeuroWiki — GEO (Generative Engine Optimization) Audit
**Date:** 2026-03-10
**Audited page:** `/calculators/late-window-ivt` (representative; site-wide findings apply)

---

## GEO Readiness Score: 62/100 *(post-remediation)*

```
Google AI Overviews:  68/100  ███████░░░  (Googlebot renders JS ✅)
ChatGPT (GPTBot):     28/100  ███░░░░░░░  (no JS execution ❌)
Perplexity:           28/100  ███░░░░░░░  (no JS execution ❌)
```

| Signal | Status | Score |
|--------|--------|-------|
| robots.txt — AI crawlers | ✅ All crawlers explicitly allowed | 20/20 |
| sitemap.xml | ✅ Updated, includes all pathways | 12/15 |
| llms.txt | ✅ Created 2026-03-10 | 10/10 |
| Structured data (JSON-LD) | ✅ MedicalWebPage + FAQPage per route | 12/15 |
| SSR / static content | ❌ Pure React SPA — JS required | 0/20 |
| Meta tags | ✅ Per-page via Seo.tsx (OG + Twitter) | 8/20 |

---

## 1. AI Crawler Access Status

```
robots.txt location: /public/robots.txt
```

| Crawler | Owner | Status |
|---------|-------|--------|
| GPTBot | OpenAI (ChatGPT) | ✅ Explicitly allowed |
| ChatGPT-User | OpenAI | ✅ Explicitly allowed |
| OAI-SearchBot | OpenAI | ✅ via wildcard |
| PerplexityBot | Perplexity | ✅ Explicitly allowed |
| Claude-Web | Anthropic | ✅ Explicitly allowed |
| anthropic-ai | Anthropic | ✅ Explicitly allowed |
| Google-Extended | Google | ✅ Explicitly allowed |
| CCBot | Common Crawl | ✅ Allowed (training data) |

**Assessment:** Excellent. No blockers for any major AI platform.

---

## 2. llms.txt Status

**Location:** `/public/llms.txt`
**Status:** ✅ Created 2026-03-10

Contains structured guidance for LLM crawlers with:
- 4 high-value clinical pathways (EVT, Late Window IVT, ELAN, SE)
- 8 calculators with descriptions
- 8 clinical guides
- 8 landmark trials
- Medical specialty and guideline source metadata

**Impact:** Helps crawlers prioritize high-value pages even when JavaScript rendering is not available.

---

## 3. Server-Side Rendering Gap Analysis

**Critical issue:** NeuroWiki is a pure React SPA (`vite.config.ts` — no SSR/SSG). All content requires JavaScript execution.

### What AI crawlers actually receive:
- `index.html` bare shell with static meta tags (homepage defaults)
- Static `Organization` + `WebSite` JSON-LD schema
- **Nothing else** — no page-specific content, no MedicalWebPage schema, no FAQs

### Platform impact breakdown:

| Platform | JS Rendering | Current Visibility |
|----------|-------------|-------------------|
| Google AI Overviews | ✅ Googlebot renders JS (2-pass crawl) | Full content visible |
| Bing Copilot | ✅ Bingbot renders JS | Full content visible |
| ChatGPT web search | ❌ GPTBot does not render JS | Sees bare shell only |
| Perplexity | ❌ PerplexityBot does not render JS | Sees bare shell only |
| Claude web features | ❌ ClaudeBot does not render JS | Sees bare shell only |

### Pre-rendering options (ranked by effort):

| Option | Effort | Infrastructure | Notes |
|--------|--------|---------------|-------|
| **`react-snap`** | Low-Medium | None (build-time) | Runs headless Chrome after `npm run build`, writes static HTML for each URL. Works with Netlify static. Best first step. |
| `vite-plugin-prerender` | Medium | None (build-time) | Vite-native equivalent, similar approach |
| Netlify Edge Functions | High | Netlify infrastructure | SSR per-request; more complex |
| Next.js / Remix migration | Very High | None → framework change | Nuclear option; full SSR; not recommended unless major rebuild |

**Recommendation:** Add `react-snap` as a post-build step. Configure it with the sitemap URL list. Expected build time increase: ~2-3 minutes. Expected ChatGPT/Perplexity visibility improvement: high.

---

## 4. Structured Data Quality

All calculator routes get a `MedicalWebPage` schema via `Seo.tsx` → `schema.ts` when JavaScript executes.

### Late Window IVT schema (verified ✅):
```json
{
  "@type": "MedicalWebPage",
  "name": "Late Window IVT — Wake-Up Stroke & Thrombolysis Eligibility | NeuroWiki",
  "description": "Interactive late window IVT eligibility pathway...",
  "audience": { "audienceType": "Physician, Neurologist, Emergency Medicine, Resident" }
}
```

Also present: `BreadcrumbList` (3-level) + `FAQPage` with 3 clinical questions.

**Issue:** These schemas are only visible to JS-rendering crawlers (Google, Bing). GPTBot/PerplexityBot see only the static `Organization` schema in index.html.

**Fix path:** When SSR/prerender is implemented, schemas will be included in pre-rendered HTML.

---

## 5. Brand Mention Analysis

| Platform | Status | Priority |
|----------|--------|----------|
| Wikipedia | ❌ No NeuroWiki article | High — ChatGPT cites Wikipedia for 47.9% of queries |
| Reddit (r/neurology, r/medicine) | ❌ No known mentions | High — Perplexity cites Reddit for 46.7% of queries |
| YouTube | ❌ No channel | Medium — YouTube mentions correlate 0.737 with AI citations |
| LinkedIn | ❌ No company page | Medium |
| PubMed / academic | ❌ Not cited | Low (long-term) |

**Note:** The AHA/ASA 2026 guideline reference (`DOI: 10.1161/STR.0000000000000513`) used throughout the site is a strong authority signal when crawlers can read it.

---

## 6. Passage-Level Citability

For Google AI Overviews (which renders JS), the FAQ schema provides directly citable answer blocks:

**Late Window IVT FAQs (in `schema.ts` PAGE_FAQS):**
1. "What is late window IVT and who is eligible?" — 134 words ✅ (optimal: 134-167)
2. "How is wake-up stroke treated with thrombolysis?" — 91 words ⚠️ (below optimal)
3. "What is the difference between COR 2a and COR 2b?" — 89 words ⚠️ (below optimal)

**Recommendation:** Expand FAQs 2 and 3 to 134-167 words to optimize for AI citation extraction.

---

## 7. Sitemap Status

**Location:** `/public/sitemap.xml`
**Updated:** 2026-03-10

Current pathways in sitemap:
- `/calculators/evt-pathway` (lastmod: 2026-03-10) ✅
- `/calculators/elan-pathway` (lastmod: 2026-03-10) ✅
- `/calculators/late-window-ivt` (lastmod: 2026-03-10) ✅ **NEW**
- `/calculators/se-pathway` (lastmod: 2026-02-18)
- All 50+ other URLs

**Issue:** `lastmod` dates are manually set — not auto-updated on content changes. Consider automating via build script reading git commit dates.

---

## 8. Top 5 Highest-Impact GEO Changes

| # | Change | Effort | Platforms Affected | Expected Impact |
|---|--------|--------|-------------------|----------------|
| 1 | **Implement `react-snap` prerendering** | Medium | ChatGPT, Perplexity, Claude | Very High — makes all content visible to non-JS crawlers |
| 2 | **Expand FAQ answers to 134-167 words** | Low | Google AIO | Medium — optimal citability window |
| 3 | **Create Reddit presence** (r/neurology, r/medicalschool posts) | Low | Perplexity, ChatGPT | High — Reddit is #1 Perplexity source |
| 4 | **Create Wikipedia article for NeuroWiki** | Medium | ChatGPT | High — Wikipedia is #1 ChatGPT citation source |
| 5 | **Add Person schema for medical reviewers** | Low | Google AIO, E-E-A-T | Medium — authority signals for medical content |

---

## 9. Quick Wins Already Completed (This Session)

- ✅ `llms.txt` created (`/public/llms.txt`)
- ✅ Sitemap updated with `/calculators/late-window-ivt`
- ✅ `<title>`, meta description, H1 optimized for Late Window IVT
- ✅ FAQPage schema added (3 clinical questions)
- ✅ `MedicalWebPage` schema with proper naming
- ✅ All AI crawlers allowed in `robots.txt` (pre-existing)

---

*GEO-ANALYSIS.md — Developer artifact. Not deployed. Updated: 2026-03-10*
