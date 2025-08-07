import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import publicHandshakeRoutes from './routes/publicHandshake';
import userHandshakeRoutes from './routes/userHandshake';
import uploadRoutes from './routes/uploads';
import authRoutes from './routes/auth';
import handshakeRequestRoutes from './routes/handshakeRequest';
import { fileURLToPath } from 'url';

dotenv.config();

function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

// @ts-ignore
const __dirname = getDirname(import.meta.url);

const app = express();

app.use(express.json());

app.get('/api/health', (_, res) => res.send({ status: 'ok' }));

// Public handshake routes (no auth)
app.use('/api/handshake', publicHandshakeRoutes);

// User handshake routes (protected internally)
app.use('/api/user-handshake', userHandshakeRoutes);

// Handshake requests routes (protected internally)
app.use('/api/handshakes/:handshakeId/requests', handshakeRequestRoutes);

// Upload routes
app.use('/api', uploadRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Serve static uploads publicly
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
