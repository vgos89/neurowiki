// HOME_SPEC §1.5.4 — useShowMore hook
// Storage key: neurowiki:home:showMoreExpanded
// Default false; only mutated via the Show more / Show less button.
import { useState } from 'react';

const STORAGE_KEY = 'neurowiki:home:showMoreExpanded';

export function useShowMore(): { isExpanded: boolean; toggle: () => void } {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, String(next));
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[useShowMore]', e);
      }
      return next;
    });
  };

  return { isExpanded, toggle };
}
