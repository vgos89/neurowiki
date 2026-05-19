# Security review — baseline-2026-05-19

**Decision:** approve-with-conditions
**Reviewer:** orchestrator (acting as security-engineer; agent not yet loadable in this session — re-run via the dedicated agent next session to confirm)
**Date:** 2026-05-19

> Inaugural baseline review of NeuroWiki's shipped cryptographic + transient-data + persistence stack. Purpose: establish current state, not block. All advisory findings carry concrete fix paths.

## Scope reviewed

- `src/lib/crypto/caseCipher.ts` — AES-256-GCM + PBKDF2 (250k SHA-256)
- `src/lib/supabase.ts` — browser client wrapper (anon-keyed)
- `src/lib/cases/transfer.ts` — createTransfer / fetchTransfer (one-time-read pattern)
- `src/lib/cases/store.ts` — IndexedDB persistence wrapper
- `src/lib/cases/types.ts` — SavedCase + SavedCaseData schema (v2 as of 2026-05-19)
- `api/transfer-cleanup.ts` — Vercel cron, daily 04:00 UTC, CRON_SECRET-gated
- `vercel.json` — cron schedule entry
- `src/components/cases/SendCasesModal.tsx` — sender UX
- `src/pages/ImportCases.tsx` — receiver UX
- **RLS SQL** — searched repo; **none found in version control** (finding F4 below).

## Threat model

Single-attacker scenarios evaluated:

1. **Curious sender** wants to re-read a sent case → blocked by one-time-read on first fetch.
2. **Snooping receiver** has the 6-digit code but not the PIN → blocked by PIN gate; 4-digit PIN is the second factor.
3. **Brute-force enumerator** guesses 6-digit codes within the 15-minute window → see F1.
4. **Service-role thief** obtains `SUPABASE_SERVICE_ROLE_KEY` → catastrophic; mitigation = key rotation + Vercel env exposure audit.
5. **Cron impostor** triggers `/api/transfer-cleanup` directly → blocked by CRON_SECRET bearer auth; see F3 for timing-attack note.
6. **IndexedDB harvest** with local device access → mitigated by initials-only clinical minimum; no PHI in plaintext.
7. **Misrouted transfer** (sender types wrong code) → no harm beyond UX friction.

Asset under protection: encrypted case bundles in flight + plaintext initials/scores at rest.

## Findings

### F1 — No application-layer rate limit on transfer SELECT *(advisory, fix recommended)*

**Issue:** `src/lib/cases/transfer.ts:75-79` performs `supabase.from('transfers').select(...).eq('token', code).single()` with no rate limit. A 6-digit code is ~20 bits of entropy. At even 100 req/s an attacker can enumerate the full code space in ~3 hours; within a 15-minute TTL window where ~N live transfers exist, the expected hits per second is ~100 × (N / 10^6). With one live transfer, ~0.0001 hits/s = a hit every ~2.8 hours. Brute-force is not trivial but is not implausible at sustained scale.

**Mitigation already in place:** the one-time-read deletes the row before decryption, so a successful guess still requires the PIN to decrypt; and the row consumes its single read on first fetch (even a wrong-PIN attempt), so the attacker can't repeatedly probe a single ciphertext.

**Recommended fix:** add IP-based rate-limit on `transfers` SELECT — either via Supabase Edge Function wrapper, a Postgres trigger that records `select_attempts_per_ip` and throws on threshold, or an upstream WAF rule. Severity: advisory because the PIN second-factor + one-time-read + 15-min TTL together make the attack uneconomical, but the rate-limit closes a real enumeration window.

**Owner agent for fix:** system-architect (where does rate-limit live in the stack) → quality-assurance (implement + smoke-test).

### F2 — SELECT + DELETE not atomic *(advisory, fix recommended)*

**Issue:** `src/lib/cases/transfer.ts:75-94` does SELECT then DELETE as two separate PostgREST round-trips. Race condition: two simultaneous fetches with the correct code can both succeed at the SELECT step before either DELETE lands. Both clients receive the ciphertext; both can attempt PIN decryption locally. The one-time-read semantic is violated.

**Practical impact:** low — the receiver is one device in practice, and the code is shared out-of-band. The race only matters if the code is shared via an insecure broadcast channel (e.g. posted to a group chat) and two recipients race.

**Recommended fix:** replace the two-step pattern with a Postgres RPC function that does `DELETE FROM transfers WHERE token = $1 RETURNING ciphertext, expires_at` in a single statement. PostgreSQL's `DELETE ... RETURNING` is atomic and guarantees one-time semantics. The Supabase RPC call wraps it.

**Owner agent for fix:** system-architect → quality-assurance.

### F3 — Cron auth comparison is not constant-time *(advisory, fix recommended)*

**Issue:** `api/transfer-cleanup.ts:32` uses `authHeader !== \`Bearer ${expectedSecret}\`` — plain string inequality. Not constant-time. An attacker who can measure response timing across many requests can extract the secret one character at a time. This is a long-standing timing-attack pattern for bearer comparison.

**Practical impact:** very low — the attack requires precise network-timing measurements across thousands of requests to the cron endpoint, and Vercel's serverless cold-start variance probably dwarfs the signal. But the fix is one line.

**Recommended fix:** use Node's `crypto.timingSafeEqual` with `Buffer.from(authHeader)` and `Buffer.from(\`Bearer ${expectedSecret}\`)`. Guard with a length check (timingSafeEqual throws on length mismatch).

**Owner agent for fix:** quality-assurance.

### F4 — RLS policies not in version control *(BLOCKING for next security review, advisory for this baseline)*

**Issue:** Supabase Row Level Security policies for the `transfers` table live only in the Supabase dashboard. No SQL migration file is committed. This means:
- Policies cannot be peer-reviewed during code review (this baseline review cannot verify them).
- A change to RLS in the dashboard does not surface in git history.
- A rogue Supabase admin (or a compromised dashboard session) could weaken policies undetectably.
- Disaster recovery requires manual reconstruction from memory or screenshots.

**Practical impact:** HIGH on supply-chain integrity. The cryptographic envelope is strong, but if RLS is misconfigured (e.g. accidentally enabling `UPDATE` for anon, or removing `WITH CHECK` on insert), the envelope's guarantees collapse silently.

**Recommended fix:** create `db/migrations/0001_transfers_rls.sql` (or equivalent) committing the current RLS state. Going forward, RLS changes go through the migration file first (PR + review), dashboard second. The next security review BLOCKS until this lands.

**Owner agent for fix:** system-architect (decide migration tool / directory structure) → orchestrator (export current RLS state + commit).

### F5 — PBKDF2 at floor, not at target *(advisory, schedule refresh)*

**Issue:** `src/lib/crypto/caseCipher.ts:20` sets `PBKDF2_ITERATIONS = 250_000`. This is the 2023 OWASP floor for SHA-256. The 2024+ recommendation is 600,000. Current value is acceptable today but should be raised within ~12 months as GPU attack costs continue to drop.

**Migration concern:** raising iteration count breaks decryption of previously-encrypted bundles unless the new code can detect and accept the old iteration count for legacy ciphertexts. For NeuroWiki this is moot — transfers expire in 15 minutes, so a one-shot bump with no compatibility window is safe.

**Recommended fix:** schedule a single-commit bump to 600,000 in `[P2] Crypto parameter refresh` TASKS.md entry. Estimated user-facing impact: ~+250ms decryption time on mid-tier phones (still well under 1s).

**Owner agent for fix:** security-engineer (verify floor at fix time) → orchestrator.

### F6 — Schema bump v1 → v2 — additive, no migration required *(approved)*

**Issue:** `src/lib/cases/types.ts:92` bumped `SAVED_CASE_SCHEMA_VERSION` from 1 to 2 in this commit set, adding `strokeTimestamps` field. Additive change; v1 cases read fine on v2 readers (field is optional); v2 cases on v1 readers ignore the new field gracefully. No structural migration needed.

**Verdict:** approved. The schema bump is correct.

### F7 — Initials-only persistence boundary holds *(approved)*

**Issue:** Reviewed `SavedCaseData` schema and `SaveCaseModal` validation (regex `/^[A-Z]{2,4}$/`). Initials are the only identifier persisted. Optional note field is 120-char max, free-text — could theoretically receive PHI from a careless clinician, but the modal explicitly tells the user "Initials only — never write the full name" + the amber Shield-icon callout in `SaveCaseModal.tsx:131-135`.

**Verdict:** approved with the existing UX guardrail. Worth a follow-up periodic content audit (e.g. monthly local-only spot-check of a few cases) to confirm clinicians are using the field as intended — but that's process, not code.

## Cryptographic correctness

| Primitive | Choice | Parameters | Verdict |
|---|---|---|---|
| Symmetric cipher | AES-256-GCM | 256-bit key, 128-bit auth tag (default) | Correct |
| KDF | PBKDF2 SHA-256 | 250,000 iterations | At floor (F5: target 600k) |
| Salt | per-record, 16 bytes | `crypto.getRandomValues(new Uint8Array(16))` | Correct |
| IV (nonce) | per-record, 12 bytes | `crypto.getRandomValues(new Uint8Array(12))` | Correct (GCM 12-byte standard) |
| Random source | `crypto.getRandomValues` | native SubtleCrypto | Correct (no `Math.random` in crypto path — verified via grep) |
| Implementation | SubtleCrypto only | no userland crypto-js / node-forge | Correct |
| Ciphertext format | base64(salt[16] | iv[12] | ct) | Self-contained, decryptable without external metadata — correct |
| Code generator | 6-digit string from `Uint32Array(1)` mod 10^6 | crypto.getRandomValues | Correct source; F1 covers entropy concerns |
| Auth tag length | 128-bit (SubtleCrypto default) | not overridden | Correct |

**Summary:** the cryptographic envelope is correct as-implemented. F5 is the only crypto-parameter follow-up.

## RLS / authorization

**Cannot fully review — no SQL in repo (see F4).**

From reading `transfer.ts` + `transfer-cleanup.ts`, the implied policies are:

| Operation | Role | Implied policy | Verifiable? |
|---|---|---|---|
| INSERT | anon | `WITH CHECK (length(token)=6 AND expires_at > now() AND ciphertext IS NOT NULL)` | NO — needs SQL in repo |
| SELECT | anon | `USING (token = ? AND expires_at > now())` (with code-match as auth) | NO — needs SQL in repo |
| DELETE | anon | `USING (token = ?)` (one-time-read pattern) | NO — needs SQL in repo |
| ALL | service_role | full access (used by cron) | NO — needs SQL in repo |

**Cannot confirm:**
- That anonymous role does NOT have UPDATE permission (UPDATE has no legitimate path in this design)
- That anonymous SELECT does NOT have a `USING (true)` clause that would allow enumeration without code-match
- That `WITH CHECK` on INSERT enforces shape (preventing malformed payloads that break cleanup)
- That service_role is not somehow exposed to anonymous role

**This is the basis of F4's recommendation that RLS land in version control before the next security review.**

## Secret handling

| Secret | Storage | Classification | Exposure | Verdict |
|---|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (Sensitive) | Highest — full DB access | Server-only (`api/transfer-cleanup.ts`) — verified no `VITE_` prefix | Correct |
| `CRON_SECRET` | Vercel env (Sensitive) | High — cron auth | Server-only — verified no `VITE_` prefix | Correct (F3: comparison not constant-time) |
| `SUPABASE_URL` | Vercel env (Sensitive) | Medium — endpoint disclosure | Server-only (separate from `VITE_SUPABASE_URL`) | Correct |
| `VITE_SUPABASE_URL` | Vercel env (Public) | Public by design | Client bundle (intentional) | Correct |
| `VITE_SUPABASE_ANON_KEY` | Vercel env (Public) | Public by design (RLS does the work) | Client bundle (intentional) | Correct, contingent on F4 verification |

**Rotation status:** not yet established. Proposed cadence:
- `SUPABASE_SERVICE_ROLE_KEY`: every 90 days; revoke + re-deploy. Runbook owner: orchestrator/V.
- `CRON_SECRET`: every 180 days; revoke + re-deploy. Lower urgency — cron is idempotent.
- Anon keys: not rotated (public by design).

Recommend: add a `[P2] Establish secret rotation cadence + runbook` TASKS.md entry.

## Required follow-ups

In rough priority order:

1. **[P1] Commit RLS SQL to repo** (F4) — blocks next security review.
2. **[P1] Add rate-limit on transfers SELECT** (F1) — closes enumeration window.
3. **[P2] Replace SELECT+DELETE with atomic RPC** (F2) — closes race-condition gap.
4. **[P2] Switch cron auth to `crypto.timingSafeEqual`** (F3) — defensive depth.
5. **[P2] Bump PBKDF2 to 600,000 iterations** (F5) — refresh to current target.
6. **[P2] Establish secret rotation cadence + runbook** — operational hygiene.
7. **[P3] Re-run this baseline via the dedicated `security-engineer` agent next session** — confirm orchestrator-acting-as-agent reached the same findings.

## Blocking issues

None on this baseline. Cryptographic envelope is correct; envelope-correctness was the load-bearing question. All findings have concrete fix paths and none represent a current exposure of plaintext PHI or secrets.

F4 (RLS in repo) becomes blocking for the **next** security review. Until then, this baseline approves the existing posture on faith that the dashboard-configured RLS matches the implied policies above.
