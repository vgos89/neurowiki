# SEO Specialist Audit — NeuroWiki Full-Repo Agent Audit

**Agent:** seo-specialist
**Date:** 2026-05-08
**Overall SEO Rating:** Yellow

The site has a strong foundation: metadata is per-route, structured data is per-route with appropriate medical schema types, trial detail pages have dynamic title/description generation, robots.txt is correct, and canonical handling is implemented. The main issues are a title duplicate between two static routes, a set of wrong URLs in both the sitemap and llms.txt for pathways, pre-rendering coverage that is substantially narrower than what the sitemap indexes, and several thin areas in structured data and the link graph.

---

## Finding 1 — Duplicate title: `stroke-basics` and `pathways-stroke-code`

**Severity:** P1

`/guide/stroke-basics` carries the title `"Stroke Code Protocol — Acute Stroke Workflow for Residents | NeuroWiki"`. `/pathways/stroke-code` carries the identical title. Google treats duplicate titles as a signal that two pages are near-duplicates and may refuse to rank one of them. The two pages serve different content (guide article vs. interactive pathway), so the titles must differ.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/config/routeManifest.ts` lines 444 and 381.

**Recommended fix:** Change the `stroke-basics` title to something that reflects its content, e.g. `"Stroke Basics — Acute Stroke Code Protocol & Workflow | NeuroWiki"`.

---

## Finding 2 — Sitemap and llms.txt use wrong URLs for pathway pages

**Severity:** P1

The pathways live at `/pathways/*` in the router. However `public/sitemap.xml` lists them under `/calculators/*`:

- `https://neurowiki.ai/calculators/evt-pathway` — correct URL is `/pathways/evt`
- `https://neurowiki.ai/calculators/elan-pathway` — correct URL is `/pathways/elan-pathway`
- `https://neurowiki.ai/calculators/late-window-ivt` — correct URL is `/pathways/late-window-ivt`
- `https://neurowiki.ai/calculators/se-pathway` — correct URL is `/pathways/se-pathway`
- `https://neurowiki.ai/calculators/migraine-pathway` — correct URL is `/pathways/migraine-pathway`
- `https://neurowiki.ai/calculators/gca-pathway` — correct URL is `/pathways/gca-pathway`

`public/llms.txt` repeats the same stale `/calculators/*` URLs for the EVT, Late Window IVT, ELAN, and SE pathway links.

These wrong URLs will return 404s (or fall back to the SPA shell) when crawlers follow them, and Google will never index the canonical pathway pages via the sitemap.

**Files:**
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/public/sitemap.xml` lines 36–75
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/public/llms.txt` lines 5–8

**Recommended fix:** Replace all six pathway `<loc>` entries with the correct `/pathways/` prefix. Add the `/pathways` hub page itself (it is `includeInSitemap: true` in routeManifest but absent from the sitemap). Update llms.txt links to match.

---

## Finding 3 — react-snap pre-renders only 39 routes; sitemap covers ~140+ URLs; most trial pages not pre-rendered

**Severity:** P1

`package.json` `reactSnap.include` lists 39 routes explicitly. The sitemap contains well over 100 trial detail URLs plus all guide and calculator pages. Crawlers that do not execute JavaScript will receive an empty SPA shell for the ~80+ trial pages and guide pages not in the pre-render list, even though those pages are in the sitemap. This is a substantial crawlability gap: Google can discover the URLs from the sitemap but the rendered HTML will be blank at request time.

Pre-rendered routes that are missing and have high SEO priority include: all guide pages beyond `iv-tpa`, `stroke-basics`, `thrombectomy`, `ich-management`, `status-epilepticus`, `gbs`, `myasthenia-gravis`; all pathway pages; and the ~90 trial detail pages in the sitemap that are not in `reactSnap.include`.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/package.json` lines 51–85.

**Recommended fix:** Either extend `reactSnap.include` to cover all sitemap URLs (preferred for full static pre-rendering), or implement a server-side rendering solution on Vercel (SSR via Vercel Functions or `@vercel/og`). A minimum viable fix is to add all guide pages and pathways to `reactSnap.include`, then expand trial coverage incrementally. Alternatively, verify whether Vercel's SPA fallback combined with dynamic rendering (via a headless bot detection layer) provides sufficient crawlability for the current deployment.

---

## Finding 4 — `/pathways` hub has no structured data schema

**Severity:** P2

`schema.ts` line 621 explicitly returns `null` for `/pathways`: `if (pathname === '/pathways') return null`. The pathways hub page is in the sitemap and is published. Without schema, this page has no `MedicalWebPage` or `BreadcrumbList` signal and no FAQPage markup. Every other hub page (calculators, guide, trials, home) has schema.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/seo/schema.ts` line 621.

**Recommended fix:** Add a `PATHWAYS_HUB_SCHEMA` object mirroring the pattern of `CALCULATORS_HUB_SCHEMA`, with a `WebPage`, `BreadcrumbList`, and `ItemList` of the seven published pathways. Remove the `null` guard.

---

## Finding 5 — Three routes are `published: true, includeInSitemap` absent/false but exist in routeManifest; not consistently excluded from sitemap

**Severity:** P2**

`pathways-gca` (`/pathways/gca-pathway`) has `publishGate: true`, `published: true`, but no `includeInSitemap: true`. Same for `pathways-migraine` (`/pathways/migraine-pathway`) and `em-billing` (`/calculators/em-billing`, which has no `includeInSitemap` field at all). Yet the sitemap includes `/calculators/em-billing` and the sitemap also includes `/calculators/migraine-pathway` and `/calculators/gca-pathway` (under the wrong path prefix, per Finding 2). The sitemap is manually maintained and has drifted from the routeManifest `includeInSitemap` flags. The `STATIC_SITEMAP_ROUTES` export at the bottom of routeManifest is the authoritative list but is not being used to generate or validate the sitemap.

**Files:**
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/config/routeManifest.ts`
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/public/sitemap.xml`

**Recommended fix:** Drive sitemap generation programmatically from `STATIC_SITEMAP_ROUTES` (already exported) plus a dynamic trial URL list. A Vite plugin or a `scripts/generate-sitemap.ts` post-build step would eliminate the manual drift. At minimum, reconcile the hand-maintained sitemap against the current `includeInSitemap` flags.

---

## Finding 6 — Title length violations (over 60 characters)

**Severity:** P2

Several titles exceed the recommended 60-character threshold at which Google truncates the `<title>` element in SERPs. Measured character counts (pipe+site-name suffix included):

| Route key | Title | Char count |
|---|---|---|
| `aspect-score` | ASPECTS Score Calculator — Alberta Stroke Program Early CT Score \| NeuroWiki | 77 |
| `heidelberg-bleeding-classification` | Heidelberg Bleeding Classification — Hemorrhagic Transformation \| NeuroWiki | 77 |
| `boston-criteria-caa` | Boston Criteria 2.0 for CAA — Cerebral Amyloid Angiopathy \| NeuroWiki | 72 |
| `chads-vasc` | CHA₂DS₂-VASc Score — AF Stroke Risk Calculator \| NeuroWiki | 62 |
| `pathways-late-ivt` | Late Window IVT — Wake-Up Stroke & Thrombolysis Eligibility \| NeuroWiki | 72 |
| `em-billing` | E/M Billing Calculator — CPT Code 99202–99215 \| MDM & Time-Based \| NeuroWiki | 80 |
| `status-epilepticus` | Status Epilepticus Management Guide — First Line to Refractory \| NeuroWiki | 78 |

Note: the EM billing title also contains a second pipe character, which renders oddly in SERPs.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/config/routeManifest.ts`

**Recommended fix:** Trim each title to ≤60 characters. The brand suffix `| NeuroWiki` is 10 characters; the descriptor before it should be ≤50. Example for ASPECTS: `"ASPECTS Score Calculator | NeuroWiki"` (37 chars).

---

## Finding 7 — Meta description length violations

**Severity:** P2

Descriptions that fall outside the 120–160 character window:

**Under 120 characters (too short — Google may auto-generate a snippet):**

| Route key | Description char count |
|---|---|
| `aha-2026-guideline` | 165 characters — over limit |
| `nihss` | 155 — within range |
| `stroke-basics` (description from routeManifest) | 191 characters — over limit |
| `iv-tpa` | 199 characters — over limit |
| `thrombectomy` | 187 characters — over limit |
| `acute-stroke-mgmt` | 179 characters — over limit |
| `status-epilepticus` | 185 characters — over limit |
| `ich-management` | 181 characters — over limit |
| `multiple-sclerosis` | 171 characters — over limit |
| `seizure-workup` | 167 characters — over limit |
| `altered-mental-status` | 166 characters — over limit |
| `headache-workup` | 165 characters — over limit |
| `vertigo` | 174 characters — over limit |
| `trials-hub` | 285 characters — significantly over limit |

The `trials-hub` description at 285 characters is the most problematic; Google will truncate it at ~160 characters and the cut-off will appear mid-sentence.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/config/routeManifest.ts`

**Recommended fix:** Trim all descriptions to 130–155 characters. For trials-hub, the current description is rich and valuable — condense to lead with the most differentiated claim: `"Summaries of 79 landmark stroke trials: DAWN, DEFUSE-3, NINDS, ORIGINAL, MR CLEAN, ELAN, INSPIRES, and more. NNT, mRS outcomes, AHA/ASA 2026 recommendations for neurologists."` (172 chars — still slightly over; target 155).

---

## Finding 8 — `og:image` missing on most calculator and pathway pages

**Severity:** P2**

`og:image` is only set when `meta.image` is defined. In routeManifest, `image` is only set on: `home`, `calculators` hub, `nihss`, `guide-hub`, `aha-2026-guideline`, `stroke-basics`, `iv-tpa`, and `trials-hub`. All other calculator pages (`ich-score`, `abcd2-score`, `has-bled-score`, `rope-score`, `glasgow-coma-scale`, `heidelberg-bleeding-classification`, `boston-criteria-caa`, `em-billing`, `chads-vasc`), all pathway pages, and all guide pages except the two above have no `image` field and therefore no `og:image` in the rendered HTML.

When shared on social media or messaging platforms these pages show no preview image. For a medical tool shared in clinical Slack channels or Twitter/X, the presence of a card image materially affects click-through.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/config/routeManifest.ts`

**Recommended fix:** Set `image: DEFAULT_IMAGE` as the default fallback inside `DEFAULT_META` (it already is set there), then ensure all routes inherit it by not overriding `image` to `undefined`. Currently routes that omit the `image` key in their `meta` object still get `DEFAULT_IMAGE` via the `STATIC_ROUTE_META_LOOKUP` spread (`{ ...DEFAULT_META, ...route.meta }`), so routes that do not specify `image` should already inherit it. However routes that explicitly set other meta keys without `image` may lose the default. Audit: `Seo.tsx` only calls `setMeta('og:image', ...)` if `meta.image` is truthy. Since `DEFAULT_META` includes `image`, all routes should have it unless the spread is dropping it. This warrants a runtime check in the pre-render output for a calculator page that omits `image`.

---

## Finding 9 — Canonical URL omits trailing slash on homepage

**Severity:** P2

`Seo.tsx` line 14: `const canonicalUrl = domain + (location.pathname === '/' ? '' : location.pathname)`. This produces `https://neurowiki.ai` (no trailing slash) for the homepage. The sitemap lists `https://neurowiki.ai/` (with trailing slash). This is a minor canonical mismatch. If Vercel redirects the trailingless form to the slash form (or vice versa), the two will be different canonical signals. They should be consistent.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/Seo.tsx` line 14.

**Recommended fix:** Change the ternary to always append the pathname without stripping the slash, or consistently use the trailing-slash form `https://neurowiki.ai/` for the homepage. Match the sitemap's form.

---

## Finding 10 — Link graph: several nodes are orphans or have sparse internal references

**Severity:** P3

From `docs/link-graph.json`:

- `hub/guide` has `referencedBy: []`. The guide hub is never linked to by any other node in the graph. This is expected for a top-level hub, but it means there are no cross-section links pointing to it.
- `calc/abcd2` has `references: []` and `referencedBy: []` — fully orphaned in the link graph. The ABCD2 calculator is published, is in the sitemap, but no other page in the graph points to it and it points nowhere.
- `article/thrombectomy`, `article/acute-stroke-mgmt`, `article/aha-2026-guideline`, `article/status-epilepticus`, `article/seizure-workup`, `article/altered-mental-status`, `article/meningitis`, `article/headache-workup`, `article/vertigo`, `article/weakness-workup`, `article/gbs`, `article/myasthenia-gravis`, `article/multiple-sclerosis` all have `references: []` — they reference no other pages. For a clinical reference site, cross-linking related guides (e.g., status-epilepticus → seizure-workup, thrombectomy → aspects-score and nihss calculators) is a significant missed SEO and user-experience opportunity.
- No trial nodes appear in `referencedBy` of any guide or calculator node. The `trial/extend-trial` node references `pathway/late-window-ivt` but that pathway node does not exist in the graph.
- The `pathway/*` nodes referenced in `calc/ich-score` (`pathway/stroke/step-2`) do not exist as nodes in the graph.

**Files:**
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/link-graph.json`

**Recommended fix:** Add cross-references: thrombectomy → nihss and aspects-score; status-epilepticus → seizure-workup; ICH management → ICH score and GCS; all condition guides → relevant trial nodes. Add all pathway nodes. Resolve the dangling `pathway/stroke/step-2` reference. Per the SEO specialist role definition, LINK_GRAPH.md should be regenerated after each update — check whether it exists and is current.

---

## Finding 11 — `MedicalScholarlyArticle` used for trial pages; `@type` requires a publication context

**Severity:** P3

`schema.ts` trialSchema wraps each trial page in `'@type': 'MedicalScholarlyArticle'` inside the `about` field. `MedicalScholarlyArticle` is a valid schema.org type, but it is technically a subtype of `Article` and requires properties like `author`, `publisher`, `datePublished`, and ideally `citation` to be recognized by Google's rich results. As currently implemented, the `about` node only carries `name` and `url`. Without `author` or `datePublished`, Google Rich Results Test will not generate a rich result from this. This is a minor issue given that Google does not currently offer a specific rich result type for clinical trial summaries, but it is worth noting for schema hygiene.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/seo/schema.ts` lines 443–469.

**Recommended fix:** Either enrich the `MedicalScholarlyArticle` node with `author`, `datePublished`, and `pmid`/`doi` fields pulled from trial data, or simplify to a `MedicalTrial` type (also valid schema.org). If the trial data model does not carry author/PMID at the schema injection point, `MedicalTrial` with `name`, `url`, and `description` is cleaner than an under-populated `MedicalScholarlyArticle`.

---

## Finding 12 — `ORGANIZATION_SCHEMA` has empty `sameAs` array and uses `favicon.png` as logo

**Severity:** P3

`schema.ts` line 29: `sameAs: []`. Schema.org Organization `sameAs` is a primary signal for Knowledge Panel eligibility. An empty array is not harmful but is a missed opportunity; at minimum the site's social profiles (if any exist) should be listed. Additionally, `logo` points to `/favicon.png`, which at typical favicon size (32×32 or 16×16 px) does not meet Google's logo guideline minimum of 112×112 px. Google recommends a dedicated logo image of at least 112×112 px for Organization schema.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/seo/schema.ts` lines 22–31.

**Recommended fix:** Add a dedicated logo image (e.g. `/logo-512.png`) at ≥112×112 px. Update `PUBLISHER.logo` and `ORGANIZATION_SCHEMA.logo` to point to it. Populate `sameAs` if any social/directory profiles exist.

---

## Finding 13 — Trial meta description falls back to `clinicalContext` which may be very long

**Severity:** P3

`routeMeta.ts` line 11–12: the trial description falls back to `trial.clinicalContext` if `trial.description` is absent. `clinicalContext` fields in trial data are often multi-sentence paragraphs far exceeding 160 characters. There is no truncation applied before the value is placed in the meta description. For the many trial pages that lack a dedicated `description` field, this will produce over-length descriptions that Google truncates mid-sentence.

**File:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/seo/routeMeta.ts` lines 10–13.

**Recommended fix:** Apply a 155-character truncation with `…` suffix when building the trial meta description from `clinicalContext`. Example: `(trial.clinicalContext ?? '').slice(0, 152) + (trial.clinicalContext?.length > 152 ? '…' : '')`.

---

## Top 5 SEO improvements (priority order)

1. **Fix the six pathway URLs in sitemap and llms.txt** (Finding 2) — These pages return non-canonical or blank content when crawled via the sitemap URLs. Highest urgency because crawlers are actively being pointed to wrong locations.

2. **Fix the duplicate title on `/guide/stroke-basics` and `/pathways/stroke-code`** (Finding 1) — Duplicate titles suppress rankings for one of the two pages. Two-minute fix in routeManifest.

3. **Extend react-snap pre-render coverage to all guide and pathway pages** (Finding 3) — Without pre-rendered HTML, most guide pages serve a blank shell to Googlebot. Add at minimum all 16 guide pages and 6 pathways to `reactSnap.include`.

4. **Add structured data schema for the `/pathways` hub** (Finding 4) — The only hub page with no schema. Straightforward: copy the `CALCULATORS_HUB_SCHEMA` pattern with the seven pathway entries.

5. **Trim over-length titles and descriptions** (Findings 6 and 7) — Seven titles exceed 60 characters and over a dozen descriptions exceed 160 characters, leading to SERP truncation. A single routeManifest edit pass addresses all of them.

---

## Summary table

| # | Finding | Severity | File(s) |
|---|---|---|---|
| 1 | Duplicate title: stroke-basics = pathways-stroke-code | P1 | routeManifest.ts |
| 2 | Sitemap and llms.txt use wrong `/calculators/*` URLs for all pathway pages | P1 | sitemap.xml, llms.txt |
| 3 | react-snap covers 39 routes; sitemap covers 140+; most trial and guide pages not pre-rendered | P1 | package.json |
| 4 | `/pathways` hub has no structured data | P2 | schema.ts |
| 5 | Sitemap is hand-maintained and has drifted from routeManifest `includeInSitemap` flags | P2 | sitemap.xml, routeManifest.ts |
| 6 | 7 titles exceed 60 characters | P2 | routeManifest.ts |
| 7 | 14 descriptions exceed 160 characters; trials-hub at 285 chars | P2 | routeManifest.ts |
| 8 | `og:image` inheritance warrants runtime verification for non-image-keyed routes | P2 | routeManifest.ts, Seo.tsx |
| 9 | Canonical URL for homepage omits trailing slash vs sitemap | P2 | Seo.tsx |
| 10 | Link graph: ABCD2 orphaned; 13 guide articles reference no pages; pathway nodes missing | P3 | docs/link-graph.json |
| 11 | `MedicalScholarlyArticle` schema underpopulated for trial pages | P3 | schema.ts |
| 12 | Organization schema: empty sameAs, favicon used as logo (<112px) | P3 | schema.ts |
| 13 | Trial description fallback to `clinicalContext` is untrimmed | P3 | routeMeta.ts |
