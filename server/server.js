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
// In production the frontend is served from Netlify.
// Set FRONTEND_URL in the Render environment dashboard to your Netlify site URL.
// e.g.  FRONTEND_URL=https://college-dhundo.netlify.app
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Production Netlify URL (set in Render env vars)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (e.g. curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
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