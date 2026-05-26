/**
 * useTeachMode — localStorage-backed boolean for the Teach mode toggle.
 *
 * Establishes the NeuroWiki precedent for educational-overlay state on
 * clinician-facing pathways. First consumer: ClinicHeadachePathway.
 *
 * - Default OFF (clinician mode). User opts in to Teach mode explicitly.
 * - Persists per device under localStorage key `nw:teach-mode`.
 * - SSR-safe: returns false when window is undefined.
 * - Cross-tab sync: listens to the `storage` event so toggling in one tab
 *   updates other open tabs.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nw:teach-mode';

function readStored(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useTeachMode(): [boolean, () => void, (next: boolean) => void] {
  const [teachMode, setTeachModeState] = useState<boolean>(readStored);

  // Cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setTeachModeState(e.newValue === '1');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const set = useCallback((next: boolean) => {
    setTeachModeState(next);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      }
    } catch {
      // ignore quota / privacy mode errors
    }
  }, []);

  const toggle = useCallback(() => set(!teachMode), [teachMode, set]);

  return [teachMode, toggle, set];
}
