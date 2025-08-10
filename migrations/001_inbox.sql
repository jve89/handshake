-- 1) Receivers (optional identity for inbox viewers)
CREATE TABLE IF NOT EXISTS receivers (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Link submissions -> receiver (nullable; keeps current flow intact)
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS receiver_id INTEGER REFERENCES receivers(id);

CREATE INDEX IF NOT EXISTS idx_submissions_receiver ON submissions(receiver_id);

-- 3) Opaque tokens to grant read-only inbox access
CREATE TABLE IF NOT EXISTS inbox_access_tokens (
  id            SERIAL PRIMARY KEY,
  token         TEXT UNIQUE NOT NULL,                 -- opaque secret
  handshake_id  INTEGER REFERENCES handshakes(id) ON DELETE CASCADE,
  receiver_id   INTEGER REFERENCES receivers(id) ON DELETE SET NULL,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ,
  is_revoked    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_iat_token ON inbox_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_iat_handshake ON inbox_access_tokens(handshake_id);
