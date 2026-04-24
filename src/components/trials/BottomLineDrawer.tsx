/**
 * BottomLineDrawer — portal-mounted fixed drawer (TRIALS_SPEC v1.0 §10.3)
 *
 * 4-state machine:
 *   A — isLoading: loading skeleton (animated pulse)
 *   B — collapsed default: handle bar + chevron
 *   C — discovery chevron: chevron bounces 3×0.6s, fires once per session 3s
 *       after load; transition B→C is guarded by sessionStorage key
 *   D — expanded: full content visible
 *
 * Position: fixed, bottom = calc(var(--tab-bar-height) + env(safe-area-inset-bottom))
 * z-index: 55 (above tab bar at z-50, below modals)
 * Renders via createPortal to document.body to escape any overflow containers.
 *
 * §15.3 constraint: no em dashes in text content.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type DrawerState = 'A' | 'B' | 'C' | 'D';

export interface SeeAlsoLink {
  label: string;
  href: string;
}

export interface BottomLineDrawerProps {
  /** Abbreviated trial name shown in the collapsed handle, e.g. "EXTEND". */
  trialName: string;
  /** Full bottom-line prose shown in expanded state. No em dashes. */
  body: string;
  /** Bedside pearl text shown in expanded state. No em dashes. */
  bedsidePearl: string;
  /** Optional cross-reference links shown in expanded state. */
  seeAlsoLinks?: SeeAlsoLink[];
  /** Citation string, e.g. "Ma et al., NEJM 2019". */
  citation: string;
  /** DOI string (without https://doi.org/ prefix), e.g. "10.1056/NEJMoa1813046". */
  doi?: string;
  /** Controls the result badge in the handle. */
  trialResult?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HARM';
  /** When trialResult='NEUTRAL' and resultSubtype='non-inferiority', badge reads "Non-inferiority met" with cobalt styling. */
  resultSubtype?: 'non-inferiority' | 'superiority' | 'safety';
  /** When true, renders state A (skeleton). Switches to B on false. */
  isLoading?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STYLE_TAG_ID = 'bottom-line-drawer-keyframes';
const KEYFRAMES_CSS = `
  @keyframes bounce-hint {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-5px); }
  }
  .bldr-bounce { animation: bounce-hint 0.6s ease-in-out 3; }
`;

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 9999,
  padding: '1px 8px',
  fontSize: 10,
  fontWeight: 600,
  lineHeight: 1.6,
};

const RESULT_BADGE: Record<string, React.CSSProperties> = {
  POSITIVE: { ...BADGE_BASE, background: '#EEF2FF', color: '#1746A2', border: '1px solid #c7d2fe' },
  NEGATIVE: { ...BADGE_BASE, background: '#FEF2F2', color: '#dc2626', border: '1px solid #fca5a5' },
  NEUTRAL: { ...BADGE_BASE, background: '#F8FAFC', color: '#64748b', border: '1px solid #e2e8f0' },
  NEUTRAL_NI: { ...BADGE_BASE, background: '#EEF2FF', color: '#1746A2', border: '1px solid #c7d2fe' },
  HARM: { ...BADGE_BASE, background: '#FEF2F2', color: '#7f1d1d', border: '1px solid #fca5a5' },
};

function getHintKey(trialName: string) {
  return `bldr-hint-${trialName.toLowerCase().replace(/\s+/g, '-')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const BottomLineDrawer: React.FC<BottomLineDrawerProps> = ({
  trialName,
  body,
  bedsidePearl,
  seeAlsoLinks,
  citation,
  doi,
  trialResult,
  resultSubtype,
  isLoading = false,
}) => {
  const [drawerState, setDrawerState] = useState<DrawerState>(isLoading ? 'A' : 'B');
  const [isBouncing, setIsBouncing] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject @keyframes once into <head> (idempotent)
  useEffect(() => {
    if (!document.getElementById(STYLE_TAG_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      style.textContent = KEYFRAMES_CSS;
      document.head.appendChild(style);
    }
  }, []);

  // Fix 3: Publish drawer floor height so FeedbackButton can lift above it.
  // 60px = collapsed handle after Fix 2 (18px top + 18px bottom + ~24px content).
  useEffect(() => {
    document.documentElement.style.setProperty('--drawer-floor-height', '60px');
    return () => {
      document.documentElement.style.setProperty('--drawer-floor-height', '0px');
    };
  }, []);

  // A → B when loading resolves
  useEffect(() => {
    if (!isLoading && drawerState === 'A') {
      setDrawerState('B');
    }
  }, [isLoading, drawerState]);

  // B → C discovery animation: fires once per session, 3s after reaching B
  useEffect(() => {
    if (drawerState !== 'B') return;

    const hintKey = getHintKey(trialName);
    if (sessionStorage.getItem(hintKey)) return; // already shown

    hintTimer.current = setTimeout(() => {
      setDrawerState('C');
      setIsBouncing(true);
      sessionStorage.setItem(hintKey, '1');

      // 3 bounces × 0.6s = 1.8s — return to B after animation
      bounceTimer.current = setTimeout(() => {
        setIsBouncing(false);
        setDrawerState('B');
      }, 1900);
    }, 3000);

    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
    };
  }, [drawerState, trialName]);

  function toggle() {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    if (bounceTimer.current) clearTimeout(bounceTimer.current);
    setIsBouncing(false);
    setDrawerState((prev) => (prev === 'D' ? 'B' : 'D'));
  }

  const isNonInferiority = trialResult === 'NEUTRAL' && resultSubtype === 'non-inferiority';
  const resultLabel = trialResult ? (
    isNonInferiority ? 'Non-inferiority met' : {
      POSITIVE: 'Positive',
      NEGATIVE: 'Negative',
      NEUTRAL: 'Neutral',
      HARM: 'Harm Signal',
    }[trialResult]
  ) : null;
  const badgeKey = isNonInferiority ? 'NEUTRAL_NI' : (trialResult ?? '');

  const drawerEl = (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--tab-bar-height, 4.5rem) + env(safe-area-inset-bottom, 0px))',
        left: 'var(--nav-rail-width, 0px)',
        right: 0,
        zIndex: 55,
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── State A: loading skeleton ── */}
      {drawerState === 'A' && (
        <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
          <div className="h-3 bg-slate-200 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-40" />
        </div>
      )}

      {/* ── States B / C / D: handle + content ── */}
      {drawerState !== 'A' && (
        <>
          {/* Handle bar */}
          <button
            type="button"
            onClick={toggle}
            className="bldr-handle w-full flex items-center justify-between px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:ring-inset"
            aria-expanded={drawerState === 'D'}
            aria-label="Bottom line summary — tap to expand"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">
                Bottom Line
              </span>
              {resultLabel && badgeKey && (
                <span style={RESULT_BADGE[badgeKey]}>{resultLabel}</span>
              )}
              <span className="text-xs text-slate-500 truncate ml-0.5">
                {trialName}
              </span>
            </div>
            <div
              className={isBouncing ? 'bldr-bounce' : ''}
              style={{ flexShrink: 0, marginLeft: 8 }}
            >
              {drawerState === 'D' ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </button>

          {/* Expanded content */}
          {drawerState === 'D' && (
            <div className="px-4 pb-safe-4 border-t border-slate-100 space-y-4 max-h-[50vh] overflow-y-auto pb-4">
              {/* Bottom line prose */}
              <p className="text-sm text-slate-700 leading-relaxed pt-3">
                {body}
              </p>

              {/* Bedside pearl */}
              <div
                style={{
                  background: '#EEF2FF',
                  borderLeft: '3px solid #1746A2',
                  borderRadius: '0 6px 6px 0',
                  padding: '10px 12px',
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-1">
                  Bedside Pearl
                </p>
                <p className="text-sm text-[#0E2D6B] leading-relaxed">
                  {bedsidePearl}
                </p>
              </div>

              {/* See-also links */}
              {seeAlsoLinks && seeAlsoLinks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    See also
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seeAlsoLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.href}
                        className="inline-flex items-center gap-1 text-xs text-[#1746A2] border border-[#1746A2] rounded-full px-3 py-1 hover:bg-[#EEF2FF] transition-colors"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Citation */}
              <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-100">
                {citation}
                {doi && (
                  <>
                    {' '}
                    <a
                      href={`https://doi.org/${doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1746A2] hover:underline not-italic"
                    >
                      doi:{doi}
                    </a>
                  </>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawerEl, document.body);
};
