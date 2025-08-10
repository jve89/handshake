import { db } from '../db/client';

export interface RequestInput {
  label: string;
  type: 'text' | 'email' | 'select' | 'file';
  required: boolean;
  options?: string[];
}

export interface HandshakeRequest extends RequestInput {
  id: number;
  handshake_id: number;
}

/**
 * DB row shape: options is text[] | null (NOT JSON)
 */
interface RequestRow {
  id: number;
  handshake_id: number;
  label: string;
  type: 'text' | 'email' | 'select' | 'file';
  required: boolean;
  options: string[] | null;
}

/**
 * Map DB row to API shape
 */
function toModel(row: RequestRow): HandshakeRequest {
  return {
    id: row.id,
    handshake_id: row.handshake_id,
    label: row.label,
    type: row.type,
    required: row.required,
    options: row.options ?? undefined,
  };
}

/**
 * List all requests belonging to a handshake owned by user
 */
export async function listRequests(userId: number, handshakeId: number): Promise<HandshakeRequest[]> {
  const result = await db.query<RequestRow>(
    `SELECT r.id, r.handshake_id, r.label, r.type, r.required, r.options
       FROM requests r
       JOIN handshakes h ON r.handshake_id = h.id
      WHERE r.handshake_id = $1 AND h.user_id = $2
      ORDER BY r.id`,
    [handshakeId, userId]
  );

  return result.rows.map(toModel);
}

/**
 * Create new request for a handshake owned by user
 */
export async function createRequest(
  userId: number,
  handshakeId: number,
  data: RequestInput
): Promise<HandshakeRequest> {
  const handshakeCheck = await db.query(
    'SELECT id FROM handshakes WHERE id = $1 AND user_id = $2',
    [handshakeId, userId]
  );
  if (handshakeCheck.rowCount === 0) throw new Error('Unauthorized or handshake not found');

  // options is text[] | null
  const options = data.options ?? null;

  const result = await db.query<RequestRow>(
    `INSERT INTO requests (handshake_id, label, type, required, options)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, handshake_id, label, type, required, options`,
    [handshakeId, data.label, data.type, data.required, options]
  );

  return toModel(result.rows[0]);
}

/**
 * Update request if it belongs to a handshake owned by user
 */
export async function updateRequest(
  userId: number,
  requestId: number,
  data: Partial<RequestInput>
): Promise<HandshakeRequest | null> {
  const existingResult = await db.query<
    RequestRow & { user_id: number }
  >(
    `SELECT r.id, r.handshake_id, r.label, r.type, r.required, r.options, h.user_id
       FROM requests r
       JOIN handshakes h ON r.handshake_id = h.id
      WHERE r.id = $1 AND h.user_id = $2`,
    [requestId, userId]
  );

  if (existingResult.rowCount === 0) return null;

  const existing = existingResult.rows[0];

  const label = data.label ?? existing.label;
  const type = (data.type as RequestRow['type'] | undefined) ?? existing.type;
  const required = data.required ?? existing.required;
  const options: string[] | null =
    data.options !== undefined ? (data.options ?? null) : existing.options;

  const updateResult = await db.query<RequestRow>(
    `UPDATE requests
        SET label = $1, type = $2, required = $3, options = $4
      WHERE id = $5
      RETURNING id, handshake_id, label, type, required, options`,
    [label, type, required, options, requestId]
  );

  return toModel(updateResult.rows[0]);
}

/**
 * Delete request.
 * If userId is provided, enforce ownership via JOIN.
 * Kept backward-compatible so existing callers (without userId) don’t break.
 * TODO: After router is updated to pass userId, remove the legacy branch.
 */
export async function deleteRequest(requestId: number, userId?: number): Promise<boolean> {
  if (userId !== undefined) {
    // Secure delete: only if the request belongs to a handshake owned by the user
    const result = await db.query(
      `DELETE FROM requests r
        USING handshakes h
       WHERE r.id = $1
         AND r.handshake_id = h.id
         AND h.user_id = $2`,
      [requestId, userId]
    );
    return (result as any).rowCount > 0;
  }

  // Legacy behavior (no ownership check) — will be removed after router update
  const legacy = await db.query(
    'DELETE FROM requests WHERE id = $1',
    [requestId]
  );
  return (legacy as any).rowCount > 0;
}

