/**
 * Database Backup Utility for CityConnect
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
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

async function performBackup() {
  console.log('=== STARTING DATABASE BACKUP ===');
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cityconnect';

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB for backup.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.db.databaseName,
      collections: {}
    };

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const documents = await mongoose.connection.db.collection(colName).find({}).toArray();
      backupData.collections[colName] = documents;
      console.log(`  - Exported collection "${colName}": ${documents.length} records`);
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupsDir, `cityconnect_backup_${timestampStr}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    console.log(`\n🎉 Backup successfully saved to: ${backupFilePath}`);
  } catch (error) {
    console.error('✕ Backup failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from database.');
  }
}

performBackup();
