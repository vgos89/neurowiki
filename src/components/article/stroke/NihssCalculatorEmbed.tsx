import React, { useState, useRef } from 'react';
import { Copy, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { copyToClipboard, type CopyState } from '../../../utils/clipboard';
import { LiveAnnouncer } from '../../a11y/LiveAnnouncer';
import { NIHSS_ITEMS, calculateTotal, getItemWarning } from '../../../utils/nihssShortcuts';
import NihssItemCard from '../../NihssItemCard';

export interface NihssCalculatorEmbedProps {
  /** Current score in workflow (display only); applying overwrites this */
  initialScore?: number;
  onApply: (score: number) => void;
  onBack: () => void;
}

/**
 * Embeddable NIHSS calculator for stroke workflow modal.
 * Full feature parity with standalone NihssCalculator:
 * - Rapid / Detailed mode toggle
 * - Clinical warnings (getItemWarning)
 * - Clinical pearls toggle
 * - Auto-scroll to next item after scoring
 * - Copy to EMR
 * Score applied via onApply(score); Back closes without applying.
 */
export const NihssCalculatorEmbed: React.FC<NihssCalculatorEmbedProps> = ({
  initialScore = 0,
  onApply,
  onBack,
}) => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopyState>('idle');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const total = calculateTotal(nihssValues);

  const handleNihssChange = (id: string, val: number) => {
    setNihssValues((prev) => ({ ...prev, [id]: val }));

    // Auto-scroll to next item
    const idx = NIHSS_ITEMS.findIndex((i) => i.id === id);
    if (idx >= 0 && idx < NIHSS_ITEMS.length - 1) {
      setTimeout(() => {
        const nextItem = NIHSS_ITEMS[idx + 1];
        const el = document.getElementById(`embed-nihss-row-${nextItem.id}`);
        if (el && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          // Account for sticky header inside modal (~72px)
          const containerTop = container.getBoundingClientRect().top;
          const elTop = el.getBoundingClientRect().top;
          const scrollOffset = elTop - containerTop - 80;
          container.scrollBy({ top: scrollOffset, behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const setAllMotor = (val: number) => {
    setNihssValues((prev) => ({ ...prev, '5a': val, '5b': val, '6a': val, '6b': val }));
  };

  const copyNihss = () => {
    const breakdown = NIHSS_ITEMS.map((i) => `${i.shortName}: ${nihssValues[i.id] ?? 0}`).join('\n');
    copyToClipboard(
      `NIHSS Total: ${total}\n\n${breakdown}`,
      () => { setCopied('copied'); setTimeout(() => setCopied('idle'), 2000); },
      () => { setCopied('failed'); setTimeout(() => setCopied('idle'), 3500); },
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Sticky control bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-1 py-2 flex items-center justify-between gap-2 flex-wrap">

        {/* Score */}
        <div className="flex-shrink-0">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">NIHSS</div>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`NIHSS score: ${total} out of 42`}
            className="flex items-baseline gap-1"
          >
            <span className="text-3xl font-bold text-slate-900 leading-none">
              {total.toString().padStart(2, '0')}
            </span>
            <span className="text-sm text-slate-400">/ 42</span>
          </div>
        </div>

        {/* Right controls: Rapid/Detailed + Copy + Reset */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5" role="group" aria-label="NIHSS assessment mode">
            <button
              onClick={() => setNihssMode('rapid')}
              aria-pressed={nihssMode === 'rapid'}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                nihssMode === 'rapid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Rapid
            </button>
            <button
              onClick={() => setNihssMode('detailed')}
              aria-pressed={nihssMode === 'detailed'}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                nihssMode === 'detailed'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Copy to EMR */}
          <button
            onClick={copyNihss}
            aria-label="Copy NIHSS to clipboard"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
          >
            {copied === 'copied' ? (
              <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            ) : copied === 'failed' ? (
              <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          {/* Icon alone cannot explain a blocked clipboard, so the failure
              state also gets a text line the screen reader will announce. */}
          {copied === 'failed' && (
            <span aria-hidden="true" className="text-[11px] font-medium text-red-600">
              Copy failed
            </span>
          )}
          <LiveAnnouncer
            message={copied === 'copied' ? 'Copied to clipboard' : copied === 'failed' ? 'Copy failed' : null}
            tone={copied === 'failed' ? 'assertive' : 'polite'}
          />

          {/* Reset */}
          <button
            onClick={() => setNihssValues({})}
            aria-label="Reset NIHSS"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Scrollable item list ────────────────────────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 py-4 px-1">
          {initialScore > 0 && (
            <p className="text-xs text-slate-500 -mb-1">
              Current score in workflow: <strong>{initialScore}</strong>. Apply below to update.
            </p>
          )}

          {NIHSS_ITEMS.map((item) => {
            const warning = getItemWarning(item.id, nihssValues[item.id] ?? 0, nihssValues);
            const showPearl = activePearl === item.id;
            const isRequired = item.id === '1a';

            if (item.id === '5a') {
              return (
                <React.Fragment key="motor-header">
                  <div className="flex justify-between items-end -mb-1">
                    <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Motor</h3>
                    <button
                      type="button"
                      onClick={() => setAllMotor(0)}
                      className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                      Normal Exam
                    </button>
                  </div>
                  {/* Override id so auto-scroll targets unique embed IDs */}
                  <div id={`embed-nihss-row-${item.id}`}>
                    <NihssItemCard
                      item={item}
                      value={nihssValues[item.id] ?? 0}
                      onChange={(v) => handleNihssChange(item.id, v)}
                      mode={nihssMode}
                      userMode="resident"
                      showPearl={showPearl}
                      onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))}
                      warning={warning}
                      isRequired={isRequired}
                    />
                  </div>
                </React.Fragment>
              );
            }

            return (
              <div key={item.id} id={`embed-nihss-row-${item.id}`}>
                <NihssItemCard
                  item={item}
                  value={nihssValues[item.id] ?? 0}
                  onChange={(v) => handleNihssChange(item.id, v)}
                  mode={nihssMode}
                  userMode="resident"
                  showPearl={showPearl}
                  onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))}
                  warning={warning}
                  isRequired={isRequired}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Apply / Back footer ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onApply(total)}
          className="min-h-[44px] px-6 py-2 text-sm font-semibold text-white bg-neuro-500 hover:bg-neuro-600 active:bg-neuro-700 rounded-xl transition-colors"
        >
          Apply score: {total}
        </button>
      </div>
    </div>
  );
};
