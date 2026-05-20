/**
 * Asymmetric (receiver-initiated) encryption envelope — Option Q (2026-05-19).
 *
 * Replaces the prior PIN-derived symmetric model. Used by the case-transfer
 * relay (`src/lib/cases/transfer.ts`). Composable on `unknown` payloads —
 * future device-pair flows can reuse these primitives without touching
 * cases-specific types.
 *
 * Algorithm:
 *   - ECDH P-256 key agreement (Web Crypto SubtleCrypto, no userland).
 *     Receiver generates `{privateKey, publicKey}`. Sender generates an
 *     ephemeral pair, derives a shared secret with the receiver's public,
 *     and uploads its own public alongside the ciphertext.
 *   - HKDF-SHA256 derives the symmetric AES-GCM-256 key from the ECDH
 *     output. Domain-separated via `info = "neurowiki-case-transfer-v1"`
 *     so a future protocol revision can't share keys with this one.
 *   - AES-256-GCM with a fresh 12-byte IV per encryption.
 *   - Wire encoding: base64url (URL-safe) for keys and ciphertext.
 *
 * Security properties:
 *   - The receiver's private key never leaves the device.
 *   - The server never sees plaintext — it holds ciphertext + ephemeral
 *     public keys (which are public by design).
 *   - An attacker with the lookup token alone cannot decrypt; they would
 *     need to break P-256 ECDH.
 *
 * Architect-review conditions honored (arch-PR-option-q-asymmetric-transfer.md):
 *   #4 wire encoding = base64url + raw key export
 *   #5 HKDF wrap with domain-separated info
 *   #8 primitives generic on `unknown` — cases-aware code lives in transfer.ts
 *   #1 symmetric encryptWithPin / decryptWithPin / generateTransferCode
 *      exports removed in the same commit.
 */

const ECDH_CURVE = 'P-256';
const AES_LEN_BITS = 256;
const IV_LEN_BYTES = 12;
const HKDF_INFO_STRING = 'neurowiki-case-transfer-v1';

// ─── Public API ─────────────────────────────────────────────────────────

export interface ReceiverKeypair {
  /** Held in component state on the receiver device. Never persisted. */
  privateKey: CryptoKey;
  /** Uploaded to Supabase as the public side of the handshake. */
  publicKeyB64Url: string;
}

export interface SenderEnvelope {
  /** base64url(iv[12] || aes-gcm-ciphertext) */
  ciphertextB64Url: string;
  /** base64url(raw P-256 ephemeral public key, 65 bytes) */
  senderPublicKeyB64Url: string;
}

/**
 * Receiver-side: create a fresh ephemeral keypair for a single transfer
 * session. The private key stays in memory; the public key gets uploaded
 * to the relay as part of the session row.
 */
export async function generateReceiverKeypair(): Promise<ReceiverKeypair> {
  const kp = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: ECDH_CURVE },
    true, // extractable so we can export the public side
    ['deriveKey']
  ) as CryptoKeyPair;
  const rawPub = await crypto.subtle.exportKey('raw', kp.publicKey);
  return {
    privateKey: kp.privateKey,
    publicKeyB64Url: bytesToBase64Url(new Uint8Array(rawPub)),
  };
}

/**
 * Sender-side: encrypt a payload destined for the holder of
 * `receiverPublicKeyB64Url`. Generates a fresh ephemeral keypair internally
 * and returns the sender's public key so the receiver can derive the same
 * shared secret.
 */
export async function encryptForReceiver(
  payload: unknown,
  receiverPublicKeyB64Url: string,
): Promise<SenderEnvelope> {
  const receiverPublicKey = await importEcdhPublicKey(receiverPublicKeyB64Url);
  const senderKp = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: ECDH_CURVE },
    true,
    ['deriveKey']
  ) as CryptoKeyPair;
  const aesKey = await deriveAesKeyFromEcdh(senderKp.privateKey, receiverPublicKey);

  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plaintext
  );

  const cipherBytes = new Uint8Array(cipherBuf);
  const combined = new Uint8Array(iv.length + cipherBytes.length);
  combined.set(iv, 0);
  combined.set(cipherBytes, iv.length);

  const senderPubRaw = await crypto.subtle.exportKey('raw', senderKp.publicKey);
  return {
    ciphertextB64Url: bytesToBase64Url(combined),
    senderPublicKeyB64Url: bytesToBase64Url(new Uint8Array(senderPubRaw)),
  };
}

/**
 * Receiver-side: decrypt a payload encrypted by `encryptForReceiver`. Uses
 * the receiver's private key (held in component state) and the sender's
 * ephemeral public key (received from the relay alongside the ciphertext).
 */
export async function decryptAsReceiver<T = unknown>(
  ciphertextB64Url: string,
  senderPublicKeyB64Url: string,
  receiverPrivateKey: CryptoKey,
): Promise<T> {
  const senderPublicKey = await importEcdhPublicKey(senderPublicKeyB64Url);
  const aesKey = await deriveAesKeyFromEcdh(receiverPrivateKey, senderPublicKey);

  const combined = base64UrlToBytes(ciphertextB64Url);
  if (combined.length < IV_LEN_BYTES + 16) {
    throw new Error('Ciphertext too short to be valid.');
  }
  const iv = combined.slice(0, IV_LEN_BYTES);
  const ct = combined.slice(IV_LEN_BYTES);

  let plainBuf: ArrayBuffer;
  try {
    plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ct
    );
  } catch {
    throw new Error('Decryption failed. The transfer may be corrupted or intended for a different device.');
  }
  const json = new TextDecoder().decode(plainBuf);
  return JSON.parse(json) as T;
}

/**
 * Generate a 5-digit transfer code as a zero-padded string. Used by the
 * receiver when creating a new session. Entropy is intentionally modest
 * (~17 bits) — the asymmetric envelope means an attacker with the code
 * alone cannot decrypt; the code is a lookup identifier, not a key.
 */
export function generateTransferCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 100_000).padStart(5, '0');
}

// ─── Internal helpers ───────────────────────────────────────────────────

async function importEcdhPublicKey(b64Url: string): Promise<CryptoKey> {
  const raw = base64UrlToBytes(b64Url);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'ECDH', namedCurve: ECDH_CURVE },
    false,
    [] // public key usage = derive-only, no direct encrypt/decrypt
  );
}

/**
 * ECDH → HKDF → AES-GCM key. Two SubtleCrypto deriveKey calls.
 *
 *   Step 1: ECDH between (own private, peer public) produces an HKDF input
 *           key. We never expose the raw shared secret — SubtleCrypto keeps
 *           it as a non-extractable CryptoKey.
 *   Step 2: HKDF-SHA256 with domain-separated `info` produces the AES-256
 *           key. Empty salt is the standard "no preshared salt" pattern
 *           since both parties contribute fresh ephemeral material to the
 *           shared secret already.
 */
async function deriveAesKeyFromEcdh(
  ownPrivateKey: CryptoKey,
  peerPublicKey: CryptoKey,
): Promise<CryptoKey> {
  // Step 1: ECDH → HKDF base key
  const hkdfBase = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: peerPublicKey },
    ownPrivateKey,
    // The TypeScript lib types don't currently express HKDF as a valid
    // derivedKeyType for deriveKey; the runtime accepts it. Cast through
    // unknown to express the intent without relaxing other types.
    { name: 'HKDF' } as unknown as AesKeyAlgorithm,
    false,
    ['deriveKey']
  );
  // Step 2: HKDF-SHA256 → AES-GCM-256 key (domain-separated by info)
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: new TextEncoder().encode(HKDF_INFO_STRING),
    },
    hkdfBase,
    { name: 'AES-GCM', length: AES_LEN_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── base64url helpers ──────────────────────────────────────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
