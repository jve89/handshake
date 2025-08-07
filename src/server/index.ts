import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import publicHandshakeRoutes from './routes/publicHandshake';
import userHandshakeRoutes from './routes/userHandshake';
import uploadRoutes from './routes/uploads';
import authRoutes from './routes/auth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/health', (_, res) => res.send({ status: 'ok' }));

// Public handshake routes (no auth)
app.use('/api/handshake', publicHandshakeRoutes);

// User handshake routes (protected by authMiddleware internally)
app.use('/api/user-handshake', userHandshakeRoutes);

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
