/**
 * Citation and claim schema for NeuroWiki clinical content governance.
 *
 * See CLAUDE.md §13.2 for design intent.
 * See .claude/agents/clinical-reviewer.md for how clinical-reviewer
 * uses these types to gate Class E and -clinical PRs.
 *
 * Wave 5 session 1: types only. Registry entries in W5.2, scanner
 * in W5.3, pre-commit hook in W5.4.
 */

/**
 * Five source types for clinical citations.
 * Determines the default review window per the §13.7 freshness matrix.
 *
 * Extension beyond CLAUDE.md §13.2 (which lists 4 types): 'definition'
 * is added to resolve the ACRM 1993 ambiguity in the GCS clinical review —
 * consensus classification criteria are distinct from guidelines and trials.
 * Documented in ADR-002.
 */
export type CitationSourceType =
  | 'guideline'    // Current clinical guidelines (AHA/ASA, AAN, ESO) — 6 months default
  | 'trial'        // Published clinical trials (landmark or recent) — 36 months default
  | 'review'       // Systematic reviews, meta-analyses, narrative reviews — 6 months default
  | 'textbook'     // Textbook chapters, reference works — 36 months default
  | 'definition';  // Consensus definitions and classification criteria (e.g., ACRM 1993) — 6 months default

/**
 * A single clinical citation with governance metadata.
 * All citations live in src/lib/citations/registry.ts (created in W5.2).
 */
export interface Citation {
  /** Unique kebab-case identifier. Example: "aha-asa-stroke-2026-3.2" */
  id: string;
  source: CitationSourceType;
  title: string;
  year: number;
  /** Guideline section. Example: "Section 3.2" */
  section?: string;
  url?: string;
  /** PubMed ID for trials and journal articles. Example: "4136544" */
  pmid?: string;
  /**
   * ISO date of last review against the §13.6 six-step checklist.
   * Format: YYYY-MM-DD.
   * Cannot be set without completing the six-step checklist per §13.6.
   */
  last_reviewed: string;
  /**
   * Override the default review window from the §13.7 freshness matrix.
   * When set, rationale must appear in a comment on the citation entry.
   */
  review_window_months?: number;
  /**
   * Exact quoted text from the source supporting this citation.
   * Required — enables semantic validity checking by clinical-reviewer per §13.1.
   */
  quoted_text: string;
}

/**
 * Where a clinical claim appears in the codebase.
 * Discriminated union — the scanner (W5.3) verifies each arm's
 * presence against the tagging method defined in CLAUDE.md §13.4.
 *
 * Phase 1 surfaces (scanner ships W5.3): jsx, data
 * Phase 2 surfaces (roadmap): computed, markdown, json
 */
export type ClaimSurface =
  | { type: 'jsx';          attribute: 'data-claim' }       // Static JSX: data-claim="claim-id" on element
  | { type: 'data';         field: 'claimId' }              // src/data/*.ts: adjacent claimId string field
  | { type: 'computed';     helper: 'claim' }               // Computed string: claim(text, "claim-id") helper
  | { type: 'markdown';     marker: '<!-- @claim:' }        // Markdown: HTML comment before clinical paragraph
  | { type: 'json';         field: 'claim_id' }             // JSON content: claim_id field beside text field
  | { type: 'bedsidePearl'; field: 'bedsidePearlClaimId' }; // src/data/trialData.ts: bedsidePearlClaimId field

/**
 * A registered clinical claim mapping claim text to its citations and surfaces.
 * All claims live in src/lib/citations/claims.ts (created in W5.2).
 */
export interface ClaimEntry {
  /** Unique kebab-case identifier. Example: "gcs-mild-threshold" */
  id: string;
  /**
   * Citation IDs supporting this claim.
   * Many-to-many: one claim may cite multiple sources.
   * Primary (strongest) citation listed first.
   */
  citation_ids: string[];
  /**
   * Where this claim appears in the codebase.
   * Required — scanner (W5.3) cross-checks surface type against actual tagging method.
   * Every registered claim must declare at least one surface.
   */
  surfaces: ClaimSurface[];
  /** Human-readable description of what this claim asserts. */
  description?: string;
}

/** All citations keyed by citation ID. Populated in src/lib/citations/registry.ts. */
export type CitationRegistry = Record<string, Citation>;

/** All registered claims keyed by claim ID. Populated in src/lib/citations/claims.ts. */
export type ClaimRegistry = Record<string, ClaimEntry>;
