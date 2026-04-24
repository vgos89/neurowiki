/**
 * HistoricalContextSection — Archetype G first-class section (TRIALS_SPEC v1.1 §7a.4)
 *
 * Promoted to section 2a, immediately after the Primary Outcome section.
 * Not inside a collapsible teaching well — it is a first-class card section.
 *
 * Structure:
 *   1. Amber caveat banner (mandatory, renders first)
 *   2. Table: Trial | Year | N | Design | Rate
 *      - Current trial row highlighted with a green left border accent
 *      - Rate displayed as a percentage bar for quick visual scan
 *
 * 3-comparator minimum: renders nothing if rows.length < 3.
 *
 * §15.3 constraint: no em dashes in text content.
 * ADR-006 Decision 2: amber caveat is mandatory and must render FIRST.
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoricalContextRow {
  /** Trial or study name, e.g. "SAMMPRIS stent arm". */
  label: string;
  /** Publication year, e.g. 2011. */
  year: number;
  /** Sample size (n), e.g. 224. */
  n: number;
  /** Brief design descriptor, e.g. "Randomized vs medical therapy, off-label". */
  design?: string;
  /** Periprocedural event rate as a percentage, e.g. 14.7. */
  rate: number;
  /** When true, applies the current-trial highlight style. */
  isCurrentTrial?: boolean;
}

export interface HistoricalContextSectionProps {
  rows: HistoricalContextRow[];
  /**
   * Amber caveat text shown at the top of the section (mandatory per ADR-006).
   * Defaults to a standard Archetype G caveat if not provided.
   */
  caveat?: string;
  /**
   * Scale maximum for the mini rate bars.
   * Defaults to max observed rate * 1.3, rounded to nearest 5.
   */
  scaleMax?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CAVEAT =
  'Historical rates are from different patient populations, study designs, and operator experience levels. ' +
  'Direct comparison to WEAVE is exploratory. These data provide context only, not a control arm.';

// ─── Component ────────────────────────────────────────────────────────────────

export const HistoricalContextSection: React.FC<HistoricalContextSectionProps> = ({
  rows,
  caveat,
  scaleMax: scaleMaxProp,
}) => {
  // 3-comparator minimum (ADR-006 Decision 2)
  if (rows.length < 3) return null;

  const caveatText = caveat ?? DEFAULT_CAVEAT;

  // Compute scale max for mini bars
  const maxRate   = Math.max(...rows.map((r) => r.rate));
  const scaleMax  = scaleMaxProp ?? Math.ceil((maxRate * 1.3) / 5) * 5;

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      role="region"
      aria-label="Historical context comparators"
    >
      {/* Section header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Historical Context
        </p>
      </div>

      {/* Amber caveat — mandatory, renders first (ADR-006 Decision 2) */}
      <div
        style={{
          background: '#FFFBEB',
          borderLeft: '3px solid #D97706',
          borderRadius: '0 6px 6px 0',
          padding: '10px 14px',
          margin: '12px 16px 4px',
        }}
        role="note"
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#92400e',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 4,
          }}
        >
          Observational context only
        </p>
        <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
          {caveatText}
        </p>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
          }}
          aria-label="Historical event rate comparators"
        >
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '8px 16px',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                  whiteSpace: 'nowrap',
                }}
              >
                Trial / Registry
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '8px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                  whiteSpace: 'nowrap',
                }}
              >
                Year
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '8px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                N
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '8px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                Design
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '8px 16px 8px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                  whiteSpace: 'nowrap',
                }}
              >
                Event rate
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isCurrent   = row.isCurrentTrial === true;
              const barWidth    = Math.min((row.rate / scaleMax) * 100, 100);
              const barColor    = isCurrent ? '#10b981' : '#cbd5e1';

              return (
                <tr
                  key={idx}
                  style={{
                    background: isCurrent ? '#f0fdf4' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    borderLeft: isCurrent ? '3px solid #10b981' : '3px solid transparent',
                  }}
                >
                  {/* Trial name */}
                  <td
                    style={{
                      padding: '10px 16px',
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent ? '#065f46' : '#334155',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.label}
                    {isCurrent && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#047857',
                          background: '#d1fae5',
                          padding: '1px 5px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        This trial
                      </span>
                    )}
                  </td>

                  {/* Year */}
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 8px',
                      color: '#64748b',
                      verticalAlign: 'middle',
                    }}
                  >
                    {row.year}
                  </td>

                  {/* N */}
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 8px',
                      color: '#64748b',
                      verticalAlign: 'middle',
                    }}
                  >
                    {row.n.toLocaleString()}
                  </td>

                  {/* Design */}
                  <td
                    style={{
                      padding: '10px 8px',
                      color: '#64748b',
                      fontSize: 11,
                      verticalAlign: 'middle',
                    }}
                  >
                    {row.design ?? ''}
                  </td>

                  {/* Rate — number + mini bar */}
                  <td
                    style={{
                      padding: '10px 16px 10px 8px',
                      verticalAlign: 'middle',
                      minWidth: 90,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {/* Mini bar */}
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          background: '#f1f5f9',
                          borderRadius: 3,
                          overflow: 'hidden',
                          maxWidth: 60,
                        }}
                        aria-hidden="true"
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${barWidth}%`,
                            background: barColor,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      {/* Rate label */}
                      <span
                        style={{
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? '#065f46' : '#475569',
                          fontSize: 12,
                          tabularNums: true,
                          whiteSpace: 'nowrap',
                        } as React.CSSProperties}
                      >
                        {row.rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p
        style={{
          fontSize: 10,
          color: '#94a3b8',
          padding: '8px 16px 12px',
          lineHeight: 1.5,
        }}
      >
        Event rate = periprocedural stroke or death. Rates are not directly
        comparable across studies due to differences in patient selection, operator
        experience, study era, and outcome assessment windows.
      </p>
    </div>
  );
};
