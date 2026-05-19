import React, { useState } from 'react';
import { NihssItemDef } from '../utils/nihssShortcuts';
import { AlertTriangle, ChevronDown } from 'lucide-react';

interface NihssItemCardProps {
  item: NihssItemDef;
  value: number | undefined;
  onChange: (val: number) => void;
  onShowPearl: () => void;
  showPearl: boolean;
  mode: 'rapid' | 'detailed';
  userMode: 'resident' | 'attending';
  warning?: string | null;
  isRequired?: boolean;
}

/**
 * NihssItemCard — single NIHSS item with two render modes:
 *
 * RAPID  — flat row of pill buttons, just the score numbers + short labels.
 * DETAILED — vertical stack of row-buttons. Each row shows:
 *     [ number cell | rubric (primary) + plain English (muted) ]
 *   Plus a collapsible "How to test" methodology section above the rows
 *   (uses item.plainEnglish — testing instructions, not per-score wording).
 *
 * Rebuilt 2026-05-19 per V direction:
 *   - Removed paragraph-above + scores-below sandwich layout
 *   - Added per-score plain English (item.plainOptions) authored by
 *     medical-scientist and clinical-reviewer-approved
 *   - Whole row is one tap target ≥44px; matches the new design tokens
 */

/** Strip "N: " prefix from a "0: Alert" style label. */
function stripNumberPrefix(label: string): string {
  return label.replace(/^\s*\d+:\s*/, '').replace(/\s*\.\s*$/, '');
}

const NihssItemCard: React.FC<NihssItemCardProps> = ({
  item,
  value,
  onChange,
  onShowPearl,
  showPearl,
  mode,
  userMode,
  warning,
  isRequired = false,
}) => {
  const [howToTestOpen, setHowToTestOpen] = useState(false);
  const isSelected = (val: number) => value === val;

  // Parse detailedInfo for rubric per score (existing logic — works for
  // items with • prefix and "0: Description" format).
  const parseDetailedInfo = (info: string): Record<number, string> => {
    const map: Record<number, string> = {};
    const lines = info.split('\n').filter((l) => l.trim());
    lines.forEach((line) => {
      const m = line.match(/^•\s*(\d+):\s*(.+?)\s*\.?\s*$/);
      if (m) map[Number(m[1])] = m[2].trim();
    });
    return map;
  };
  const rubricByScore = parseDetailedInfo(item.detailedInfo);

  // Helper: render the plainEnglish methodology block as small inline content.
  const renderMethodology = () => {
    if (!item.plainEnglish) return null;
    return (
      <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
        {item.plainEnglish.split('\n').map((line, idx) => {
          if (line.trim() === '') return null;
          if (line.includes('**')) {
            const parts = line.split('**');
            return (
              <p key={idx} className="leading-relaxed">
                {parts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-slate-900">{part}</strong> : part
                )}
              </p>
            );
          }
          if (line.trim().startsWith('•')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-2">
                <span className="text-slate-400 flex-shrink-0">·</span>
                <span className="flex-1">{line.trim().substring(1).trim()}</span>
              </div>
            );
          }
          return <p key={idx} className="leading-relaxed">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div
      id={`nihss-row-${item.id}`}
      className="bg-white rounded-xl border border-slate-100 p-5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-slate-400 font-medium">{item.id}</span>
          <h2 id={`nihss-label-${item.id}`} className="text-base font-semibold text-slate-900">
            {item.name.replace(/^\d+[a-z]?\.\s*/i, '')}
          </h2>
        </div>
        {isRequired && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
            Required
          </span>
        )}
      </div>

      {/* Warning */}
      {warning && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border-l-2 border-amber-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-amber-900 font-medium">{warning}</p>
        </div>
      )}

      {mode === 'rapid' && (
        // Rapid mode — unchanged: pill row of short labels.
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-labelledby={`nihss-label-${item.id}`}
        >
          {item.rapidOptions.map((opt) => {
            const isActive = isSelected(opt.value);
            return (
              <button
                key={opt.value}
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange(opt.value)}
                className={`min-h-[44px] flex-1 min-w-0 px-3 py-2 md:px-5 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-neuro-500 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {mode === 'detailed' && (
        <>
          {/* "How to test" — collapsible methodology block (uses existing
              item.plainEnglish field which is testing instructions, not
              per-score wording). */}
          {item.plainEnglish && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setHowToTestOpen((v) => !v)}
                className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors rounded-lg text-left"
                aria-expanded={howToTestOpen}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {howToTestOpen ? 'How to test' : '+ How to test'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${howToTestOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {howToTestOpen && (
                <div className="mt-2 p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                  {renderMethodology()}
                </div>
              )}
            </div>
          )}

          {/* Score rows — row-buttons with rubric (primary) + plain English (muted) */}
          <div
            className="space-y-1.5"
            role="radiogroup"
            aria-labelledby={`nihss-label-${item.id}`}
          >
            {item.rapidOptions.map((opt) => {
              const isActive = isSelected(opt.value);
              const rubricText = rubricByScore[opt.value] ?? stripNumberPrefix(opt.label);
              const plainOpt = item.plainOptions?.find((p) => p.value === opt.value);
              const plainText = plainOpt ? stripNumberPrefix(plainOpt.label) : null;

              return (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onChange(opt.value)}
                  className={`w-full min-h-[56px] flex items-stretch gap-3 rounded-lg border transition-colors text-left ${
                    isActive
                      ? 'bg-neuro-50 border-neuro-300'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Number cell */}
                  <div
                    className={`flex-shrink-0 w-10 flex items-center justify-center font-semibold text-base ${
                      isActive
                        ? 'bg-neuro-500 text-white rounded-l-lg'
                        : 'bg-slate-50 text-slate-700 rounded-l-lg'
                    }`}
                  >
                    {opt.value === 9 ? 'UN' : opt.value}
                  </div>

                  {/* Text cell — rubric primary, plain English muted */}
                  <div className="flex-1 min-w-0 py-2.5 pr-3 flex flex-col justify-center">
                    <span
                      className={`text-sm font-medium leading-snug ${
                        isActive ? 'text-neuro-900' : 'text-slate-900'
                      }`}
                    >
                      {rubricText}
                    </span>
                    {plainText && (
                      <span
                        className={`text-xs leading-snug mt-0.5 ${
                          isActive ? 'text-neuro-700' : 'text-slate-500'
                        }`}
                      >
                        {plainText}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default NihssItemCard;
