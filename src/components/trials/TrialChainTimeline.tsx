/**
 * TrialChainTimeline — bottom-of-trial-page lineage footer.
 *
 * Renders the trials in the same clinical chain as the current trial, with
 * the current trial highlighted in the middle and predecessors / successors
 * navigable above and below. Cohort-members at the same era render as
 * siblings.
 *
 * Architect resolution: docs/reviews/arch-trial-chain-timeline-2026-05-20.md
 *   - Schema: chainMembership[] on TrialMetadata
 *   - Registry: src/data/trialChainRegistry.ts (chain metadata only)
 *   - Component renders by scanning the catalog for other chainMembership
 *     entries with the same chainId; sorts by year ascending; positions
 *     the current trial in the middle and others above/below.
 *
 * Phase 1 rollout: hemicraniectomy (4 trials) and basilar-evt (4 trials).
 * Per-trial render guard: returns null if the trial has no chainMembership
 * — safe for the ~80 other trials in the catalog that have not been tagged.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { TRIAL_DATA } from '../../data/trialData';
import { TRIAL_CHAINS } from '../../data/trialChainRegistry';

interface TrialChainTimelineProps {
  /** id of the trial whose page is rendering this timeline. */
  trialId: string;
}

interface ChainNode {
  trialId: string;
  title: string;
  year: number;
  trialResult?: string;
  listDescription?: string;
}

/** Year extractor — tries common locations on a trial entry. */
function extractYear(trialId: string): number | null {
  const trial = TRIAL_DATA[trialId];
  if (!trial) return null;
  // source field commonly looks like "Author et al. NEJM 2024;..." or
  // similar. Pull the first 4-digit year ≥ 1980.
  const source = trial.source ?? '';
  const m = source.match(/\b(19[89]\d|20\d{2})\b/);
  if (m) return Number(m[1]);
  return null;
}

const TrialChainTimeline: React.FC<TrialChainTimelineProps> = ({ trialId }) => {
  const currentTrial = TRIAL_DATA[trialId];
  if (!currentTrial || !currentTrial.chainMembership || currentTrial.chainMembership.length === 0) {
    return null;
  }

  // Render one chain block per chainMembership entry the current trial declares.
  return (
    <div style={{ marginTop: 24 }}>
      {currentTrial.chainMembership.map((membership) => {
        const chain = TRIAL_CHAINS[membership.chainId];
        if (!chain) return null;

        // Find every other trial in this chain.
        const allNodes: ChainNode[] = [];
        for (const [otherId, otherTrial] of Object.entries(TRIAL_DATA)) {
          const inThisChain = otherTrial.chainMembership?.some(
            (m) => m.chainId === membership.chainId,
          );
          if (!inThisChain) continue;
          const year = extractYear(otherId);
          if (year === null) continue;
          allNodes.push({
            trialId: otherId,
            title: otherTrial.title,
            year,
            trialResult: otherTrial.trialResult,
            listDescription: otherTrial.listDescription,
          });
        }

        if (allNodes.length === 0) return null;

        // Sort ascending by year. Stable sort preserves catalog order
        // within the same year, which is what we want for cohort-members.
        allNodes.sort((a, b) => a.year - b.year);

        const currentYear = extractYear(trialId);

        return (
          <section
            key={membership.chainId}
            style={{
              marginTop: 28,
              padding: '20px 18px 22px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
            }}
            aria-label={`Trial lineage: ${chain.name}`}
          >
            <header style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Trial lineage
              </p>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.01em' }}>
                {chain.name}
              </h2>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
                {chain.narrative}
              </p>
            </header>

            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {allNodes.map((node, idx) => {
                const isCurrent = node.trialId === trialId;
                const showConnector = idx < allNodes.length - 1;
                return (
                  <li key={node.trialId} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                    {/* Year column with connector */}
                    <div style={{ width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{node.year}</span>
                      {showConnector && (
                        <div style={{ width: 2, background: '#cbd5e1', flex: 1, marginTop: 6, minHeight: 24 }} aria-hidden="true" />
                      )}
                    </div>
                    {/* Card */}
                    <div style={{ flex: 1, paddingBottom: showConnector ? 14 : 0 }}>
                      <div
                        style={{
                          background: isCurrent ? '#EEF2FF' : '#ffffff',
                          border: `1px solid ${isCurrent ? '#1746A2' : '#e2e8f0'}`,
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          {isCurrent ? (
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0E2D6B' }}>
                              {node.title}
                              <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: '#1746A2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                · this page
                              </span>
                            </span>
                          ) : (
                            <Link
                              to={`/trials/${node.trialId}`}
                              style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}
                            >
                              {node.title}
                            </Link>
                          )}
                          {node.trialResult && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {node.trialResult}
                            </span>
                          )}
                        </div>
                        {node.listDescription && (
                          <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                            {node.listDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
};

export default TrialChainTimeline;
