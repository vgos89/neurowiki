import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const routeManifestPath = path.join(rootDir, 'src/config/routeManifest.ts');
const appPath = path.join(rootDir, 'src/App.tsx');

async function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const encoded = Buffer.from(transpiled).toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

const { STATIC_ROUTE_DEFINITIONS, STATIC_ROUTE_LOOKUP, STATIC_SITEMAP_ROUTES } = await loadTsModule(routeManifestPath);
const appSource = fs.readFileSync(appPath, 'utf8');

const paths = STATIC_ROUTE_DEFINITIONS.map((route) => route.path);
const duplicatePaths = paths.filter((path, index) => paths.indexOf(path) !== index);
if (duplicatePaths.length > 0) {
  throw new Error(`Duplicate manifest paths detected: ${duplicatePaths.join(', ')}`);
}

const requiredStaticPaths = ['/', '/calculators', '/guide', '/trials', '/pathways', '/pathways/stroke-code', '/guide/aha-2026-guideline'];
for (const requiredPath of requiredStaticPaths) {
  if (!STATIC_ROUTE_LOOKUP[requiredPath]) {
    throw new Error(`Required static route missing from manifest: ${requiredPath}`);
  }
}

const missingMeta = STATIC_ROUTE_DEFINITIONS.filter((route) => !route.meta?.title || !route.meta?.description);
if (missingMeta.length > 0) {
  throw new Error(`Routes missing title/description metadata: ${missingMeta.map((route) => route.path).join(', ')}`);
}

const missingPublishedFlag = STATIC_ROUTE_DEFINITIONS.filter((route) => route.publishGate && typeof route.published !== 'boolean');
if (missingPublishedFlag.length > 0) {
  throw new Error(`Publish-gated routes missing published flag: ${missingPublishedFlag.map((route) => route.path).join(', ')}`);
}

// LAYOUT_SPEC §7, §2, §6.1.2 — every route must declare zone, bottomNavTab, railItem
// 2026-05-19: null is now permitted for bottomNavTab + railItem to support
// private utility routes (e.g., /my-cases) that don't surface in the global
// bottom nav or desktop rail.
const VALID_ZONES = ['reading', 'reference', 'none'];
const VALID_TABS = ['home', 'trials', 'calculators', 'pathways', 'guide', 'cases'];

const missingZone = STATIC_ROUTE_DEFINITIONS.filter(
  (route) => !VALID_ZONES.includes(route.zone)
);
if (missingZone.length > 0) {
  throw new Error(
    `Routes missing valid zone field (${VALID_ZONES.join('|')}): ${missingZone.map((r) => r.path).join(', ')}`
  );
}

const missingBottomNavTab = STATIC_ROUTE_DEFINITIONS.filter(
  (route) => route.bottomNavTab !== null && !VALID_TABS.includes(route.bottomNavTab)
);
if (missingBottomNavTab.length > 0) {
  throw new Error(
    `Routes missing valid bottomNavTab field: ${missingBottomNavTab.map((r) => r.path).join(', ')}`
  );
}

const missingRailItem = STATIC_ROUTE_DEFINITIONS.filter(
  (route) => route.railItem !== null && !VALID_TABS.includes(route.railItem)
);
if (missingRailItem.length > 0) {
  throw new Error(
    `Routes missing valid railItem field: ${missingRailItem.map((r) => r.path).join(', ')}`
  );
}

// Part 3 — verify no /calculators/{pathway-slug} entries remain in the manifest
const pathwaySlugsThatMoved = ['stroke-code', 'evt-pathway', 'late-window-ivt', 'elan-pathway', 'se-pathway', 'migraine-pathway', 'gca-pathway'];
const stranded = STATIC_ROUTE_DEFINITIONS.filter(
  (r) => r.path.startsWith('/calculators/') && pathwaySlugsThatMoved.some((s) => r.path.endsWith(s))
);
if (stranded.length > 0) {
  throw new Error(`Pathway routes still under /calculators/ — should have moved to /pathways/: ${stranded.map(r => r.path).join(', ')}`);
}

const missingSitemapRoutes = STATIC_ROUTE_DEFINITIONS
  .filter((route) => route.includeInSitemap)
  .map((route) => route.path)
  .filter((route) => !STATIC_SITEMAP_ROUTES.includes(route));
if (missingSitemapRoutes.length > 0) {
  throw new Error(`Sitemap routes missing from export: ${missingSitemapRoutes.join(', ')}`);
}

if (!appSource.includes('<Route path="/trials/:topicId" element={<PublishGate><TrialPageNew /></PublishGate>} />')) {
  throw new Error('Dynamic trial route is missing from App.tsx');
}

// Filter to static (non-dynamic) per-trial routes — routes with ':' are dynamic sub-namespaces
// and are intentionally allowed (e.g. /trials/q/:questionId for the questions detail surface).
const manualTrialRoutes = [...appSource.matchAll(/<Route path="(\/trials\/[^":*][^"]*)"/g)]
  .map((match) => match[1])
  .filter((route) => route !== '/trials' && !route.includes(':'));

if (manualTrialRoutes.length > 0) {
  throw new Error(`Manual per-trial routes remain in App.tsx: ${manualTrialRoutes.join(', ')}`);
}

console.log(`Validated ${STATIC_ROUTE_DEFINITIONS.length} static routes with manifest-driven routing.`);
