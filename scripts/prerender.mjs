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
 *   1. Spins up `vite preview` against the existing `dist/` directory.
 *   2. Opens each route from STATIC_ROUTE_DEFINITIONS in headless Chrome.
 *   3. Waits for React to hydrate + Seo.tsx to update document.title.
 *   4. Captures the post-hydration HTML and writes it to dist/<route>/index.html.
 *
 * Net result: when Vercel serves the per-route HTML directly (no JS execution
 * needed by Googlebot to see the right title/description/JSON-LD), every page
 * has the correct per-route SEO content in the initial response.
 *
 * Usage:
 *   node scripts/prerender.mjs              # all Phase 1 routes
 *   node scripts/prerender.mjs --route=/    # single route (debug)
 *   PRERENDER_DEBUG=1 node scripts/prerender.mjs  # verbose logging
 *
 * Wire into Vercel deploys (after V upgrades puppeteer):
 *   package.json scripts:
 *     "postbuild": "node scripts/prerender.mjs"
 *
 * Architect plan: docs/reviews/arch-PR-spa-prerendering-2026-05-21.md
 * Path B selection: V approval 2026-05-22 (post-react-snap-failure morning).
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

// ── Phase 1 route list ─────────────────────────────────────────────────────
// Architect-approved 11 high-SEO-priority routes. Phase 2 (V approval) expands
// to all 43 static routes from STATIC_ROUTE_DEFINITIONS.
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
const HYDRATION_DELAY_MS = 2000; // wait for Seo.tsx useEffect to update title
const PER_ROUTE_TIMEOUT_MS = 30_000;
const DEBUG = process.env.PRERENDER_DEBUG === '1';

const log = (...args) => console.log('[prerender]', ...args);
const debug = (...args) => DEBUG && console.log('[prerender:debug]', ...args);

// ── Chrome path resolution ─────────────────────────────────────────────────
// Strategy (in order):
//   1. PUPPETEER_EXECUTABLE_PATH env var (CI / Vercel can override)
//   2. macOS system Chrome (/Applications/Google Chrome.app/...)
//   3. Linux Chromium / Chrome (Vercel build / dev containers)
//   4. Fall back to puppeteer's bundled Chromium (whatever version is installed)
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

// ── Launch vite preview as a subprocess ────────────────────────────────────
async function startPreviewServer() {
  log(`Starting vite preview on port ${PORT}...`);
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait until the server prints its ready line.
  await new Promise((res, rej) => {
    const timeout = setTimeout(() => rej(new Error('vite preview did not start in 10s')), 10_000);
    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      debug('preview stdout:', text.trim());
      if (text.includes('Local:') || text.includes(`localhost:${PORT}`)) {
        clearTimeout(timeout);
        res();
      }
    });
    proc.stderr.on('data', (chunk) => debug('preview stderr:', chunk.toString().trim()));
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
  log(`  snapshotting ${route}`);
  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(PER_ROUTE_TIMEOUT_MS);
    await page.goto(url, { waitUntil: 'networkidle0' });
    // Give React a moment to mount and Seo.tsx's useEffect to update document.title.
    await new Promise((r) => setTimeout(r, HYDRATION_DELAY_MS));

    // Capture the post-hydration HTML.
    const html = await page.content();

    // Sanity check: did the title actually update beyond the index.html shell?
    const title = await page.title();
    debug(`  ${route} → title: "${title}"`);

    return { html, title };
  } finally {
    await page.close();
  }
}

// ── Write per-route HTML to dist/<route>/index.html ────────────────────────
async function writeSnapshot(route, html) {
  // Map "/" → dist/index.html (overwrites the SPA shell with the hydrated home)
  // Map "/calculators/nihss" → dist/calculators/nihss/index.html
  const filePath =
    route === '/'
      ? join(DIST, 'index.html')
      : join(DIST, ...route.split('/').filter(Boolean), 'index.html');
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, 'utf8');
  debug(`  wrote ${filePath} (${html.length.toLocaleString()} bytes)`);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(DIST)) {
    console.error('[prerender] ERROR: dist/ does not exist. Run `vite build` first.');
    process.exit(1);
  }

  // CLI single-route override for debugging.
  const singleRouteArg = process.argv.find((a) => a.startsWith('--route='));
  const routes = singleRouteArg
    ? [singleRouteArg.split('=')[1]]
    : PHASE_1_ROUTES;

  const chromePath = resolveChromePath();
  if (chromePath) {
    log(`Using Chrome at: ${chromePath}`);
  } else {
    log('No system Chrome found — falling back to puppeteer bundled Chromium.');
  }

  // Dynamic import so this script can use whatever puppeteer version is
  // installed (the user upgrades puppeteer separately; this script doesn't
  // pin a version).
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch (e) {
    console.error('[prerender] ERROR: `puppeteer` is not installed.');
    console.error('[prerender] Run: npm install -D puppeteer');
    console.error('[prerender] Then re-run: node scripts/prerender.mjs');
    process.exit(1);
  }

  const previewProc = await startPreviewServer();

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath ?? undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    log(`Pre-rendering ${routes.length} route(s)...`);
    let ok = 0;
    let fail = 0;
    const failures = [];

    for (const route of routes) {
      try {
        const { html, title } = await snapshotRoute(browser, route);
        // Sanity check: empty / shell-only response is a failure.
        if (!html || html.length < 1000) {
          throw new Error(`HTML too short (${html?.length} bytes)`);
        }
        // Verify the title isn't a stale shell — log warning but don't fail
        // since some routes legitimately use the shell title.
        if (route !== '/' && title.includes('Resident & Attending Guide') && !title.includes('|')) {
          log(`  warning: ${route} still shows shell title "${title}"`);
        }
        await writeSnapshot(route, html);
        ok++;
      } catch (e) {
        log(`  FAILED ${route}: ${e.message}`);
        failures.push({ route, error: e.message });
        fail++;
      }
    }

    log(`Done: ${ok} succeeded, ${fail} failed.`);
    if (failures.length > 0) {
      console.error('[prerender] Failures:');
      for (const f of failures) console.error(`  ${f.route}: ${f.error}`);
      process.exit(1);
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
