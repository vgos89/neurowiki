# Supabase Operations Runbook

Owner: V (project admin). Updated 2026-05-19.

Operational steps that live outside the repo — Supabase dashboard settings,
secret rotation, Realtime/WAF configuration — that NeuroWiki depends on but
can't be enforced via code or migrations.

---

## 1. Enable Realtime on the `transfers` table

**Why:** the `pollForCases` receiver flow uses Supabase Realtime as the
fast-path delivery channel for incoming case transfers. When Realtime is
enabled, transfers land sub-second on the desktop side. When it is not
enabled, the implementation falls back to 2-second polling and still
works — but with worse latency.

**How:**
1. Supabase dashboard → **Database** → **Replication**
2. Find the **`transfers`** table in the list
3. Toggle the **Source** switch to ON (this adds the table to the
   `supabase_realtime` publication)
4. Confirm — no client-side change needed; the code subscribes
   automatically the next time someone opens `/import`

**Verify:** open `/import` on desktop, scan/type the code from a phone,
and watch the elapsed time between phone "Sent" toast and desktop
"X cases imported" — should be <1 second when Realtime is on, ~2s
average when off.

**Rollback:** flip the toggle off. The polling fallback keeps the feature
working at slower latency.

---

## 2. Rate-limit the `transfers` table to deter code enumeration (security baseline F1)

**Why:** the 5-digit transfer code is ~17 bits of entropy. Combined with
asymmetric encryption (Option Q) an attacker who guesses a code can at
worst DoS a single transfer — they cannot exfiltrate cases because the
receiver's private key never crosses the wire. But sustained enumeration
attempts are still a workload cost and a UX-disruption risk.

**Choose one of:**

### Option A — Supabase native rate limit (preferred for projects on the Team plan)

1. Dashboard → **Project Settings** → **API** → **Rate Limits**
2. Add a rule: `path = /rest/v1/transfers`, `requests per minute per IP = 30`
3. Save

This caps any single IP to 30 row-fetches per minute against the
`transfers` table. Legitimate clients never hit the cap (one
`createReceiveSession` + ~2 polls/sec for at most a few seconds is well
under). Enumeration attempts above 30/min get HTTP 429.

### Option B — Cloudflare or upstream WAF (preferred for projects not on Team plan)

If you front the Supabase project with Cloudflare:
1. Cloudflare dashboard → your zone → **Security** → **WAF** → **Rate
   limiting rules**
2. Rule: when `URI Path contains "/rest/v1/transfers"` then `Block`
   when `requests > 30 per 1 minute per IP`
3. Deploy

### Option C — Postgres trigger (project-local, no dashboard)

If neither A nor B is available, a `SELECT` audit trigger on the
`transfers` table can record IP attempts and refuse the query above N.
This is heavier and not currently committed; ask for the SQL if needed.

**Verify:** open `/import` 31 times in a minute from one IP — the 31st
should fail with 429 (or a generic error). Legitimate cross-device
transfers should never trigger this.

---

## 3. Secret rotation cadence

Owner: V. Track rotations in `docs/secret-rotation-log.md` (create when
the first rotation happens).

| Secret | Where stored | Proposed cadence | Why |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (Sensitive) | 90 days | Highest-privilege key. If leaked, the entire database is read/writable. |
| `CRON_SECRET` | Vercel env (Sensitive) | 180 days | Cron-trigger auth. Lower urgency because the cron is idempotent (delete expired rows) and the worst case is an attacker triggering cleanup early. |
| `VITE_SUPABASE_ANON_KEY` | Vercel env (Public) | n/a — public by design | The anon key is intended for the browser bundle. RLS does the security work. |

**Rotation procedure:**
1. Supabase dashboard → **Project Settings** → **API** → **Reset API
   keys** (or copy a new value from the relevant secret-management tool)
2. Vercel dashboard → **Settings** → **Environment Variables** →
   update the value, mark as Sensitive
3. Redeploy (Vercel will pick up the new env on the next deploy)
4. Test `/import` end-to-end + a manual cron trigger (`curl -H
   "Authorization: Bearer $NEW_CRON_SECRET" https://neurowiki.ai/api/transfer-cleanup`)
5. Log the rotation in `docs/secret-rotation-log.md`

---

## 4. Where the RLS policies live

In version control at `db/migrations/0001_transfers_symmetric.sql` (legacy)
and `db/migrations/0002_transfers_asymmetric.sql` (current). Closes
baseline F4. If you change RLS in the dashboard, **also update the
migration file** so the next person reviewing the security posture sees
the current state.

The dashboard view and the migration file should always match. When they
drift, the migration file is wrong and needs to be updated.

---

## 5. Re-running the security baseline review

The `security-engineer` agent in `.claude/agents/` produces the
`docs/reviews/security-PR-*.md` artifacts. The initial baseline +
Option Q reviews were produced by the orchestrator session in shadow
because the agent wasn't yet loadable in the running harness. Re-run
the dedicated agent once it's loadable (typically next Claude Code
session start) to confirm the orchestrator-shadow findings.

The expected re-run cadence after that: any commit touching
`src/lib/crypto/`, `src/lib/supabase.ts`, `src/lib/cases/transfer.ts`,
`api/`, RLS SQL, or `vercel.json` cron config.
