---
name: testing-patterns
description: NeuroWiki Vitest setup, test conventions, calculator scoring test templates, hook test patterns, and coverage targets. Load when writing or reviewing tests, or when quality-assurance runs gates.
---

# Testing Patterns — NeuroWiki

## Setup (shipped Phase 5A — commit 5d84715)

**Framework:** Vitest + @testing-library/react  
**Config:** `vite.config.ts` — `test:` block  
**Test directory:** `src/__tests__/` (co-located strategy for hooks; `__tests__/` for pure logic)  
**Run:** `npm test` (exits 0 = all pass)  
**TypeScript:** `tsc --noEmit` runs before tests in CI; tests must type-check

## File naming

| Type | Pattern | Example |
|---|---|---|
| Scoring logic | `<calculatorName>.test.ts` | `nihss.test.ts` |
| React hook | `<hookName>.test.ts` | `useFavorites.test.ts` |
| Utility | `<utilName>.test.ts` | `strokeDosing.test.ts` |
| Component | `<ComponentName>.test.tsx` | `NihssItemCard.test.tsx` |

## Calculator scoring test template

Every calculator scoring function must have:
1. Zero-score case (all items minimum)
2. Maximum-score case (all items maximum)
3. Known clinical boundary (e.g., severity threshold crossings)
4. Input validation (undefined, null, out-of-range)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateNihss } from '../utils/nihssScoring';

describe('calculateNihss', () => {
  it('returns 0 for all-zero inputs', () => {
    const result = calculateNihss(allZeroItems);
    expect(result.total).toBe(0);
    expect(result.severity).toBe('none');
  });

  it('returns 42 for maximum inputs', () => {
    const result = calculateNihss(allMaxItems);
    expect(result.total).toBe(42);
    expect(result.severity).toBe('severe');
  });

  it('severity boundaries — minor/moderate crossover at 4/5', () => {
    expect(calculateNihss(scoreOf4).severity).toBe('minor');
    expect(calculateNihss(scoreOf5).severity).toBe('moderate');
  });
});
```

## NIHSS severity thresholds (test ground truth)

| Score | Severity |
|---|---|
| 0 | none |
| 1–4 | minor |
| 5–15 | moderate |
| 16–20 | moderate-severe |
| 21–42 | severe |

## Hook test template

```typescript
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../hooks/useFavorites';

describe('useFavorites', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('toggles a trial on and off', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggleFavorite('ninds-trial'));
    expect(result.current.isFavorite('ninds-trial')).toBe(true);
    act(() => result.current.toggleFavorite('ninds-trial'));
    expect(result.current.isFavorite('ninds-trial')).toBe(false);
  });
});
```

## Coverage targets (Phase 5A baseline)

| Surface | Target | Priority |
|---|---|---|
| Calculator scoring (NIHSS, ASPECTS, ICH, ABCD2, GCS) | 70%+ | P1 |
| strokeDosing utility | 80%+ (edge cases: 0-weight, boundary doses) | P1 |
| useRecents hook | 60%+ | P2 |
| useFavorites hook | 60%+ | P2 |
| Clinical scoring boundaries | 100% (all threshold crossings) | P0 |

## What NOT to test

- Tailwind class strings (snapshot tests for CSS are brittle)
- react-router navigation (use integration tests, not unit tests)
- External API calls without mocking (always mock PubMed/ClinicalTrials.gov)
- `trialData.ts` object shapes (TypeScript handles this at compile time)

## Pending (Phase 5B — not yet built)

- Hook tests: `useNavigationSource`, `useBackNavigation`, `useScenarioExpansion`
- Coverage gates in CI (currently runs but no threshold enforced)
- E2E tests (Playwright) — parked until Phase 5B approved
- `npm test` is not yet in the pre-commit hook (by design — too slow)

## Mocking pattern for localStorage

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```
