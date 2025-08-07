// src/server/routes/handshakeRequest.ts

import { Router, Request, Response } from 'express';
import authMiddleware, { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  listRequests,
  createRequest,
  updateRequest,
  deleteRequest,
  RequestInput,
} from '../services/handshakeRequestService';
import { db } from '../db/client';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// Middleware: verify that the handshake belongs to the authenticated user
async function verifyOwnership(req: AuthenticatedRequest, res: Response, next: () => void) {
  const handshakeId = Number(req.params.handshakeId);
  const userId = req.user!.id;

  try {
    const result = await db.query(
      'SELECT id FROM handshakes WHERE id = $1 AND user_id = $2',
      [handshakeId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Forbidden: handshake not owned by user' });
    }
    next();
  } catch (err) {
    console.error('Ownership verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

router.use(verifyOwnership);

// GET /api/handshakes/:handshakeId/requests
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const handshakeId = Number(req.params.handshakeId);

  try {
    const requests = await listRequests(req.user!.id, handshakeId);
    res.json({ requests });
  } catch (err) {
    console.error('Error listing requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/handshakes/:handshakeId/requests
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const handshakeId = Number(req.params.handshakeId);
  const data: RequestInput = req.body;

  if (
    !data.label ||
    !['text', 'email', 'select', 'file'].includes(data.type) ||
    typeof data.required !== 'boolean' ||
    (data.type === 'select' && (!data.options || !Array.isArray(data.options)))
  ) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const newRequest = await createRequest(req.user!.id, handshakeId, data);
    res.status(201).json({ request: newRequest });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/handshakes/:handshakeId/requests/:requestId
router.put('/:requestId', async (req: AuthenticatedRequest, res: Response) => {
  const requestId = Number(req.params.requestId);
  const data: Partial<RequestInput> = req.body;

  if (
    (data.type && !['text', 'email', 'select', 'file'].includes(data.type)) ||
    (data.required !== undefined && typeof data.required !== 'boolean') ||
    (data.options !== undefined && !Array.isArray(data.options))
  ) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const updated = await updateRequest(req.user!.id, requestId, data);
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.json({ request: updated });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/handshakes/:handshakeId/requests/:requestId
router.delete('/:requestId', async (req: AuthenticatedRequest, res: Response) => {
  const requestId = Number(req.params.requestId);

  try {
    const success = await deleteRequest(requestId);
    if (!success) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
