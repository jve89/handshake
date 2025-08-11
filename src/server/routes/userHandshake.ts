import { Router } from 'express';
import authMiddleware, { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getSubmissionsForHandshake } from '../services/userHandshakeService';
import { Response } from 'express';
import {
  listHandshakes,
  createHandshake,
  getHandshakeById,
  updateHandshake,
  deleteHandshake,
  setHandshakeArchived,
} from '../services/userHandshakeService';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = (req.query.archived as string) || 'false';
    const archivedFilter: 'false' | 'true' | 'all' =
      (['false', 'true', 'all'].includes(raw) ? raw : 'false') as any;

    const handshakes = await listHandshakes(req.user!.id, archivedFilter);
    res.json({ handshakes });
  } catch (err) {
    console.error('Error fetching handshakes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug, title, description, expires_at } = req.body;
    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    const handshake = await createHandshake(req.user!.id, { slug, title, description, expires_at });
    res.status(201).json({ handshake });
  } catch (err) {
    console.error('Error creating handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const handshakeId = Number(req.params.id);
    const handshake = await getHandshakeById(req.user!.id, handshakeId);
    if (!handshake) {
      return res.status(404).json({ error: 'Handshake not found' });
    }
    res.json({ handshake });
  } catch (err) {
    console.error('Error fetching handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const handshakeId = Number(req.params.id);
    const { title, description, expires_at } = req.body;
    const handshake = await updateHandshake(req.user!.id, handshakeId, { title, description, expires_at });
    if (!handshake) {
      return res.status(404).json({ error: 'Handshake not found or no permission' });
    }
    res.json({ handshake });
  } catch (err) {
    console.error('Error updating handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const handshakeId = Number(req.params.id);
    const success = await deleteHandshake(req.user!.id, handshakeId);
    if (!success) {
      return res.status(404).json({ error: 'Handshake not found or no permission' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:id/submissions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const handshakeId = Number(req.params.id);
    const userId = req.user!.id;

    const submissions = await getSubmissionsForHandshake(userId, handshakeId);
    res.json({ submissions });
  } catch (err) {
    console.error('Error loading submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/archive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const handshakeId = Number(req.params.id);
    if (!Number.isInteger(handshakeId)) {
      return res.status(400).json({ error: 'bad_id' });
    }
    const handshake = await setHandshakeArchived(req.user!.id, handshakeId, true);
    if (!handshake) return res.status(404).json({ error: 'Handshake not found or no permission' });
    res.json({ handshake });
  } catch (err) {
    console.error('Error archiving handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/unarchive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const handshakeId = Number(req.params.id);
    if (!Number.isInteger(handshakeId)) {
      return res.status(400).json({ error: 'bad_id' });
    }
    const handshake = await setHandshakeArchived(req.user!.id, handshakeId, false);
    if (!handshake) return res.status(404).json({ error: 'Handshake not found or no permission' });
    res.json({ handshake });
  } catch (err) {
    console.error('Error unarchiving handshake:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
