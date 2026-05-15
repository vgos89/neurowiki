// SearchProvider — global state for the smart search overlay.
// Wraps the app once at Layout level. Exposes open/close + lazy index build.

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { SearchEngine } from '../../lib/search/types';

interface SearchContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  engine: SearchEngine | null;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [engine, setEngine] = useState<SearchEngine | null>(null);

  // Lazy-build the search index on first open. The corpus generator pulls
  // routeManifest + trialData + trial-questions, which sums to ~250 docs
  // and ~30 KB JSON. We don't want that on the initial bundle path.
  useEffect(() => {
    if (!isOpen || engine) return;
    let cancelled = false;
    (async () => {
      const [{ buildEngine }, { buildSearchCorpus }] = await Promise.all([
        import('../../lib/search/engine'),
        import('../../lib/search/buildSearchCorpus'),
      ]);
      if (cancelled) return;
      const corpus = buildSearchCorpus();
      setEngine(buildEngine(corpus));
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, engine]);

  // Global hotkeys: Cmd+K / Ctrl+K opens; "/" opens unless an input has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isModK) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      if (e.key === '/' && !isOpen) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        const isEditable = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const value = useMemo<SearchContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      engine,
    }),
    [isOpen, engine],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>');
  return ctx;
}
