import React, { useState, useRef, useMemo } from 'react';
import { Info, Copy, RefreshCw, Check } from 'lucide-react';
import { NIHSS_ITEMS, calculateTotal, getItemWarning, calculateLvoProbability } from '../../../utils/nihssShortcuts';
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
 * - LVO probability (RACE Scale) with tooltip breakdown
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
  const [showLvoTooltip, setShowLvoTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  const lvoTooltipRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const total = calculateTotal(nihssValues);
  const lvoData = useMemo(() => calculateLvoProbability(nihssValues), [nihssValues]);

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
    navigator.clipboard.writeText(`NIHSS Total: ${total}\n\n${breakdown}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lvoColorClass =
    lvoData.label === 'High'
      ? 'text-red-600'
      : lvoData.label === 'Moderate'
      ? 'text-blue-600'
      : 'text-green-600';

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky control bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-1 py-2 flex items-center justify-between gap-2 flex-wrap">

        {/* Score */}
        <div className="flex-shrink-0">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">NIHSS</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900 leading-none">
              {total.toString().padStart(2, '0')}
            </span>
            <span className="text-sm text-slate-400">/ 42</span>
          </div>
        </div>

        {/* LVO Probability */}
        <div className="flex-shrink-0" ref={lvoTooltipRef}>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LVO</span>
            <button
              onClick={() => setShowLvoTooltip((v) => !v)}
              className="p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="LVO probability info"
            >
              <Info className="w-3 h-3 text-slate-400 cursor-help" />
            </button>
          </div>
          <div className={`text-sm font-semibold leading-none ${lvoColorClass}`}>
            {lvoData.label}{' '}
            <span className="text-slate-500 font-normal">{lvoData.probability}%</span>
          </div>

          {/* LVO Tooltip */}
          {showLvoTooltip && (
            <div className="absolute left-4 right-4 mt-2 p-4 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
              <button
                onClick={() => setShowLvoTooltip(false)}
                className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
              <p className="text-sm font-bold text-slate-900 mb-3">LVO Probability (RACE Scale)</p>
              <div className="mb-3 p-2 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-700 mb-1">RACE Score: {lvoData.raceScore}/9</p>
                <div className="text-[10px] text-slate-600 space-y-0.5">
                  <div>Facial Palsy: {lvoData.breakdown.facial}/2</div>
                  <div>Arm Motor (worst): {lvoData.breakdown.arm}/2</div>
                  <div>Leg Motor (worst): {lvoData.breakdown.leg}/2</div>
                  <div>Gaze Deviation: {lvoData.breakdown.gaze}/1</div>
                  <div>Aphasia: {lvoData.breakdown.aphasia}/2</div>
                  <div>Agnosia/Neglect: {lvoData.breakdown.agnosia}/1</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1 mb-3">
                <p className="font-semibold text-slate-700">Interpretation:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li><strong>0–4:</strong> Low (20%) – Unlikely LVO</li>
                  <li><strong>5–6:</strong> Moderate (55%) – Probable LVO</li>
                  <li><strong>7–9:</strong> High (85%) – Very likely LVO</li>
                </ul>
                <p className="text-[11px] mt-1.5">
                  <strong>Pearl:</strong> RACE ≥5 has 85% sensitivity for LVO — prompt urgent CTA/CTP.
                </p>
              </div>
              <p className="text-[9px] text-slate-400 border-t border-slate-100 pt-2">
                Pérez de la Ossa N et al. Stroke. 2014.
              </p>
            </div>
          )}
        </div>

        {/* Right controls: Rapid/Detailed + Copy + Reset */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5">
            <button
              onClick={() => setNihssMode('rapid')}
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
            title="Copy to EMR"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={() => setNihssValues({})}
            title="Reset"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
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
          className="min-h-[44px] px-6 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl transition-colors"
        >
          Apply score to workflow — {total}
        </button>
      </div>
    </div>
  );
};
