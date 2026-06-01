import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import collegeRoutes from './routes/collegeRoutes.js';

// Apply the DNS patch globally to ensure server.js connects flawlessly too
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🔌 Mount API Routes
// This means any URL starting with /api/colleges will be handled by collegeRoutes.js
app.use('/api/colleges', collegeRoutes);

// Base Diagnostic Route
app.get('/', (req, res) => {
  res.send('🏫 College Discovery Platform API is running smoothly...');
});

// Database Connection & Server Bootup
// Using your verified connection string
const MONGODB_URI = "mongodb+srv://collegeDiscovery:1234567890@collegediscovery.lmuoeno.mongodb.net/collegeDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('🍃 Connected to MongoDB Cloud Database successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running in production mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`❌ Database connection failed: ${err.message}`);
  });

/*
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows our server to read JSON bodies in incoming requests

// Health Check Route (To confirm everything is working smoothly)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is up, running, and healthy!',
    timestamp: new Date()
  });
});

// Start the server listening process
app.listen(PORT, () => {
  console.log(`🚀 Mentor Core Engine running in production mode on port: ${PORT}`);
});
*/