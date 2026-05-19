/**
 * Symmetric encryption for case-transfer payloads.
 *
 * Algorithm: AES-256-GCM via the native SubtleCrypto API (no external deps).
 *   - Key derivation: PBKDF2 with 250,000 iterations, SHA-256, 32-byte output
 *   - Salt: 16 random bytes, prepended to ciphertext
 *   - IV (nonce): 12 random bytes, prepended after salt
 *   - Ciphertext format: base64(salt[16] | iv[12] | gcmCiphertext)
 *
 * The PIN is the user's 4-digit choice. The 6-digit transfer token is NOT the
 * key (it's the lookup identifier on Supabase). An attacker who steals the
 * Supabase row still needs the PIN to decrypt — and the PIN never reaches the
 * server.
 *
 * PBKDF2 250k iterations is OWASP-recommended for SHA-256 (2023). Slow enough
 * to make 4-digit brute force unattractive without making single decrypts
 * feel sluggish (target: ~150ms on a mid-tier phone).
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;

/** Derive an AES-GCM key from a PIN + salt. */
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Encrypt a JSON-serializable payload with a PIN. Returns base64 ciphertext. */
export async function encryptWithPin(payload: unknown, pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(pin, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  );
  // Concatenate salt | iv | ciphertext, then base64
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
  return bytesToBase64(combined);
}

/** Decrypt a base64 ciphertext with a PIN. Throws on wrong PIN / corrupted data. */
export async function decryptWithPin<T = unknown>(b64: string, pin: string): Promise<T> {
  const combined = base64ToBytes(b64);
  if (combined.length < SALT_LEN + IV_LEN + 16) {
    throw new Error('Ciphertext too short');
  }
  const salt = combined.slice(0, SALT_LEN);
  const iv = combined.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ciphertext = combined.slice(SALT_LEN + IV_LEN);
  const key = await deriveKey(pin, salt);
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    );
    const json = new TextDecoder().decode(plaintext);
    return JSON.parse(json) as T;
  } catch {
    throw new Error('Wrong PIN or corrupted transfer.');
  }
}

/** Generate a 6-digit transfer code as a string with leading zeros preserved. */
export function generateTransferCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1_000_000).padStart(6, '0');
}

// ─── base64 helpers (Uint8Array <-> base64 string) ───────────────────────────

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
