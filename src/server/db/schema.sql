-- Handshake metadata
DROP TABLE IF EXISTS handshakes CASCADE;
CREATE TABLE handshakes (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(32) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP,
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes (match production)
CREATE INDEX IF NOT EXISTS idx_handshakes_archived ON handshakes (archived);

-- Structured requests inside a handshake (e.g. "What's your name?")
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  handshake_id INTEGER REFERENCES handshakes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'file', 'email', 'select')),
  required BOOLEAN DEFAULT false,
  options TEXT[] DEFAULT NULL  -- optional: for dropdowns etc.
);

-- Submissions from public users
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  handshake_id INTEGER REFERENCES handshakes(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Individual field responses linked to a submission
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
  value TEXT NOT NULL
);
