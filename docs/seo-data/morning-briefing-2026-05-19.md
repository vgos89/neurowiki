# Morning briefing — May 19

You left at "Do all layers back to back, I'm going to sleep." Here's what got done, what didn't, and what needs your call.

---

## What got done while you slept

Five things shipped, in this order. All on `main`, all pushed, every commit passed the quality gates.

### 1. Title bug is fixed
The first weekly report showed several pages appearing twice — once with the right title and once with the generic homepage title. That was a real bug, not a quirk of the data. Cause: Google Analytics was logging the page view *before* the page had a chance to set its own title. Now every page view is logged after the title is in place, with the right title attached on purpose (not by accident). Next weekly report should show clean, single entries for every page.

### 2. We now actually track what clinicians DO on the site
Until last night we knew clinicians visited pages. We didn't know if anything happened after that. I added tracking for 8 specific clinician actions:

- Copying a calculator's EMR text
- Using the share button on any calculator or pathway
- Clicking a trial card from the trials index
- Advancing through the Stroke Code steps (so we can see where people drop off)
- Opening a Deep Learning pearl
- Clicking out to a citation (DOI link)
- Submitting feedback
- Acknowledging the medical disclaimer

Every calculator and pathway gets the copy/share tracking for free — I wired it into the shared header so all 14 calculators benefit without per-page work. The data takes about 24 hours to start showing up in reports, but you can see events fire in real time in Google Analytics' DebugView if you want to verify.

### 3. The next Claude session will know how to read the weekly report
I wrote a new "SEO Analyst" skill that codifies the 6-step weekly read pattern, the decision thresholds (when CTR is low enough to act on, when a position drop matters, when a query is worth a new page), the quality bar (what we will *never* do — no thin landing pages, no keyword stuffing, no compromise on clinical accuracy), and a template for the weekly action list. Next time someone says "what does the report show" or "why isn't [page] ranking," the SEO manager will load this skill automatically and produce a real analysis instead of guessing.

### 4. Structured data upgrades
Two enrichments to how Google understands the site:
- **Trial pages** now tell Google they're describing clinical studies (using the more specific `MedicalStudy` schema, in addition to the existing scholarly-article markup). Helps with knowledge-panel eligibility.
- **Guide pages** now tell Google they're clinical guidelines (using `MedicalGuideline`). Same idea — more specific signal.

Both are structural only — I deliberately did *not* populate clinical claim fields like evidence levels or trial outcomes, because that would require per-page clinical sign-off. Worth doing later, but not autonomously.

### 5. Automated weekly reports — scaffolding ready, not turned on
Wrote a serverless function at `/api/seo-weekly` that does the same fetch + report the local `npm run seo:weekly` does, but designed to fire on a Vercel cron every Monday morning. It's not active yet because it needs two things from you (see "Your call" below).

---

## What I left untouched (deliberately)

- **Auto-commit of weekly reports to the repo.** The cron handler returns the data as JSON; it doesn't yet commit the report back to the repo. That requires a GitHub token with write access, and I didn't want to ask for that until you decide whether you want the automation at all.
- **Per-trial FAQ schemas.** Would 4× the schema file and each trial would need clinical-content sign-off. Higher cost than benefit until we see the next data run.
- **The internal-link graph.** This is a UX call (which calculator should the EXTEND trial page link to, etc.) and benefits hugely from real query data — which we don't have yet because Search Console just started collecting.
- **Disabling GA4 Enhanced Measurement page views.** The title-bug fix makes this lower-priority, but if you ever see duplicate page-view events in the next report, that's why — see "Your call" #3 below.

---

## Your call when you're up

**1. Want the automated weekly report? If yes, I need 6 env vars in Vercel.**

The full list is documented at the top of `api/seo-weekly.ts`. Short version:
- `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` — pull from `oauth-credentials.json` (the file you saved at the repo root)
- `OAUTH_REFRESH_TOKEN` — pull from `.oauth-token.json` (created when you signed in last night)
- `GA4_PROPERTY_ID` — same number you put in `.env.local`
- `GSC_SITE_URL` — set to `https://neurowiki.ai/`
- `CRON_SECRET` — generate a random 32+ character string (any password manager will do)

If you can get me those, I can test the endpoint live and then wire the cron schedule in.

**2. OAuth app: stay in Testing mode or publish for verification?**

Right now your OAuth app is in Testing mode. Refresh tokens for Testing-mode apps expire after 7 days of inactivity. For a weekly cron that's a tight margin (one missed week and the token's dead). Two paths:
- **Stay Testing**, accept that if the cron misses 2+ weeks, you'll need to re-run `seo:auth-login`. Low cost, occasional friction.
- **Publish + verify** the app with Google. Once verified, the refresh token never expires. Takes 1–2 weeks for Google's review. No code change needed; it's purely a Google Cloud Console step.

If you want long-term reliable automation, publishing is the right answer. Starting the verification process this week means it lands while the data is still backfilling — good timing.

**3. (Minor) Want to also turn off GA4 Enhanced Measurement page views?**

This is belt-and-braces on the title-fix from last night. The fix should be sufficient on its own. But if you go to GA4 → Admin → Data Streams → click your web stream → toggle off "Page views" in Enhanced Measurement, you'd guarantee no duplicate or out-of-order page_view events ever again. 30 seconds. Reply "yes" if you want me to walk you through it.

**4. The GSC data should be live by Wednesday/Thursday.**

Search Console started collecting search queries the moment you verified ownership last night. Standard 2–3 day lag before queries show up in the API. When you say the word, I'll re-run `npm run seo:weekly` and we'll have our first GA4 + GSC report together — then I can run the new SEO Analyst skill against it and propose the first batch of concrete actions.

---

## Commits, for the record

| Commit | What it does |
|---|---|
| `0f36624` | Title-bug fix |
| `30341c2` | 8 new event hooks |
| `c09b9b2` | SEO Analyst skill + governance updates |
| `1951f02` | Trial + guide structured data upgrades |
| `720c7fa` | Vercel cron handler scaffolding |

All live on production. No broken builds, no broken pages.

---

## Bottom line for the CEO

The weekly SEO pipeline went from "pipeline works, one report in hand, mostly blind" to "pipeline works, instrumentation across every meaningful clinician action, fresh structured-data signal to Google, ready for automation, and the next Claude session has a written playbook for how to read the data and act on it." 

What's left is the two decisions in "Your call" above. Both can wait a few days if you want; nothing is broken or urgent.
