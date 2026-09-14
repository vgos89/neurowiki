# SEO briefing, 2026-09-09

**One line:** Second quiet-by-force morning: the Google sign-in that feeds every
traffic and ranking report is still expired, so there are again no numbers, and
the two-minute renewal is now the only thing standing between you and a normal
report.

## What I changed

Nothing on the site, by design.

I did file this morning's reports, and yesterday's, into the project history.
That is the one thing that improved: yesterday a file of yours was sitting
half-added and I stopped rather than risk sweeping it in. That is now clear, so
both days are saved and nothing is left dangling.

I refreshed the one report that does not need Google: the list of pages the site
publishes. It stands at 184. Of those, 39 appear in the sitemap but not in the
site's own page list and 1 the other way round. Not urgent, worth a look when
the numbers are flowing again.

No wording suggestions today. With no search data there is nothing to argue
from, and a suggestion I cannot back with numbers is worse than none.

## What needs you

1. **Sign in to Google again**, `npm run seo:auth-login`, two minutes in the
   browser. Use the Google account that owns the site's Search Console and
   analytics. Until this is done, every morning report will look like this one.
2. **Publish the Google project out of testing mode.** Yesterday I said I would
   flag this if it recurred within the week. It recurred the very next morning,
   which confirms the cause: while the project is marked in-testing, Google
   throws the sign-in away every few days no matter how often you renew it.
   Publishing it is one click in the Google console and one time only. Doing
   only step 1 buys a few days; doing both ends the problem.

## Numbers

None available for a second day. Every traffic and ranking figure comes from
Google, and Google is turning us away.

## Watching

- The sitemap and the site's own page list still disagree by 39 pages. Carried
  from yesterday, unchanged, not yet worth acting on.
- The early-warning check that watches for sudden traffic drops has now not run
  for two mornings. Read both as "not checked", not "all clear".

## Ran into trouble

Seven of eleven checks failed, all for the same single reason: the saved Google
sign-in is no longer accepted.

One wrinkle worth a working session: the early-warning check reported itself as
having run when in fact it had stopped on the same sign-in failure. It cannot
mislead you today because I read its underlying record, but on a busy morning it
could. Small fix, needs a supervised session because it touches the machinery
rather than the reports.

The self-check that confirms this job stayed inside its own reporting folder ran
at the end of the data pull and came back clean: nothing outside the reporting
folder was touched. I confirmed that a second time by hand before saving, because
the check will only compare against the same calendar day it started on, and this
run straddled a date change. Your headache-pathway work, which was still
unsaved when the run began, was saved by your own session mid-morning and is
safely in the project history.

**Footer:** Reports filed this morning as the standard daily-report entry,
covering both 2026-09-08 and 2026-09-09, and labelled the 9th because that is the
day the data covers. Reference code in the chat summary.
