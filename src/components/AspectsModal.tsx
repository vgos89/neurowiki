import React, { useState, useCallback, useEffect } from 'react';
import { X, Check } from 'lucide-react';

// ── Region definitions (mirrors AspectScoreCalculator) ────────────────────

const CORTICAL_REGIONS = [
  { id: 'M1', label: 'M1', fullName: 'Anterior MCA cortex' },
  { id: 'M2', label: 'M2', fullName: 'Lateral insular / MCA cortex' },
  { id: 'M3', label: 'M3', fullName: 'Posterior MCA cortex' },
  { id: 'M4', label: 'M4', fullName: 'Anterior MCA (superior)' },
  { id: 'M5', label: 'M5', fullName: 'Lateral MCA (superior)' },
  { id: 'M6', label: 'M6', fullName: 'Posterior MCA (superior)' },
] as const;

const SUBCORTICAL_REGIONS = [
  { id: 'C',  label: 'C',  fullName: 'Caudate' },
  { id: 'L',  label: 'L',  fullName: 'Lentiform nucleus' },
  { id: 'IC', label: 'IC', fullName: 'Internal capsule' },
  { id: 'I',  label: 'I',  fullName: 'Insular ribbon' },
] as const;

type RegionId = (typeof CORTICAL_REGIONS)[number]['id'] | (typeof SUBCORTICAL_REGIONS)[number]['id'];

// ── Score color helpers ───────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 3) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreLabel(score: number): string {
  if (score >= 8) return 'Small/No Infarct — EVT strongly indicated';
  if (score >= 6) return 'Moderate — EVT generally indicated';
  if (score >= 3) return 'Large Core — EVT may benefit (SELECT-2 / ANGEL-ASPECT)';
  return 'Extensive — EVT typically not indicated';
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface AspectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreConfirmed?: (score: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export const AspectsModal: React.FC<AspectsModalProps> = ({
  isOpen,
  onClose,
  onScoreConfirmed,
}) => {
  const [involved, setInvolved] = useState<Set<RegionId>>(new Set());

  const score = 10 - involved.size;

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setInvolved(new Set());
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleRegion = useCallback((id: RegionId) => {
    setInvolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleConfirm = () => {
    onScoreConfirmed?.(score);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aspects-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 id="aspects-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              ASPECTS Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mark regions with early ischemic change</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live score */}
            <div className="text-right" aria-live="polite" aria-atomic="true" aria-label={`ASPECTS ${score} out of 10`}>
              <div className={`text-2xl font-black tabular-nums ${scoreColor(score)}`}>
                {score}<span className="text-sm font-normal text-slate-400">/10</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close ASPECTS calculator"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Region grid */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Cortical */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Cortical (M1–M6)
              </p>
              <div className="space-y-1.5">
                {CORTICAL_REGIONS.map((r) => {
                  const isOn = involved.has(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isOn}
                      onClick={() => toggleRegion(r.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all min-h-[44px] ${
                        isOn
                          ? 'border-red-400 bg-red-50 dark:bg-red-900/25 dark:border-red-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold flex-shrink-0 ${
                          isOn ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {r.label}
                      </span>
                      <span className={`text-xs font-medium leading-tight ${isOn ? 'text-red-800 dark:text-red-200' : 'text-slate-700 dark:text-slate-300'}`}>
                        {r.fullName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcortical */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Subcortical
              </p>
              <div className="space-y-1.5">
                {SUBCORTICAL_REGIONS.map((r) => {
                  const isOn = involved.has(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isOn}
                      onClick={() => toggleRegion(r.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all min-h-[44px] ${
                        isOn
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/25 dark:border-orange-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold flex-shrink-0 ${
                          isOn ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {r.label}
                      </span>
                      <span className={`text-xs font-medium leading-tight ${isOn ? 'text-orange-800 dark:text-orange-200' : 'text-slate-700 dark:text-slate-300'}`}>
                        {r.fullName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Score summary */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
                <div className={`text-3xl font-black tabular-nums mt-0.5 ${scoreColor(score)}`}>
                  {score}<span className="text-sm font-normal text-slate-400">/10</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{involved.size} region{involved.size !== 1 ? 's' : ''} involved</div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="mt-4 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className={`text-xs font-medium ${scoreColor(score)}`}>
              {scoreLabel(score)}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex gap-3 px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          {onScoreConfirmed && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-neuro-500 hover:bg-neuro-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check size={16} aria-hidden="true" />
              Use ASPECTS {score}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AspectsModal;
