# SEO Daily Job Governance — NeuroWiki

> CLAUDE.md-tier rule file (see CLAUDE.md §3; @-referenced from §22). Governs the unattended morning SEO job registered at `~/.claude/scheduled-tasks/neurowiki-seo-daily/` (07:50 daily), the procedure in `.claude/commands/seo-daily.md`, and any session emulating that job. Established by task SEO-DAILY-PORT, V-approved 2026-09-07; architecture record in `docs/adrs/2026-09-07-seo-daily-routine.md`.

The one-sentence version: **the morning job reads everything, writes only reports, suggests edits, and publishes nothing.**

---

## 1. Write allowlist — file scope

The job may create or modify files ONLY under:

- `docs/seo/**`
- `docs/seo-data/**`

Everything else is out of reach, without exception: all of `src/`, `public/`, `scripts/`, `api/`, `.claude/`, `.husky/`, `TASKS.md`, `CLAUDE.md`, `package.json`, config files. Every clinical surface in `.claude/rules/clinical-surfaces.md` is therefore excluded by construction, not by vigilance.

**Enforcement tiers (per CLAUDE.md §2):**

| Layer | Tier | What it does |
|---|---|---|
| `.husky/commit-msg` + `clinical-guard.mjs --staged` | **Hook (the wall)** | Any commit whose message starts `docs(seo): daily report` is rejected if a staged path escapes the allowlist |
| `clinical-guard.mjs --baseline` / `--check` in `daily-run.sh` | Script (early warning) | Snapshots `git status` at run start; at run end, any path changed during the run outside the allowlist fails the manifest red. The baseline means work V left uncommitted overnight is never blamed on the job |
| This file + scoped `git add docs/seo docs/seo-data` | Convention | Honor-based; the hook is what makes it real |

`--no-verify` cannot be blocked locally. The honest mitigation: every briefing and manifest records the morning commit's SHA and its exact file list, so a bypass would be visible the same morning.

## 2. External writes — API scope

The OAuth grant includes Search Console write access, so "report-only" is declared for external state too. The job's permitted outbound writes are exactly:

1. The Monday sitemap resubmission (`submit-sitemap.mjs --confirm`).
2. Up to **2 request-indexing clicks per morning** in the GSC browser UI (best effort, only if Chrome tools are available and signed in), tracked in `docs/seo/indexing-requests.json`, 14-day cooldown per URL, never re-requesting a URL still in cooldown.

Every other Google API call is read-only. The job never writes to GA4, never changes GSC settings, never touches any other Google product. If GSC shows a quota message, stop for the day and note it.

## 3. Suggest-only — what the job produces instead of edits

V's standing decision (2026-09-07 interview): the job **never rewrites site wording itself**, it drafts proposals.

- Max **3 snippet proposals** (page title / meta description) per run, drawn from the top of `docs/seo/page-refresh-latest.md`, written to `docs/seo/proposals/<date>.md` with: the page, current wording, proposed wording, the target query, and the evidence (impressions, clicks, position).
- Max **3 internal-link suggestions** per run, from `docs/seo/internal-links-latest.md`.
- Drafted wording rules: humanizer skill pass mandatory; **no em-dash (U+2014)** (en-dash numeric ranges allowed per CLAUDE.md §10.3); title ≤60 characters; description 140-160; the description must accurately summarize the page (seo-analytics skill quality bar — a click won by overpromising is a loss).
- **Clinical wording flag (flag by default).** Every proposal carries the label
  `clinical wording — Class E path` UNLESS the target page is on the safe list below
  AND neither current nor proposed text contains any category below. The label is the
  default; silence is earned, not assumed.
  - **Safe list (may go unlabeled):** navigation, utility and index pages carrying no
    clinical assertion in title or description — `/`, `/about`, `/privacy`, `/terms`,
    `/accessibility`, `/contact`, `/feedback`, `/search`, and the `/trials` and
    `/calculators` index pages. A calculator, pathway, guide, trial or question page is
    never on the safe list.
  - **Clinical categories (any one means label):** (1) dose, route or frequency;
    (2) numeric threshold or score cutoff (NIHSS, ASPECTS, PC-ASPECTS, mRS, BP, age, time);
    (3) time window or temporal qualifier (within, up to, beyond, after, onset, last known
    well); (4) recommendation or its strength (recommended, indicated, should, reasonable,
    may be considered, not recommended, contraindicated); (5) guideline class or level of
    evidence (COR 1 / 2a / 2b / 3, LOE A/B/C, AAN level, "the guideline supports");
    (6) trial-result characterization (positive, negative, neutral, failed, met, missed,
    noninferior, superior, no difference, benefit, harm) and any named trial cited as
    evidence for a conclusion; (7) certainty marker (may, might, suggests, is associated
    with, versus causes, reduces, improves); (8) population or eligibility qualifier,
    numeric or not (age band, stroke subtype, AF-related, non-disabling, after successful
    EVT, when EVT is unavailable, pre-stroke baseline); (9) a drug, device or procedure
    name placed beside a condition or population such that an indication is implied;
    (10) any statistic, rate or effect size.
  - Unsure means label. Two labeled proposals and one skipped is a better morning than
    three unlabeled ones.
- **No new clinical assertion.** Proposed wording may only re-arrange clinical content
  already published on the page it targets (its current title, description, structured-data
  answer, or body). The job never introduces a clinical fact, number, trial name, grade or
  indication that is not already on that page, and never answers a clinical question from a
  search query. Uncertain means no proposal.
- **The character budget never buys itself with a qualifier.** The length limits are hard,
  and so is clinical meaning. If wording cannot reach the budget without dropping a
  population, hedge, time window, grade, trial-result word or eligibility qualifier, no
  proposal is made: the briefing says "cannot shorten without changing clinical meaning"
  and moves on.
- **Every copy, or none.** Snippet wording is duplicated across surfaces: page titles and
  descriptions live in `src/config/routeManifest.ts`, `src/seo/routeMeta.ts`, and
  `src/seo/schema.ts` (`QUESTION_META`), and a question page's description appears in the
  last two verbatim. Each proposal lists every file and field that currently holds the
  wording it would replace, found by searching for the exact current string. A proposal
  labeled clinical is applied to all of them in one supervised change or to none: applying
  to some ships two different clinical statements for one page, one of which search engines
  may present as the answer. The structured-data `answer` field and any visible FAQ answer
  are out of scope for this job and are never edited as part of applying a snippet proposal.
- Humanizer tier note: `docs/seo/proposals/` is outside `check:humanizer`'s scanned directories, so the humanizer rule is convention tier while wording is a draft. It becomes hook tier the moment V's session applies the wording into `src/config/routeManifest.ts` or any scanned surface.
  **Clinical checking never becomes hook tier.** `scripts/check-claims.ts` validates only
  claims that already carry a tag; none of `src/config/routeManifest.ts`,
  `src/seo/routeMeta.ts` or `src/seo/schema.ts` carries one, and none is listed in
  `.claude/rules/clinical-surfaces.md`. No hook will notice a changed dose, grade, hedge,
  population or trial-result word in a page title or meta description. The label above, and
  the human who reads it, are the entire clinical gate.
- Every `docs/seo/proposals/<date>.md` opens with this line verbatim: "These are drafts
  written without supervision. An unlabeled proposal has not been clinically reviewed, it
  has only not been flagged. Anything touching clinical wording needs medical review before
  it goes on the site."
- Never re-propose wording V already declined: rejections live in `docs/seo/proposal-rejections.json` (keyed page + field + proposed text); entries do not expire.
- A recommendation ignored three mornings running is demoted to one line under Watching, not repeated.

## 4. The experiment ledger

Every APPLIED snippet change is a measured 14-day experiment in `docs/seo/rewrite-ledger.json`.

- **The supervised session that applies a proposal** appends the entry: page path, editedOn, field, old/new wording, target query, 28-day GSC baseline, `"verdict": "pending"`.
- **The morning job** settles entries 14+ days old: CTR clearly up or clicks appeared → `kept` (mention the win); CTR clearly down or position dropped >3 spots → verdict `recommend-revert` plus a revert proposal in the briefing (the job never reverts site code itself); under ~10 impressions in both windows → `inconclusive`, wording stays.
- One live experiment per page at a time. Never propose a rewrite for a page with a pending entry.

## 5. Commit and push discipline

- Commit format: `docs(seo): daily report <date> [report-only]`, body listing the report files, ending with the `Co-Authored-By` trailer per CLAUDE.md §16.
- Stage with `git add docs/seo docs/seo-data` exactly. Never `git add -A`, never `-u`.
- **Never push. Never deploy. Never open a PR.** This is a standing, V-approved exception to CLAUDE.md golden rule 8, scoped to commits matching the format above; V's next supervised session pushes them. Recorded in the ADR.
- All hooks run and must pass. A pre-commit or commit-msg rejection is reported in the briefing with the exact failing gate's name, and the work is left staged. **Never `--no-verify`, never any bypass flag.** If the failure comes from repo state the job did not create (for example a stale-citation freshness block), that is a finding for V, not a problem to solve unattended.

## 6. Credentials

- Live at the repo root: `oauth-credentials.json` (OAuth client) and `.oauth-token.json` (refresh token), both gitignored. Never copy, move, print, or commit them; never place any credential under `docs/`.
- `invalid_grant` / 401 / unauthorized in any log = expired token. One line in the briefing: V runs `npm run seo:auth-login` (2-minute browser sign-in). The job never attempts re-auth itself. If it recurs within ~10 days, the Google Cloud consent screen is likely in Testing mode; V publishes it to Production (one click in the Cloud console) so refresh tokens stop expiring.

## 7. Silo and privacy

- Never read from or write to the Tidbit Health repo, or any other project's directory. NeuroWiki reports never contain Tidbit data and vice versa.
- Never publish to any artifact URL other than `SITE.dashboardArtifactUrl` in `scripts/seo/config.mjs`. Tidbit's dashboard URL (`fb267461-8757-41b3-a149-429fff5f9231`) is explicitly banned.
- The job never touches Supabase, case data, feedback submissions with contact details, or anything with personal data in it. GSC/GA4 aggregates are the only data sources.

## 8. Escalation

- An anomaly **ALARM** leads the briefing; optional work is skipped that morning; what V must do is stated plainly.
- A production-down symptom (site unreachable, wrong content served): the briefing and chat summary say so in the first line and tell V to start `/incident` in a supervised session. The unattended job never reverts, hotfixes, or redeploys.
- Anything requiring a strategy change (new thresholds, new autonomy, new content direction) is queued in the briefing for a supervised planning session, never decided mid-run.

## 9. Voice

Everything V reads (briefing, dashboard, chat summary) passes the C-suite test of CLAUDE.md §10.2: clinician impact first, no jargon, no file paths, no tool names, business consequence stated. A quiet morning is a good morning and must read like one; the job never invents work to justify the run.

## 10. Autonomy changes

Any expansion of this job's permissions (letting it apply snippet rewrites itself, widening the allowlist, adding external writes) is a Class D change to this file: plan, architect review, V approval, ADR. The clinical-escalation boundary in §3 was ratified by clinical-reviewer at port time (ratify-with-conditions, all six conditions applied 2026-09-07; artifact at `docs/reviews/clinical-ratification-seo-daily-governance.md`); changing that boundary, including removing or narrowing any category in the §3 list, additionally requires clinical-reviewer sign-off.
