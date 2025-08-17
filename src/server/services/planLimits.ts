// src/server/services/planLimits.ts
import { db } from "../db/client";

/**
 * Plan rules → max active handshakes.
 * MVP:
 *  - 'active' → 3
 *  - anything else (including null) → 1
 */
export function getMaxActiveForStatus(status: string | null): number {
  return status === "active" ? 3 : 1;
}

/**
 * Load user's subscription_status and compute maxActive.
 */
export async function getMaxActiveForUser(userId: number): Promise<number> {
  const result = await db.query<{ subscription_status: string | null }>(
    "SELECT subscription_status FROM users WHERE id = $1",
    [userId],
  );
  const status = result.rowCount ? result.rows[0].subscription_status : null;
  return getMaxActiveForStatus(status);
}
