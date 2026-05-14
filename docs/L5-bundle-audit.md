# L5 Bundle Audit — NeuroWiki

**Date:** 2026-05-13  
**Commit:** Current main (build successful)  
**Status:** Findings only — no code changes  

---

## Executive Summary

Total production bundle: **3.0 MB raw** assets (482 KB + 390 KB + 388 KB alone for top 3 chunks). Gzip: **~550 KB total**. Build is within acceptable range for a clinical app, but three giant chunks (trialData, TrialVisualizations, TrialPageNew) dominate the bundle at 1.26 MB raw = 42% of all JavaScript. The bundle is well-code-split at the route level (50 lazy routes), but three critical bottlenecks prevent faster trial page load:

1. **trialData (482 KB raw / 118.7 KB gzip)** — 9,781-line data export; referenced by both TrialPageNew and globally available for modal context.
2. **TrialVisualizations (390 KB raw / 114.98 KB gzip)** — recharts + all chart archetypes (GrottaBarChart, DeltaBandChart, BenchmarkThresholdChart) bundled together despite only one being used per trial.
3. **TrialPageNew (387 KB raw / 43.73 KB gzip)** — dynamic import attempted but static imports elsewhere prevent chunk isolation.

**Good news:** lucide-react is correctly chunked (23.91 KB / 5.47 KB gzip). Suspense boundaries are in place on TrialPageNew. All 50+ routes are lazy-loaded.

**Action items (ordered by impact):** Split trial visualizations by archetype. Lazy-load trialData on demand. Split TrialPageNew from SubgroupWell. Audit lucide-react icon usage for dead-tree removal.

---

## Top 10 Chunks

| Chunk | Raw Size | Gzip Size | Lazy | Status |
|---|---|---|---|---|
| trialData | 482.30 KB | 118.70 KB | ⚠️ Partial | **GATEWAY** — all trial pages wait for this |
| TrialVisualizations | 390.18 KB | 114.98 KB | ✓ Lazy | Bloated — includes all chart types |
| TrialPageNew | 387.75 KB | 43.73 KB | ✓ Lazy | Static import chain prevents split |
| react-vendor | 230.71 KB | 73.73 KB | ✓ Bundled | Correct — React + React Router |
| index-W3QjXB5H | 117.75 KB | 36.25 KB | — | Shared code (utils, hooks, contexts) |
| index-B7k4fcBq | 109.23 KB | 31.34 KB | — | Additional shared layer |
| EmBillingCalculator | 87.88 KB | 22.16 KB | ✓ Lazy | Legitimate single-page use |
| guideContent | 85.87 KB | 27.67 KB | ✓ Lazy | All guide prose loaded on first guide access |
| EvtPathway | 72.80 KB | 16.69 KB | ✓ Lazy | Legitimate pathway page |
| StrokeGuidelineMindmap | 71.17 KB | 19.66 KB | ✓ Lazy | Mindmap SVG + prose; large but expected |

---

## Findings — High Priority

### H1 — trialData singleton blocks all trial pages

**Surface:** `src/data/trialData.ts` (9,781 lines)  
**Current:** 482 KB raw / 118.7 KB gzip  
**Expected:** 180–220 KB gzip (if split by category or paginated)  
**Why:** Trial metadata (89 trials × ~110 LOC each) is loaded upfront by TrialsPage and TrialModalContext. Every trial detail page waits for the full 482 KB chunk to parse before rendering.  
**Fix complexity:** Medium

**Recommendation:** Split by category (`strokeTrialData.ts`, `epilepsyTrialData.ts`, etc.) or implement lazy-load-on-demand via `findTrialById` that fetches only the trial being viewed. Current `src/data/trialListData.ts` already provides a lightweight catalog; extend it to load full payload only when needed.

**Impact:** -80–120 KB gzip on initial trial page load.

---

### H2 — TrialVisualizations includes all chart archetypes regardless of trial type

**Surface:** `src/components/trials/TrialVisualizations.tsx` (imports all archetypes)  
**Current:** 390.18 KB raw / 114.98 KB gzip (recharts + 3 chart types)  
**Expected:** 220 KB gzip (single archetype per trial)  
**Why:** The file imports DeltaBandChart, GrottaBarChart, and BenchmarkThresholdChart at the top level, even though a single trial uses only one. Recharts itself is large (~60 KB gzip); multiplying its footprint across three chart components adds 30–40 KB waste.  
**Fix complexity:** Medium

**Recommendation:**
1. Replace enum-dispatch in TrialVisualizations with dynamic imports:
   ```typescript
   const chartType = trial.visualization.type;
   const Chart = await import(`./archetypes/${chartType}Chart`);
   ```
2. Or: Create three separate visualization files (DeltaBandVisualizations.tsx, GrottaBarVisualizations.tsx, etc.) and lazy-load by trial type.
3. Currently GrottaBarChart is *also* statically imported by SubgroupWell (line 13 of SubgroupWell.tsx), which causes the Vite warning: `dynamic import will not move module into another chunk`. Remove the static import; wrap GrottaBarChart in a Suspense boundary within SubgroupWell instead.

**Impact:** -60–80 KB gzip.

---

### H3 — ComingSoon + GrottaBarChart dual import prevents code splitting

**Surface:** Build warning at compile time  
**Current:** ComingSoon dynamically imported in App.tsx but statically imported in PublishGate.tsx. GrottaBarChart dynamically imported in TrialPageNew but statically imported in SubgroupWell.  
**Expected:** Zero warnings; dynamic imports honored.  
**Why:** Vite/Rollup cannot split a module into a separate chunk if it is statically imported anywhere. Both cases should use *only* lazy/dynamic imports, even if the component is used in multiple places.  
**Fix complexity:** Small

**Recommendation:**
1. In PublishGate.tsx: Replace `import { ComingSoon }` with `const ComingSoon = lazy(() => import('./ComingSoon'))`.
2. In SubgroupWell.tsx: Replace `import { GrottaBarChart }` with lazy import + wrap the chart in a Suspense boundary.

**Impact:** -5–10 KB gzip (enables chunk isolation for frequently-used components).

---

### H4 — lucide-react at 23.91 KB raw — tree-shake unused icons

**Surface:** `src/` (49 lucide-react imports across codebase)  
**Current:** 23.91 KB raw / 5.47 KB gzip  
**Expected:** 15–18 KB raw / 3.5–4 KB gzip  
**Why:** lucide-react is a large icon library. Even with tree-shaking, unused imports can slip through. Post-L5.6 refactor, some icon imports may be orphaned (e.g., old dark-mode toggle icons).  
**Fix complexity:** Small

**Recommendation:** Run `npm run build -- --visualize` or use `rollup-plugin-visualizer` to identify unused lucide icons. The vite.config.ts already has visualizer configured (`process.env.ANALYZE === 'true'`). Then:
```bash
ANALYZE=true npm run build
open dist/stats.html  # or dist/stats-gzip.html
```
Look for lucide icons with 0 usage. Remove dead imports.

**Impact:** -5–8 KB gzip.

---

## Findings — Medium Priority

### M1 — Two index chunks (index-W3QjXB5H + index-B7k4fcBq) — shared code deduplication

**Surface:** Vite automatic vendor splitting  
**Current:** 117.75 KB + 109.23 KB = 227 KB raw / 67.6 KB gzip (two chunks)  
**Expected:** One or consolidated shared chunk at 190 KB raw / 55 KB gzip  
**Why:** These are likely hooks, contexts, and utilities referenced by many routes. Vite splits large shared code into intermediate chunks. The duplication is unintentional.  
**Fix complexity:** Medium

**Recommendation:** Audit what's in each chunk (add `console.log` in chunks or use visualizer). Consider consolidating utilities into a single `utils-shared.ts` or `hooks-core.ts` to guide Vite's splitting. Alternatively, increase `manualChunks` specificity:

```typescript
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
    if (id.includes('lucide-react')) return 'lucide';
    if (id.includes('recharts')) return 'recharts'; // explicit lucide chunk
  }
  // Add utility/hook aggregation here for codebase files
}
```

**Impact:** -10–15 KB gzip (consolidation overhead recovery).

---

### M2 — strokeClinicaPearls chunk at 33.25 KB raw / 11.28 KB gzip is large for prose

**Surface:** `src/data/strokeClinicalPearls.ts`  
**Current:** 33.25 KB raw / 11.28 KB gzip  
**Expected:** 20 KB raw / 7 KB gzip (if split into smaller chunks)  
**Why:** Clinical pearls data is loaded whenever a guide page renders. If only a subset of pearls are shown per page, lazy-loading the full data is overkill.  
**Fix complexity:** Low (if pearls are already paginated per guide; Medium if they're all on one page)

**Recommendation:** Check usage. If all pearls appear on the same page, no action needed. If pearls are shown selectively (e.g., "Deep Learning modal only" or "per-article"), move that subset into a separate file and lazy-load it.

**Impact:** -4–5 KB gzip (minor if already paginated).

---

### M3 — MarkdownSection at 40.71 KB raw / 12.33 KB gzip — likely includes react-markdown

**Surface:** `src/components/trials/MarkdownSection.tsx`  
**Current:** 40.71 KB raw / 12.33 KB gzip  
**Expected:** 25 KB raw / 8 KB gzip  
**Why:** MarkdownSection is lazy-loaded in TrialPageNew but may pull in react-markdown + remark/unified on every trial detail page.  
**Fix complexity:** Small (if markdown parser is already on-demand; Low if it's static)

**Recommendation:** Confirm react-markdown is a runtime dependency, not bundled elsewhere. If trials with no markdown still load the parser, consider splitting markdown-having trials into a separate route.

**Impact:** -4–6 KB gzip.

---

## Findings — Low Priority

### L1 — EmBillingCalculator at 87.88 KB raw / 22.16 KB gzip

**Surface:** `src/pages/EmBillingCalculator.tsx`  
**Current:** 87.88 KB raw / 22.16 KB gzip (largest single calculator page)  
**Expected:** 50–60 KB gzip (typical calculator is 10–15 KB)  
**Why:** EM billing logic is complex; likely includes lookup tables or complex business logic.  
**Fix complexity:** Medium (refactor logic into a shared utility)

**Recommendation:** Extract billing logic into `src/lib/emBilling.ts` (shared, smaller). Check for duplicate dependencies with other calculators. No urgent action.

**Impact:** -5–10 KB gzip (low priority).

---

## Recommended Next Steps

**Immediate (next sprint):**
1. **H1:** Create a migration plan for trialData chunking. Start with category splits (strokeTrialData, seizureTrialData, etc.).
2. **H3:** Remove static imports of ComingSoon and GrottaBarChart; replace with lazy imports.
3. **H4:** Run visualizer and identify unused lucide icons. Remove dead imports.

**Short-term (1–2 sprints):**
4. **H2:** Split TrialVisualizations into per-archetype files. Implement dynamic import of chart components.
5. **M1:** Investigate the two index chunks; consolidate if possible.

**Later (as needed):**
6. **M2 / M3:** Profile strokeClinicaPearls and MarkdownSection usage; lazy-load if high-frequency but low-utility.
7. **L1:** Refactor EmBillingCalculator logic into utilities.

---

## Performance Budget Status

| Metric | Target | Current | Status |
|---|---|---|---|
| Total JS gzip | < 500 KB | ~550 KB | ⚠️ Over by 50 KB |
| Initial bundle (index + vendor) | < 150 KB gzip | ~108 KB gzip | ✓ Pass |
| First calculator load | < 150 KB | ~50 KB gzip | ✓ Pass |
| Trial page (lazy-loaded) | < 300 KB | 387 KB raw / 43 KB gzip | ⚠️ Raw size high, gzip good |
| LCP threshold (clinical use) | < 2.5 sec | Unknown (not measured) | ? |

---

## Lazy-Loading Verification

- **Routes lazy-loaded:** 50 / 50 ✓ (App.tsx confirms all page components are `lazy()`)
- **Suspense boundaries:** Present on TrialPageNew, index.html uses standard `<Suspense fallback>` ✓
- **Chart lazy-loading:** TrialPageNew uses `React.lazy()` for GrottaBarChart, DeltaBandChart, BenchmarkThresholdChart, but static import in SubgroupWell breaks the promise (see H3)
- **Modal lazy-loading:** GlobalTrialModal and DisclaimerModal are lazy ✓

---

## Notes

- Vite config is correct: no obvious misconfigurations. `manualChunks` for react-vendor and lucide are good.
- CSS bundle (121.05 KB raw / 20.07 KB gzip) is reasonable for Tailwind + shadcn/ui.
- No obvious unused dependencies detected (recharts, react-markdown, date-fns all appear used).
- Build time: 1.88 seconds — healthy for Vite + 2,798 modules.

---

**Audit completed by:** quality-assurance  
**Next review:** After H1, H2, H3 fixes implemented.
