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

// Internal type reflecting DB row with options as string|null
interface RequestRow {
  id: number;
  handshake_id: number;
  label: string;
  type: 'text' | 'email' | 'select' | 'file';
  required: boolean;
  options: string | null;
}

// Helper to parse DB rows into HandshakeRequest objects
function parseRow(row: RequestRow): HandshakeRequest {
  return {
    ...row,
    options: row.options ? JSON.parse(row.options) : undefined,
  };
}

// List all requests belonging to a handshake owned by user
export async function listRequests(userId: number, handshakeId: number): Promise<HandshakeRequest[]> {
  const result = await db.query<RequestRow>(
    `SELECT r.id, r.handshake_id, r.label, r.type, r.required, r.options
     FROM requests r
     JOIN handshakes h ON r.handshake_id = h.id
     WHERE r.handshake_id = $1 AND h.user_id = $2
     ORDER BY r.id`,
    [handshakeId, userId]
  );

  return result.rows.map(parseRow);
}

// Create new request for handshake owned by user
export async function createRequest(userId: number, handshakeId: number, data: RequestInput): Promise<HandshakeRequest> {
  const handshakeCheck = await db.query(
    'SELECT id FROM handshakes WHERE id = $1 AND user_id = $2',
    [handshakeId, userId]
  );
  if (handshakeCheck.rowCount === 0) throw new Error('Unauthorized or handshake not found');

  const optionsJson = data.options ? JSON.stringify(data.options) : null;
  const result = await db.query<RequestRow>(
    `INSERT INTO requests (handshake_id, label, type, required, options)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [handshakeId, data.label, data.type, data.required, optionsJson]
  );

  return parseRow(result.rows[0]);
}

// Update request if it belongs to handshake owned by user
export async function updateRequest(userId: number, requestId: number, data: Partial<RequestInput>): Promise<HandshakeRequest | null> {
  const existingResult = await db.query<RequestRow & { user_id: number }>(
    `SELECT r.*, h.user_id FROM requests r
     JOIN handshakes h ON r.handshake_id = h.id
     WHERE r.id = $1 AND h.user_id = $2`,
    [requestId, userId]
  );
  if (existingResult.rowCount === 0) return null;

  const existing = existingResult.rows[0];

  const label = data.label ?? existing.label;
  const type = data.type ?? existing.type;
  const required = data.required ?? existing.required;
  const options = data.options !== undefined ? JSON.stringify(data.options) : existing.options;

  const updateResult = await db.query<RequestRow>(
    `UPDATE requests
     SET label = $1, type = $2, required = $3, options = $4
     WHERE id = $5
     RETURNING *`,
    [label, type, required, options, requestId]
  );

  return parseRow(updateResult.rows[0]);
}

// Delete request - simple delete as you prefer
export async function deleteRequest(requestId: number): Promise<boolean> {
  const result = await db.query(
    'DELETE FROM requests WHERE id = $1',
    [requestId]
  ) as any;

  return result.rowCount > 0;
}
