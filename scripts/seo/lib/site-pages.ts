/**
 * Page inventory adapter — the one place the SEO pipeline learns what pages
 * exist and what wording they currently serve.
 *
 * Architect condition 3 (SEO-DAILY-PORT): CONSUME, never re-derive.
 *   - title/description come from getRouteMeta(pathname), the exact function
 *     the live site renders through (routeManifest statics, trial pages,
 *     /trials/q/* question pages, calculator fallbacks). A snippet proposal
 *     can therefore never quote a phantom "old wording".
 *   - the path universe comes from SITEMAP_ROUTES plus public/sitemap.xml;
 *     disagreements between the two are reported, not silently merged away.
 *   - lastmod and inSitemap come from public/sitemap.xml only.
 *
 * Runs under tsx (same pattern as scripts/gen-trial-card-meta.ts, which also
 * imports from src/). Emits JSON for the plain-.mjs analysis scripts:
 *   docs/seo/pages-snapshot-latest.json         (stable path for consumers)
 *   docs/seo/runs/<date>/pages-snapshot.json    (the day's record)
 *
 * Usage: npx tsx scripts/seo/lib/site-pages.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { getRouteMeta } from '../../../src/seo/routeMeta';
import { SITEMAP_ROUTES } from '../../../src/seo/sitemapRoutes';
// @ts-ignore — plain-JS config module shared with the .mjs scripts
import { SITE, kindOf, normalizePath } from '../config.mjs';

type PageRecord = {
  url: string;
  path: string;
  kind: string;
  title: string | null;
  description: string | null;
  lastmod: string | null;
  inSitemap: boolean;
  inManifest: boolean;
};

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');

// ── Sitemap: URL universe + lastmod ─────────────────────────────────────
const sitemapXml = fs.readFileSync(path.join(repoRoot, 'public/sitemap.xml'), 'utf8');
const sitemapEntries = new Map<string, string | null>();
for (const block of sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const loc = block[1].match(/<loc>\s*([^<]+?)\s*<\/loc>/)?.[1];
  if (!loc) continue;
  const lastmod = block[1].match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/)?.[1] ?? null;
  sitemapEntries.set(normalizePath(loc), lastmod);
}

// ── Manifest: the canonical route list the app itself exports ───────────
const manifestPaths = new Set<string>(SITEMAP_ROUTES.map((p: string) => normalizePath(p)));

// ── Merge on path ───────────────────────────────────────────────────────
const allPaths = [...new Set([...sitemapEntries.keys(), ...manifestPaths])].sort();

const pages: PageRecord[] = allPaths.map((p) => {
  const meta = getRouteMeta(p);
  return {
    url: `${SITE.baseUrl}${p === '/' ? '' : p}` || SITE.baseUrl,
    path: p,
    kind: kindOf(p),
    title: meta?.title ?? null,
    description: meta?.description ?? null,
    lastmod: sitemapEntries.get(p) ?? null,
    inSitemap: sitemapEntries.has(p),
    inManifest: manifestPaths.has(p),
  };
});

const onlySitemap = pages.filter((p) => p.inSitemap && !p.inManifest).map((p) => p.path);
const onlyManifest = pages.filter((p) => !p.inSitemap && p.inManifest).map((p) => p.path);

const snapshot = {
  generatedAt: new Date().toISOString(),
  site: SITE.baseUrl,
  counts: {
    total: pages.length,
    inSitemap: pages.filter((p) => p.inSitemap).length,
    inManifest: pages.filter((p) => p.inManifest).length,
    byKind: pages.reduce<Record<string, number>>((acc, p) => {
      acc[p.kind] = (acc[p.kind] ?? 0) + 1;
      return acc;
    }, {}),
  },
  // Drift between the hand-maintained sitemap and the app's own route list.
  // Non-empty lists here are findings for the briefing, not errors.
  sitemapOnly: onlySitemap,
  manifestOnly: onlyManifest,
  pages,
};

const date = new Date().toISOString().slice(0, 10);
const runDir = path.join(repoRoot, SITE.reportRoot, 'runs', date);
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, 'pages-snapshot.json'), JSON.stringify(snapshot, null, 2));
fs.writeFileSync(
  path.join(repoRoot, SITE.reportRoot, 'pages-snapshot-latest.json'),
  JSON.stringify(snapshot, null, 2),
);

console.log(`Page inventory: ${pages.length} pages (${snapshot.counts.inSitemap} in sitemap, ${snapshot.counts.inManifest} in manifest)`);
if (onlySitemap.length) console.log(`  In sitemap but not the app's route list: ${onlySitemap.join(', ')}`);
if (onlyManifest.length) console.log(`  In the app's route list but missing from sitemap: ${onlyManifest.join(', ')}`);
console.log(`Summary: pages=${pages.length} sitemapOnly=${onlySitemap.length} manifestOnly=${onlyManifest.length}`);
