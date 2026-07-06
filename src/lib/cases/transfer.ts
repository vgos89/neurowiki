/**
 * Case-transfer relay — receiver-initiated asymmetric model (Option Q,
 * 2026-05-19). Composes on the generic ECDH primitives in
 * `src/lib/crypto/caseCipher.ts`.
 *
 * Flow (phone→desktop is the dominant direction):
 *
 *   Desktop (receiver):
 *     1. createReceiveSession() — generate ephemeral keypair, INSERT
 *        {token, receiver_public_key, expires_at} into Supabase. Keep
 *        the private key in component state. Display token + QR.
 *     2. pollForCases(token, privateKey) — poll every 2s for the row
 *        until ciphertext + sender_public_key are populated. Decrypt
 *        locally, DELETE the row (one-time read).
 *
 *   Phone (sender):
 *     1. sendCases(token, cases) — fetch receiver_public_key by token,
 *        encrypt cases with a fresh ephemeral keypair, UPDATE the row
 *        with ciphertext + sender_public_key. RLS guards against a
 *        second sender claiming the same row (USING ciphertext IS NULL).
 *
 * Security envelope (per security baseline + architect review):
 *   - Receiver's private key never crosses the wire.
 *   - Network attacker with the token cannot decrypt — they would need
 *     to break P-256 ECDH or the desktop's local key material.
 *   - Supabase the company cannot decrypt — same reason.
 *   - Replay defense: UPDATE policy requires ciphertext IS NULL, so
 *     a second sender posting to the same token is rejected.
 *
 * Architect conditions honored:
 *   #3 polling at 2 s (Realtime as future follow-up)
 *   #7 tab-close orphan → explicit phone-side error ("This code is no
 *      longer active")
 */

import { getSupabase } from '../supabase';
import {
  generateReceiverKeypair,
  encryptForReceiver,
  decryptAsReceiver,
  generateTransferCode,
} from '../crypto/caseCipher';
import type { SavedCase } from './types';

const TRANSFER_TTL_MINUTES = 15;
const POLL_INTERVAL_MS = 2000;

/** TTL in minutes — exported for UI display. */
export const TRANSFER_TTL_MIN = TRANSFER_TTL_MINUTES;

// ─── Receiver-side (desktop) ────────────────────────────────────────────

export interface ReceiveSession {
  /** 5-digit token to display on the desktop. */
  code: string;
  /** ECDH private key held in component state. Never persisted. */
  privateKey: CryptoKey;
  /** ISO timestamp when the relay row expires + is purged. */
  expiresAt: string;
}

/**
 * Create a new receive session. Generates an ephemeral ECDH keypair,
 * uploads only the public key to Supabase, returns the code + private
 * key for the caller (ImportCases page) to hold in state.
 */
export async function createReceiveSession(): Promise<ReceiveSession> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Sync is not configured on this device.');
  }
  const { privateKey, publicKeyB64Url } = await generateReceiverKeypair();
  const code = generateTransferCode();
  const expiresAt = new Date(Date.now() + TRANSFER_TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabase.from('transfers').insert({
    token: code,
    receiver_public_key: publicKeyB64Url,
    expires_at: expiresAt,
  });

  if (error) {
    // 23505 = unique-violation = token collision. With 100k codes + 15-min
    // TTL the collision rate is low; one retry is enough in practice.
    if (error.code === '23505') return createReceiveSession();
    // Schema-mismatch detection — if the Supabase database hasn't had
    // db/migrations/0002_transfers_asymmetric.sql applied yet, PostgREST
    // returns an "Could not find the 'receiver_public_key' column" error
    // with code PGRST204. Translate that to actionable plain language
    // instead of leaking the raw schema-cache message to clinicians.
    if (error.code === 'PGRST204' || /receiver_public_key|column .* schema cache/i.test(error.message)) {
      throw new Error(
        'Cross-device transfer is being upgraded on this site. Try again in a few minutes; if the issue persists, ask the admin to apply the latest database migration.'
      );
    }
    throw new Error(`Could not create receive session: ${error.message}`);
  }
  return { code, privateKey, expiresAt };
}

/**
 * Wait for the sender to attach ciphertext, then decrypt.
 *
 * Hybrid implementation (architect P3 follow-up, 2026-05-19):
 *
 *   - Fast path — Supabase Realtime subscription on the `transfers` row.
 *     When the sender's UPDATE lands, the postgres_changes event lights
 *     us up sub-second. No SELECT round-trip on the receive side.
 *
 *   - Backup path — 2-second polling. Covers three failure modes:
 *       (a) the sender raced ahead and uploaded before we subscribed
 *           (initial checkOnce catches this);
 *       (b) Realtime is not enabled on the `transfers` table in this
 *           Supabase project — the channel never delivers events but
 *           polling still resolves the transfer;
 *       (c) the postgres_changes event is dropped (replication lag,
 *           RLS filtering, network blip).
 *
 *   First path to resolve wins; the other cleans up its subscription /
 *   timer. AbortSignal cancels both paths.
 */
export async function pollForCases(
  code: string,
  privateKey: CryptoKey,
  signal?: AbortSignal,
): Promise<{ cases: SavedCase[] }> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Sync is not configured on this device.');
  }

  return new Promise<{ cases: SavedCase[] }>((resolve, reject) => {
    let settled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const cleanup = () => {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (channel) { void supabase.removeChannel(channel); channel = null; }
      signal?.removeEventListener('abort', onAbort);
    };
    const finish = (result: { cases: SavedCase[] } | Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (result instanceof Error) reject(result);
      else resolve(result);
    };
    const onAbort = () => finish(new Error('Polling cancelled.'));
    if (signal?.aborted) { onAbort(); return; }
    signal?.addEventListener('abort', onAbort);

    /** Decrypt + delete-row when we have ciphertext + sender public key. */
    const tryDecrypt = async (row: { ciphertext: string; sender_public_key: string }) => {
      if (settled) return;
      try {
        const payload = await decryptAsReceiver<{ cases: SavedCase[]; version: number }>(
          row.ciphertext, row.sender_public_key, privateKey,
        );
        await supabase.from('transfers').delete().eq('token', code);
        if (!Array.isArray(payload.cases)) {
          finish(new Error('Transfer payload is invalid.'));
          return;
        }
        finish({ cases: payload.cases });
      } catch (e) {
        finish(e instanceof Error ? e : new Error('Decrypt failed.'));
      }
    };

    /** One-shot row check — handles ciphertext-present / expired / not-found. */
    const checkOnce = async () => {
      if (settled) return;
      const { data, error } = await supabase
        .from('transfers')
        .select('ciphertext, sender_public_key, expires_at')
        .eq('token', code)
        .maybeSingle();
      if (settled) return;
      if (error) return finish(new Error(`Could not check for incoming transfer: ${error.message}`));
      if (!data) return finish(new Error('This session has expired. Start over to get a new code.'));
      if (new Date(data.expires_at).getTime() < Date.now()) {
        await supabase.from('transfers').delete().eq('token', code);
        return finish(new Error('This session expired before the sender finished.'));
      }
      if (data.ciphertext && data.sender_public_key) {
        await tryDecrypt(data as { ciphertext: string; sender_public_key: string });
      }
    };

    // Fast path — Realtime subscription. The cast on `postgres_changes` is
    // because @supabase/supabase-js's channel typing is overloaded in a way
    // that doesn't inline-narrow well; the runtime accepts the literal.
    channel = supabase
      .channel(`transfers:${code}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'transfers', filter: `token=eq.${code}` },
        (payload: { new: { ciphertext: string | null; sender_public_key: string | null } }) => {
          const row = payload.new;
          if (row.ciphertext && row.sender_public_key) {
            void tryDecrypt(row as { ciphertext: string; sender_public_key: string });
          }
        },
      )
      .subscribe();

    // Backup path — immediate check + polling. Always runs alongside
    // Realtime so we handle the cases where Realtime isn't enabled or
    // the event is dropped. First path to resolve wins.
    void checkOnce();
    pollTimer = setInterval(checkOnce, POLL_INTERVAL_MS);
  });
}

// ─── Sender-side (phone) ────────────────────────────────────────────────

/**
 * Send the given cases to the receiver identified by `code`. Fetches the
 * receiver's public key, encrypts with a fresh ephemeral keypair, UPDATEs
 * the row.
 *
 * Throws an explicit error when the row is gone (receiver closed their
 * tab or session expired) so the phone UX can prompt the clinician to
 * "ask the other device to start over" — architect condition #7.
 */
export async function sendCases(
  code: string,
  cases: SavedCase[],
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Sync is not configured on this device.');
  }
  // 1. Fetch receiver public key by code.
  const { data, error } = await supabase
    .from('transfers')
    .select('receiver_public_key, ciphertext, expires_at')
    .eq('token', code)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not look up the code: ${error.message}`);
  }
  if (!data) {
    throw new Error('This code is no longer active. Ask the other device to start over.');
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    throw new Error('This code has expired. Ask the other device to start over.');
  }
  if (data.ciphertext) {
    throw new Error('This code was already used. Ask the other device to start over.');
  }

  // 2. Encrypt the payload for the receiver.
  const payload = { cases, sentAt: Date.now(), version: 2 };
  const envelope = await encryptForReceiver(payload, data.receiver_public_key);

  // 3. UPDATE the row, attaching ciphertext + sender ephemeral public key.
  //    RLS (USING ciphertext IS NULL) guarantees only one such UPDATE can
  //    succeed per row — replay defense at the database layer.
  const { data: updated, error: upErr } = await supabase
    .from('transfers')
    .update({
      ciphertext: envelope.ciphertextB64Url,
      sender_public_key: envelope.senderPublicKeyB64Url,
    })
    .eq('token', code)
    .is('ciphertext', null)
    .select('token');

  if (upErr) {
    throw new Error(`Could not send: ${upErr.message}`);
  }
  if (!updated || updated.length === 0) {
    // Two clients raced to send to the same code; the other won. RLS
    // (USING ciphertext IS NULL) ensures only one UPDATE succeeds.
    throw new Error('This code was just used by another device. Ask the receiver to start over.');
  }
}

// `sleep()` helper retired 2026-05-19 — the pollForCases polling loop was
// replaced with a Realtime-channel + setInterval hybrid that no longer needs
// an abortable sleep. If a future caller needs the helper back, recover it
// from git history at commit e25a3ea.
