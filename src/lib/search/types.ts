// Smart-search types — corpus + result shape
// Used by buildSearchCorpus.ts (corpus generator) and useSearchIndex.ts (runtime).
// Designed so MiniSearch can be dropped in later (npm install minisearch) without
// changing the consumer code in SearchOverlay.tsx — the SearchEngine interface is
// what the UI talks to.

export type SearchKind = 'trial' | 'calculator' | 'pathway' | 'guide' | 'question' | 'route';

export interface SearchDoc {
  /** Stable id: `${kind}:${slug}`. Used as key in lists and for dedup. */
  id: string;
  kind: SearchKind;
  /** Primary match field (boost ×4). Shown as the result row's main label. */
  title: string;
  /** Secondary match field (boost ×2). Shown below title, smaller text. */
  subtitle?: string;
  /** Tertiary match (boost ×1). Pearls / description / clinicalContext. Not shown. */
  body?: string;
  /** Hand-curated synonyms (e.g. "tpa","alteplase","thrombolysis"). Boost ×3. */
  keywords?: string[];
  /** React Router target. */
  path: string;
  /** Optional lucide-react icon name; falls back to per-kind default. */
  icon?: string;
  /** 0-100 hint to bump frequently-searched docs. Optional. */
  popularity?: number;
}

export interface SearchHit {
  doc: SearchDoc;
  /** Composite score (higher = better). */
  score: number;
  /** Tokens that matched, for highlighting in the row. */
  matchedTerms: string[];
}

export interface SearchEngine {
  /** Run a query. Returns at most `limit` hits, sorted by score desc. */
  query(q: string, limit?: number): SearchHit[];
  /** Total documents in the index, for diagnostics. */
  size: number;
}
