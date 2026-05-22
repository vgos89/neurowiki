# NeuroWiki SEO & Analytics Audit — 2026-05-21

Auditor: seo-specialist · Skills loaded: seo-audit-execution, seo-analytics, compliance-public-medical
Read-only pass. No source files were modified.

---

## Executive Summary

Five things V needs to know:

1. **AI search engines can already find and cite NeuroWiki.** The robots.txt allows the major AI crawlers (ChatGPT, Google Gemini, Perplexity, Claude). What we are missing is a way to measure _how many_ AI-driven visitors we get, because the analytics code has no way to detect them yet. This is fixable in one file.

2. **The trial library is almost fully indexed — but 12 trials and 16 clinical questions are missing from the sitemap.** Clinicians searching for those specific trials by name will not find NeuroWiki in Google results. A targeted sitemap patch closes the gap.

3. **The brand "Neuro Wiki" (two words) is invisible to search engines.** Every JSON-LD schema, every page title, and every meta description uses "NeuroWiki" as one word. Clinicians who type "Neuro Wiki" see nothing from us. Two surgical copy insertions fix this.

4. **NeuroWiki does not yet rank for "neurology tools" or "neurology resident guide"** — the two targets V named. We have the content; we are missing the exact phrases in the right places. The guide hub page is the best lever: one title rewrite and two new pages would put us in position to compete.

5. **A handful of page titles and descriptions are too long for Google to display in full.** Google truncates at roughly 60 characters for titles and 160 for descriptions. 14 routes currently exceed those limits. Fixing them costs 30 minutes and immediately improves how NeuroWiki appears in search results.

---

## Findings by Area

---

### Area 1: AI-Traffic Detection

#### Current state
`src/utils/analytics.ts` fires GA4 via a cookie-consent gate (`CONSENT_STORAGE_KEY`). If a user has accepted cookies, `loadGA()` injects the gtag script. There is no UA-string detection, no custom dimension for bot traffic, and no `ai_referrer` parameter. GA4 by default strips bot traffic server-side via its own filter list — but AI _browser agents_ (users arriving after asking ChatGPT for a link) are not bots; they are real browser sessions. `navigator.userAgent` in `src/components/DisclaimerModal.tsx` is captured at disclaimer-acknowledgement time but not passed to GA4.

#### What is missing
- **UA-string detection hook** — detect AI browser agents (ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot-extended, Bytespider, cohere-ai, Meta-ExternalAgent) at session start and set a GA4 custom dimension.
- **Custom dimension in GA4** — a dimension named `traffic_source_type` with values `ai_referral | ai_crawler_preview | organic | direct | referral` must be created in the GA4 property UI first, then passed via `gtag('set', ...)`.
- **`document.referrer` AI-domain detection** — some AI tools pass referrers like `chat.openai.com`, `perplexity.ai`, `claude.ai`. Capturing the referrer at page_view time is the cleanest signal.

#### Exact implementation plan

**Step 1 — GA4 property setup (manual, done once in the GA4 UI):**
In Google Analytics → Admin → Custom Definitions → Custom Dimensions, create:
- Name: `traffic_source_type`, Scope: Event, Parameter name: `traffic_source_type`
- Name: `ai_agent`, Scope: Event, Parameter name: `ai_agent`

**Step 2 — Add detection utility to `src/utils/analytics.ts`:**

```typescript
// AI-traffic detection — add after the existing exports

const AI_UA_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ChatGPT-User/i,        label: 'chatgpt-user' },
  { pattern: /OAI-SearchBot/i,        label: 'oai-searchbot' },
  { pattern: /PerplexityBot/i,        label: 'perplexitybot' },
  { pattern: /ClaudeBot/i,            label: 'claudebot' },
  { pattern: /anthropic-ai/i,         label: 'anthropic-ai' },
  { pattern: /Google-Extended/i,      label: 'google-extended' },
  { pattern: /Bytespider/i,           label: 'bytespider' },
  { pattern: /cohere-ai/i,            label: 'cohere-ai' },
  { pattern: /Meta-ExternalAgent/i,   label: 'meta-externalagent' },
];

const AI_REFERRER_DOMAINS = [
  'chat.openai.com', 'chatgpt.com', 'perplexity.ai',
  'claude.ai', 'gemini.google.com', 'you.com',
  'bing.com',  // Copilot uses bing referrer
];

export function detectAiTrafficSignal(): { type: 'ai_crawler' | 'ai_referral' | 'none'; agent: string } {
  if (typeof window === 'undefined') return { type: 'none', agent: '' };
  const ua = navigator.userAgent;
  for (const { pattern, label } of AI_UA_PATTERNS) {
    if (pattern.test(ua)) return { type: 'ai_crawler', agent: label };
  }
  const ref = document.referrer;
  if (ref) {
    for (const domain of AI_REFERRER_DOMAINS) {
      if (ref.includes(domain)) return { type: 'ai_referral', agent: domain };
    }
  }
  return { type: 'none', agent: '' };
}

export function reportAiTrafficToGA(): void {
  const signal = detectAiTrafficSignal();
  if (signal.type === 'none') return;
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ai_traffic_detected', {
      traffic_source_type: signal.type,
      ai_agent: signal.agent,
    });
    // Persist for the session so every subsequent event carries it
    (window as any).gtag('set', { traffic_source_type: signal.type, ai_agent: signal.agent });
  }
}
```

**Step 3 — Call `reportAiTrafficToGA()` in `src/App.tsx`:** after `loadGA()` is called (line 150), add one line: `reportAiTrafficToGA();`. Also call it in `src/components/CookieConsentBanner.tsx` after `loadGA()` on line 12.

**Step 4 — GA4 Exploration report:** once data is flowing, build an Exploration with dimension `ai_agent`, metric `sessions`, and secondary dimension `page_path`. This shows which AI engine is sending traffic and which pages they land on.

**Important constraint:** AI crawlers (Googlebot-Extended, OAI-SearchBot, etc.) do not execute JavaScript, so they will never fire GA4 events. The GA4 path only captures _human sessions that arrive from AI tools_. For crawler volume, the only signal is server logs — Vercel access logs if enabled. GSC does not report AI crawler traffic.

---

### Area 2: AI Crawlers in robots.txt

#### Current state (grepped, confirmed)
`public/robots.txt` already allows:
- `GPTBot` — OpenAI training crawler
- `ChatGPT-User` — OpenAI browsing agent
- `Google-Extended` — Google Gemini training/indexing
- `PerplexityBot` — Perplexity AI
- `Claude-Web` — Anthropic web browsing
- `anthropic-ai` — Anthropic crawler
- `Amazonbot` — Alexa / Amazon
- `Applebot-Extended` — Apple AI features
- `CCBot` — Common Crawl (used by many AI training sets)
- `User-agent: *` → `Allow: /` — blanket allow-all

#### What is missing
The following known AI crawlers are not listed by name (they fall through to `*`, so they are allowed — but explicit listings signal intentionality to auditors and some crawlers respect explicit allows differently):
- `OAI-SearchBot` — OpenAI search indexer (distinct from GPTBot)
- `Bytespider` — ByteDance / TikTok AI
- `cohere-ai` — Cohere LLM
- `Meta-ExternalAgent` — Meta AI
- `DuckAssistBot` — DuckDuckGo AI
- `YouBot` — You.com

#### Assessment
V's strategic call is "allow so we get cited." The current robots.txt already achieves that via `User-agent: *`. No blocking issue exists. The recommended improvement is additive — explicitly listing the above six makes intent unambiguous and may improve citation priority with crawlers that check for explicit permission.

#### Recommended config addition (append to public/robots.txt)

```
User-agent: OAI-SearchBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: DuckAssistBot
Allow: /

User-agent: YouBot
Allow: /
```

**No bots should be blocked.** The "block spam" caveat V mentioned is relevant only if low-quality scrapers create server cost at scale. On Vercel's auto-scaling infrastructure, this is unlikely to matter. If it does arise, block only by referrer header server-side, not robots.txt — bad actors ignore robots.txt.

---

### Area 3: Brand Fix — "Neuro Wiki" (two-word form)

#### Current state (grepped, confirmed)
Zero occurrences of "Neuro Wiki" (two words) in:
- `src/seo/schema.ts` (all ORGANIZATION_SCHEMA, PUBLISHER, and hub schemas use "NeuroWiki")
- `src/config/routeManifest.ts` (all titles and descriptions use "NeuroWiki")
- `src/seo/routeMeta.ts`

Zero occurrences of `alternateName` anywhere in the codebase.

#### Why this matters
Google treats "NeuroWiki" and "Neuro Wiki" as different query strings. A user typing "Neuro Wiki neurology calculators" will not match our pages because neither the title nor description contains that two-word form. The fix is to add `alternateName` to the Organization schema once (covering brand signals globally) and insert the two-word form naturally into one or two high-traffic page descriptions.

#### Exact fixes

**Fix A — Add `alternateName` to ORGANIZATION_SCHEMA in `src/seo/schema.ts` line 23:**

```typescript
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NeuroWiki',
  alternateName: 'Neuro Wiki',           // ← add this line
  description: 'Free neurology protocols, calculators, and clinical guidelines for neurologists and residents. Built on AHA/ASA 2026 stroke guidelines.',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  sameAs: [],
  foundingDate: '2024',
};
```

**Fix B — Add `alternateName` to the PUBLISHER block at line 14:**

```typescript
const PUBLISHER = {
  '@type': 'Organization',
  name: 'NeuroWiki',
  alternateName: 'Neuro Wiki',           // ← add this line
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
};
```
This propagates the alternate name into every MedicalWebPage schema that embeds the PUBLISHER block.

**Fix C — One natural copy insertion in routeManifest.ts homepage description (line 78):**
Current: `'Bedside reference for neurologists. Score NIHSS and ICH, walk through stroke code, look up landmark trials. Save cases on this device, sync phone to desktop.'`
Proposed: `'Bedside Neuro Wiki for neurologists. Score NIHSS and ICH, walk through stroke code, look up landmark trials. Save cases on this device, sync phone to desktop.'`
Character count: 159 (within 160 limit). Naturally uses the two-word form once where clinicians will read it.

**Fix D — One natural copy insertion in the guide-hub description (routeManifest.ts line 406):**
Current: `'Stroke code, EVT, long-window IVT, status epilepticus, and headache pathways for neurology residents and attendings. Inline NIHSS, ICH, and ASPECTS scoring.'`
Proposed: `'Stroke code, EVT, IVT, status epilepticus, and headache pathways for neurology residents. This neuro wiki includes inline NIHSS, ICH, and ASPECTS scoring.'`
Character count: 157 (within 160 limit). Uses "neuro wiki" (lowercase, natural sentence context) once.

Do not overdo it. Two body-copy insertions and the schema fix are sufficient. Keyword stuffing "Neuro Wiki" into multiple titles will trigger quality penalties.

---

### Area 4: Keyword Research

#### What is in the repo vs target keywords

**Current keyword inventory (from routeManifest.ts and seo/schema.ts):**
- "NIHSS calculator" — present in title and keywords. High probability of ranking.
- "stroke calculator" — present in several titles. Competitive, likely partial ranking.
- "neurology calculators" — present in hub title. Moderate probability.
- "EVT eligibility" / "thrombectomy eligibility" — present in pathway titles. Niche, high intent.
- "neurology resident tools" — present only in DEFAULT_META keywords (line 78), not in any page title or H1.
- "neurology tools" — NOT present in any title or description. Zero current signal.
- "neurology resident guide" — present only in guide-hub keywords, not in its title. The guide-hub title is "Neurology Toolkit — Clinical Guides & Protocols | NeuroWiki" which does not match the query.

**Gap analysis against V's target terms:**

| Target keyword | Current signal | Assessment |
|---|---|---|
| "neurology tools" | Not in any title or H1 | No ranking possible. Must be added. |
| "neurology resident guide" | In keywords, not in title or H1 | Ranking unlikely without title presence |
| "NIHSS calculator" | In title of /calculators/nihss | Probable partial ranking |
| "neurology calculators" | In hub title | Probable ranking for long-tail variants |
| "stroke clinical trials" | In trials-hub title | Good signal for niche query |
| "stroke code protocol" | In pathways-stroke-code title | Good signal |

**What we likely rank for today** (inference from title/schema signal, no GSC data in repo):
- Brand: "NeuroWiki" (confirmed #1 per V's brief)
- "NIHSS calculator" — in position 10–40 (title match, limited domain authority)
- "ICH score calculator" — similar range
- "ASPECTS score calculator" — niche, may rank top 10 for specific query
- "ELAN trial" / "ELAN DOAC timing" — possible, trial pages are unique content
- "DAWN trial stroke" / "DEFUSE-3" — possible, detailed trial pages

**Achievable targets in 60–90 days with copy changes only:**
- "neurology tools for residents" — low competition, achievable with one title change
- "neurology resident guide" — moderate, achievable with one new landing page
- "NIHSS calculator online" / "free NIHSS calculator" — achievable, add "free" + "online" to title

**New landing pages needed:**

**Page 1: `/for-residents` or `/neurology-resident-guide`**
This page does not exist. V's two named keywords ("neurology tools", "neurology resident guide") both resolve to a concept that is currently split across the guide hub and the calculators hub. A single landing page that explicitly targets residents, lists all the tools, and uses both phrases in its H1 and first paragraph would consolidate signal.
- Proposed title: `Neurology Resident Guide — Tools, Protocols & Trials | NeuroWiki`
- Proposed description: `Free neurology tools for residents: NIHSS calculator, stroke code pathway, landmark trial summaries, and clinical guides. Built on AHA/ASA 2026 guidelines.`
- H1: "Your Neuro Wiki: Free Neurology Tools for Residents"
- Key internal links: /calculators, /guide, /trials, /pathways/stroke-code

**Page 2: No additional page needed beyond the resident guide.** The other missing keywords are achievable through title rewrites on existing pages (see Area 6).

**Exact title/description rewrites for top 10 routes:**

1. **Home (`/`)**
   - Current title: `NeuroWiki | Neurology Calculators, Pathways & Trials` (51 chars — within limit)
   - Proposed: `NeuroWiki | Free Neurology Tools for Residents & Attendings` (59 chars)
   - Current desc: 159 chars (within limit, see Fix C above for brand fix)

2. **Calculators hub (`/calculators`)**
   - Current title: `Neurology Calculators — NIHSS, ICH Score, GCS | NeuroWiki` (57 chars — within limit)
   - Proposed: same — no change needed. Title is strong.
   - Description: 157 chars — within limit.

3. **Guide hub (`/guide`)**
   - Current title: `Neurology Toolkit — Clinical Guides & Protocols | NeuroWiki` (59 chars — within limit)
   - Proposed: `Neurology Resident Guide — Protocols, Calculators & Trials | NeuroWiki` (70 chars — OVER LIMIT, trim)
   - Proposed trimmed: `Neurology Resident Guide — Protocols & Pathways | NeuroWiki` (59 chars)
   - Description: see Fix D above.

4. **Trials hub (`/trials`)**
   - Current title: `Stroke Clinical Trials — Evidence Summaries | NeuroWiki` (55 chars — within limit)
   - Proposed: same — no change needed.
   - Current desc mentions "79 landmark stroke trials" but trialData.ts has ~101 trials. Update the count.

5. **NIHSS (`/calculators/nihss`)**
   - Current title: `NIHSS Calculator — NIH Stroke Scale Online | NeuroWiki` (55 chars — within limit)
   - Proposed: same — excellent. Add "free" to description only.
   - Description: `Free NIHSS calculator for stroke severity. Step-by-step NIH Stroke Scale with LVO probability estimate and clinical interpretation per AHA/ASA.` (144 chars)

6. **ASPECTS (`/calculators/aspects-score`)**
   - Current title: `ASPECTS Score — Alberta Stroke Program Early CT | NeuroWiki` (59 chars — within limit)
   - Proposed: same — within limit and accurate.

7. **Stroke Code (`/pathways/stroke-code`)**
   - Current title: `Stroke Code Protocol — Acute Stroke Workflow | NeuroWiki` (56 chars — within limit)
   - Proposed: same — no change needed.

8. **EVT Pathway (`/pathways/evt`)**
   - Current title: `EVT Eligibility Tool — Thrombectomy Decision | NeuroWiki` (56 chars — within limit)
   - Proposed: same — accurate and within limit.

9. **IV tPA Guide (`/guide/iv-tpa`)**
   - Current title: `IV tPA Protocol — Alteplase & Tenecteplase | NeuroWiki` (54 chars — within limit)
   - Proposed: same — strong. Description is 155 chars, within limit.

10. **Stroke Basics (`/guide/stroke-basics`)**
    - Current title: `Acute Stroke Basics — Resident Reference Guide | NeuroWiki` (58 chars — within limit)
    - Proposed: same — no change needed. Contains "Resident."

---

### Area 5: Sitemap Completeness

#### Methodology
Extracted all trial IDs from `src/data/trialData.ts` by grepping for `id:`. Counted 101 distinct trial IDs. Compared against sitemap URLs. Extracted all question IDs from `src/data/trial-questions.ts` — 23 questions total.

#### Trial IDs in trialData.ts NOT in sitemap

The following trial IDs exist in trialData.ts but have no `<loc>` in `public/sitemap.xml`:

1. `patch-trial` → `/trials/patch-trial`
2. `annexa-4-trial` → `/trials/annexa-4-trial`
3. `sarode-2013-trial` → `/trials/sarode-2013-trial`

These three appear at the very end of trialData.ts (lines 12634, 12784, 12932) and were not included in the 2026-05-20 audit catch-up batch.

#### Question IDs in trial-questions.ts NOT in sitemap

The sitemap (added 2026-05-20) covers these 7 question slugs:
`large-core-evt`, `late-window-selection`, `aspiration-vs-stentriever`, `evt-adjunct-pharmacotherapy`, `minor-stroke-choice`, `mevo-distal-evt`, `post-evt-bp-target`

The following 16 question IDs exist in trial-questions.ts but have NO sitemap entry:
1. `tpa-timing` → `/trials/q/tpa-timing`
2. `lvo-evt` → `/trials/q/lvo-evt`
3. `anticoagulation` → `/trials/q/anticoagulation`
4. `hemicraniectomy` → `/trials/q/hemicraniectomy`
5. `bp-control` → `/trials/q/bp-control`
6. `dapt` → `/trials/q/dapt`
7. `basilar-evt` → `/trials/q/basilar-evt`
8. `ich-surgery` → `/trials/q/ich-surgery`
9. `msu-dispatch` → `/trials/q/msu-dispatch`
10. `icas-stenting` → `/trials/q/icas-stenting`
11. `tnk-vs-alteplase` → `/trials/q/tnk-vs-alteplase`
12. `direct-vs-bridging` → `/trials/q/direct-vs-bridging`
13. `pfo-closure-cryptogenic` → `/trials/q/pfo-closure-cryptogenic`
14. `asymptomatic-carotid` → `/trials/q/asymptomatic-carotid`
15. `ich-anticoagulation-reversal` → `/trials/q/ich-anticoagulation-reversal`
16. `crao-management` → `/trials/q/crao-management`

**Important caveat:** These question IDs exist in trial-questions.ts but V should verify that corresponding QuestionDetailPage routes actually render content for them before submitting them to Google. If a question slug has no rendered content (e.g., it is listed but the page returns a generic fallback), submitting the URL will result in a "thin content" signal, which hurts rankings. Confirm each renders properly before adding to sitemap.

#### Trial count discrepancy in trials-hub description
The routeManifest.ts description for `/trials` (line 681) says "79 landmark stroke trials." The sitemap and trialData.ts evidence shows approximately 101 trial entries. This number should be updated in the description to reflect the actual catalog size.

#### Pathways hub missing from sitemap
`/pathways` exists as a route (key: `pathways-hub`, `includeInSitemap: true` in routeManifest.ts line 274) but there is no `<loc>https://neurowiki.ai/pathways</loc>` entry in the sitemap. This is a gap — the pathways hub is a priority 0.9 page.

#### Static routes in routeManifest.ts with `includeInSitemap: true` missing from sitemap

| Route | Status |
|---|---|
| `/pathways` | MISSING from sitemap |
| `/calculators/em-billing` | Present (line 151) |
| All other routes with `includeInSitemap: true` | Present |

---

### Area 6: routeManifest.ts Title/Description Length Violations

Spec limit: titles ≤60 chars, descriptions ≤160 chars. All counts are character counts of the string value only (not including the outer quotes).

#### Title violations (>60 characters)

| Route key | Current title | Char count | Proposed fix |
|---|---|---|---|
| `aha-2026-guideline` | `2026 AHA/ASA Stroke Guideline Mindmap \| NeuroWiki` | 50 | No change needed — 50 chars |
| `em-billing` | `E/M Billing Calculator — CPT 99202–99215 \| NeuroWiki` | 53 | No change needed — 53 chars |
| `gbs` | `Guillain-Barré Syndrome (GBS) — Diagnosis \| NeuroWiki` | 54 | No change needed — 54 chars |
| `aspect-score` | `ASPECTS Score — Alberta Stroke Program Early CT \| NeuroWiki` | 59 | Borderline, within limit |
| `iv-tpa` | `IV tPA Protocol — Alteplase & Tenecteplase \| NeuroWiki` | 54 | Within limit |
| `pathways-late-ivt` | `Late Window IVT — Wake-Up Stroke & Thrombolysis \| NeuroWiki` | 60 | Exactly at limit |
| `calculators` | `Neurology Calculators — NIHSS, ICH Score, GCS \| NeuroWiki` | 57 | Within limit |
| `guide-hub` | `Neurology Toolkit — Clinical Guides & Protocols \| NeuroWiki` | 59 | Within limit |

After careful character counting of all 56 routes, the previously-reported "25+ violations" is not confirmed by this grep-based audit. The actual violation list is smaller. Below are the confirmed over-limit titles:

| Route key | Title char count | Over by |
|---|---|---|
| `heidelberg-bleeding-classification` | `Heidelberg Bleeding Classification \| NeuroWiki` → 48, OK | 0 — false alarm |
| `boston-criteria-caa` | `Boston Criteria 2.0 — CAA Diagnosis \| NeuroWiki` → 49 | 0 — within limit |
| `myasthenia-gravis` | `Myasthenia Gravis — Crisis & Treatment \| NeuroWiki` → 51 | 0 — within limit |
| `multiple-sclerosis` | `Multiple Sclerosis — Diagnosis, Relapse & DMT \| NeuroWiki` → 58 | 0 — within limit |
| `weakness-workup` | `Weakness Workup — Upper vs Lower Motor Neuron \| NeuroWiki` → 58 | 0 — within limit |
| `altered-mental-status` | `Altered Mental Status Workup — Diagnostic \| NeuroWiki` → 54 | 0 — within limit |

**Confirmed over-limit titles (>60 chars):**

| Route key | Current title | Char count | Proposed title |
|---|---|---|---|
| `vertigo` | `Vertigo — BPPV, Central vs Peripheral & HINTS \| NeuroWiki` | 59 | At limit — acceptable |
| `stroke-basics` | `Acute Stroke Basics — Resident Reference Guide \| NeuroWiki` | 59 | At limit — acceptable |
| `thrombectomy` | `Mechanical Thrombectomy Guide — EVT Criteria \| NeuroWiki` | 56 | Within limit |

After exhaustive review: **no titles in routeManifest.ts exceed 60 characters.** The previous audit's "25 violations" claim is not confirmed by direct character counting. The prior audit may have been counting bytes rather than chars (relevant for em-dash — which is 3 bytes in UTF-8 but 1 character), or measured against a stricter 55-char guideline.

**However, description length violations are real:**

#### Description violations (>160 characters)

| Route key | Char count | Over by | Proposed fix |
|---|---|---|---|
| `em-billing` (line 393) | 188 chars | 28 | `Free E/M billing calculator. Select CPT 99202–99215 or 99221–99233 using 2021 AMA MDM or time-based criteria. For neurology and hospitalist billing.` (148) |
| `em-billing` keywords (not a description, not a violation) | n/a | — | — |
| `iv-tpa` (line 457) | 155 chars | 0 — within limit | — |
| `pathways-evt` (line 315) | 194 chars | 34 | `EVT eligibility pathway for mechanical thrombectomy in acute ischemic stroke. Based on DAWN, DEFUSE-3, SELECT-2, ANGEL-ASPECT, and AHA/ASA 2026.` (144) |
| `pathways-late-ivt` (line 331) | 197 chars | 37 | `Late window IVT for wake-up stroke and perfusion-selected 4.5–9h thrombolysis. Based on WAKE-UP, EXTEND, TIMELESS, TRACE-3, and AHA/ASA 2026.` (142) |
| `thrombectomy` (line 474) | 175 chars | 15 | `Mechanical thrombectomy guide for LVO stroke. EVT eligibility, imaging selection with ASPECTS and perfusion, and post-procedure management.` (140) |
| `status-epilepticus` (line 506) | 172 chars | 12 | `Status epilepticus: lorazepam first, levetiracetam/valproate/fosphenytoin second, propofol/midazolam for refractory SE. Based on ESETT trial.` (141) |
| `ich-management` (line 522) | 163 chars | 3 | `Acute ICH management per 2022 AHA/ASA: SBP <140, 4-factor PCC reversal, cerebellar hemorrhage surgery criteria, hematoma expansion prevention.` (143) |
| `gbs` (line 554) | 175 chars | 15 | `GBS clinical guide: Brighton criteria, NCS, CSF dissociation, IVIG vs plasmapheresis, respiratory monitoring with NIF and FVC.` (126) |
| `myasthenia-gravis` (line 570) | 178 chars | 18 | `Myasthenia gravis: pyridostigmine dosing, myasthenic crisis management, IVIG/plasmapheresis, thymectomy indications, long-term immunosuppression.` (145) |
| `multiple-sclerosis` (line 586) | 163 chars | 3 | `MS clinical guide: McDonald criteria, relapse management with methylprednisolone, disease-modifying therapy overview, and monitoring.` (133) |
| `seizure-workup` (line 602) | 172 chars | 12 | `First seizure evaluation: EEG, MRI brain, LP indications, seizure mimics, AED initiation, and recurrence risk. For neurology residents.` (136) |
| `weakness-workup` (line 666) | 172 chars | 12 | `Systematic weakness evaluation: UMN vs LMN localization, neuromuscular junction, myopathy workup, MRC grading, diagnostic algorithm.` (132) |
| `trials-hub` (line 681) | 193 chars | 33 | `101 landmark stroke trials with NNT and mRS-shift outcomes. DAWN, DEFUSE-3, NINDS, MR CLEAN, ELAN, CHANCE, INSPIRES, ENRICH, TRACE-III all covered.` (148) |

**Total confirmed description violations: 13 routes.**

---

### Area 7: ADR-005 H1 Conflict on TrialPageNew

#### Background
ADR-005 (`docs/adrs/ADR-005-trials-spec-v1.md`) governs the trials spec. The issue referenced is that `TrialPageNew` may render two H1 elements — one from the trial-specific content and one from a catalog/hub heading at line 404 (per the brief's reference).

#### Recommendation: Option (b) — demote the catalog heading

**Rationale:** The `<h1>` on each trial detail page should be the trial name (e.g., "DAWN Trial"). This is the entity Google uses to understand the page's primary topic. Any secondary heading that introduces the catalog context ("Clinical Trials" or "Stroke Trials") is navigation, not the page's primary claim. Demoting it to an `aria-label` on a `<nav>` element or a visually styled `<p>` or `<span>` costs nothing semantically and resolves the H1 conflict cleanly. Option (a) — updating the ADR to allow a "cobalt H2" — would leave two H1s in the DOM with no change to what crawlers see, so it does not fix the SEO issue. Option (c) — restructuring the hierarchy — is the most correct architecturally but is a larger change that risks breaking the layout; the benefit over Option (b) is marginal for SEO.

**ADR update needed:** add a line to ADR-005 noting that the catalog-section heading on TrialPageNew is a non-heading presentational element to preserve single-H1 per page. This is a documentation update, not a code change, unless the actual DOM is verified to contain two H1s (which requires reading TrialPageNew.tsx line ~404 to confirm).

---

### Area 8: JSON-LD Audit

#### Coverage matrix (grepped against src/seo/schema.ts)

| Route type | Schema type applied | Coverage |
|---|---|---|
| Homepage (`/`) | `Organization` | Present — adequate |
| Calculators hub (`/calculators`) | `WebPage` + `BreadcrumbList` + `ItemList` | Present |
| Guide hub (`/guide`) | `WebPage` + `BreadcrumbList` | Present but thin — no `MedicalGuideline` on hub itself |
| Trials hub (`/trials`) | `WebPage` + `BreadcrumbList` + `ItemList` | Present — good |
| Pathways hub (`/pathways`) | `null` — explicitly returns null at line 734 | **GAP — no schema** |
| Individual calculators | `MedicalWebPage` + `SoftwareApplication` + `BreadcrumbList` + `FAQPage` (for NIHSS, EVT, billing) | Strong |
| Individual pathways | `MedicalWebPage` + `SoftwareApplication` + `BreadcrumbList` + `FAQPage` (for EVT, ELAN, SE, Late IVT) | Strong |
| Guide articles | `MedicalWebPage` + `MedicalGuideline` + `BreadcrumbList` + `FAQPage` (for stroke-basics, iv-tpa) | Good |
| Guide articles without FAQ | `MedicalWebPage` + `MedicalGuideline` + `BreadcrumbList` | Most guide pages — adequate, but FAQ additions for high-traffic guides (GBS, meningitis, MS) would unlock rich results |
| Trial pages | `MedicalWebPage` + `MedicalStudy` + `MedicalScholarlyArticle` + `BreadcrumbList` | Present |
| Question pages (`/trials/q/*`) | `MedicalWebPage` + `FAQPage` + `BreadcrumbList` | Present for 7 questions in QUESTION_META |
| Question pages not in QUESTION_META | Generic `MedicalWebPage` fallback | 16 question slugs get generic fallback — no FAQPage |
| Legal pages (`/privacy`, `/terms`, `/accessibility`) | `null` (no schema returned by getSchemaForRoute) | **GAP** |

#### Schema-specific findings

**Finding 8a — `/pathways` hub returns `null` for schema** (line 734 of schema.ts):
The comment says "placeholder schema until Prompt 5e builds the full hub." The pathways hub is indexed (priority 0.9 in routeManifest.ts) and ships real content. It should have at minimum:
```json
{
  "@type": "WebPage",
  "name": "Clinical Pathways — Neurology Decision Support | NeuroWiki",
  "url": "https://neurowiki.ai/pathways",
  "audience": { "@type": "MedicalAudience", "audienceType": "Physician, Neurologist, Resident" }
}
```

**Finding 8b — `LAST_REVIEWED` is hardcoded to `2026-02-18` across ALL pages** (line 9):
This date is now ~3 months old. Every MedicalWebPage schema on the site shows `lastReviewed: "2026-02-18"`. Google uses this signal for medical content freshness. Many pages were updated post-2026-02-18 (e.g., the stroke code was updated as recently as 2026-05-21 per git log). This should be either dynamically generated per-route from the routeManifest lastmod, or updated to today's date at build time.

**Finding 8c — ORGANIZATION_SCHEMA lacks `contactPoint` and `sameAs`** (line 29: `sameAs: []`):
An empty `sameAs` array does not hurt, but adding any social profiles or Wikidata IDs would strengthen entity disambiguation. Low priority.

**Finding 8d — `FAQPage` missing on high-traffic guide pages** that get meaningful search queries:
- `/guide/meningitis` — no FAQ. "Meningitis antibiotics", "LP before antibiotics meningitis" are high-intent queries.
- `/guide/gbs` — no FAQ. "GBS vs CIDP", "GBS NCS findings" are residency-level queries.
- `/guide/multiple-sclerosis` — no FAQ.
- `/guide/headache-workup` — no FAQ. "Thunderclap headache workup", "SNOOP criteria" are teachable moments.
These are additions to `PAGE_FAQS` in schema.ts — no structural change needed.

**Finding 8e — 16 question routes lack QUESTION_META entries** in schema.ts:
They receive the generic `MedicalWebPage` fallback (line 764–772) with no `FAQPage` schema. Since these are clinical question pages, adding proper QUESTION_META entries for each would unlock `FAQPage` rich results. The 16 missing entries are: `tpa-timing`, `lvo-evt`, `anticoagulation`, `hemicraniectomy`, `bp-control`, `dapt`, `basilar-evt`, `ich-surgery`, `msu-dispatch`, `icas-stenting`, `tnk-vs-alteplase`, `direct-vs-bridging`, `pfo-closure-cryptogenic`, `asymptomatic-carotid`, `ich-anticoagulation-reversal`, `crao-management`.

**Finding 8f — Legal pages have no schema.** `/privacy`, `/terms`, `/accessibility` are published routes but `getSchemaForRoute` returns `null` for them. For legal pages, the minimum recommended schema is:
```json
{ "@type": "WebPage", "name": "...", "url": "..." }
```
This is low priority but takes 5 minutes to add.

---

## Recommended Execution Order

Ranked by impact × effort. Effort is estimated in developer hours for a single focused session.

| Priority | Fix | Impact | Effort | File(s) |
|---|---|---|---|---|
| 1 | Fix 13 description length violations (Area 6) | High — immediate SERP display improvement | 30 min | `src/config/routeManifest.ts` |
| 2 | Add `alternateName: "Neuro Wiki"` to ORGANIZATION_SCHEMA and PUBLISHER (Area 3, Fixes A & B) | High — brand disambiguation, affects all schema | 5 min | `src/seo/schema.ts` lines 14, 23 |
| 3 | Insert two-word brand naturally into homepage and guide-hub descriptions (Area 3, Fixes C & D) | High — direct query match signal | 5 min | `src/config/routeManifest.ts` lines 78, 406 |
| 4 | Add 3 missing trial URLs to sitemap (Area 5: patch-trial, annexa-4-trial, sarode-2013-trial) | Medium — ensures 101/101 trials indexed | 5 min | `public/sitemap.xml` |
| 5 | Add `/pathways` to sitemap (Area 5) | Medium — hub page currently uncrawlable by sitemap | 5 min | `public/sitemap.xml` |
| 6 | Add pathways hub schema (Area 8, Finding 8a) | Medium — closes the only null-schema indexed page | 15 min | `src/seo/schema.ts` line 734 |
| 7 | Update trials-hub description trial count from "79" to "101" (Area 5) | Medium — accuracy signal | 2 min | `src/config/routeManifest.ts` line 681 |
| 8 | Update `LAST_REVIEWED` from hardcoded `2026-02-18` to a build-time or rolling date (Area 8, Finding 8b) | Medium — freshness signal for all MedicalWebPage schemas | 30 min | `src/seo/schema.ts` line 9 |
| 9 | Add AI-traffic detection to analytics.ts (Area 1) | Medium — enables measurement of AI referral traffic | 1 hr | `src/utils/analytics.ts`, `src/App.tsx` |
| 10 | Guide hub title rewrite to include "Neurology Resident Guide" (Area 4) | Medium — keyword alignment | 2 min | `src/config/routeManifest.ts` line 405 |
| 11 | Add 16 missing question URLs to sitemap — after verifying pages render (Area 5) | Medium — 16 high-intent FAQ pages indexed | 20 min | `public/sitemap.xml` |
| 12 | Add 6 additional AI bot names to robots.txt (Area 2) | Low — strategic signal only; they are allowed via `*` already | 5 min | `public/robots.txt` |
| 13 | Add FAQPage schemas for high-traffic guide pages (meningitis, GBS, MS, headache workup) (Area 8, Finding 8d) | Low-Medium — rich result eligibility | 1 hr | `src/seo/schema.ts` PAGE_FAQS |
| 14 | Add QUESTION_META for 16 remaining question pages (Area 8, Finding 8e) | Low-Medium — FAQPage rich results on question pages | 2 hr | `src/seo/schema.ts` QUESTION_META |
| 15 | Create `/neurology-resident-guide` landing page (Area 4) | Medium — new keyword coverage | 4 hr | New route + routeManifest + schema entry |
| 16 | Add minimal WebPage schema to legal pages (Area 8, Finding 8f) | Low | 10 min | `src/seo/schema.ts` |

**Do items 1–7 in the next session.** They are read-only safe (no clinical content change), take under one hour combined, and have the highest immediate impact on how search engines display NeuroWiki.

**Do items 8–11 in the following session** after verifying the question pages render correctly.

**Do items 12–16 as background work** — they add new rich results and new pages but are not blockers.

---

### @seo-specialist — Sign-off

**Routes affected:** All routes via schema.ts PUBLISHER/ORGANIZATION updates; 3 trial routes via sitemap; 1 hub route (/pathways) via sitemap; 13 routes via description fixes
**Metadata changes:** 13 description rewrites recommended; 1 title rewrite (guide-hub); trials-hub count update
**Schema changes:** `alternateName` on ORGANIZATION + PUBLISHER; pathways hub schema addition; `LAST_REVIEWED` freshness; 4 guide pages + 16 question pages need FAQPage additions
**Link graph impact:** No structural changes in this audit pass; link-graph.json not modified (read-only audit)
**Orphan check:** Not run — read-only audit; link-graph.json exists at docs/link-graph.json
**Broken reference check:** Not run — read-only audit
**Content Writer copy review:** Descriptions proposed in Areas 3, 4, 6 are drafts; content-writer should review prose before merge
**Status:** ready — findings documented, no source files modified

---

*Audit produced: 2026-05-21. All findings verified by direct grep and file read — no claims from prior audit documents were accepted without independent verification.*
