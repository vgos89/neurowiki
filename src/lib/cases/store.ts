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

// Bug-1 fix (2026-07-01 audit): cache the IDBDatabase handle at the
// module level so repeat calls to openDB() short-circuit after the
// first success. The uncached path is a 30–200 ms round-trip on a
// cold Safari tab and is the primary race window for the NIHSS
// case-load bug where a fast-typing clinician's taps get wholesale-
// overwritten by the async hydration. Caching shrinks that window to
// 1–5 ms per call — enough headroom that the interaction guard in
// NihssCalculator.tsx wins even for the fastest typists.
//
// On a genuine open failure (private-browsing quota, corrupted DB,
// user cleared site data), we reset the cache so a retry can attempt
// fresh. `onclose` and `onversionchange` also clear the cache since
// those signal the handle is no longer usable.
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onclose = () => { dbPromise = null; };
      db.onversionchange = () => { dbPromise = null; db.close(); };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
    req.onblocked = () => {
      dbPromise = null;
      reject(new Error('IndexedDB upgrade blocked; close other tabs.'));
    };
  });
  return dbPromise;
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
