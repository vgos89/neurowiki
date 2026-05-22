#!/usr/bin/env node
/**
 * prerender.mjs — Custom SPA pre-rendering for NeuroWiki.
 *
 * Why a custom script: react-snap (already in package.json) ships an old
 * Chromium that can't parse React 19's optional-chaining + nullish-coalescing
 * JS. vite-plugin-ssg requires SSR-safe components (66 window/localStorage
 * references would need guards). A small puppeteer script is the cleanest
 * answer — we control the Chrome version, the hydration wait, and the
 * output file layout.
 *
 * What it does:
 *   1. Reads route list from public/sitemap.xml (single source of truth).
 *   2. Spins up `vite preview` against the existing `dist/` directory.
 *   3. Opens each route in headless Chrome with N-way concurrency.
 *   4. Waits for React to hydrate + Seo.tsx to update document.title.
 *   5. Captures the post-hydration HTML and writes it to dist/<route>/index.html.
 *
 * Net result: when Vercel serves the per-route HTML directly (no JS execution
 * needed by Googlebot to see the right title/description/JSON-LD), every page
 * has the correct per-route SEO content in the initial response.
 *
 * Usage:
 *   node scripts/prerender.mjs                  # all sitemap routes (Phase 2+3)
 *   node scripts/prerender.mjs --mode=static    # static routes only (Phase 2)
 *   node scripts/prerender.mjs --mode=phase1    # 11-route legacy starter set
 *   node scripts/prerender.mjs --route=/foo     # single route (debug)
 *   node scripts/prerender.mjs --concurrency=2  # tune parallelism (default 4)
 *   PRERENDER_DEBUG=1 node scripts/prerender.mjs  # verbose logging
 *
 * Wire into Vercel deploys (after V upgrades puppeteer):
 *   package.json scripts:
 *     "postbuild": "node scripts/prerender.mjs"
 *
 * Architect plan: docs/reviews/arch-PR-spa-prerendering-2026-05-21.md
 * Phase 2 + 3 expansion: V approval 2026-05-22 (morning).
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { platform } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITEMAP_PATH = join(ROOT, 'public/sitemap.xml');

const PHASE_1_ROUTES = [
  '/',
  '/calculators',
  '/pathways',
  '/guide',
  '/trials',
  '/calculators/nihss',
  '/calculators/aspects-score',
  '/calculators/ich-score',
  '/calculators/glasgow-coma-scale',
  '/calculators/abcd2-score',
  '/calculators/has-bled-score',
];

const PORT = 4173; // vite preview default
const HYDRATION_DELAY_MS = 1500; // wait for Seo.tsx useEffect to update title
const PER_ROUTE_TIMEOUT_MS = 30_000;
const DEFAULT_CONCURRENCY = 4;
const DEBUG = process.env.PRERENDER_DEBUG === '1';

const log = (...args) => console.log('[prerender]', ...args);
const debug = (...args) => DEBUG && console.log('[prerender:debug]', ...args);

// ── CLI parsing ────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name) => {
    const found = args.find((a) => a.startsWith(`--${name}=`));
    return found ? found.split('=').slice(1).join('=') : null;
  };
  return {
    mode: get('mode') ?? 'all', // 'all' | 'static' | 'phase1'
    route: get('route'),
    concurrency: parseInt(get('concurrency') ?? String(DEFAULT_CONCURRENCY), 10),
  };
}

// ── Route source: parse public/sitemap.xml ─────────────────────────────────
async function loadSitemapRoutes() {
  if (!existsSync(SITEMAP_PATH)) {
    throw new Error(`sitemap.xml not found at ${SITEMAP_PATH}`);
  }
  const xml = await readFile(SITEMAP_PATH, 'utf8');
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
  // Convert https://neurowiki.ai[/path] → /path (root → /)
  const paths = locs
    .map((u) => u.replace(/^https?:\/\/neurowiki\.ai/i, ''))
    .map((p) => (p === '' ? '/' : p));
  // Dedupe preserving order.
  return [...new Set(paths)];
}

function filterToStatic(routes) {
  // "Static" = not under /trials/* (trial detail) or /trials/q/* (question detail).
  // The /trials hub itself stays. Same for /calculators (hub) vs /calculators/* (per-calc).
  // Per-calculator pages are static (a fixed set), so they stay.
  // Per-pathway, per-guide pages are also static, so they stay.
  return routes.filter((r) => {
    if (r === '/trials') return true; // hub
    if (r.startsWith('/trials/q/')) return false; // dynamic question
    if (r.startsWith('/trials/')) return false; // dynamic trial detail
    return true;
  });
}

// ── Chrome path resolution ─────────────────────────────────────────────────
function resolveChromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates =
    platform() === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ]
      : [
          '/usr/bin/google-chrome-stable',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
        ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

// ── Vite preview subprocess ────────────────────────────────────────────────
async function startPreviewServer() {
  log(`Starting vite preview on port ${PORT}...`);
  const proc = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
  );

  await new Promise((res, rej) => {
    const timeout = setTimeout(
      () => rej(new Error('vite preview did not start in 10s')),
      10_000
    );
    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      debug('preview stdout:', text.trim());
      if (text.includes('Local:') || text.includes(`localhost:${PORT}`)) {
        clearTimeout(timeout);
        res();
      }
    });
    proc.stderr.on('data', (chunk) =>
      debug('preview stderr:', chunk.toString().trim())
    );
    proc.on('exit', (code) => {
      if (code !== 0) rej(new Error(`vite preview exited with code ${code}`));
    });
  });

  log(`vite preview ready at http://localhost:${PORT}`);
  return proc;
}

// ── Snapshot a single route ────────────────────────────────────────────────
async function snapshotRoute(browser, route) {
  const url = `http://localhost:${PORT}${route}`;
  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(PER_ROUTE_TIMEOUT_MS);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, HYDRATION_DELAY_MS));
    const html = await page.content();
    const title = await page.title();
    return { html, title };
  } finally {
    await page.close();
  }
}

// ── Write per-route HTML ───────────────────────────────────────────────────
async function writeSnapshot(route, html) {
  const filePath =
    route === '/'
      ? join(DIST, 'index.html')
      : join(DIST, ...route.split('/').filter(Boolean), 'index.html');
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, 'utf8');
  debug(`  wrote ${filePath} (${html.length.toLocaleString()} bytes)`);
}

// ── Concurrency-limited iteration ──────────────────────────────────────────
async function runWithConcurrency(items, concurrency, fn) {
  const queue = items.slice();
  const results = [];
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item === undefined) return;
        const r = await fn(item);
        results.push(r);
      }
    })
  );
  return results;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(DIST)) {
    console.error('[prerender] ERROR: dist/ does not exist. Run `vite build` first.');
    process.exit(1);
  }

  const { mode, route, concurrency } = parseArgs();

  // Resolve route list.
  let routes;
  if (route) {
    routes = [route];
    log(`Single-route mode: ${route}`);
  } else if (mode === 'phase1') {
    routes = PHASE_1_ROUTES;
    log(`Phase 1 mode: ${routes.length} hardcoded high-priority routes`);
  } else {
    const sitemapRoutes = await loadSitemapRoutes();
    routes = mode === 'static' ? filterToStatic(sitemapRoutes) : sitemapRoutes;
    log(
      `Mode "${mode}": ${routes.length} routes from sitemap` +
        (mode === 'static' ? ' (filtered to static only)' : '')
    );
  }

  // ── Browser launch strategy ──────────────────────────────────────────────
  // Two modes:
  //   Vercel build  → use @sparticuz/chromium + puppeteer-core. Vercel's
  //                   stripped Linux build container is missing the system
  //                   libs (libnss3, libatk1.0-0, libdrm2, etc.) that puppeteer's
  //                   bundled Chromium needs to start. @sparticuz/chromium
  //                   ships a self-contained Chromium specifically for AWS
  //                   Lambda + Vercel build phases.
  //   Local / other → use puppeteer with system Chrome via executablePath.
  //                   macOS dev (system Chrome at /Applications) works
  //                   end-to-end via puppeteer 25's DevTools Protocol.
  //
  // Detection: process.env.VERCEL is "1" during Vercel builds.
  const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;

  let puppeteer;
  let launchExecutablePath;
  let launchArgs;
  let launchHeadless = true;

  if (isVercel) {
    log('Vercel environment detected — using @sparticuz/chromium + puppeteer-core.');
    let chromium;
    try {
      chromium = (await import('@sparticuz/chromium')).default;
    } catch (_e) {
      console.error('[prerender] ERROR: `@sparticuz/chromium` is not installed (required on Vercel).');
      console.error('[prerender] Run: npm install -D @sparticuz/chromium puppeteer-core');
      process.exit(1);
    }
    try {
      puppeteer = (await import('puppeteer-core')).default;
    } catch (_e) {
      console.error('[prerender] ERROR: `puppeteer-core` is not installed (required on Vercel).');
      console.error('[prerender] Run: npm install -D puppeteer-core');
      process.exit(1);
    }
    launchExecutablePath = await chromium.executablePath();
    launchArgs = chromium.args;
    launchHeadless = chromium.headless;
  } else {
    const chromePath = resolveChromePath();
    if (chromePath) {
      log(`Using Chrome at: ${chromePath}`);
    } else {
      log('No system Chrome found — falling back to puppeteer bundled Chromium.');
    }
    try {
      puppeteer = (await import('puppeteer')).default;
    } catch (_e) {
      console.error('[prerender] ERROR: `puppeteer` is not installed.');
      console.error('[prerender] Run: npm install -D puppeteer');
      console.error('[prerender] Then re-run: node scripts/prerender.mjs');
      process.exit(1);
    }
    launchExecutablePath = chromePath ?? undefined;
    launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ];
  }

  const previewProc = await startPreviewServer();

  let browser;
  const t0 = Date.now();
  try {
    browser = await puppeteer.launch({
      headless: launchHeadless,
      executablePath: launchExecutablePath,
      args: launchArgs,
    });

    log(`Pre-rendering ${routes.length} route(s) with concurrency ${concurrency}...`);
    let ok = 0;
    let fail = 0;
    const failures = [];

    await runWithConcurrency(routes, concurrency, async (r) => {
      try {
        const { html, title } = await snapshotRoute(browser, r);
        if (!html || html.length < 1000) {
          throw new Error(`HTML too short (${html?.length} bytes)`);
        }
        await writeSnapshot(r, html);
        ok++;
        if (DEBUG || routes.length <= 20) {
          log(`  ✓ ${r} → ${title}`);
        }
      } catch (e) {
        log(`  ✗ ${r}: ${e.message}`);
        failures.push({ route: r, error: e.message });
        fail++;
      }
    });

    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
    log(`Done: ${ok} succeeded, ${fail} failed in ${elapsedSec}s.`);

    // Tolerance: allow up to 5% failure rate before treating as a build error.
    // Individual page failures (e.g., a trial page with a temporary fetch
    // issue) shouldn't break the entire deploy.
    const failureRate = fail / routes.length;
    const TOLERATED_FAILURE_RATE = 0.05;
    if (failureRate > TOLERATED_FAILURE_RATE) {
      console.error(
        `[prerender] Failure rate ${(failureRate * 100).toFixed(1)}% exceeds ` +
          `tolerance ${(TOLERATED_FAILURE_RATE * 100).toFixed(1)}%. Failing build.`
      );
      console.error('[prerender] Failures:');
      for (const f of failures) console.error(`  ${f.route}: ${f.error}`);
      process.exit(1);
    } else if (fail > 0) {
      console.warn(
        `[prerender] Tolerated ${fail} failure(s) (${(failureRate * 100).toFixed(1)}% < ${(TOLERATED_FAILURE_RATE * 100).toFixed(1)}%).`
      );
      for (const f of failures) console.warn(`  ${f.route}: ${f.error}`);
    }
  } finally {
    if (browser) await browser.close();
    previewProc.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error('[prerender] FATAL:', e);
  process.exit(1);
});
