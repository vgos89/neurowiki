---
name: performance
description: Domain knowledge for Core Web Vitals, bundle size optimization, code splitting, image optimization, caching strategies, and performance budgets. Loaded by quality-assurance and ui-architect when performance budgets are in scope.
---

Performance optimization knowledge for NeuroWiki. Loaded by quality-assurance and ui-architect when performance budgets, Core Web Vitals, or bundle size are in scope for the current task.

---

## Performance Targets

**Core Web Vitals (required):**
- LCP (Largest Contentful Paint): < 2.5 seconds
- FID (First Input Delay): < 100 milliseconds
- CLS (Cumulative Layout Shift): < 0.1

**Additional targets:**
- TTFB (Time to First Byte): < 600ms
- Total page load: < 3 seconds
- Bundle size: < 500KB (gzipped)
- Lighthouse score: > 90

**Per-feature budget:**
- Load time: < 2 seconds
- Bundle impact: < 50KB
- No blocking JavaScript
- Images optimized (WebP, lazy loaded)

---

## Code Splitting

Lazy load every calculator and guide page — do not include in the main bundle:

```typescript
const NIHSSCalculator = lazy(() => import('./calculators/NIHSS'));
const ASPECTSCalculator = lazy(() => import('./calculators/ASPECTS'));

<Suspense fallback={<LoadingSpinner />}>
  <NIHSSCalculator />
</Suspense>
```

Route-based splitting is automatic via React Router + Vite dynamic imports.

---

## Image Optimization

- Format: WebP (70% smaller than JPEG). Fallback to JPEG/PNG for legacy browsers. SVG for icons and logos.
- Sizing: Never serve images larger than the display size.
- Lazy loading: All images below the fold use `loading="lazy"` and `decoding="async"`.
- Quality: 85% for photos; lossless for diagrams.

---

## Bundle Size

**Analyze:**
```bash
npm run build && npx vite-bundle-visualizer
```

**Tree shaking — import only what you use:**
```typescript
// Bad
import _ from 'lodash'; // 70KB
// Good
import sortBy from 'lodash/sortBy'; // 2KB
// Better
const sorted = [...array].sort((a, b) => a.name.localeCompare(b.name));
```

---

## Caching

Static assets (images, fonts): `Cache-Control: public, max-age=31536000, immutable`

Trial data (changes rarely): Revalidate every 24 hours.

---

## JavaScript Optimization

**Minimize re-renders:**
```typescript
const handleClick = useCallback(() => { ... }, []);
```

**Debounce search:**
```typescript
const debouncedSearch = useMemo(
  () => debounce((q: string) => searchTrials(q), 300), []
);
```

**Virtualize long lists (50+ items):**
Use `react-window` or `react-virtual` for trial lists longer than 50 rows.

---

## Performance Checklist

Before deploying any new page or feature:
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Total bundle < 500KB
- [ ] Images WebP + lazy loaded
- [ ] Route code-split
- [ ] No console.log in production
- [ ] API responses cached appropriately

---

## Lighthouse CI

Run before PR:
```bash
npx lhci autorun --collect.url=http://localhost:4173/
```

Assert: performance ≥ 0.9, LCP ≤ 2500ms.

---

## Clinical Context

Residents use NeuroWiki in stroke codes on hospital WiFi. Every 100ms of delay matters. Prioritize:
1. Time-to-interactive on calculator and guide pages (these are used under time pressure)
2. Offline resilience (hospital WiFi is unreliable)
3. Mobile performance at 375px / slow 3G simulation
