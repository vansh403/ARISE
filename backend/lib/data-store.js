import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DataStore {
  constructor() {
    this.locks = {};
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
  find(table, query = {}) {
    const records = this._readTable(table);
    return records.filter((rec) => {
      for (const key in query) {
        if (rec[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Find single record matching query criteria
  findOne(table, query = {}) {
    const records = this._readTable(table);
    return records.find((rec) => {
      for (const key in query) {
        if (rec[key] !== query[key]) return false;
      }
      return true;
    });
  }

  // Insert a record into a table
  insert(table, data) {
    const records = this._readTable(table);
    const newRecord = { ...data };
    records.push(newRecord);
    this._writeTable(table, records);
    return newRecord;
  }

  // Update records matching a query or direct match
  update(table, query, updates) {
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
  delete(table, query) {
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
