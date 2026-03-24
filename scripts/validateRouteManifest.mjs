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

const requiredStaticPaths = ['/', '/calculators', '/guide', '/trials', '/calculators/stroke-code', '/guide/aha-2026-guideline'];
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

const manualTrialRoutes = [...appSource.matchAll(/<Route path="(\/trials\/[^":*][^"]*)"/g)]
  .map((match) => match[1])
  .filter((route) => route !== '/trials');

if (manualTrialRoutes.length > 0) {
  throw new Error(`Manual per-trial routes remain in App.tsx: ${manualTrialRoutes.join(', ')}`);
}

console.log(`Validated ${STATIC_ROUTE_DEFINITIONS.length} static routes with manifest-driven routing.`);
