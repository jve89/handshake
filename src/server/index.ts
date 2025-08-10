import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import publicHandshakeRoutes from './routes/publicHandshake';
import userHandshakeRoutes from './routes/userHandshake';
import uploadRoutes from './routes/uploads';
import authRoutes from './routes/auth';
import handshakeRequestRoutes from './routes/handshakeRequest';
import inboxRoutes from './routes/inbox';

dotenv.config();

function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

// @ts-ignore
const __dirname = getDirname(import.meta.url);

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.send({ status: 'ok' }));

// Public (no-auth) routes
app.use('/api/handshake', publicHandshakeRoutes);

// Protected user routes (existing mounts — unchanged)
app.use('/api/user-handshake', userHandshakeRoutes);
app.use('/api/handshakes/:handshakeId/requests', handshakeRequestRoutes);
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);

// Outbox aliases (additive; old mounts stay)
app.use('/api/outbox/handshakes', userHandshakeRoutes);
app.use('/api/outbox/handshakes/:handshakeId/requests', handshakeRequestRoutes);

// Inbox placeholder (stub only)
app.use('/api/inbox', inboxRoutes);

// Public file access
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Boot server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
