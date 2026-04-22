/**
 * TeachingWell — collapsible teaching accordion (TRIALS_SPEC v1.0 §10.2)
 *
 * Two rendering modes:
 *  - 'qa'       : Q&A pairs (for "How to read this chart")
 *  - 'interpret': Proves / Does not prove / Cautions (for "How to interpret")
 *
 * Collapsed: shows title + chevron.
 * Expanded:  shows content within the cobalt-left-border well.
 *
 * Styling per spec: background #f8fafc, border-left 2px solid #1746A2,
 * border-radius 0 8px 8px 0, padding 14px 16px.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── Prop types ──────────────────────────────────────────────────────────────

interface TeachingWellBase {
  /** Section heading displayed in the collapsed handle. */
  title: string;
  /** Start in expanded state (default: false). */
  defaultExpanded?: boolean;
}

interface TeachingWellQA extends TeachingWellBase {
  mode: 'qa';
  /** Q&A pairs for "How to read this chart". */
  items: { question: string; answer: string }[];
}

interface TeachingWellInterpret extends TeachingWellBase {
  mode: 'interpret';
  /** Structured interpretation sections. */
  sections: {
    proves: string;
    doesNotProve: string;
    cautions: string;
  };
}

export type TeachingWellProps = TeachingWellQA | TeachingWellInterpret;

// ─── Styles ──────────────────────────────────────────────────────────────────

const wellStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderLeft: '2px solid #1746A2',
  borderRadius: '0 8px 8px 0',
  overflow: 'hidden',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const TeachingWell: React.FC<TeachingWellProps> = (props) => {
  const { title, defaultExpanded = false } = props;
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div style={wellStyle}>
      {/* Collapsed handle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {props.mode === 'qa'
            ? props.items.map((item, idx) => (
                <div key={idx}>
                  <p className="text-xs font-semibold text-[#1746A2] mb-1">
                    {item.question}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))
            : (
              <>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 mb-1">
                    Proves
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {props.sections.proves}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                    Does not prove
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {props.sections.doesNotProve}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1">
                    Cautions
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {props.sections.cautions}
                  </p>
                </div>
              </>
            )}
        </div>
      )}
    </div>
  );
};
