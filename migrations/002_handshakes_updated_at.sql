-- 002_handshakes_updated_at.sql
-- Add updated_at to handshakes (app already writes to it on update)

ALTER TABLE public.handshakes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

-- Backfill so existing rows are non-null
UPDATE public.handshakes
SET updated_at = NOW()
WHERE updated_at IS NULL;
