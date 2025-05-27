
import { AuditLogEntry } from '../types';

let db: IDBDatabase | null = null;
const DB_NAME = 'SafetyCopilotDB';
const DB_VERSION = 1;
const AUDIT_LOG_STORE_NAME = 'auditLogs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      const target = event.target as IDBOpenDBRequest | null;
      console.error('IndexedDB error:', target?.error);
      reject(`Error opening IndexedDB: ${target?.error?.message || 'Unknown error'}`);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = (event.target as IDBOpenDBRequest).result;
      if (!tempDb.objectStoreNames.contains(AUDIT_LOG_STORE_NAME)) {
        const auditLogStore = tempDb.createObjectStore(AUDIT_LOG_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        auditLogStore.createIndex('timestamp', 'timestamp', { unique: false });
        auditLogStore.createIndex('actionType', 'actionType', { unique: false });
      }
      // Future object stores can be added here based on DB_VERSION changes
    };
  });
}

export const dbService = {
  async addAuditLog(entryData: Omit<AuditLogEntry, 'id'>): Promise<number> {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = currentDb.transaction([AUDIT_LOG_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(AUDIT_LOG_STORE_NAME);
      
      // Ensure timestamp is a Date object, as entryData might come from JSON later if state is persisted
      const entryToAdd = { ...entryData, timestamp: new Date(entryData.timestamp) };

      const request = store.add(entryToAdd as AuditLogEntry); // IDB will add 'id'

      request.onsuccess = () => {
        resolve(request.result as number); // Returns the key of the new record
      };

      request.onerror = () => {
        console.error('Error adding audit log:', request.error);
        reject(`Error adding audit log: ${request.error?.message || 'Unknown error'}`);
      };
    });
  },

  async getAllAuditLogs(): Promise<AuditLogEntry[]> {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = currentDb.transaction([AUDIT_LOG_STORE_NAME], 'readonly');
      const store = transaction.objectStore(AUDIT_LOG_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as AuditLogEntry[]);
      };

      request.onerror = () => {
        console.error('Error fetching audit logs:', request.error);
        reject(`Error fetching audit logs: ${request.error?.message || 'Unknown error'}`);
      };
    });
  },

  async clearAuditLogs(): Promise<void> {
    const currentDb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = currentDb.transaction([AUDIT_LOG_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(AUDIT_LOG_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        console.error('Error clearing audit logs:', request.error);
        reject(`Error clearing audit logs: ${request.error?.message || 'Unknown error'}`);
      };
    });
  }
};
