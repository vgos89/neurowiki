// NeuroWiki SEO — the single configuration source for the daily pipeline.
//
// Why this file exists: the Tidbit original hardcoded its domain inside nine
// scripts, and porting meant hunting them down. Every site-specific value
// lives HERE and only here; the analysis scripts import { SITE } and never
// mention a hostname, property id, URL list, or output root themselves.
// Site three is this file with different values, not another port.
//
// Not secrets: both IDs below already appear in committed snapshots under
// docs/seo-data/. Env vars (loaded from .env.local by daily-run.sh when that
// file exists) override the defaults; the only value with no default is the
// optional PSI_API_KEY.

export const SITE = {
  name: 'NeuroWiki',

  // Hosts, measured 2026-09-07: the site SERVES on www (the apex 307-redirects
  // to www), the sitemap lists www URLs, but the verified Search Console
  // property is the APEX URL-prefix property and Google's May snapshot indexed
  // apex URLs. A 307 is a temporary redirect, so Google's canonical picture is
  // genuinely split; the durable fix is a domain property
  // (sc-domain:neurowiki.ai), which is V's 5-minute GSC action and a standing
  // briefing item until done. Every join in this pipeline is on PATH via
  // normalizePath(), so the split cannot corrupt the data.
  baseUrl: 'https://www.neurowiki.ai', // the serving host: crawls, schema, pagespeed, anomaly
  gscSiteUrl: process.env.GSC_SITE_URL || 'https://neurowiki.ai/',
  ga4PropertyId: process.env.GA4_PROPERTY_ID || '367909578',
  // Must match the feedpath registered in GSC (apex, submitted 2026-05-22).
  sitemapUrl: 'https://neurowiki.ai/sitemap.xml',

  // Anomaly thresholds.
  sitemapUrlFloor: 160, // alarm when <loc> count drops below this (182 on 2026-09-07)
  homepageMarker: 'NeuroWiki', // "wrong content is being served" check

  // Output roots (repo-relative).
  reportRoot: 'docs/seo', // briefings, analysis reports, runs/, dashboard
  rawDataRoot: 'docs/seo-data', // raw GSC/GA4 snapshots (pre-existing convention)

  psiApiKey: process.env.PSI_API_KEY || null,

  // "Clinician actions": the GA4 events that show a page did bedside work,
  // summed for the snapshot and the dashboard tile. Event names must match
  // src/utils/analytics.ts.
  conversionEvents: [
    'calculator_used',
    'calculator_copied',
    'calculator_shared',
    'pathway_step_advanced',
    'deep_learning_opened',
    'external_citation_clicked',
    'feedback_submitted',
  ],

  // Queries matching this are branded and skipped by opportunity mining
  // (branded queries behave differently and would drown the real signals).
  brandedQueryPattern: /neurowiki|neuro wiki/i,

  // Representative URLs for the weekly structured-data check. One of each
  // page shape; adding more slows the Monday tier for little new signal.
  schemaCheckUrls: [
    '/',
    '/calculators',
    '/calculators/nihss',
    '/calculators/ich-score',
    '/pathways/stroke-code',
    '/guide/iv-tpa',
    '/trials',
    '/trials/sammpris-trial',
    '/trials/q/tpa-timing',
    '/privacy',
  ],

  // Pages worth a weekly PageSpeed run. Keep this list short: every page
  // added is ~25 more seconds per week plus API quota.
  pagespeedUrls: ['/', '/calculators/nihss', '/pathways/stroke-code', '/trials'],

  // V's morning dashboard artifact. Set once at first publish (2026-09-07)
  // and never changed; the procedure file reads it from here. Publishing
  // to any OTHER artifact URL (Tidbit's included) is banned — see
  // .claude/rules/seo-daily-governance.md.
  dashboardArtifactUrl: 'https://claude.ai/code/artifact/2a16ebc6-5a46-4dd6-9c5a-d1b284c24f82',

  // Seed terms for the monthly keyword-discovery run (Google Suggest).
  // Clinician-intent terms only; NeuroWiki does not chase lay-public queries.
  seedKeywords: [
    'nihss calculator',
    'nihss score interpretation',
    'aspects score stroke',
    'ich score calculator',
    'glasgow coma scale calculator',
    'abcd2 score tia',
    'has-bled score',
    'chads vasc score',
    'rope score pfo',
    'modified rankin scale',
    'tpa eligibility criteria',
    'tenecteplase stroke dose',
    'thrombectomy criteria',
    'evt large core stroke',
    'basilar occlusion thrombectomy',
    'stroke code algorithm',
    'late window thrombolysis',
    'status epilepticus treatment algorithm',
    'ich management guidelines',
    'dapt after stroke',
    'stroke trials summary',
    'dawn trial stroke',
    'defuse 3 trial',
    'neurology residency tools',
    'migraine treatment algorithm emergency',
    'neurowiki',
  ],
  suggestLocale: { hl: 'en', gl: 'US' },
};

// Path → kind. The taxonomy is site-specific and lives only here; analysis
// scripts may group and sort by the returned string but must never branch on
// a specific member name (so the scripts stay portable to the next site).
export function kindOf(path) {
  if (path === '/' || path === '/calculators' || path === '/pathways' || path === '/guide' || path === '/trials') return 'hub';
  if (path.startsWith('/calculators/')) return 'calculator';
  if (path.startsWith('/pathways/')) return 'pathway';
  if (path.startsWith('/guide/')) return 'guide';
  if (path.startsWith('/trials/q/')) return 'question';
  if (path.startsWith('/trials/')) return 'trial';
  if (path === '/privacy' || path === '/terms' || path === '/accessibility') return 'legal';
  return 'other';
}

// The URL Inspection API only accepts URLs inside the property. For a
// URL-prefix property, inspect under that exact prefix; for a domain
// property (sc-domain:), any host under the domain works, so use the
// serving host.
export function inspectionUrlFor(path) {
  const p = path === '/' ? '/' : path;
  if (SITE.gscSiteUrl.startsWith('sc-domain:')) {
    return p === '/' ? `${SITE.baseUrl}/` : `${SITE.baseUrl}${p}`;
  }
  const prefix = SITE.gscSiteUrl.replace(/\/$/, '');
  return p === '/' ? `${prefix}/` : `${prefix}${p}`;
}

// https://[www.]neurowiki.ai/x → /x, '' → '/'. Same normalizer shape as
// scripts/prerender.mjs; the property is apex while the site serves www, so
// every join must go through this.
export function normalizePath(url) {
  const p = String(url)
    .replace(/^https?:\/\/(?:www\.)?neurowiki\.ai/i, '')
    .split('#')[0]
    .split('?')[0];
  return p === '' ? '/' : p;
}

// Which existing page should own a discovered query (monthly keyword
// research). Heuristic, site-specific by design.
export function suggestOwningPage(query) {
  const q = query.toLowerCase();
  if (/nihss/.test(q)) return '/calculators/nihss';
  if (/aspects/.test(q)) return '/calculators/aspects-score';
  if (/ich score/.test(q)) return '/calculators/ich-score';
  if (/glasgow|gcs/.test(q)) return '/calculators/glasgow-coma-scale';
  if (/abcd2/.test(q)) return '/calculators/abcd2-score';
  if (/has.?bled/.test(q)) return '/calculators/has-bled-score';
  if (/chads|cha2ds2/.test(q)) return '/calculators/chads-vasc';
  if (/rope|pfo/.test(q)) return '/calculators/rope-score';
  if (/rankin|mrs\b/.test(q)) return '/calculators/mrs';
  if (/tpa|alteplase|tenecteplase|thrombolysis|thrombolytic/.test(q)) return '/guide/iv-tpa';
  if (/thrombectomy|evt|large core|basilar/.test(q)) return '/pathways/evt';
  if (/stroke code/.test(q)) return '/pathways/stroke-code';
  if (/status epilepticus|seizure/.test(q)) return '/pathways/se-pathway';
  if (/migraine|headache/.test(q)) return '/pathways/migraine-pathway';
  if (/ich|hemorrhage|haemorrhage/.test(q)) return '/guide/ich-management';
  if (/trial/.test(q)) return '/trials';
  if (/calculator|score|scale/.test(q)) return '/calculators';
  return '/guide (guide hub, or a new page candidate)';
}
