// src/server/routes/inbox.ts
import { Router } from 'express';

const router = Router();

// Minimal placeholder endpoint so the mount works
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'inbox alive' });
});

export default router;
