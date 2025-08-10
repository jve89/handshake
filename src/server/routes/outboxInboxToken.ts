import { Router, Response } from 'express';
import { db } from '../db/client';
import authMiddleware, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { issueInboxToken } from '../services/tokenService';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

// POST /api/outbox/handshakes/:handshakeId/inbox-token
router.post('/:handshakeId/inbox-token', async (req: AuthenticatedRequest, res: Response) => {
  const handshakeId = Number(req.params.handshakeId);
  if (!Number.isFinite(handshakeId)) return res.status(400).json({ error: 'Invalid handshakeId' });

  // Verify ownership
  const r = await db.query('SELECT id FROM handshakes WHERE id = $1 AND user_id = $2', [handshakeId, req.user!.id]);
  if (r.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });

  const { expires_at } = req.body || {};
  const issued = await issueInboxToken(handshakeId, undefined, expires_at ?? null);
  res.status(201).json({ token: issued.token, handshake_id: issued.handshake_id, expires_at: issued.expires_at });
});

export default router;
