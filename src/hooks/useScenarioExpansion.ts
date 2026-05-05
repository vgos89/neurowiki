// HOME_SPEC §1.4.4 — useScenarioExpansion hook
// First-visit auto-expand detected via localStorage:neurowiki:home:hasVisited.
// Subsequent visits open with all scenarios collapsed.
import { useState } from 'react';
import type { Scenario } from '../data/scenarios';

const VISITED_KEY = 'neurowiki:home:hasVisited';

export function useScenarioExpansion(scenarios: Scenario[]): {
  expandedIds: Set<string>;
  toggle: (id: string) => void;
} {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const hasVisited = window.localStorage.getItem(VISITED_KEY) === 'true';
      if (!hasVisited) {
        window.localStorage.setItem(VISITED_KEY, 'true');
        return scenarios[0] ? new Set([scenarios[0].id]) : new Set();
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[useScenarioExpansion]', e);
    }
    return new Set();
  });

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return { expandedIds, toggle };
}
