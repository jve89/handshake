import { db } from "../db/client";

export interface SubmissionRow {
  submission_id: number;
  submitted_at: string;
  request_id: number;
  label: string;
  value: string;
}

export interface Submission {
  submission_id: number;
  submitted_at: string;
  responses: { request_id: number; label: string; value: string }[];
}

function group(rows: SubmissionRow[]): Submission[] {
  const map = new Map<number, Submission>();
  for (const row of rows) {
    let s = map.get(row.submission_id);
    if (!s) {
      s = {
        submission_id: row.submission_id,
        submitted_at: row.submitted_at,
        responses: [],
      };
      map.set(row.submission_id, s);
    }
    s.responses.push({
      request_id: row.request_id,
      label: row.label,
      value: row.value,
    });
  }
  return Array.from(map.values());
}

export async function listByHandshake(
  handshakeId: number,
  limit = 100,
  offset = 0,
): Promise<Submission[]> {
  const q = await db.query<SubmissionRow>(
    `
    SELECT s.id AS submission_id, s.submitted_at, r.request_id, q.label, r.value
      FROM submissions s
      JOIN responses r ON r.submission_id = s.id
      JOIN requests  q ON q.id = r.request_id
     WHERE s.handshake_id = $1
     ORDER BY s.submitted_at DESC, r.request_id ASC
     LIMIT $2 OFFSET $3
    `,
    [handshakeId, limit, offset],
  );
  return group(q.rows);
}

export async function getSubmission(
  submissionId: number,
): Promise<Submission | null> {
  const q = await db.query<SubmissionRow>(
    `
    SELECT s.id AS submission_id, s.submitted_at, r.request_id, q.label, r.value, s.handshake_id
      FROM submissions s
      JOIN responses r ON r.submission_id = s.id
      JOIN requests  q ON q.id = r.request_id
     WHERE s.id = $1
     ORDER BY r.request_id ASC
    `,
    [submissionId],
  );
  const list = group(q.rows);
  return list[0] ?? null;
}

export async function getSubmissionHandshakeId(
  submissionId: number,
): Promise<number | null> {
  const r = await db.query<{ handshake_id: number }>(
    `SELECT handshake_id FROM submissions WHERE id = $1`,
    [submissionId],
  );
  return r.rowCount ? r.rows[0].handshake_id : null;
}
