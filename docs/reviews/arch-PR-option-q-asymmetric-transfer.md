# Architect review — PR #option-q-asymmetric-transfer

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-19

## Rationale

The plan replaces a symmetric PIN-derived envelope with an ECDH receiver-keypair envelope inside the same module boundaries (`src/lib/crypto/caseCipher.ts`, `src/lib/cases/transfer.ts`, `src/components/cases/SendCasesModal.tsx`, `src/pages/ImportCases.tsx`). Reads of the current files confirm three things that matter for the structural rubric: (a) the existing crypto module is already the single chokepoint for envelope logic and has zero downstream callers outside `transfer.ts`, so a clean swap is feasible without leaving a parallel implementation behind; (b) `transfer.ts` is the single chokepoint for Supabase row I/O, so the polling/Realtime decision is localized; (c) `html5-qrcode` is already a dependency and the QR scanner already lives on the receiver page — moving it to the sender page is a relocation, not a new capability. There is no existing asymmetric primitive in the repo, so no duplication risk. The boundary contract (crypto stays in `lib/crypto`, transport stays in `lib/cases`, UI stays in components/pages) is preserved by the plan as written. The main structural risks are (1) the legacy `encryptWithPin`/`decryptWithPin` exports must be removed in the same PR rather than left in place "for safety," because leaving both creates the third-pattern problem the rubric flags, and (2) the file-count exceeds the §17.1 five-file rollback threshold (4 client files + 1 SQL migration + ImportCases + privacy policy = ~6–7 files) so a rollback note must be explicit in the PR body. The plan does include a migration file and a parallel security review — both are right. Answers to the ten clarifying questions are in Required follow-ups; none of them rise to a structural block.

## Required follow-ups

1. **Retire the symmetric path in the same PR.** Remove `encryptWithPin` / `decryptWithPin` / `generateTransferCode` exports and the PIN-related types in the same commit that ships Option Q. Do not leave a `caseCipher.legacy.ts` shim — there is no migration cohort (transfers are 15-min ephemeral, no persisted ciphertext) so a clean cut is the correct move and avoids the duplication-risk failure mode.

2. **Schema migration — drop+recreate, not ALTER.** Because every row in `transfers` has a ≤15-min TTL and is purposeless after that, the cleanest path is `DROP TABLE transfers; CREATE TABLE transfers (...)` inside a single transaction in `db/migrations/0002_transfers_asymmetric.sql`, run during low-traffic window. ALTER + nullable `ciphertext` + nullable `receiver_public_key` creates a transient schema where the RLS check and NOT NULL constraints disagree with the client invariants. Drop+recreate is also a one-line rollback (re-run 0001).

3. **Polling first, Realtime as follow-up — confirmed.** Ship 2 s polling. Add a separate `TASKS.md` entry tagged `L4-P2` for Realtime migration. The polling code path is ~15 lines in `transfer.ts`; the swap-cost when Realtime lands is trivial. This matches the §6 "migration exit" principle — the simpler primitive ships first.

4. **Wire encoding: base64url, `raw` export.** Use `crypto.subtle.exportKey('raw', key)` → base64url. `raw` for P-256 ECDH is 65 bytes (`0x04 || X || Y`) and is the canonical Web Crypto encoding for this curve. `spki` adds DER wrapping for no security benefit on a short-lived in-app key. Base64url is correct for forward-compatibility with QR / URL embedding even though current QR encodes only the 5-digit code.

5. **HKDF the ECDH output — yes, do this.** `crypto.subtle.deriveKey({name:'ECDH', public:...}, privateKey, {name:'HKDF', ...}, ...)` followed by `deriveKey` to AES-GCM is one extra call. Skipping HKDF and using the raw ECDH X-coordinate as the AES key is the documented anti-pattern. The discipline cost is low and the audit defense is significant. Domain-separate the HKDF `info` parameter with a literal like `'neurowiki-case-transfer-v1'`.

6. **Replay defense — must be in RLS, not just client.** The plan correctly identifies `USING (token = ? AND ciphertext IS NULL)` on the UPDATE policy. Make this an explicit assertion in the migration SQL and add a `tests/db/rls.spec.ts`-style smoke test (or a manual verification script committed to `scripts/`) that exercises the "second sender attempts to overwrite" case. Without this, the failure is silent and undetectable in production.

7. **Tab-close orphan rows — explicit phone-side error.** When desktop's tab closes mid-flow, the `receiver_public_key` is gone but the row persists until TTL. Phone should detect this via "row already has ciphertext" (impossible-state) OR more simply via the TTL sweep cleaning it up. Add explicit copy on the phone: *"This code is no longer active. Ask the desktop to start over."* Triggered when the row is absent or expired. This is a 5-line addition to `sendCases()`.

8. **Composability — keep the primitive narrow, expose generalizable helpers.** The `caseCipher.ts` primitives (`generateReceiverKeypair`, `encryptForReceiver`, `decryptAsReceiver`) should be domain-agnostic — they operate on `unknown` payloads. The `transfer.ts` layer is where "cases" enters the type signature. This separation lets a future "share with a colleague" feature reuse the crypto without touching cases, satisfying composability without over-generalizing the transport layer. Confirm this split lands as described.

9. **Rollback note required in PR body.** Plan touches 6+ files including a SQL migration — exceeds the §17.1 five-file threshold. PR body must include: revert path for the SQL (re-run `0001`), revert path for the client (`git revert <merge>`), and a statement that no persisted state migrates (because transfers are ephemeral).

10. **Route clinical portions to clinical-reviewer.** The Privacy Policy change is the only clinical-tier surface in this plan. Route the Privacy Policy diff to `clinical-reviewer` once `compliance-legal` lands its draft. This review covers structural only.

11. **Artifact paths confirmed.** `docs/reviews/arch-PR-option-q-asymmetric-transfer.md` (this file) and `docs/reviews/security-PR-option-q-asymmetric-transfer.md` (orchestrator-produced security artifact) are the right paths. Use the §17.1 architect template for both — same structure, different reviewer field.

## Blocking issues

None. Conditions in Required follow-ups must land in the executing PR; if they do, this is approve.

---

Rubric scorecard for the audit trail:

- **Duplication risk** — concern. Pass only if follow-up 1 lands (remove symmetric exports in the same PR). Otherwise block.
- **Boundary integrity** — pass. Crypto stays in `lib/crypto`, transport in `lib/cases`, UI in components/pages. No cross-boundary leakage in the plan.
- **Composability** — pass with follow-up 8. Primitive split is correct as described.
- **State locality** — pass. Receiver's private `CryptoKey` is held in component state on `ImportCases`, never lifted, never persisted. Sender holds ephemeral key only for the duration of `sendCases()`.
- **Dependency weight** — pass. No new packages. `html5-qrcode` already present; Web Crypto is built-in.
- **Migration exit** — concern. Pass only if follow-up 2 (drop+recreate) and follow-up 9 (rollback note in PR body) both land.
