import React, { useState } from 'react';
import { NIHSS_ITEMS, calculateTotal } from '../../../utils/nihssShortcuts';
import NihssItemCard from '../../NihssItemCard';

export interface NihssCalculatorEmbedProps {
  /** Current score in workflow (display only); applying overwrites this */
  initialScore?: number;
  onApply: (score: number) => void;
  onBack: () => void;
}

/**
 * Embeddable NIHSS calculator for stroke workflow modal.
 * Score applied via onApply(score); Back returns to workflow without applying.
 */
export const NihssCalculatorEmbed: React.FC<NihssCalculatorEmbedProps> = ({
  initialScore = 0,
  onApply,
  onBack,
}) => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});

  const total = calculateTotal(nihssValues);

  const handleNihssChange = (id: string, val: number) => {
    setNihssValues((prev) => ({ ...prev, [id]: val }));
  };

  const setAllMotor = (val: number) => {
    setNihssValues((prev) => ({ ...prev, '5a': val, '5b': val, '6a': val, '6b': val }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIHSS Total</div>
          <div className="text-2xl font-bold text-slate-900">{total.toString().padStart(2, '0')} / 42</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onApply(total)}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Apply score to workflow
          </button>
        </div>
      </div>
      {initialScore > 0 && (
        <p className="text-xs text-slate-500">
          Current score in workflow: <strong>{initialScore}</strong>. Apply above to update.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {NIHSS_ITEMS.map((item) => {
          if (item.id === '5a') {
            return (
              <React.Fragment key="motor-header">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Motor</h3>
                  <button
                    type="button"
                    onClick={() => setAllMotor(0)}
                    className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100"
                  >
                    Normal Exam
                  </button>
                </div>
                <NihssItemCard
                  key={item.id}
                  item={item}
                  value={nihssValues[item.id] ?? 0}
                  onChange={(v) => handleNihssChange(item.id, v)}
                  mode="rapid"
                  userMode="resident"
                  showPearl={false}
                  onShowPearl={() => {}}
                />
              </React.Fragment>
            );
          }
          return (
            <NihssItemCard
              key={item.id}
              item={item}
              value={nihssValues[item.id] ?? 0}
              onChange={(v) => handleNihssChange(item.id, v)}
              mode="rapid"
              userMode="resident"
              showPearl={false}
              onShowPearl={() => {}}
              isRequired={item.id === '1a'}
            />
          );
        })}
      </div>
    </div>
  );
};
