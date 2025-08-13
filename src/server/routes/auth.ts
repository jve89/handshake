// src/server/routes/auth.ts
import { Router } from 'express';
import { signup, login, logout, getMe } from '../services/authService';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/register', signup);   // ← add this line (alias)
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
