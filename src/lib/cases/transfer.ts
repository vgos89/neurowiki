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
    throw new Error(`Could not create receive session: ${error.message}`);
  }
  return { code, privateKey, expiresAt };
}

/**
 * Poll the relay until the sender attaches ciphertext, then decrypt.
 * Returns the decoded payload. Caller (ImportCases) is responsible for
 * deciding what to do with the cases (typically: merge into local
 * IndexedDB).
 *
 * Aborts cleanly when the AbortSignal fires (e.g. user closes the page
 * or hits "Cancel").
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
  while (!signal?.aborted) {
    const { data, error } = await supabase
      .from('transfers')
      .select('ciphertext, sender_public_key, expires_at')
      .eq('token', code)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not check for incoming transfer: ${error.message}`);
    }
    if (!data) {
      // Row was deleted (TTL sweep) or never existed (race condition with
      // the session itself being purged by the cron).
      throw new Error('This session has expired. Start over to get a new code.');
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      // Defensive — the SELECT RLS already filters expired rows, but the
      // app-side check guarantees consistent UX.
      await supabase.from('transfers').delete().eq('token', code);
      throw new Error('This session expired before the sender finished.');
    }
    if (data.ciphertext && data.sender_public_key) {
      // Decrypt before deleting so we don't destroy the only copy on a
      // decrypt failure. If decrypt throws, the row remains until TTL —
      // which is the intended behavior (sender can retry the upload? no,
      // RLS UPDATE-on-null-ciphertext blocks that; but we don't make
      // the situation worse by deleting prematurely).
      const payload = await decryptAsReceiver<{ cases: SavedCase[]; version: number }>(
        data.ciphertext,
        data.sender_public_key,
        privateKey
      );
      await supabase.from('transfers').delete().eq('token', code);
      if (!Array.isArray(payload.cases)) {
        throw new Error('Transfer payload is invalid.');
      }
      return { cases: payload.cases };
    }
    await sleep(POLL_INTERVAL_MS, signal);
  }
  throw new Error('Polling cancelled.');
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

// ─── Helpers ────────────────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }
    const t = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      cleanup();
      reject(new Error('Aborted'));
    };
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    signal?.addEventListener('abort', onAbort);
  });
}
