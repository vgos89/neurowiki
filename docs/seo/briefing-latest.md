# SEO briefing, 2026-09-09

**One line:** Second morning without numbers: the Google sign-in that feeds every
traffic and ranking report is still expired, and a two-minute renewal is the only
thing standing between you and a normal report.

## What I changed

Nothing on the site, by design.

I did file this morning's reports, and yesterday's, into the project history.
Yesterday I stopped short of that because a file of yours was sitting half-saved
and I would not risk sweeping it in. Your own session saved that work mid-morning,
so both days are now filed and nothing is left dangling.

I refreshed the one report that does not need Google: the site publishes 184
pages, of which 39 appear in the sitemap but not in the site's own page list, and
1 the other way round.

No wording suggestions today. With no search data there is nothing to argue from,
and a suggestion I cannot back with numbers is worse than none.

## What needs you

1. **Sign in to Google again**, `npm run seo:auth-login`, two minutes in the
   browser, using the account that owns the site's Search Console and analytics.
   Until this is done, every morning report will look like this one.
2. **Publish the Google project out of testing mode.** Yesterday I said I would
   flag this if it recurred within the week. It recurred the next morning, which
   confirms the cause: while the project is marked in-testing, Google discards the
   sign-in every few days no matter how often you renew it. One click in the
   Google console, one time. Step 1 alone buys a few days; both together end it.

## Numbers

None available for a second day. Every traffic and ranking figure comes from
Google, and Google is turning us away.

## Watching

- Sitemap and page list still disagree by 39 pages. Unchanged from yesterday, not
  yet worth acting on.
- The early-warning check for sudden traffic drops has not run for two mornings.
  Read both as "not checked", not "all clear".

## Ran into trouble

Seven of eleven checks failed, all for the same reason: the saved Google sign-in
is no longer accepted.

One wrinkle for a working session: the early-warning check reported itself as
having run when it had in fact stopped on that same failure. Harmless today
because I read its underlying record, easy to miss on a busy morning.

The self-check confirming this job stayed inside its own reporting folder came
back clean, and I confirmed it by hand as well.

**Footer:** Reports filed as the standard daily-report entry, covering both the
8th and the 9th, labelled the 9th because that is the day the data covers.
Reference code in the chat summary.
