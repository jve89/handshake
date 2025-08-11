-- 003_handshakes_add_archived.sql
-- Purpose: add 'archived' flag to handshakes + index (Option A: public unchanged)

-- UP
ALTER TABLE handshakes
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_handshakes_archived ON handshakes (archived);

-- DOWN
DROP INDEX IF EXISTS idx_handshakes_archived;
ALTER TABLE handshakes
  DROP COLUMN IF EXISTS archived;
