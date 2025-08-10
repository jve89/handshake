// src/server/routes/inbox.ts
import { Router, Request, Response } from 'express';
import inboxToken from '../middleware/inboxToken';
import { listByHandshake, getSubmission, getSubmissionHandshakeId } from '../services/inboxService';

const router = Router();

/** Health (public) */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'inbox alive' });
});

/** All endpoints below require a valid inbox token */
router.use(inboxToken);

/** GET /api/inbox/submissions
 *  If token has receiverId (future use), list by receiver.
 *  Else if token scoped to handshake, list by handshake.
 */
router.get('/submissions', async (req: Request, res: Response) => {
  const scope = req.inbox!;
  if (scope.handshakeId) {
    const items = await listByHandshake(scope.handshakeId);
    return res.json({ submissions: items });
  }
  // Future: receiverId listing
  return res.status(403).json({ error: 'Token scope not supported for this endpoint' });
});

/** GET /api/inbox/handshakes/:handshakeId/submissions */
router.get('/handshakes/:handshakeId/submissions', async (req: Request, res: Response) => {
  const scope = req.inbox!;
  const handshakeId = Number(req.params.handshakeId);
  if (!Number.isFinite(handshakeId)) return res.status(400).json({ error: 'Invalid handshakeId' });
  if (scope.handshakeId !== handshakeId) return res.status(403).json({ error: 'Token not scoped to this handshake' });

  const items = await listByHandshake(handshakeId);
  res.json({ submissions: items });
});

/** GET /api/inbox/submissions/:submissionId */
router.get('/submissions/:submissionId', async (req: Request, res: Response) => {
  const scope = req.inbox!;
  const submissionId = Number(req.params.submissionId);
  if (!Number.isFinite(submissionId)) return res.status(400).json({ error: 'Invalid submissionId' });

  // Ensure submission belongs to the token's handshake scope
  if (scope.handshakeId) {
    const hid = await getSubmissionHandshakeId(submissionId);
    if (!hid) return res.status(404).json({ error: 'Not found' });
    if (hid !== scope.handshakeId) return res.status(403).json({ error: 'Token not scoped for this submission' });
  }

  const sub = await getSubmission(submissionId);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  res.json({ submission: sub });
});

export default router;
