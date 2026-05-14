---
name: seo-audit-execution
description: SEO audit methodology, keyword research workflow, structured-data templates, GA4/GSC integration patterns, and the side-by-side content+SEO playbook for NeuroWiki. Load when running an SEO audit, researching keywords, adding structured data, or co-reviewing public-indexable content with content-writer.
---

# SEO Audit Execution

**Related:** `.claude/skills/routing/` — route addition, manifest mechanics, JSON-LD placement at new-route build time.

Base directory for this skill: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/.claude/skills/seo-audit-execution`

---

## When to load

Load this skill when:
- Running a full or partial SEO audit of NeuroWiki
- Researching keyword opportunities or SERP landscape
- Adding or auditing JSON-LD structured data
- Reviewing GSC/GA4 data or planning integration
- Co-reviewing public-indexable content with `content-writer` (guide pages, trial pages, calculator intro copy, FAQ pages, new routes)
- Checking sitemap completeness or link-graph health

Do not load for route addition mechanics — that is `routing` skill territory. Cross-reference `routing` for how `routeManifest.ts` works and how `check:routes` is run.

---

## Related skills

- `routing` — route addition, manifest mechanics (`routeManifest.ts`, `App.tsx`), `check:routes` validator, JSON-LD placement at build time
- `compliance-public-medical` — disclaimer-aware copy on public-indexable surfaces
- `performance` — Core Web Vitals overlap with SEO signals (LCP, CLS affect rankings)
- `humanizer` — content-writer voice when SEO co-review suggests copy revisions

---

## §1 Audit methodology

Source documents: `docs/seo-audit-2026-05-13.md` (Phase 1), `docs/seo-keyword-research.md` (Phase 2), `docs/seo-game-plan-2026.md` (Phase 3).

### 1.1 Route manifest scan

File: `src/config/routeManifest.ts`

Check every route entry against these rules:

| Field | Rule | Violation pattern |
|---|---|---|
| `title` | ≤60 chars plain text | Long calculator names with full brand suffix ("ASPECTS Score Calculator — Alberta Stroke Program Early CT Score | NeuroWiki" = 78 chars) |
| `description` | ≤160 chars | DEFAULT_META description was 168 chars as of Phase 1 audit |
| `zone` | Must be set | Missing zone breaks CSS class assignment |
| `bottomNavTab` | Must be set or null | Missing entry breaks mobile nav highlight |
| `railItem` | Must be set or null | Missing entry breaks desktop rail |
| `includeInSitemap` | Cross-check against sitemap.xml | Phase 1 found 3 routes with `includeInSitemap: true` absent from sitemap.xml |
| `title` uniqueness | No two routes share exact title | Phase 1 H3: `/pathways/stroke-code` and `/guide/stroke-basics` shared identical title |

Count titles exceeding 60 chars. Priority order for shortening: anything above 75 chars first, then 61–74.

Check tool:
```bash
# Count titles over 60 chars in routeManifest.ts
grep -n "title:" src/config/routeManifest.ts | awk 'length($0) > 95'
```
(The 95 accounts for the line number prefix and indentation before the title value.)

### 1.2 Live URL verification

Use `WebFetch` on production URLs to verify what Googlebot actually receives. Key checks:

```
WebFetch: https://neurowiki.ai/pathways/evt
- Does the HTML response contain <title>? (Only if pre-rendered or SSR)
- Is there a static canonical in the response, or is canonical JS-injected?
- Does <script type="application/ld+json"> appear in the response body?
```

Current architecture: Vite SPA on Vercel static hosting. Googlebot must execute JS to see per-route metadata. The static `index.html` canonical points only to the home URL. This is Phase 1 finding M2 — documented, not yet resolved. Note this limitation in any audit finding where canonical accuracy matters.

For sitemap URL verification:
```
WebFetch: https://neurowiki.ai/sitemap.xml
```
Compare every `<loc>` against the routes in `routeManifest.ts`. Phase 1 found 6 pathway `<loc>` entries using `/calculators/` prefix instead of `/pathways/` — those were fixed in commit 78d4588.

### 1.3 Structured data audit

File: `src/seo/schema.ts`

Per-surface JSON-LD requirements:

| Surface | Required schemas | Where generated |
|---|---|---|
| Home | `WebSite` + `Organization` | Static in `index.html` |
| Calculators hub (`/calculators`) | `WebPage` + `BreadcrumbList` + `ItemList` | `schema.ts` |
| Individual calculator | `MedicalWebPage` + `SoftwareApplication` + `BreadcrumbList` + `FAQPage` (if FAQs defined) | `schema.ts` |
| Pathways hub (`/pathways`) | `CollectionPage` + `BreadcrumbList` + `ItemList` | Phase 1 M3: was `null` — needs fix |
| Individual pathway | `MedicalWebPage` + `SoftwareApplication` + `BreadcrumbList` + `FAQPage` (if FAQs defined) | `schema.ts` |
| Guide hub (`/guide`) | `WebPage` + `BreadcrumbList` | `schema.ts` |
| Individual guide article | `MedicalWebPage` + `BreadcrumbList` + `FAQPage` (if FAQs defined) | `schema.ts` |
| Trials hub (`/trials`) | `WebPage` + `BreadcrumbList` + `ItemList` | `schema.ts` |
| Individual trial page | `MedicalWebPage` + `MedicalScholarlyArticle` + `BreadcrumbList` | `schema.ts` |

Verification: navigate to a page in a browser, open DevTools console, run:
```javascript
document.querySelectorAll('script[type="application/ld+json"]')
```
Paste each block into the Google Rich Results Test (https://search.google.com/test/rich-results) to check validity.

Grep pattern to find which pathnames return null schema:
```bash
grep -n "return null" src/seo/schema.ts
```

### 1.4 Sitemap audit

Files: `public/sitemap.xml`, `src/config/routeManifest.ts`, `src/seo/sitemapRoutes.ts`

Steps:
1. Grep `includeInSitemap: true` in `routeManifest.ts` — this is the authoritative list of routes that should appear.
2. Compare against `<loc>` entries in `public/sitemap.xml`. Every `includeInSitemap: true` route must have a matching entry. No wrong paths.
3. Check that trial routes in `sitemapRoutes.ts` (exported as `SITEMAP_ROUTES`) are all present in sitemap.xml. As of Phase 1: ~80 trial routes are in the sitemap via this array.
4. Check `<lastmod>` dates. Most entries were frozen at 2026-02-18 as of Phase 1 (finding L4). Ideal: build-time generation from `git log` timestamps. Current: manual maintenance.
5. Run: `xmllint --noout public/sitemap.xml` to validate XML structure. A malformed sitemap stops Googlebot from reading it.

Common failure modes:
- Wrong path prefix (`/calculators/` vs `/pathways/`) — fixed in Phase 1 H1
- Route added to manifest but sitemap not updated — this caused Phase 1 M1
- sitemap.xml XML not valid after a manual edit

### 1.5 Internal linking audit

File: `docs/link-graph.json`

The link graph is the source of truth for internal link structure. Every node has:
```json
{
  "id": "calc/nihss",
  "path": "/calculators/nihss",
  "label": "NIHSS Calculator",
  "references": ["pathway/stroke-code", "pathway/evt"],
  "referencedBy": ["hub/calculators", "article/stroke-basics"]
}
```

Audit steps:
1. Find orphan nodes (no inbound links): `"referencedBy": []`. Phase 1 found 25 orphans — 23 trial nodes, hub/guide, calc/abcd2.
2. Find dead-end nodes (no outbound links): `"references": []`. Phase 1 found 14 — 13 guide articles + article/stroke-basics.
3. Cross-check: every pathway node should reference its associated calculators and trials. Every calculator node should reference pathways that use it.

Orphan pages receive no PageRank flow. Dead-end pages do not pass link equity. Both reduce ranking potential.

Priority fix order per Phase 2: wire trial nodes to pathway and article nodes first (Cluster 4 is NeuroWiki's highest-potential trial authority cluster).

Note: `docs/link-graph.json` is the planning layer. Actual internal links (`<a>` tags) in JSX are the implementation. The two must stay in sync — the link graph should reflect real navigational paths, not aspirational ones.

### 1.6 Heading hierarchy audit

Each public page must have exactly one `<h1>`. Phase 1 finding H2: `TrialPageNew.tsx` had 65+ `<h1>` elements from stat-card labels.

Grep pattern for H1 count per file:
```bash
grep -c "<h1" src/pages/trials/TrialPageNew.tsx
```

For guide pages:
```bash
grep -rn "<h1" src/pages/guide/
```

Expected: one match per file. Multiple matches = heading hierarchy violation.

For stat-card labels using `<h1>`, the fix is `<h3>` or `<p>` with the same CSS class preserved. The correct page-level H1 in TrialPageNew is at the `{catalogTrial.name}` render. Note: this fix conflicts with ADR-005 Decision 4 — V must resolve before proceeding (Phase 3.C2).

---

## §2 Keyword research workflow

Source: `docs/seo-keyword-research.md` — all SERP positions in that document are estimates (GSC-authoritative data pending Phase 2b).

### 2.1 Cluster framework

NeuroWiki's keyword opportunity maps to five clusters:

| Cluster | Description | Competitive landscape | Top opportunity |
|---|---|---|---|
| 1 — Calculator-driven | NIHSS, ASPECTS, ICH Score, GCS, ABCD2, HAS-BLED, CHA2DS2-VASc, RoPE, Boston Criteria, Heidelberg | MDCalc dominates head terms (DA 70+); long-tail interpretation queries are open | "NIHSS score 6 meaning," "ASPECTS 7 thrombectomy eligible" |
| 2 — Pathway / decision support | EVT eligibility, tPA eligibility, stroke code protocol, ELAN anticoagulation, status epilepticus | Society sources (AHA/ASA) own head terms; no MDCalc equivalent for pathway tools | ELAN pathway (low competition, low MDCalc presence) |
| 3 — Guideline / education | AHA/ASA 2026, ICH 2022, AAN SE | Society sources rank above all third parties | Derivative queries ("AHA 2026 EVT criteria summary"), not head terms |
| 4 — Trial summaries | DAWN, DEFUSE-3, MR CLEAN, ENRICH, NINDS, ESCAPE, EXTEND | Wikipedia + PubMed + journal publishers; no single platform owns trial summaries | ENRICH (recent, low SERP competition); DAWN "inclusion criteria" long-tail |
| 5 — Long-tail clinical questions | "How to score NIHSS in intubated patient," "ASPECTS score for thrombectomy" | UpToDate + eMedicine + academic center protocols | FAQPage schema + featured snippet capture |

### 2.2 SERP-snapshot method (when GSC unavailable)

Use `WebSearch` for live SERP inspection. This is an estimate, not authoritative.

For each keyword:
1. `WebSearch: "[keyword]"` — note the top 5 publishers.
2. Classify the competition type: society, MDCalc, Wikipedia, clinical reference (UpToDate/eMedicine), academic center, journal.
3. Assign action classification:
   - **(a) already ranking** — optimize meta; confirm FAQPage schema present
   - **(b) gap** — NeuroWiki has a page but it is absent or low-ranked; structural fix (sitemap, link graph, schema) usually the cause
   - **(c) compete** — MDCalc or similar incumbent; differentiate on structured data, interpretation depth, mobile UX
   - **(d) low value** — society head term or out-of-scope content; skip

Label every position estimate as "estimate" in all documents. Do not present SERP estimates as confirmed data.

### 2.3 GSC-authoritative method (when integration available)

Placeholder. Phase 2b deferred GSC integration. When available:

Queries to run in GSC (Google Search Console > Performance > Search results):
- Filter by page to see impressions/clicks/position per URL
- Filter by query to find which searches NeuroWiki appears for at position 11–30 (these are optimization candidates, not creation candidates)
- Export to CSV, drop in `docs/seo-data/` as `gsc-export-YYYY-MM-DD.csv`
- Compare against Phase 2 cluster keyword list: which "unknown" positions are now confirmed?

GSC API authentication pattern: OAuth2 with service account. Scope: `https://www.googleapis.com/auth/webmasters.readonly`. Endpoint: `https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`. Document auth flow here when V sets up credentials.

### 2.4 Competitor identification

| Competitor | Strength | Where they rank | NeuroWiki's counter |
|---|---|---|---|
| MDCalc (mdcalc.com) | DA 70+; 1000+ calculators; massive backlink profile | All calculator head terms (position 1–3) | Neurology specialty depth; EVT pathway integration; faster mobile UX |
| UpToDate | Gated but high authority signals; citation profile | Clinical reference queries across all clusters | Free access for residents; bedside speed; structured data eligibility |
| AHA/ASA (ahajournals.org) | Owns its own guideline queries | Guideline head terms (position 1–2) | Derivative queries ("EVT criteria per AHA 2026") rather than head terms |
| Wikipedia | High DA; broad coverage | Trial head terms ("MR CLEAN trial"), history queries | "Inclusion criteria" and "eligibility criteria" long-tail variants; structured data (Wikipedia lacks FAQPage) |
| eMedicine (Medscape) | Broad clinical reference; high trust | Symptom/workup queries | Not a direct competitor for calculator or pathway queries |
| PubMed (abstract pages) | Canonical source for trial results | "[Trial name] results" | MedicalScholarlyArticle schema and synthesized bedside interpretation |

### 2.5 Action classification per keyword

Apply to every keyword before recommending a tactic:

- **(a) ranking, optimize** — page is indexed and has impressions; improve title, description, FAQPage schema
- **(b) gap, fix indexing** — page exists and has good content, but is not indexed (sitemap error, no inbound links, no schema); structural fix first, content second
- **(c) gap, create content** — no NeuroWiki page covers this query; requires new route or new FAQ entry
- **(d) compete, improve** — page is indexed, competitor ranks above, content quality or structured data depth needs work
- **(e) low value, skip** — head-term society query; not winnable; redirect effort to derivative queries

---

## §3 Side-by-side content+SEO playbook

Per architect C2 (arch-seo-program-kickoff.md): pairing fires on public-indexable surfaces only.

### 3.1 Public-indexable surfaces (pairing fires)

- Guide pages (`src/pages/guide/`)
- Trial pages (`src/pages/trials/TrialPageNew.tsx`)
- Calculator landing/intro copy (the descriptive text above the calculator tool, not the interpretation strings)
- FAQ pages
- Any new route added to `routeManifest.ts`

### 3.2 Non-indexable surfaces (pairing does NOT fire)

- Study Mode pearls
- Tooltips
- Modal and dialog text
- In-calculator interpretation strings (strings returned by scoring functions, displayed only after user input)

These surfaces are either gated, non-URL-addressable, or too deeply nested to carry canonical SEO weight. SEO review on these surfaces produces noise without signal.

### 3.3 Workflow

1. `content-writer` drafts copy for the public-indexable surface.
2. `seo-specialist` reviews the draft for:
   - Title and H1 alignment with target keyword
   - Meta description optimization (≤160 chars, includes primary keyword)
   - FAQPage schema opportunities (does the content answer a discrete clinical question?)
   - Internal link opportunities (does the copy mention a calculator, trial, or pathway that could be linked?)
   - Keyword alignment (does the primary keyword appear in the first sentence of the body copy?)
3. `content-writer` revises if needed — SEO suggestions must not alter clinical meaning. Clinical accuracy takes precedence (CLAUDE.md §4 decision hierarchy: clinical safety beats architectural consistency beats UI polish).
4. `seo-specialist` adds the sign-off block to the PR description (see §6).
5. PR ships.

---

## §4 Structured data templates

All JSON-LD is injected at runtime by `src/components/Seo.tsx` from schemas in `src/seo/schema.ts`. Place new schema constants in `schema.ts` and wire them to the relevant pathname branch.

### 4.1 Calculator pages

```json
[
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "[Calculator Name]",
    "applicationCategory": "MedicalApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "audience": { "@type": "MedicalAudience", "audienceType": "Physician" },
    "about": {
      "@type": "MedicalEntity",
      "name": "[Clinical entity the calculator measures]"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "[Calculator Name] — NeuroWiki",
    "url": "https://neurowiki.ai/calculators/[slug]",
    "description": "[≤160 char description]",
    "audience": { "@type": "MedicalAudience", "audienceType": "Physician" },
    "medicalAudience": { "@type": "MedicalAudience", "audienceType": "Physician" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NeuroWiki", "item": "https://neurowiki.ai" },
      { "@type": "ListItem", "position": 2, "name": "Calculators", "item": "https://neurowiki.ai/calculators" },
      { "@type": "ListItem", "position": 3, "name": "[Calculator Name]", "item": "https://neurowiki.ai/calculators/[slug]" }
    ]
  }
]
```

Add `FAQPage` schema when the page has FAQ entries (see §4.6).

### 4.2 Trial pages

```json
[
  {
    "@context": "https://schema.org",
    "@type": "MedicalScholarlyArticle",
    "name": "[Trial Name]",
    "headline": "[Trial Name] — [One-sentence summary]",
    "url": "https://neurowiki.ai/trials/[slug]",
    "about": { "@type": "MedicalCondition", "name": "[Condition studied]" },
    "citation": "[Author et al. Journal Year;Vol:Pages]",
    "datePublished": "[YYYY]"
  },
  {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "[Trial Name] — NeuroWiki",
    "url": "https://neurowiki.ai/trials/[slug]"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NeuroWiki", "item": "https://neurowiki.ai" },
      { "@type": "ListItem", "position": 2, "name": "Trials", "item": "https://neurowiki.ai/trials" },
      { "@type": "ListItem", "position": 3, "name": "[Trial Name]", "item": "https://neurowiki.ai/trials/[slug]" }
    ]
  }
]
```

### 4.3 Pathway pages

```json
[
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "[Pathway Name]",
    "description": "[What the pathway helps a clinician decide]",
    "step": [
      { "@type": "HowToStep", "name": "[Step 1 label]", "text": "[Step 1 description]" },
      { "@type": "HowToStep", "name": "[Step 2 label]", "text": "[Step 2 description]" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "[Pathway Name] — NeuroWiki",
    "url": "https://neurowiki.ai/pathways/[slug]"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NeuroWiki", "item": "https://neurowiki.ai" },
      { "@type": "ListItem", "position": 2, "name": "Pathways", "item": "https://neurowiki.ai/pathways" },
      { "@type": "ListItem", "position": 3, "name": "[Pathway Name]", "item": "https://neurowiki.ai/pathways/[slug]" }
    ]
  }
]
```

### 4.4 Guide pages

```json
[
  {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "[Article Title] — NeuroWiki",
    "url": "https://neurowiki.ai/guide/[slug]",
    "description": "[≤160 char description]",
    "audience": { "@type": "MedicalAudience", "audienceType": "Physician" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NeuroWiki", "item": "https://neurowiki.ai" },
      { "@type": "ListItem", "position": 2, "name": "Guide", "item": "https://neurowiki.ai/guide" },
      { "@type": "ListItem", "position": 3, "name": "[Article Title]", "item": "https://neurowiki.ai/guide/[slug]" }
    ]
  }
]
```

### 4.5 Hubs (BreadcrumbList)

Every hub page (`/calculators`, `/pathways`, `/guide`, `/trials`) uses a two-level BreadcrumbList:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "NeuroWiki", "item": "https://neurowiki.ai" },
    { "@type": "ListItem", "position": 2, "name": "[Hub Name]", "item": "https://neurowiki.ai/[hub-path]" }
  ]
}
```

The pathways hub also needs a `CollectionPage` + `ItemList` per Phase 1 finding M3 (see Phase 3.A3 task).

### 4.6 FAQPage (for bedside clinical questions)

FAQPage schema creates featured-snippet eligibility for discrete clinical questions. Use on calculator pages, pathway pages, and guide articles where FAQ entries exist.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Clinical question exactly as a resident would type it]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Concise, actionable answer. Include the number or threshold. ≤300 chars for featured snippet eligibility.]"
      }
    }
  ]
}
```

Priority FAQ targets per Phase 2 Cluster 5:
- NIHSS: "How do I score NIHSS in an intubated patient?"
- ASPECTS: "What ASPECTS score is required for thrombectomy eligibility?"
- ICH Score: "What is the predicted 30-day mortality for each ICH Score level?"
- ABCD2: "What ABCD2 score requires hospitalization after TIA?"
- RoPE: "When is PFO closure indicated based on RoPE score?"

Note: FAQ answer text is clinical copy. Route it through `content-writer` + `medical-scientist` + `clinical-reviewer` before the JSON-LD is added (Class C-clinical per CLAUDE.md §6).

---

## §5 GA4 / GSC integration patterns

### 5.1 Current state (2026-05-14)

- GA4 is active with a consent gate. Events fire after consent.
- **GSC MCP integration: `suganthan-gsc-mcp` scaffolded** — setup walkthrough at `docs/seo-data/GSC-MCP-SETUP.md`. V completes the ~15 min one-time Google Cloud Console + OAuth dance on their machine, then the MCP is live for any session. Anthropic registry has no first-party GSC MCP as of this date.
- Once V signals "GSC MCP is wired up": this section gets updated to mark **available**, and Phase 2 keyword research is re-run against authoritative positions (replacing the SERP-snapshot estimates).
- Manual export remains the fallback when the MCP is not running (off-network, token expired, fresh machine).

### 5.2 GSC manual export protocol

When V runs a GSC export:
1. Open Google Search Console for https://neurowiki.ai
2. Performance > Search results > Export > Download CSV
3. Drop the file at `docs/seo-data/gsc-export-YYYY-MM-DD.csv`
4. Cross-reference the CSV against the Phase 2 keyword list in `docs/seo-keyword-research.md`
5. For any keyword showing impressions but position > 10: check whether the page has FAQPage schema and whether it is wired in the link graph

Useful GSC filter paths:
- Filter by page `/pathways/*` to confirm pathway indexing after sitemap H1 fix
- Filter by query containing "ASPECTS" or "NIHSS" to see calculator query impression volume
- Filter by page `/trials/*` to check which trial pages have impressions before link-graph wiring

### 5.3 GSC MCP integration — `suganthan-gsc-mcp`

**Status:** scaffolded 2026-05-14. Setup doc: `docs/seo-data/GSC-MCP-SETUP.md`. Pending V's first-run OAuth flow.

**Package:** `suganthan-gsc-mcp` (npm, Node, v2.2.2+ as of April 2026). Runs locally on V's machine. Data does not leave V's environment.

**Auth:** OAuth (user consent flow). Scope: `webmasters.readonly`. Token cached at `docs/seo-data/token.json` (gitignored). Client secrets at `docs/seo-data/client_secrets.json` (gitignored).

**Configured via** `~/.claude/`-side MCP config (outside the repo). See setup doc §4 for the JSON entry shape.

**Tool surface (20 tools, key subset used by seo-specialist):**
- `get_search_analytics` — top queries + clicks + impressions + position + CTR for a date range
- `compare_search_periods` — diff two date windows; the bedrock for "did our sitemap fix recover indexing?" questions
- `inspect_url_enhanced` — per-URL index status, last crawl date, structured data validation
- `quick_wins` — keywords ranked 4–15 with high impressions (low-hanging fruit for content/title tweaks)
- `content_gaps` — queries with impressions but no matching page
- `traffic_drops` — pages with declining clicks period-over-period
- `cannibalization_check` — multiple pages competing for the same query

**Recommended query rhythm:**
- Weekly: pull top 100 queries (28d window) + top 50 pages
- After any ranking-affecting change (sitemap fix, title change, new structured data): `compare_search_periods` with the change date as boundary
- Pre-Phase-3-action: run `quick_wins` to validate which keywords actually have impression headroom before optimizing for them

**Underlying REST API** (in case the MCP misbehaves and we need a direct call):
- Endpoint: `POST https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`
- Body: `{ "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "dimensions": ["query", "page"], "rowLimit": 1000 }`
- `siteUrl` for neurowiki.ai is typically `sc-domain:neurowiki.ai` if domain-verified, else `https://neurowiki.ai/`.

### 5.4 GA4 events relevant to SEO

Existing events (confirm against GA4 dashboard):
- `page_view` — fires on route change via React Router; confirms GA4 is tracking SPA navigation
- Any calculator submission events — confirm whether these fire to cross-reference engagement data with landing-page performance

Gaps to flag:
- No event fires specifically when a user arrives from organic search (GA4 attribution handles this at the session level, but confirming the referrer is set correctly matters for SPA entry points)
- Internal link click tracking (anchor `<a>` clicks to cross-link between calculators, trials, and pathways) would help validate link-graph buildout ROI

---

## §6 Sign-off template

Add this block to the PR description for any PR where `seo-specialist` co-reviewed public-indexable content:

```
### @seo-specialist — Sign-off

- [ ] Title ≤60 chars and contains primary keyword
- [ ] Description ≤160 chars
- [ ] Structured data present and valid (Rich Results Test passed)
- [ ] Sitemap entry present (if new route)
- [ ] Internal links added to link-graph.json (if new route or new content node)
- [ ] FAQPage schema added where FAQ content exists
- [ ] No duplicate title with any other route in routeManifest.ts

**Keyword target:** [primary keyword this page should rank for]
**Cluster:** [1 Calculator / 2 Pathway / 3 Guideline / 4 Trial / 5 Long-tail]
**Action classification:** [a/b/c/d/e from §2.5]
```

---

## §7 Common failures

Patterns seen in the Phase 1 audit (`docs/seo-audit-2026-05-13.md`):

1. **Sitemap path mismatch** — manually adding a sitemap entry and using the wrong URL prefix. Check actual route in `routeManifest.ts` before writing the `<loc>`.
2. **Duplicate titles** — two routes share an identical title string. `check:routes` (`npm run check:routes`) catches this at build time.
3. **Missing sitemap entry after route launch** — adding a route to `routeManifest.ts` with `includeInSitemap: true` but not updating `public/sitemap.xml`. Will not be caught until a manual audit.
4. **Stale lastmod dates** — `public/sitemap.xml` lastmod dates frozen from months earlier. Googlebot deprioritizes stale lastmod entries. Fix target: build-time sitemap generation (Phase 3.B3).
5. **Multiple H1 per page** — stat-card labels, section headers, or component abstractions using `<h1>` when they should use `<h3>` or `<p>`. One `<h1>` per page, containing the page title.
6. **Missing OG image** — `meta.image` not set on a route, causing social share previews to render without an image. Fix: fallback to `DEFAULT_META.image` in `Seo.tsx` when `meta.image` is undefined.
7. **FAQPage schema without FAQ content** — adding FAQPage JSON-LD with empty or placeholder entries. Each FAQ must have real clinical content; the structured data is meaningless without it.
8. **Pathways hub returning null schema** — `schema.ts` `if (pathname === '/pathways') return null` was the Phase 1 M3 finding. All hubs need a schema.
9. **Link graph nodes not matching real `<a>` tags** — adding aspirational links to `docs/link-graph.json` without adding actual `<a>` elements in the JSX. The link graph and real HTML links must stay in sync.
10. **Orphan pages at launch** — a new route with no inbound links from other pages. Every new route should have at least two inbound `referencedBy` edges in link-graph.json and corresponding `<a>` links in existing pages before it ships.
