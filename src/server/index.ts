import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import handshakeRoutes from './routes/handshake';
import uploadRoutes from './routes/uploads';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/health', (_, res) => res.send({ status: 'ok' }));
app.use('/api/handshake', handshakeRoutes); 

// after express.json()
app.use('/api', uploadRoutes);

// also serve static uploads publicly
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
