// HOME_SPEC §1.6.4 — useRecents hook
// Storage key: neurowiki:recents:v1
// Cap 20 stored, return first 5
// Hydrate in useEffect (SSR-safe); subscribe to `storage` events for cross-tab.
import { useCallback, useEffect, useState } from 'react';

export type RecentEntry = {
  id: string;
  type: 'trial' | 'calculator' | 'pathway' | 'guide';
  title: string;
  subtitle: string;
  category: string;
  trail?: string;
  viewedAt: number;
};

const STORAGE_KEY = 'neurowiki:recents:v1';
const MAX_STORED = 20;
const MAX_DISPLAYED = 5;

function readStorage(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentEntry[];
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[useRecents] Failed to read', e);
    return [];
  }
}

function writeStorage(entries: RecentEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[useRecents] Failed to write', e);
  }
}

export function useRecents(): {
  recents: RecentEntry[];
  recordView: (entry: Omit<RecentEntry, 'viewedAt'>) => void;
  clear: () => void;
} {
  // Initial render returns []; hydrate in effect (SSR-safe).
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setEntries(readStorage());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setEntries(readStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const recordView = useCallback(
    (entry: Omit<RecentEntry, 'viewedAt'>) => {
      setEntries((prev) => {
        const now = Date.now();
        const filtered = prev.filter((e) => e.id !== entry.id);
        const next: RecentEntry[] = [{ ...entry, viewedAt: now }, ...filtered]
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, MAX_STORED);
        writeStorage(next);
        return next;
      });
    },
    [],
  );

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[useRecents] Failed to clear', e);
      }
    }
    setEntries([]);
  }, []);

  // Cap at MAX_DISPLAYED for display, sorted newest-first.
  const recents = entries
    .slice()
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, MAX_DISPLAYED);

  return { recents, recordView, clear };
}
