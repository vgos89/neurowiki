-- =========================================================================
-- 0001_transfers_symmetric.sql  (DOC-OF-RECORD + rollback path)
-- =========================================================================
-- This migration documents the pre-Option-Q Supabase `transfers` table
-- state that lived only in the Supabase dashboard until 2026-05-19. The
-- security baseline review (docs/reviews/security-PR-baseline-2026-05-19.md
-- Finding F4) flagged RLS-not-in-repo as a blocking issue for the next
-- security review. This file closes that gap retroactively.
--
-- Apply this file if you ever need to roll back 0002 (Option Q) — it
-- recreates the symmetric PIN+code schema that the original PBKDF2 +
-- AES-256-GCM flow used.
-- =========================================================================

BEGIN;

DROP TABLE IF EXISTS public.transfers CASCADE;

-- Pre-Option-Q symmetric model.
--   token       — 6-digit lookup code (PRIMARY KEY).
--   ciphertext  — base64(salt[16] || iv[12] || gcm_ciphertext). Required.
--                 Encryption key is PBKDF2(PIN, salt, 250k iterations);
--                 PIN never crosses the wire.
--   expires_at  — Hard TTL (15 minutes from INSERT).
--   created_at  — Audit timestamp.
CREATE TABLE public.transfers (
  token       TEXT PRIMARY KEY,
  ciphertext  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX transfers_expires_at_idx ON public.transfers (expires_at);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- INSERT — sender uploads encrypted blob.
CREATE POLICY "anon_insert_transfer" ON public.transfers
  FOR INSERT TO anon
  WITH CHECK (
        length(token) = 6
    AND token ~ '^[0-9]{6}$'
    AND ciphertext IS NOT NULL
    AND length(ciphertext) > 0
    AND expires_at > now()
    AND expires_at < now() + interval '20 minutes'
  );

-- SELECT — receiver reads by token.
CREATE POLICY "anon_select_by_token" ON public.transfers
  FOR SELECT TO anon
  USING (expires_at > now());

-- DELETE — receiver one-time-reads (delete on successful fetch).
CREATE POLICY "anon_delete_after_read" ON public.transfers
  FOR DELETE TO anon
  USING (true);

-- No UPDATE policy — symmetric model has no legitimate update path.

COMMIT;
