# Architect review — PR # SPA-prerendering-2026-05-21 (Phase 1)

**Decision:** approve-with-conditions
**Reviewed:** plan only + touched files
**Reviewer:** system-architect (orchestrator-routed)
**Date:** 2026-05-21

## Rationale

The pre-rendering scaffold is already 80% in place and the chosen path is unambiguous. `react-snap` 1.23.0 is installed, configured in `package.json`, and `index.tsx` already branches on `rootElement.hasChildNodes()` to call `hydrateRoot` vs `createRoot` — the canonical react-snap integration. The `Seo.tsx` component writes `document.title` and meta tags inside a `useEffect`, which react-snap's `renderAfterTime: 1500` is explicitly designed to capture. What's missing is mechanical: (a) a `postbuild` script that invokes react-snap, (b) corrected `include` paths (four paths reference the old `/calculators/*-pathway` URLs that were redirected to `/pathways/*`), (c) a full enumeration of the 43 static routes from `STATIC_ROUTE_DEFINITIONS`, and (d) a deliberate scoping decision for the 124 dynamic trial/question routes.

Option 1 (finish wiring react-snap) wins decisively over Options 2 and 3 for tonight's autonomous execution: vite-plugin-ssg would require restructuring `index.tsx`'s mount path and proving every lazy-loaded page is SSR-safe (66 `window`/`localStorage` references across 20 files — at least four would need audit), and a custom puppeteer script is net-new code with no payoff over the already-installed tool. Chief risks are (1) Vercel build environment puppeteer/Chromium support, (2) VitePWA's Workbox precache picking up the newly-generated per-route HTML files and bloating the manifest, and (3) the SPA-fallback rewrite needing to *not* override per-route HTML files now present in `dist/`. Each is addressable but each is a real failure mode — hence approve-with-conditions, not approve.

**Recommendation on autonomy:** Ship autonomously, but staged. Wire react-snap with a small initial route set (11 highest-SEO pages). Verify Vercel build, Gate 6 live-route check, Workbox precache size. If green, follow up with a second commit expanding to all 43 static routes. Do NOT pre-render the 124 dynamic routes tonight. Blast radius of staged approach is one commit reverted via `git revert` if Vercel build breaks; the SPA itself is unaffected because if `dist/calculators/glasgow-coma-scale/index.html` doesn't exist, Vercel's SPA-fallback serves `dist/index.html` and the app works exactly as today.

## Required follow-ups

1. **Phase 1 (this PR, tonight):** wire react-snap for 11 high-value routes only — `/`, `/calculators`, `/pathways`, `/guide`, `/trials`, `/calculators/nihss`, `/calculators/aspects-score`, `/calculators/ich-score`, `/calculators/glasgow-coma-scale`, `/calculators/abcd2-score`, `/calculators/has-bled-score`. Add `inlineCss: false`, `minifyHtml: { collapseWhitespace: false, removeComments: false }`, and `viewport: { width: 1280, height: 800 }` to the `reactSnap` config.
2. **Hard prerequisite — local `npm run build` must succeed before `git push`.** If puppeteer/Chromium fails locally, do not push. Escalate to V in morning.
3. **Live verify post-deploy** — `WebFetch` `https://neurowiki.ai/calculators/glasgow-coma-scale` and confirm the body contains "Glasgow" (per-route title), not just the shell title. Same for `/calculators/nihss`.
4. **VitePWA interaction:** existing `globPatterns: ['**/*.{js,css,html,...}']` will sweep new per-route `index.html` files. For 11 routes that's ~50 KB total — fine for Phase 1. Phase 2 expansion needs explicit globIgnores or pattern restructure.
5. **Rollback plan:** `git revert <commit>` and push. Previous commit had no postbuild step — the revert is clean. Vercel auto-rolls-back to prior deploy if build times out mid-puppeteer.
6. **Phase 2 (next PR, V awake):** expand to all 43 static routes. Generate include array from `STATIC_ROUTE_DEFINITIONS` programmatically (avoid duplication).
7. **Dynamic routes (101 trials + 23 questions):** defer. Per-route pre-render of 124 dynamic pages adds ~3-5 min to Vercel build + ~10 MB to dist. Phase 3 conversation with V — curated allowlist by GA4 traffic.

## Blocking issues

None — all material concerns addressed by the staged approach. Single hard prerequisite: local `npm run build` must succeed before push. If it doesn't, PR doesn't ship — escalate to V in morning.
