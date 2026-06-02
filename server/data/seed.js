import dns from 'dns';
// 🛠️ THE DNS PATCH: Force Node to use Cloudflare & Google DNS to resolve MongoDB maps
dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import College from '../models/College.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚨 FOR FORCE-TESTING ONLY: Paste your actual string inside the quotes below
const FALLBACK_URI = "mongodb+srv://collegeDiscovery:1234567890@collegediscovery.lmuoeno.mongodb.net/collegeDB?retryWrites=true&w=majority";
const MONGODB_URI = process.env.MONGODB_URI || FALLBACK_URI;

const seedData = async () => {
  try {
    console.log('⏳ Connecting directly to MongoDB Atlas...');
    
    // We are forcing Mongoose to use the URI from environment or fallback
    await mongoose.connect(MONGODB_URI);
    console.log('🍃 Database connected safely.');

    const jsonPath = path.join(__dirname, 'college_dataset.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const colleges = JSON.parse(rawData);

    // 🖼️ Merge images from the separate college_images.json file
    const imagesPath = path.join(__dirname, 'college_images.json');
    if (fs.existsSync(imagesPath)) {
      const imagesRaw = fs.readFileSync(imagesPath, 'utf-8');
      const imagesData = JSON.parse(imagesRaw);
      
      console.log('⏳ Resolving Wikipedia/Wikimedia Commons image URLs to raw CDN links...');
      
      const resolveWikiUrl = (url) => {
        return new Promise((resolve) => {
          if (!url.includes('wikipedia.org/wiki/File:') && !url.includes('wikimedia.org/wiki/File:')) {
            // Keep non-wiki URLs as-is
            return resolve(url);
          }
          
          const options = {
            headers: {
              'User-Agent': 'CollegeDiscoveryPlatform/1.0 (contact@example.com)'
            }
          };
          
          const req = https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
              console.log(` ⚠️ Failed to resolve URL: ${url} => Status: ${res.statusCode}`);
              return resolve(null); // Filter out broken/404 URLs
            }
            
            let html = '';
            res.on('data', (chunk) => {
              html += chunk;
            });
            
            res.on('end', () => {
              const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
              if (ogImageMatch && ogImageMatch[1]) {
                resolve(ogImageMatch[1]);
              } else {
                resolve(null);
              }
            });
          });
          
          req.on('error', () => {
            resolve(null);
          });
        });
      };
      
      // Batch resolve logic to prevent overwhelming Wikipedia or memory limits
      const resolvedCollegesImages = {};
      const batchSize = 10;
      
      const fallbackCampusImages = [
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'
      ];
      
      for (let i = 0; i < imagesData.length; i += batchSize) {
        const batch = imagesData.slice(i, i + batchSize);
        console.log(` 📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imagesData.length / batchSize)}...`);
        
        await Promise.all(batch.map(async (item) => {
          const processedAssets = [];
          if (item.imageAssets && item.imageAssets.length > 0) {
            let campusCount = 0;
            for (const asset of item.imageAssets) {
              const resolvedUrl = await resolveWikiUrl(asset.url);
              if (resolvedUrl) {
                processedAssets.push({ type: asset.type, url: resolvedUrl });
              } else if (asset.type === 'campus') {
                // Calculate a consistent fallback image index using college ID and count
                const idNum = parseInt(item.id.replace(/[^0-9]/g, '')) || 0;
                const fallbackIndex = (idNum + campusCount) % fallbackCampusImages.length;
                processedAssets.push({ type: 'campus', url: fallbackCampusImages[fallbackIndex] });
                campusCount++;
              }
            }
          }
          resolvedCollegesImages[item.id] = processedAssets;
        }));
        
        // Short pause between batches to be polite to Wikipedia servers
        await new Promise(r => setTimeout(r, 100));
      }
      
      let matched = 0;
      let totalResolvedImages = 0;
      colleges.forEach((college) => {
        const assets = resolvedCollegesImages[college.id];
        if (assets && assets.length > 0) {
          college.imageAssets = assets;
          matched++;
          totalResolvedImages += assets.length;
        }
      });
      console.log(`🖼️  Successfully resolved and merged ${totalResolvedImages} working image(s) for ${matched} colleges.`);
    } else {
      console.log('ℹ️  No college_images.json found — skipping image merge.');
    }

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