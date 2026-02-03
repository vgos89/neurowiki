# Performance Audit Report — Neurowiki (Cloudflare)

**Date:** 2026-02-03  
**Scope:** Bundle, code splitting, render, Cloudflare, network  
**Target:** &lt;500 KB gzipped bundle, TTI &lt;3.8s, TBT &lt;200ms

---

## Critical issues (fix immediately)

### 1. Tailwind CSS: CDN + runtime compilation

- **Current:** `index.html` loads `https://cdn.tailwindcss.com` and inline `tailwind.config`. `index.css` uses `@tailwind base/components/utilities` but there is no PostCSS/Tailwind in the Vite pipeline, so production relies on the CDN.
- **Impact:** Large blocking script, runtime CSS compilation on the main thread, layout/style shifts, slower LCP/TTI.
- **Fix:** Use Tailwind at build time via `@tailwindcss/vite`, import CSS from `index.tsx`, remove CDN and inline config, define theme in CSS with `@theme`.

### 2. Unused ESM import map in production

- **Current:** `index.html` includes `<script type="importmap">` pointing React, react-dom, react-router-dom, etc. to esm.sh. Vite bundles everything; the import map is unused in production.
- **Impact:** Extra HTML, possible parser work, confusion; no direct size win but cleaner and correct.
- **Fix:** Remove the `<script type="importmap">` block from `index.html`.

### 3. CSS not in the Vite bundle pipeline

- **Current:** `index.css` is linked from `index.html` with `<link href="/index.css">`. It is not imported from JS, so Vite does not run PostCSS/Tailwind on it; built CSS can contain raw `@tailwind` directives or be minimal.
- **Impact:** Tailwind only works via CDN; no single optimized stylesheet, no tree-shaking of unused utilities.
- **Fix:** Add `import './index.css'` (or equivalent path) in `index.tsx` so CSS is processed by Vite and the Tailwind plugin.

---

## High priority (fix this week)

### 4. Duplicate font loading

- **Current:** Inter loaded in `index.html` (Google Fonts link) and again in `index.css` (`@import url('...Inter...')`). Material Icons Outlined in CSS vs Material Symbols Outlined in HTML (two icon sets).
- **Impact:** Duplicate requests, more bytes, risk of FOUT/FOIT.
- **Fix:** Load Inter and one icon font only from `index.html`; remove font `@import` from `index.css`. Add `preconnect` for `fonts.googleapis.com` and `fonts.gstatic.com`.

### 5. No cache headers for static assets (Cloudflare)

- **Current:** No `_headers` (or equivalent) for Cloudflare Pages; default caching only.
- **Impact:** Suboptimal reuse of JS/CSS/fonts/images at edge and browser.
- **Fix:** Add `public/_headers` with long-lived immutable cache for hashed assets and reasonable cache for HTML.

### 6. Large main bundle (guideContent + layout)

- **Current:** `Layout` (and thus `guideContent.ts`) and modals (e.g. GlobalTrialModal) are eagerly loaded. `guideContent.ts` is large static data.
- **Impact:** Larger main JS, slower TTI.
- **Fix:** Lazy-load modals and route-level chunks; consider splitting or lazy-loading guide content by section.

---

## Medium priority (fix this month)

### 7. Favicon size

- **Current:** `favicon.png` ~115 KB.
- **Fix:** Resize/optimize or serve as ICO/WebP; target &lt;50 KB.

### 8. No explicit vendor/code splitting in Vite

- **Current:** Relies on Vite defaults only.
- **Fix:** Add `build.rollupOptions.output.manualChunks` to split React/react-dom and other large vendors into a stable chunk.

### 9. No lazy loading for heavy UI

- **Current:** Modals (Deep Learning, NIHSS embed, Eligibility, EVT, etc.) and some calculators are not lazy-loaded.
- **Fix:** Use `React.lazy()` + `Suspense` for modals and heavy calculator components.

---

## Bundle / code splitting (summary)

| Item | Status | Action |
|------|--------|--------|
| Tailwind | ❌ CDN | Build-time via @tailwindcss/vite |
| Routes | ✅ Router | Keep; add lazy routes where heavy |
| Modals | ❌ Eager | Lazy-load |
| Calculators | ⚠️ Mixed | Lazy-load per page/modal |
| guideContent | ❌ Main bundle | Split or lazy-load by section |
| Fonts | ❌ Duplicate | Single source + preconnect |

---

## Cloudflare / network (summary)

| Item | Status | Action |
|------|--------|--------|
| Cache headers | ❌ Default | Add `_headers` (immutable for assets) |
| Compression | ✅ Typically on | Rely on Brotli/gzip at edge |
| Preconnect | ❌ Missing | Add for fonts (and analytics if needed) |
| Import map | ❌ Unused | Remove |

---

## Implementation priority

**Phase 1 (today):**

1. Add `@tailwindcss/vite`, wire Tailwind in Vite, move theme to CSS, remove Tailwind CDN and inline config from `index.html`.
2. Import root CSS from `index.tsx` so it goes through Vite (and Tailwind).
3. Remove ESM import map from `index.html`.
4. Add font preconnect and single font/icon source; remove duplicate font imports from CSS.
5. Add `public/_headers` for cache-control.

**Phase 2 (this week):**

1. Lazy-load modals and heavy calculator components.
2. Add `manualChunks` in Vite for vendor splitting.
3. Consider splitting or lazy-loading `guideContent`.

**Phase 3 (this month):**

1. Optimize favicon and images (WebP, sizes).
2. Add React.memo/useMemo/useCallback where profiling shows benefit.
3. Prefetch critical routes or assets if needed.

---

## Expected impact (after Phase 1)

- **LCP/TTI:** Fewer blocking scripts and runtime CSS work → meaningful improvement (target: ~30%+).
- **Bundle:** One optimized CSS chunk, no Tailwind CDN; main JS unchanged in Phase 1.
- **Caching:** Better cache hit rates from `_headers` → faster repeat loads.

Metrics (LCP, TTI, bundle size) should be re-measured after Phase 1 (e.g. Lighthouse, `vite build` + `dist` sizes) and again after Phase 2.

---

## Phase 2 Implementation (2026-02-03)

### Completed

1. **Vite manualChunks**
   - Added `build.rollupOptions.output.manualChunks` in `vite.config.ts`.
   - `react-vendor`: react, react-dom, react-router-dom (one chunk to avoid circular deps).
   - `lucide`: lucide-react.
   - `genai`: @google/genai (only loaded when AI features are used).
   - react-markdown is not in a separate chunk (stays in route chunks that use it) to avoid circular chunk warnings.

2. **Lazy-loaded modals**
   - **App.tsx:** `DisclaimerModal` and `GlobalTrialModal` are now `React.lazy()` with `Suspense` (fallback `null`). TrialModalWrapper wraps GlobalTrialModal in Suspense.
   - **Layout.tsx:** `ToolManagerModal` is lazy; only mounted when `isToolModalOpen` is true, wrapped in Suspense.
   - **FeedbackButton.tsx:** `FeedbackModal` is lazy; only mounted when `isOpen` is true, wrapped in Suspense.

### Build impact (after Phase 2)

- **Main bundle (index):** ~107 KB (gzipped ~31.5 KB) — app shell only; modals and heavy UI load on demand.
- **react-vendor:** ~231 KB (~74 KB gzipped) — stable, cacheable chunk for React stack.
- **Lazy chunks:** GlobalTrialModal, DisclaimerModal, ToolManagerModal, FeedbackModal each in separate chunks (~2–7 KB gzipped), loaded when first used.
- Routes remain lazy as in Phase 1 (unchanged).
