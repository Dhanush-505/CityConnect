/**
 * Database Restore & Disaster Recovery Utility for CityConnect
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const backupsDir = path.join(__dirname, '..', 'backups');

async function performRestore() {
  console.log('=== STARTING DISASTER RECOVERY RESTORE ===');
  const backupFiles = fs.existsSync(backupsDir)
    ? fs.readdirSync(backupsDir).filter((f) => f.endsWith('.json')).sort().reverse()
    : [];

  if (backupFiles.length === 0) {
    console.log('✕ No backup JSON files found in backups/ directory.');
    return;
  }

  const latestBackupFile = path.join(backupsDir, backupFiles[0]);
  console.log(`Reading backup file: ${latestBackupFile}`);

  const backupRaw = fs.readFileSync(latestBackupFile, 'utf-8');
  const backupData = JSON.parse(backupRaw);

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cityconnect';

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB for restoration.');

    for (const [colName, docs] of Object.entries(backupData.collections || {})) {
      if (docs.length > 0) {
        await mongoose.connection.db.collection(colName).deleteMany({});
        await mongoose.connection.db.collection(colName).insertMany(docs);
        console.log(`  ✓ Restored collection "${colName}": ${docs.length} documents.`);
      }
    }

    console.log('\n🎉 Disaster recovery restoration complete!');
  } catch (error) {
    console.error('✕ Restoration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from database.');
  }
}

performRestore();
