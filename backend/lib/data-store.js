import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;
let mongoClient = null;
let mongoDb = null;
let isConnecting = false;

class DataStore {
  async _ensureConnected() {
    if (isMongoConnected) return;
    if (isConnecting) {
      // Wait a brief moment if another query triggered connection
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
    }
    const uri = process.env.MONGODB_URI;
    if (uri && !mongoDb) {
      isConnecting = true;
      try {
        mongoClient = await MongoClient.connect(uri);
        mongoDb = mongoClient.db();
        isMongoConnected = true;
        console.log('========================================');
        console.log('   CONNECTED SUCCESSFULLY TO MONGODB');
        console.log('========================================');
      } catch (err) {
        console.error('MongoDB connection failed. Falling back to local JSON store.', err);
      } finally {
        isConnecting = false;
      }
    }
  }

  _getFilePath(table) {
    return path.join(DATA_DIR, `${table}.json`);
  }

  _readTable(table) {
    const filePath = this._getFilePath(table);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading database table "${table}":`, e);
      return [];
    }
  }

  _writeTable(table, data) {
    const filePath = this._getFilePath(table);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error(`Error writing database table "${table}":`, e);
      return false;
    }
  }

  // Find multiple records matching query criteria
  async find(table, query = {}) {
    await this._ensureConnected();
    if (isMongoConnected) {
      try {
        return await mongoDb.collection(table).find(query).toArray();
      } catch (err) {
        console.error(`MongoDB find error on table "${table}":`, err);
      }
    }
    const records = this._readTable(table);
    return records.filter((rec) => {
      for (const key in query) {
        if (rec[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Find single record matching query criteria
  async findOne(table, query = {}) {
    await this._ensureConnected();
    if (isMongoConnected) {
      try {
        return await mongoDb.collection(table).findOne(query);
      } catch (err) {
        console.error(`MongoDB findOne error on table "${table}":`, err);
      }
    }
    const records = this._readTable(table);
    return records.find((rec) => {
      for (const key in query) {
        if (rec[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Insert a record into a table
  async insert(table, data) {
    await this._ensureConnected();
    if (isMongoConnected) {
      try {
        const doc = { ...data };
        await mongoDb.collection(table).insertOne(doc);
        return doc;
      } catch (err) {
        console.error(`MongoDB insert error on table "${table}":`, err);
      }
    }
    const records = this._readTable(table);
    const newRecord = { ...data };
    records.push(newRecord);
    this._writeTable(table, records);
    return newRecord;
  }

  // Update records matching a query or direct match
  async update(table, query, updates) {
    await this._ensureConnected();
    if (isMongoConnected) {
      try {
        const result = await mongoDb.collection(table).updateMany(query, { $set: updates });
        return result.modifiedCount;
      } catch (err) {
        console.error(`MongoDB update error on table "${table}":`, err);
      }
    }
    const records = this._readTable(table);
    let updatedCount = 0;
    
    const updatedRecords = records.map((rec) => {
      let matches = true;
      for (const key in query) {
        if (rec[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...rec, ...updates };
      }
      return rec;
    });

    if (updatedCount > 0) {
      this._writeTable(table, updatedRecords);
    }
    return updatedCount;
  }

  // Delete records matching a query
  async delete(table, query) {
    await this._ensureConnected();
    if (isMongoConnected) {
      try {
        const result = await mongoDb.collection(table).deleteMany(query);
        return result.deletedCount;
      } catch (err) {
        console.error(`MongoDB delete error on table "${table}":`, err);
      }
    }
    const records = this._readTable(table);
    const initialLength = records.length;
    const remainingRecords = records.filter((rec) => {
      let matches = true;
      for (const key in query) {
        if (rec[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });

    const deletedCount = initialLength - remainingRecords.length;
    if (deletedCount > 0) {
      this._writeTable(table, remainingRecords);
    }
    return deletedCount;
  }
}

export const db = new DataStore();

// Schedule initial lazy connection attempt on next event tick after dotenv loads
setTimeout(() => db._ensureConnected(), 0);
