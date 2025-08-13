// src/server/index.ts
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
import outboxInboxTokenRoutes from './routes/outboxInboxToken';
import billingRoutes, { billingWebhook } from './routes/billing';

dotenv.config();

function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return path.dirname(__filename);
}

// @ts-ignore
const __dirname = getDirname(import.meta.url);

const app = express();

/**
 * Stripe webhook MUST receive raw body.
 * Mount BEFORE json parser.
 */
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhook);

// JSON parser for the rest of the API
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
app.use('/api/outbox/handshakes', outboxInboxTokenRoutes);

// New route for issuing inbox tokens
app.use('/api/inbox', inboxRoutes);

// Billing (Checkout session)
app.use('/api/billing', billingRoutes);

// Public file access
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// =========================
// Serve Vite frontend build
// =========================
const distPath = path.join(__dirname, '../../dist/client');
app.use(express.static(distPath));

// SPA fallback — must come last (after all API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Boot server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
