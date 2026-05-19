/**
 * Case transfer relay — phone↔desktop (or any device↔device) via Supabase
 * as a transient encrypted-blob storage. NeuroWiki the app never sees the
 * cleartext on the server; Supabase only holds opaque ciphertext briefly.
 *
 * Flow:
 *   1. Sender: pick 4-digit PIN, encryptWithPin(cases, PIN), generate 6-digit
 *      transfer code, INSERT { token, ciphertext, expires_at = now + 15m }
 *   2. Receiver: enter 6-digit code, SELECT WHERE token = code, immediately
 *      DELETE the row (one-time read), prompt for PIN, decryptWithPin.
 *
 * Security envelope:
 *   - Token is the lookup identifier, NOT the encryption key
 *   - PIN never reaches the server
 *   - 15-minute TTL + one-time-read = short exposure window
 *   - Supabase RLS allows anonymous insert/select/delete; "knowing the token
 *     = authorization" is the model. PIN is the second factor.
 */

import { getSupabase } from '../supabase';
import { encryptWithPin, decryptWithPin, generateTransferCode } from '../crypto/caseCipher';
import type { SavedCase } from './types';

const TRANSFER_TTL_MINUTES = 15;

export interface TransferCreateResult {
  /** 6-digit code the user shares with the receiver. */
  code: string;
  /** ISO timestamp when the row expires + is purged. */
  expiresAt: string;
}

/** Encrypt the cases payload with PIN and POST to Supabase. Returns the code. */
export async function createTransfer(
  cases: SavedCase[],
  pin: string,
): Promise<TransferCreateResult> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Sync is not configured on this device.');
  }
  const payload = { cases, createdAt: Date.now(), version: 1 };
  const ciphertext = await encryptWithPin(payload, pin);
  const code = generateTransferCode();
  const expiresAt = new Date(Date.now() + TRANSFER_TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabase.from('transfers').insert({
    token: code,
    ciphertext,
    expires_at: expiresAt,
  });

  if (error) {
    // Token collision — extremely rare with 10^6 possibilities. Retry once.
    if (error.code === '23505') {
      return createTransfer(cases, pin);
    }
    throw new Error(`Could not create transfer: ${error.message}`);
  }

  return { code, expiresAt };
}

/** Fetch + delete a transfer by code, then decrypt with PIN. Returns cases. */
export async function fetchTransfer(
  code: string,
  pin: string,
): Promise<{ cases: SavedCase[] }> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Sync is not configured on this device.');
  }

  // First: fetch the row
  const { data, error } = await supabase
    .from('transfers')
    .select('ciphertext, expires_at')
    .eq('token', code)
    .single();

  if (error || !data) {
    throw new Error('Transfer code not found or already used.');
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    // Expired — clean up + report
    await supabase.from('transfers').delete().eq('token', code);
    throw new Error('Transfer expired. Ask the sender to start over.');
  }

  // Second: one-time read — delete the row immediately on successful fetch.
  // We delete BEFORE decryption so a wrong-PIN attempt still consumes the
  // transfer. This is intentional: prevents PIN brute force against the
  // ciphertext via repeated server fetches.
  await supabase.from('transfers').delete().eq('token', code);

  // Third: decrypt client-side with PIN
  const payload = await decryptWithPin<{ cases: SavedCase[]; version: number }>(
    data.ciphertext,
    pin,
  );

  if (!payload.cases || !Array.isArray(payload.cases)) {
    throw new Error('Transfer payload is invalid.');
  }

  return { cases: payload.cases };
}

/** TTL in minutes — exported for UI display. */
export const TRANSFER_TTL_MIN = TRANSFER_TTL_MINUTES;
