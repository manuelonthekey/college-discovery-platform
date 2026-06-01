import dns from 'dns';
// 🛠️ THE DNS PATCH: Force Node to use Cloudflare & Google DNS to resolve MongoDB maps
dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import College from '../models/College.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚨 FOR FORCE-TESTING ONLY: Paste your actual string inside the quotes below
const HARDCODED_URI = "mongodb+srv://collegeDiscovery:1234567890@collegediscovery.lmuoeno.mongodb.net/collegeDB?retryWrites=true&w=majority";

const seedData = async () => {
  try {
    console.log('⏳ Connecting directly to MongoDB Atlas...');
    
    // We are forcing Mongoose to use the direct string variable here
    await mongoose.connect(HARDCODED_URI);
    console.log('🍃 Database connected safely.');

    const jsonPath = path.join(__dirname, 'mockColleges.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const colleges = JSON.parse(rawData);

    console.log('🧹 Cleaning existing college records...');
    await College.deleteMany();

    console.log(`🚀 Injecting ${colleges.length} colleges into MongoDB...`);
    await College.insertMany(colleges);

    console.log('✅ Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error during data seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();