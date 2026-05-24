#!/usr/bin/env node
/**
 * Gate 6 — Post-push live route verify.
 *
 * Runs after `git push` (via .husky/pre-push) once Vercel has had time to deploy.
 * Fetches a small representative set of production routes and checks each one
 * returned 200 and a sensible <title>. Designed to catch the "deployed but
 * broken" class of regression that tsc/build/claims/routes cannot see —
 * exactly the failure mode that triggered the 2026-05-14 articles-don't-open
 * incident.
 *
 * Skippable: set SKIP_LIVE_VERIFY=1 or pass --no-verify to git push.
 *
 * Tunables:
 *   LIVE_VERIFY_BASE      — base URL (default https://neurowiki.ai)
 *   LIVE_VERIFY_WAIT_SECS — seconds to wait before first fetch (default 90)
 *   LIVE_VERIFY_TIMEOUT   — per-route fetch timeout ms (default 15000)
 */

if (process.env.SKIP_LIVE_VERIFY === '1') {
  console.log('[live-verify] SKIP_LIVE_VERIFY=1 — skipping Gate 6');
  process.exit(0);
}

const BASE = process.env.LIVE_VERIFY_BASE || 'https://neurowiki.ai';
const WAIT_SECS = parseInt(process.env.LIVE_VERIFY_WAIT_SECS || '90', 10);
const TIMEOUT = parseInt(process.env.LIVE_VERIFY_TIMEOUT || '15000', 10);

// Representative routes. Cover: homepage shell, a calculator, a trial detail,
// a question page. Each one represents a render path that has broken in the past.
const ROUTES = [
  { path: '/', titleIncludes: 'Neuro' },
  { path: '/calculators/glasgow-coma-scale', titleIncludes: 'GCS' },
  { path: '/trials/dawn-trial', titleIncludes: 'DAWN' },
  { path: '/trials/q/tpa-timing', titleIncludes: 'Thrombolysis' },
];

// The home shell title. If a non-home route returns this exact string, the
// prerender step did not run for that route and it fell back to the shell.
const SHELL_TITLE_SUBSTRINGS = [
  'Neuro Wiki: Neurology Resident',
];

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(id);
  }
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : '';
}

async function main() {
  console.log(`[live-verify] Waiting ${WAIT_SECS}s for Vercel deploy…`);
  await sleep(WAIT_SECS * 1000);

  const results = [];
  for (const route of ROUTES) {
    const url = `${BASE}${route.path}`;
    try {
      const { ok, status, text } = await fetchWithTimeout(url);
      const title = extractTitle(text);
      let result;
      if (!ok) {
        result = { route: route.path, status: 'FAIL', detail: `HTTP ${status}` };
      } else if (
        route.path !== '/' &&
        SHELL_TITLE_SUBSTRINGS.some((s) => title.includes(s)) &&
        !title.toLowerCase().includes(route.titleIncludes.toLowerCase())
      ) {
        result = {
          route: route.path,
          status: 'FAIL',
          detail: `home-shell title leaked: "${title}" (expected to include "${route.titleIncludes}")`,
        };
      } else if (!title.toLowerCase().includes(route.titleIncludes.toLowerCase())) {
        result = {
          route: route.path,
          status: 'FAIL',
          detail: `title "${title}" missing expected substring "${route.titleIncludes}"`,
        };
      } else {
        result = { route: route.path, status: 'PASS', detail: title };
      }
      results.push(result);
    } catch (err) {
      results.push({ route: route.path, status: 'FAIL', detail: err.message });
    }
  }

  let failed = 0;
  for (const r of results) {
    const tag = r.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`[live-verify] ${tag}  ${r.route}  ${r.detail}`);
    if (r.status === 'FAIL') failed++;
  }

  if (failed > 0) {
    console.error(`[live-verify] ${failed}/${results.length} routes failed.`);
    console.error('[live-verify] If the deploy is genuinely still in progress, re-push or set SKIP_LIVE_VERIFY=1.');
    console.error('[live-verify] Otherwise: invoke /incident immediately — the live site is broken.');
    process.exit(1);
  }
  console.log(`[live-verify] All ${results.length} routes PASS — Gate 6 green.`);
}

main().catch((e) => {
  console.error('[live-verify] unexpected error:', e);
  process.exit(1);
});
