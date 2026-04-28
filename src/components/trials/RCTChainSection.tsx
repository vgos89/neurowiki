/**
 * RCTChainSection — TRIALS_SPEC v1.2 §7b
 *
 * Renders a vertical timeline of RCT predecessors leading to the current trial.
 * Use when predecessors are real RCTs that progressively improved on each other.
 * Do NOT use for single-arm benchmarks or registries — those use HistoricalContextSection (§7a).
 *
 * No amber caveat: RCT-to-RCT comparison is epistemically valid.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Types (mirrors TrialMetadata['rctChain'])
// ---------------------------------------------------------------------------

export interface RCTChainPredecessor {
  trialId?: string;
  trialName: string;
  year: number;
  journal: string;
  n?: number;
  designNotes?: string;
  keyResult: string;
  whatWasMissing: string;
}

export interface RCTChainData {
  chainName: string;
  chainNarrative: string;
  predecessors: RCTChainPredecessor[];
  currentTrialResult: string;
  whatChanged: string;
}

export interface RCTChainSectionProps {
  chain: RCTChainData;
  currentTrialName: string;
  currentTrialYear: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const VISIBLE_CAP = 4;

interface PredecessorCardProps {
  predecessor: RCTChainPredecessor;
  showConnector: boolean;
  isMobile?: boolean;
}

const PredecessorCard: React.FC<PredecessorCardProps> = ({ predecessor, showConnector }) => {
  const { trialId, trialName, year, journal, n, designNotes, keyResult, whatWasMissing } = predecessor;

  const NameEl = trialId ? (
    <Link
      to={`/trials/${trialId}`}
      style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}
    >
      {trialName}
    </Link>
  ) : (
    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{trialName}</span>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      {/* Year column */}
      <div
        style={{
          width: 56,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 10,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textAlign: 'center' }}>
          {year}
        </span>
        {showConnector && (
          <div
            style={{
              width: 2,
              background: '#cbd5e1',
              flex: 1,
              minHeight: 20,
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* Card body */}
      <div
        style={{
          flex: 1,
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 12px',
          background: '#ffffff',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <div>
            {NameEl}
            {designNotes && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{designNotes}</div>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>
            {journal} · {year}
            {n !== undefined && ` · N=${n.toLocaleString()}`}
          </div>
        </div>

        {/* Result line */}
        <p style={{ fontSize: 13, color: '#374151', margin: '6px 0 0' }}>{keyResult}</p>

        {/* What was missing footer */}
        <div
          style={{
            borderLeft: '2px solid #cbd5e1',
            background: '#f8fafc',
            color: '#64748b',
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: '0 4px 4px 0',
            marginTop: 8,
          }}
        >
          <span style={{ fontWeight: 600, color: '#475569' }}>What was missing: </span>
          {whatWasMissing}
        </div>
      </div>
    </div>
  );
};

interface CurrentTrialCardProps {
  trialName: string;
  year: number;
  result: string;
  whatChanged: string;
}

const CurrentTrialCard: React.FC<CurrentTrialCardProps> = ({
  trialName,
  year,
  result,
  whatChanged,
}) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
    {/* Year column — cobalt-800, no connector below */}
    <div
      style={{
        width: 56,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 10,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: '#0C447C', textAlign: 'center' }}>
        {year}
      </span>
    </div>

    {/* Card body — cobalt */}
    <div
      style={{
        flex: 1,
        border: '2px solid #185FA5',
        borderRadius: 8,
        padding: '10px 12px',
        background: '#E6F1FB',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#042C53' }}>{trialName}</span>
        <span
          style={{
            background: '#1746A2',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '1px 6px',
            borderRadius: 4,
          }}
        >
          This Trial
        </span>
      </div>

      {/* Result line */}
      <p style={{ fontSize: 13, color: '#1e3a5f', margin: '6px 0 0' }}>{result}</p>

      {/* What changed footer */}
      <div
        style={{
          borderLeft: '2px solid #185FA5',
          background: '#cce0f5',
          color: '#0C447C',
          fontSize: 12,
          padding: '6px 10px',
          borderRadius: '0 4px 4px 0',
          marginTop: 8,
        }}
      >
        <span style={{ fontWeight: 600 }}>What changed: </span>
        {whatChanged}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const RCTChainSection: React.FC<RCTChainSectionProps> = ({
  chain,
  currentTrialName,
  currentTrialYear,
}) => {
  const { chainNarrative, predecessors, currentTrialResult, whatChanged } = chain;
  const [expanded, setExpanded] = useState(false);

  // Guard: empty predecessors array → render nothing
  if (!predecessors || predecessors.length === 0) return null;

  const totalPredecessors = predecessors.length;
  const needsCap = totalPredecessors >= VISIBLE_CAP + 1; // 5+ predecessors triggers cap
  const visiblePredecessors = needsCap && !expanded ? predecessors.slice(0, VISIBLE_CAP) : predecessors;
  const hiddenCount = totalPredecessors - VISIBLE_CAP;

  // Header metadata
  const earliestYear = predecessors[0].year;
  const trialCount = totalPredecessors + 1; // predecessors + current trial
  const yearRange = `${earliestYear}--${currentTrialYear}`;

  // Stub footnote: any predecessor missing trialId?
  const hasStubs = predecessors.some((p) => !p.trialId);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px',
        marginTop: 16,
      }}
    >
      {/* Section header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Historical Context
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {trialCount} trials · {yearRange}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 500, color: '#0f172a', margin: '0 0 0' }}>
        The road to {currentTrialName}
      </h3>

      {/* Chain narrative */}
      <p
        style={{
          fontSize: 14,
          color: '#475569',
          lineHeight: 1.55,
          margin: '8px 0 16px',
        }}
      >
        {chainNarrative}
      </p>

      {/* Card stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visiblePredecessors.map((p, idx) => {
          const isLast = idx === visiblePredecessors.length - 1;
          // Show connector unless: last visible card when NOT showing expand button,
          // OR last card when expanded (connector to current trial handled by current card gap)
          const showConnector = !(isLast && (expanded || !needsCap));
          return (
            <PredecessorCard
              key={`${p.trialName}-${p.year}`}
              predecessor={p}
              showConnector={showConnector}
            />
          );
        })}

        {/* Expand button — between last visible predecessor and current trial */}
        {needsCap && !expanded && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setExpanded(true)}
              style={{
                fontSize: 12,
                color: '#1746A2',
                fontWeight: 500,
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                padding: '6px 14px',
                background: '#eff6ff',
                cursor: 'pointer',
              }}
            >
              Show all {hiddenCount > 0 ? totalPredecessors : totalPredecessors} predecessors
            </button>
          </div>
        )}

        {/* Current trial card */}
        <CurrentTrialCard
          trialName={currentTrialName}
          year={currentTrialYear}
          result={currentTrialResult}
          whatChanged={whatChanged}
        />
      </div>

      {/* Stub footnote */}
      {hasStubs && (
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>
          Some predecessor trial pages are forthcoming.
        </p>
      )}
    </div>
  );
};

export default RCTChainSection;
