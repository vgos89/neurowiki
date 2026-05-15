// SearchOverlay — the modal that appears when the user opens search.
// Centered dialog on desktop, full-screen sheet on mobile (md: breakpoint).
// Combobox + listbox pattern per WAI-ARIA Authoring Practices Guide.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from './SearchProvider';
import { recordRecentSelection } from '../../lib/search/engine';
import type { SearchHit, SearchKind } from '../../lib/search/types';

const KIND_ORDER: SearchKind[] = ['trial', 'calculator', 'pathway', 'guide', 'question', 'route'];
const KIND_LABEL: Record<SearchKind, string> = {
  trial: 'Trials',
  calculator: 'Calculators',
  pathway: 'Pathways',
  guide: 'Guides',
  question: 'Clinical questions',
  route: 'Other pages',
};
const KIND_BADGE: Record<SearchKind, string> = {
  trial: 'Trial',
  calculator: 'Calc',
  pathway: 'Pathway',
  guide: 'Guide',
  question: 'Question',
  route: 'Page',
};

function groupByKind(hits: SearchHit[]): Array<{ kind: SearchKind; hits: SearchHit[] }> {
  const buckets = new Map<SearchKind, SearchHit[]>();
  for (const hit of hits) {
    const arr = buckets.get(hit.doc.kind) || [];
    arr.push(hit);
    buckets.set(hit.doc.kind, arr);
  }
  return KIND_ORDER
    .filter((k) => buckets.has(k))
    .map((kind) => ({ kind, hits: buckets.get(kind)! }));
}

function highlightMatch(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="bg-neuro-100 text-neuro-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export const SearchOverlay: React.FC = () => {
  const { isOpen, close, engine } = useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Defer focus to after mount + transition
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  // Compute hits
  const hits = (engine && query.trim().length >= 2) ? engine.query(query.trim(), 18) : [];
  const grouped = groupByKind(hits);
  const flatHits: SearchHit[] = grouped.flatMap((g) => g.hits);

  // Keep activeIndex in bounds
  useEffect(() => {
    if (activeIndex >= flatHits.length && flatHits.length > 0) {
      setActiveIndex(flatHits.length - 1);
    } else if (flatHits.length === 0) {
      setActiveIndex(0);
    }
  }, [flatHits.length, activeIndex]);

  const handleSelect = useCallback(
    (hit: SearchHit) => {
      recordRecentSelection(hit.doc.id);
      close();
      navigate(hit.doc.path);
    },
    [close, navigate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, flatHits.length - 1)));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && flatHits[activeIndex]) {
        e.preventDefault();
        handleSelect(flatHits[activeIndex]);
      }
    },
    [activeIndex, close, flatHits, handleSelect],
  );

  // Scroll active row into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector(`[data-search-idx="${activeIndex}"]`);
    if (active && 'scrollIntoView' in active) {
      (active as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, flatHits.length]);

  if (!isOpen) return null;

  const showEmptyHint = query.trim().length < 2;
  const showNoResults = !showEmptyHint && hits.length === 0 && engine !== null;
  const showLoadingHint = !engine;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/50 backdrop-blur-sm px-4 pt-[10vh] md:pt-[12vh]"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Site search"
        className="w-full max-w-[640px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="search-listbox"
            aria-activedescendant={flatHits[activeIndex] ? `search-opt-${activeIndex}` : undefined}
            placeholder="Search trials, calculators, pathways, guides…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          {showLoadingHint && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">Loading search index…</div>
          )}
          {showEmptyHint && engine && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              Type at least 2 characters to search. Try <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">nih</kbd>, <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">tpa</kbd>, or <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">evt</kbd>.
            </div>
          )}
          {showNoResults && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No results for "<span className="text-slate-700 font-medium">{query}</span>". Try a different term or check spelling.
            </div>
          )}
          {hits.length > 0 && (
            <ul ref={listRef} id="search-listbox" role="listbox" className="py-1">
              {grouped.map((group) => (
                <li key={group.kind} role="group" aria-label={KIND_LABEL[group.kind]}>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {KIND_LABEL[group.kind]}
                  </div>
                  <ul>
                    {group.hits.map((hit) => {
                      flatIndex += 1;
                      const isActive = flatIndex === activeIndex;
                      const optionId = `search-opt-${flatIndex}`;
                      return (
                        <li
                          key={hit.doc.id}
                          id={optionId}
                          role="option"
                          aria-selected={isActive}
                          data-search-idx={flatIndex}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => handleSelect(hit)}
                          className={`px-4 py-2 cursor-pointer transition-colors ${
                            isActive ? 'bg-neuro-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-medium text-slate-900 truncate">
                                {highlightMatch(hit.doc.title, hit.matchedTerms)}
                              </div>
                              {hit.doc.subtitle && (
                                <div className="text-[12px] text-slate-500 truncate mt-0.5">
                                  {highlightMatch(hit.doc.subtitle, hit.matchedTerms)}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 flex-shrink-0">
                              {KIND_BADGE[hit.doc.kind]}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with keyboard hints */}
        {hits.length > 0 && (
          <div className="hidden md:flex items-center justify-between px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400 bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-slate-200 rounded text-[10px]">⏎</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-slate-200 rounded text-[10px]">ESC</kbd> close</span>
            </div>
            <div>{hits.length} result{hits.length === 1 ? '' : 's'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
