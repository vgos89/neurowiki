/**
 * IndexedDB store for saved cases (Flavor 1 — on-device memory).
 *
 * Why IndexedDB instead of localStorage:
 *   - 50+ MB capacity vs ~5 MB
 *   - Async access (doesn't block main thread)
 *   - Structured storage with indexes (we index by createdAt for fast list)
 *
 * Database: 'neurowiki', store: 'cases', keyPath: 'id'.
 * Indexes: createdAt (for list ordering).
 *
 * All operations return Promises. Errors are surfaced; never silently swallowed.
 */

import type { SavedCase } from './types';

const DB_NAME = 'neurowiki';
const DB_VERSION = 1;
const STORE_NAME = 'cases';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB upgrade blocked; close other tabs.'));
  });
}

/** List all saved cases, newest first. */
export async function listCases(): Promise<SavedCase[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const cases = (req.result as SavedCase[]).sort((a, b) => b.createdAt - a.createdAt);
      resolve(cases);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Get a single case by id, or null if not found. */
export async function getCase(id: string): Promise<SavedCase | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as SavedCase) ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Save a new case or overwrite an existing one. */
export async function saveCase(c: SavedCase): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(c);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Delete a single case by id. */
export async function deleteCase(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Delete all cases (used by "Clear all" in the Cases UI). */
export async function clearAllCases(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Generate a UUID v4 for a new case id. Uses crypto.randomUUID where available. */
export function newCaseId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
