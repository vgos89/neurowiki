// Hand-rolled search engine — no dependency.
// Designed to be drop-in-replaceable by MiniSearch later (consumer code uses
// SearchEngine interface). Sufficient for ~250 docs.
//
// Algorithm:
// 1. Tokenize query → lowercase words ≥2 chars
// 2. For each doc, score = sum over (token × field) of:
//    - exact word match: full points × field weight
//    - prefix match: 0.7 × points × field weight
//    - substring match: 0.4 × points × field weight
// 3. Bonus: × (1 + popularity/200) × recency boost from LRU
// 4. Filter: at least one token must match somewhere
// 5. Sort by score desc, return top N

import type { SearchDoc, SearchEngine, SearchHit } from './types';

const FIELD_WEIGHTS: Record<string, number> = {
  title: 4,
  keywords: 3,
  subtitle: 2,
  body: 1,
};

const RECENT_KEY = 'neurowiki:search:recents';
const RECENT_MAX = 8;

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function fieldText(doc: SearchDoc, field: keyof SearchDoc): string {
  const v = (doc as unknown as Record<string, unknown>)[field];
  if (Array.isArray(v)) return (v as string[]).join(' ');
  if (typeof v === 'string') return v;
  return '';
}

function scoreToken(token: string, fieldText: string, fieldWeight: number): { score: number; matched: boolean } {
  if (!fieldText) return { score: 0, matched: false };
  const lower = fieldText.toLowerCase();
  const words = lower.split(/\s+/);

  // Exact word match (highest)
  if (words.includes(token)) {
    return { score: 1.0 * fieldWeight, matched: true };
  }
  // Prefix match (any word starts with token)
  for (const w of words) {
    if (w.startsWith(token)) {
      return { score: 0.7 * fieldWeight, matched: true };
    }
  }
  // Substring match (token appears anywhere)
  if (lower.includes(token)) {
    return { score: 0.4 * fieldWeight, matched: true };
  }
  return { score: 0, matched: false };
}

function getRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    // ignore
  }
  return [];
}

export function recordRecentSelection(id: string): void {
  try {
    const recents = [id, ...getRecentIds().filter((x) => x !== id)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  } catch {
    // ignore (private browsing, quota, etc.)
  }
}

/**
 * Build a SearchEngine over the given corpus. Index is in-memory and never
 * mutated after construction. O(n) per query, fine for ~250 docs.
 */
export function buildEngine(corpus: SearchDoc[]): SearchEngine {
  const recentIds = new Set(getRecentIds());

  return {
    size: corpus.length,
    query(rawQuery: string, limit = 12): SearchHit[] {
      const tokens = tokenize(rawQuery);
      if (tokens.length === 0) return [];

      const hits: SearchHit[] = [];

      for (const doc of corpus) {
        let totalScore = 0;
        const matchedTerms: string[] = [];
        let anyMatch = false;

        for (const token of tokens) {
          let tokenBest = 0;
          let tokenMatched = false;

          for (const field of ['title', 'keywords', 'subtitle', 'body'] as const) {
            const weight = FIELD_WEIGHTS[field];
            const text = fieldText(doc, field);
            const { score, matched } = scoreToken(token, text, weight);
            if (score > tokenBest) tokenBest = score;
            if (matched) tokenMatched = true;
          }

          totalScore += tokenBest;
          if (tokenMatched) {
            matchedTerms.push(token);
            anyMatch = true;
          }
        }

        if (!anyMatch) continue;

        // Popularity bump (0-100 → 1.0–1.5×)
        const popBonus = 1 + (doc.popularity || 0) / 200;
        // Recency bump
        const recencyBonus = recentIds.has(doc.id) ? 1.2 : 1;

        hits.push({
          doc,
          score: totalScore * popBonus * recencyBonus,
          matchedTerms,
        });
      }

      hits.sort((a, b) => b.score - a.score);
      return hits.slice(0, limit);
    },
  };
}
