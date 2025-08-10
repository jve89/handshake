import { db } from '../db/client';
import crypto from 'crypto';

export function generateOpaqueToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex'); // 64 chars
}

export async function issueInboxToken(handshakeId: number, receiverId?: number, expiresAt?: string) {
  const token = generateOpaqueToken();
  const result = await db.query(
    `INSERT INTO inbox_access_tokens (token, handshake_id, receiver_id, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING token, handshake_id, receiver_id, expires_at`,
    [token, handshakeId, receiverId ?? null, expiresAt ?? null]
  );
  return result.rows[0];
}

export async function verifyInboxToken(token: string): Promise<{
  valid: boolean; reason?: string; handshakeId?: number; receiverId?: number;
}> {
  const r = await db.query(
    `SELECT token, handshake_id, receiver_id, expires_at, is_revoked
       FROM inbox_access_tokens
      WHERE token = $1`,
    [token]
  );
  if (r.rowCount === 0) return { valid: false, reason: 'Token not found' };

  const row = r.rows[0];
  if (row.is_revoked) return { valid: false, reason: 'Token revoked' };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { valid: false, reason: 'Token expired' };
  }
  return { valid: true, handshakeId: row.handshake_id ?? undefined, receiverId: row.receiver_id ?? undefined };
}

export async function touchInboxToken(token: string) {
  await db.query(`UPDATE inbox_access_tokens SET last_used_at = NOW() WHERE token = $1`, [token]);
}
