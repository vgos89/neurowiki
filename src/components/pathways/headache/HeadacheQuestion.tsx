/**
 * HeadacheQuestion — Frame 2's "one question per screen" zone.
 *
 * Renders a single `HeadacheQuestion` config entry (src/data/headacheQuestions.ts)
 * as the approved large answer cards. Single-select cards commit-and-advance;
 * multi-select cards toggle and expose an explicit Continue (PM spec §5.4 — a
 * multi-check screen always carries its own primary action, never hidden among
 * the options). The faint Teach pearl shows when present (Scenario C); a quiet
 * Skip lets the clinician pass an unsure question.
 *
 * No clinical claims are authored here — every label comes from the gated
 * question config. No percentages.
 */
import React from 'react';
import { CircleCheck, Circle, CheckSquare, Square, GraduationCap, ChevronRight } from 'lucide-react';
import type { HeadacheQuestion as HeadacheQuestionConfig, AnswerOption } from '../../../data/headacheQuestions';

export interface HeadacheQuestionProps {
  question: HeadacheQuestionConfig;
  /** Currently-selected option ids for this question. */
  selectedOptionIds: ReadonlySet<string>;
  /** One-based position + total, for the eyebrow ("Question N of ~M"). */
  position: number;
  total: number;
  /** Single-select: commit this option (page advances). */
  onSelectSingle: (option: AnswerOption) => void;
  /** Multi-select: toggle this option (no advance). */
  onToggleMulti: (option: AnswerOption) => void;
  /** Multi-select: explicit advance. */
  onContinue: () => void;
  /** Pass an unsure question without answering. */
  onSkip: () => void;
}

export const HeadacheQuestion: React.FC<HeadacheQuestionProps> = ({
  question,
  selectedOptionIds,
  position,
  total,
  onSelectSingle,
  onToggleMulti,
  onContinue,
  onSkip,
}) => {
  const isMulti = question.select === 'multi';

  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Question {position} of ~{total} · {question.eyebrow}
      </div>
      <h2 className="text-[22px] font-medium tracking-[-0.01em] text-slate-900 leading-snug mt-2">
        {question.prompt}
      </h2>

      {question.teach && (
        <div className="mt-2 flex items-start gap-1.5 text-[12px] text-neuro-700/80">
          <GraduationCap className="w-[15px] h-[15px] mt-px text-neuro-400 shrink-0" aria-hidden="true" />
          <span className="leading-snug">
            <span className="font-semibold">Teach:</span> {question.teach}
          </span>
        </div>
      )}

      <div className="mt-4 space-y-2.5" role={isMulti ? 'group' : 'radiogroup'} aria-label={question.prompt}>
        {question.options.map(opt => {
          const on = selectedOptionIds.has(opt.id);
          const OnIcon = isMulti ? CheckSquare : CircleCheck;
          const OffIcon = isMulti ? Square : Circle;
          return (
            <button
              key={opt.id}
              type="button"
              role={isMulti ? 'checkbox' : 'radio'}
              aria-checked={on}
              onClick={() => (isMulti ? onToggleMulti(opt) : onSelectSingle(opt))}
              className={`w-full text-left rounded-lg border px-4 min-h-[60px] flex items-center justify-between gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 ${
                on
                  ? 'border-neuro-500 bg-[#f8faff]'
                  : 'border-slate-100 bg-white hover:border-neuro-500 hover:bg-[#f8faff]'
              }`}
            >
              <span className={`text-[15px] font-medium ${on ? 'text-slate-900' : 'text-slate-700'}`}>{opt.label}</span>
              {on ? (
                <OnIcon className="w-5 h-5 text-neuro-500 shrink-0" aria-hidden="true" />
              ) : (
                <OffIcon className="w-5 h-5 text-slate-300 shrink-0" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {isMulti && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full mt-4 bg-neuro-500 hover:bg-neuro-600 text-white text-[15px] font-semibold rounded-xl px-5 min-h-[52px] flex items-center justify-center gap-1.5 transition-colors"
        >
          Continue
          <ChevronRight className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
      )}

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] text-slate-400 hover:text-slate-600 underline underline-offset-2 min-h-[44px] px-4"
        >
          Skip (unsure)
        </button>
      </div>
    </div>
  );
};
