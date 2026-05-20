# Security review — option-q-asymmetric-transfer

**Decision:** approve-with-conditions
**Reviewer:** orchestrator (acting as security-engineer; agent not yet loadable in this session — re-run via the dedicated agent next session to confirm)
**Date:** 2026-05-19

> Pre-execution security review of the Option Q asymmetric receiver-initiated case-transfer rewrite. Companion to `arch-PR-option-q-asymmetric-transfer.md`.

## Scope reviewed

- `db/migrations/0001_transfers_symmetric.sql` (rollback doc-of-record)
- `db/migrations/0002_transfers_asymmetric.sql` (new schema + RLS)
- `src/lib/crypto/caseCipher.ts` (rewritten — ECDH + HKDF + AES-GCM)
- `src/lib/cases/transfer.ts` (rewritten — createReceiveSession / sendCases / pollForCases)
- `src/components/cases/SendCasesModal.tsx` (rewritten — scan-first sender)
- `src/pages/ImportCases.tsx` (rewritten — generate-first receiver + polling)
- `api/transfer-cleanup.ts` (unchanged in this commit — still uses CRON_SECRET bearer auth; F3 follow-up remains)

## Threat model

1. **Network attacker with token.** Can fetch the relay row by token over the wire. Has receiver_public_key + (possibly) ciphertext + sender_public_key. Goal: read cases. **Defense:** ciphertext is encrypted with an AES-GCM key derived via ECDH from the receiver's private key, which never crosses the wire. Attacker would need to break P-256.

2. **Token brute-force / enumeration.** 5-digit token = ~17 bits = 100,000 codes. Attacker enumerates live sessions within 15-min TTL window. **What they can do:** UPDATE a row (the ciphertext arrives, the receiver fails to decrypt it with garbage from the attacker's ephemeral key, transfer dies). This is a denial-of-service, not exfiltration. **What they cannot do:** decrypt — they have the wrong ephemeral key pair. Rate-limiting at the Supabase/WAF layer remains a follow-up (F1 from baseline) but is not catastrophic.

3. **Replay attack.** Two senders try to upload to the same code. **Defense:** the RLS UPDATE policy uses `USING (ciphertext IS NULL)`. Only the first UPDATE succeeds. The second is rejected at the database layer, not just client-side (architect condition #6). Verified in the migration SQL.

4. **Supabase as adversary.** Server-side compromise (rogue admin, subpoena, database leak). Server sees: ciphertext (AES-GCM, unbreakable without the AES key) + receiver_public_key + sender_public_key + token + timestamps. **Defense:** server never has the AES key or either private key. Cleartext cannot be reconstructed from server-side state.

5. **Receiver tab closes mid-transfer.** Sender posts ciphertext to a row whose receiver private key is gone. **Defense:** session expires within 15 minutes; cron cleanup sweeps the row. Phone-side error in `sendCases()` explicitly tells the clinician "this code is no longer active" when the row vanishes (architect condition #7).

6. **Sender's ephemeral key reuse.** Each `encryptForReceiver()` call generates a fresh ECDH key pair internally. Reuse is structurally impossible.

7. **IV reuse with AES-GCM.** Catastrophic if it happened. **Defense:** fresh `crypto.getRandomValues(new Uint8Array(12))` per encryption. Verified in `caseCipher.ts` line where IV is generated.

## Findings

### F1 (carried from baseline) — No app-layer rate limit on transfer SELECT
**Severity:** advisory (unchanged from baseline). Option Q does not introduce this risk; under asymmetric mode an enumerator can only DoS sessions, not exfiltrate. Still warrants WAF-layer rate-limit in a future commit.

### F2 — Asymmetric replay defense (RLS) ✓ APPROVED
The migration SQL's `anon_update_attach_ciphertext` policy uses `USING (ciphertext IS NULL AND expires_at > now())`. Only the first UPDATE per row can succeed. Verified by re-reading the migration. Closes baseline F2 (atomic SELECT+DELETE — no longer relevant under new model, replaced by atomic UPDATE-with-null-check which is stronger).

### F3 (carried from baseline) — Cron auth not constant-time
**Severity:** advisory (unchanged). This commit does not touch `api/transfer-cleanup.ts`. Recommend a small follow-up commit to switch to `crypto.timingSafeEqual`. Not blocking.

### F4 (closed by this commit) — RLS in repo ✓ APPROVED
Both `0001_transfers_symmetric.sql` and `0002_transfers_asymmetric.sql` committed to `db/migrations/`. The migration SQL is now peer-reviewable. **F4 is closed.**

### F5 (closed by this commit) — PBKDF2 → ECDH ✓ APPROVED
PBKDF2 is gone. The new envelope uses ECDH P-256 + HKDF-SHA256 + AES-GCM-256. No password-derived key material anywhere. **F5 is closed** (PBKDF2 600k target is no longer relevant).

### F6 — HKDF domain separation ✓ APPROVED
`deriveAesKeyFromEcdh()` uses HKDF with `info = "neurowiki-case-transfer-v1"` and empty salt. Architect condition #5 met. Future protocol versions can use `"neurowiki-case-transfer-v2"` to ensure keys cannot be mixed across protocols. Verified by reading caseCipher.ts.

### F7 — base64url + raw key export ✓ APPROVED
`crypto.subtle.exportKey('raw', publicKey)` returns 65 bytes for P-256 uncompressed (`0x04 || X || Y`). Encoded as base64url for URL-safety. Architect condition #4 met. Verified.

### F8 — Symmetric path retired in same PR ✓ APPROVED
The new `caseCipher.ts` has no `encryptWithPin` / `decryptWithPin` / `generateTransferCode`-with-6-digit export. The 5-digit `generateTransferCode()` is the new export. Architect condition #1 met — no parallel-path duplication risk.

### F9 — Receiver private key lifecycle ✓ APPROVED
The ephemeral private key is held in a `useRef<CryptoKey | null>` in `ImportCases.tsx` for the duration of the session. It is generated client-side via Web Crypto (non-extractable on the derive step, extractable=true only for the public side of the export). On tab close / page unmount, the ref is garbage-collected. It is never:
- written to IndexedDB
- written to localStorage
- uploaded
- logged

Verified by reading ImportCases.tsx + caseCipher.ts.

### F10 — Token entropy reduction (6 → 5 digits)
**Severity:** advisory.
**Issue:** Token length dropped from 6 digits (~20 bits) to 5 digits (~17 bits). Lower brute-force resistance.
**Why acceptable:** under the new asymmetric model, the token is a lookup identifier only — not a key. An attacker who guesses the token can at worst trigger a one-shot DoS by uploading junk ciphertext. They cannot exfiltrate. The friction reduction (5 digits typed on a workstation keyboard) is a real UX win.
**Recommendation:** monitor for DoS patterns in Supabase logs. If observed, add rate-limit. If sustained, consider returning to 6 digits or adding a CAPTCHA on the SELECT path.

### F11 — Cipher payload format
Payload format: `base64url(iv[12] || aes-gcm-ciphertext)`. IV is prepended (not stored separately). AES-GCM authentication tag is in the ciphertext suffix per Web Crypto spec. Length sanity check (`combined.length < IV_LEN + 16`) is present.
**Verdict:** correct.

## Cryptographic correctness

| Primitive | Choice | Parameters | Verdict |
|---|---|---|---|
| Key agreement | ECDH | P-256 (secp256r1) | Correct — widely supported, audit-clean |
| Key derivation | HKDF-SHA256 | empty salt, info = "neurowiki-case-transfer-v1" | Correct |
| Symmetric cipher | AES-256-GCM | 256-bit key, 128-bit auth tag (default) | Correct |
| IV | per-record fresh | `crypto.getRandomValues(new Uint8Array(12))` | Correct |
| Random source | SubtleCrypto / `crypto.getRandomValues` | Native | Correct |
| Implementation | Web Crypto SubtleCrypto only | No userland | Correct |
| Public key encoding | raw, base64url | 65 bytes uncompressed P-256 | Correct |
| Cipher format | iv[12] \|\| aes-gcm-ciphertext | base64url | Correct |
| Token generator | `crypto.getRandomValues(Uint32Array(1)) % 100_000` | 5 digits, zero-padded | Correct (entropy reduction documented in F10) |

## RLS / authorization

| Operation | Role | Policy | Verdict |
|---|---|---|---|
| INSERT (receiver creates session) | anon | length(token)=5, token=regex, receiver_public_key set, ciphertext+sender_public_key NULL, expires_at in window | Correct — constrains shape, rejects malformed |
| SELECT (sender + receiver poll) | anon | expires_at > now() | Correct — expired rows hidden |
| UPDATE (sender attaches ciphertext) | anon | USING ciphertext IS NULL ∧ expires_at > now(); WITH CHECK ciphertext + sender_public_key both set | **Replay defense at DB layer** — only first sender wins |
| DELETE (one-time read) | anon | USING true | Acceptable — token is the access control |
| ALL | service_role | RLS bypass (default) | Correct — used only by `api/transfer-cleanup.ts` |

All policies committed to `db/migrations/0002_transfers_asymmetric.sql`. F4 closed.

## Secret handling

| Secret | Storage | Classification | Status |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (Sensitive) | Highest | Unchanged from baseline |
| `CRON_SECRET` | Vercel env (Sensitive) | High | Unchanged; F3 (timing-safe compare) follow-up remains |
| `VITE_SUPABASE_*` | Vercel env (Public) | Public by design | Unchanged |
| Receiver ephemeral private key | Component state (`useRef<CryptoKey>`) | Critical (never leaves device) | Correct lifecycle |
| Sender ephemeral private key | Stack frame of `encryptForReceiver()` | Critical (never leaves device) | Correct — out of scope immediately after use |

## Required follow-ups

In priority order:

1. **[P2] WAF rate-limit on transfers SELECT / INSERT / UPDATE** (F1 + F10). DoS resistance for 5-digit token + asymmetric envelope.
2. **[P2] Cron auth → crypto.timingSafeEqual** (F3 carried from baseline). Defensive depth.
3. **[P3] Re-run this baseline via the dedicated `security-engineer` agent next session** — confirm orchestrator-acting-as-agent reached the same findings.
4. **[P3] Consider Supabase Realtime for ImportCases polling** — eliminate the 2-second polling latency. Architect condition #3 deferred. Polling code path is ~15 lines and trivially swappable.

## Blocking issues

None. Cryptographic envelope is correct as implemented; replay defense is in the database; key lifecycle is clean. F4 and F5 from the baseline review are closed by this commit. F1 and F3 are unchanged advisory items not specific to Option Q.

## Closing remarks

This is a strictly stronger security envelope than the prior symmetric PIN model on every threat axis except token entropy (where the reduction from 20 → 17 bits is acceptable given the asymmetric envelope's exfiltration resistance). The receiver's private-key isolation in particular is a meaningful improvement — previously the AES key was derived from a PIN that often traveled the same channel as the code in practice; now the decryption key is structurally bound to the receiver device.
