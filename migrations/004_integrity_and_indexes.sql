BEGIN;

WITH dups AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY submission_id, request_id ORDER BY id) AS rn
  FROM responses
)
DELETE FROM responses r
USING dups d
WHERE r.id = d.id AND d.rn > 1;

ALTER TABLE requests     ALTER COLUMN handshake_id SET NOT NULL;
ALTER TABLE submissions  ALTER COLUMN handshake_id SET NOT NULL;
ALTER TABLE responses    ALTER COLUMN submission_id SET NOT NULL;
ALTER TABLE responses    ALTER COLUMN request_id SET NOT NULL;

ALTER TABLE responses
  ADD CONSTRAINT responses_unique_per_request_per_submission
  UNIQUE (submission_id, request_id);

CREATE INDEX IF NOT EXISTS idx_requests_handshake_id     ON requests(handshake_id);
CREATE INDEX IF NOT EXISTS idx_submissions_handshake_id  ON submissions(handshake_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at  ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_responses_submission_id   ON responses(submission_id);
CREATE INDEX IF NOT EXISTS idx_responses_request_id      ON responses(request_id);

ALTER TABLE handshakes
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN expires_at TYPE timestamptz USING expires_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
ALTER TABLE submissions
  ALTER COLUMN submitted_at TYPE timestamptz USING submitted_at AT TIME ZONE 'UTC';

ALTER TABLE handshakes  ALTER COLUMN created_at  SET DEFAULT now();
ALTER TABLE submissions ALTER COLUMN submitted_at SET DEFAULT now();

COMMIT;
