// src/server/services/userHandshakeService.ts
import { db } from '../db/client';
import type { Handshake } from '../../shared/types';

export interface HandshakeInput {
  slug: string;
  title: string;
  description?: string;
  expires_at?: string | null;
}



export interface Submission {
  submission_id: number;
  submitted_at: string;
  responses: { request_id: number; label: string; value: string }[];
}

export async function listHandshakes(
  userId: number,
  archivedFilter: 'false' | 'true' | 'all' = 'false'
): Promise<Handshake[]> {
  const sql = `
    SELECT id, slug, title, description, created_at, expires_at, user_id, updated_at, archived
    FROM handshakes
    WHERE user_id = $1
      AND ($2 = 'all' OR archived = ($2::boolean))
    ORDER BY created_at DESC
  `;
  const result = await db.query<Handshake>(sql, [userId, archivedFilter]);
  return result.rows;
}

export async function createHandshake(userId: number, data: HandshakeInput): Promise<Handshake> {
  const result = await db.query<Handshake>(
    `INSERT INTO handshakes (user_id, slug, title, description, created_at, expires_at)
     VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *`,
    [userId, data.slug, data.title, data.description || null, data.expires_at || null]
  );
  return result.rows[0];
}

export async function getHandshakeById(userId: number, handshakeId: number): Promise<Handshake | null> {
  const result = await db.query<Handshake>(
    'SELECT * FROM handshakes WHERE id = $1 AND user_id = $2',
    [handshakeId, userId]
  );
  return result.rows[0] || null;
}

export async function updateHandshake(
  userId: number,
  handshakeId: number,
  data: Partial<HandshakeInput>
): Promise<Handshake | null> {
  const result = await db.query<Handshake>(
    `UPDATE handshakes
     SET title = $1, description = $2, expires_at = $3, updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [data.title, data.description || null, data.expires_at || null, handshakeId, userId]
  );
  return result.rows[0] || null;
}

export async function deleteHandshake(userId: number, handshakeId: number): Promise<boolean> {
  const result = await db.query(
    'DELETE FROM handshakes WHERE id = $1 AND user_id = $2',
    [handshakeId, userId]
  ) as any;
  return result.rowCount > 0;
}

export async function countActiveHandshakes(userId: number): Promise<number> {
  const result = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM handshakes
     WHERE user_id = $1 AND archived = FALSE`,
    [userId]
  );
  return parseInt(result.rows[0]?.count ?? '0', 10);
}

export async function setHandshakeArchived(
  userId: number,
  handshakeId: number,
  state: boolean
): Promise<Handshake | null> {
  const sql = `
    UPDATE handshakes
    SET archived = $3,
        updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, slug, title, description, created_at, expires_at, user_id, updated_at, archived
  `;
  const result = await db.query<Handshake>(sql, [handshakeId, userId, state]);
  return result.rows[0] || null;
}

export async function getSubmissionsForHandshake(userId: number, handshakeId: number) {
  // Verify ownership
  const ownerCheck = await db.query(
    `SELECT id FROM handshakes WHERE id = $1 AND user_id = $2`,
    [handshakeId, userId]
  );

  if (ownerCheck.rowCount === 0) return [];

  // Join submissions + responses + requests
  const result = await db.query(
    `
    SELECT
      s.id AS submission_id,
      s.submitted_at,
      r.request_id,
      q.label,
      r.value
    FROM submissions s
    JOIN responses r ON r.submission_id = s.id
    JOIN requests q ON q.id = r.request_id
    WHERE s.handshake_id = $1
    ORDER BY s.submitted_at DESC, r.request_id ASC
    `,
    [handshakeId]
  );

  // Group responses under their submission
  const grouped: Record<number, {
    submission_id: number;
    submitted_at: string;
    responses: { request_id: number; label: string; value: string }[];
  }> = {};

  for (const row of result.rows) {
    const sid = row.submission_id;
    if (!grouped[sid]) {
      grouped[sid] = {
        submission_id: sid,
        submitted_at: row.submitted_at,
        responses: [],
      };
    }
    grouped[sid].responses.push({
      request_id: row.request_id,
      label: row.label,
      value: row.value,
    });
  }

  return Object.values(grouped);
}


