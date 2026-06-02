import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import collegeRoutes from './routes/collegeRoutes.js';

dotenv.config();

// DNS patch: Force Node to use Cloudflare & Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allows localhost for development and any Netlify deployment for production.
// Optionally set FRONTEND_URL in Render env vars to lock down to a specific domain.
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isNetlify = origin.endsWith('.netlify.app');
    const isCustomDomain = process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL;

    if (isLocalhost || isNetlify || isCustomDomain) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/colleges', collegeRoutes);

// Health check / root
app.get('/', (req, res) => {
  res.send('🏫 College Discovery Platform API is running smoothly...');
});

// ── Database & Server Boot ────────────────────────────────────────────────────
const FALLBACK_URI = "mongodb+srv://collegeDiscovery:1234567890@collegediscovery.lmuoeno.mongodb.net/collegeDB?retryWrites=true&w=majority";
const MONGODB_URI = process.env.MONGODB_URI || FALLBACK_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('🍃 Connected to MongoDB Cloud Database successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`❌ Database connection failed: ${err.message}`);
    process.exit(1);
  });