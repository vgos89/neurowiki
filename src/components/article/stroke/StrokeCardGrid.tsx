import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Step1Data } from './CodeModeStep1';
import type { Step2Data } from './CodeModeStep2';

interface StrokeCardGridProps {
  activeCard: number;
  onSelectCard: (id: number) => void;
  step1Data: Step1Data | null;
  step2Data: Step2Data | null;
  step4Orders: string[];
  doorTime: Date;
  tpaBolusTime?: Date | null;
}

function formatHHMM(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function card1Summary(d: Step1Data | null): string {
  if (!d) return 'Enter LKW, NIHSS & vitals';
  const lkw = d.lkwUnknown ? 'Unknown' : `${d.lkwHours.toFixed(1)}h`;
  return `LKW: ${lkw} · NIHSS: ${d.nihssScore} · BP: ${d.systolicBP}/${d.diastolicBP}`;
}

function card2Summary(d: Step2Data | null): string {
  if (!d) return 'Select CT result & treatment';
  if (d.ctResult === 'bleed') return 'CT: ICH detected · ICH protocol';
  const ct = d.ctResult === 'no-bleed' ? 'No bleed' : 'Other finding';
  const tx = !d.treatmentGiven || d.treatmentGiven === 'none'
    ? 'No thrombolysis'
    : d.treatmentGiven.toUpperCase();
  return `CT: ${ct} · ${tx}`;
}

function card3Summary(doorTime: Date, orders: string[], tpaBolusTime?: Date | null): string {
  const orderText = orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'No orders yet';
  if (!tpaBolusTime) return `Door: ${formatHHMM(doorTime)} · ${orderText}`;
  const dtnMin = Math.round((tpaBolusTime.getTime() - doorTime.getTime()) / 60000);
  const flag = dtnMin <= 60 ? ' ✓' : '';
  return `DTN: ${dtnMin} min${flag} · ${orderText}`;
}

const CARDS = [
  { id: 1, title: 'LKW & Vitals', sub: 'Assessment' },
  { id: 2, title: 'CT & Treatment', sub: 'Imaging' },
  { id: 3, title: 'Summary & Orders', sub: 'Documentation' },
] as const;

export const StrokeCardGrid: React.FC<StrokeCardGridProps> = ({
  activeCard,
  onSelectCard,
  step1Data,
  step2Data,
  step4Orders,
  doorTime,
  tpaBolusTime,
}) => {
  const summaries: Record<number, string> = {
    1: card1Summary(step1Data),
    2: card2Summary(step2Data),
    3: card3Summary(doorTime, step4Orders, tpaBolusTime),
  };

  const hasData: Record<number, boolean> = {
    1: step1Data !== null,
    2: step2Data !== null,
    3: true, // door time always set
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 px-3 sm:px-6 mb-4" role="tablist" aria-label="Stroke code sections">
      {CARDS.map((card) => {
        const isActive = activeCard === card.id;
        const filled = hasData[card.id];

        return (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="card-content-panel"
            onClick={() => onSelectCard(card.id)}
            className={[
              'flex flex-col gap-1 p-3 rounded-xl text-left transition-all min-h-[72px]',
              card.id === 3 ? 'col-span-2' : '',
              isActive
                ? 'border-2 border-neuro-500 bg-neuro-50 shadow-sm'
                : filled
                  ? 'border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  : 'border-2 border-dashed border-slate-200 bg-slate-50/60 hover:border-slate-300',
            ].join(' ')}
          >
            {/* Header row: number badge + title */}
            <div className="flex items-center gap-2">
              <span
                className={[
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0',
                  isActive
                    ? 'bg-neuro-500 text-white'
                    : filled
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-300 text-slate-600',
                ].join(' ')}
                aria-hidden
              >
                {card.id}
              </span>
              <span className={[
                'text-xs font-bold leading-tight flex-1 min-w-0',
                isActive ? 'text-neuro-700' : 'text-slate-800',
              ].join(' ')}>
                {card.title}
              </span>
              <ChevronRight
                className={[
                  'w-3.5 h-3.5 flex-shrink-0 transition-transform',
                  isActive ? 'text-neuro-400 rotate-90' : 'text-slate-300',
                ].join(' ')}
                aria-hidden
              />
            </div>

            {/* Summary line */}
            <p className={[
              'text-[11px] leading-snug pl-7',
              isActive
                ? 'text-neuro-600'
                : filled
                  ? 'text-slate-600'
                  : 'text-slate-400 italic',
            ].join(' ')}>
              {summaries[card.id]}
            </p>
          </button>
        );
      })}
    </div>
  );
};
