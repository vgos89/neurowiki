/**
 * QuestionScreen — single-question primitive for adaptive-interview pathways.
 *
 * Generic at the UI layer. No headache types in the signature. First
 * consumer: ClinicHeadachePathway. Designed to be reused by future
 * diagnostic pathways (vertigo, weakness, AMS, etc.).
 *
 * Two question types:
 *   - 'single-choice': renders 2-4 large tap-target buttons; tapping a
 *     button commits the answer and advances. No explicit Continue.
 *   - 'multi-check': renders chip-style toggle buttons; user can tap
 *     several before committing via a Continue answer (typically labelled
 *     "Continue" or "None present").
 *
 * Accessibility:
 *   - <fieldset>+<legend> for the prompt
 *   - role="radio" / aria-checked for single-choice
 *   - role="button" + aria-pressed for multi-check toggles
 *   - focus-visible ring on every actionable element
 *   - 44px touch targets per CALCULATOR_SPEC §1.1
 *
 * Teach mode:
 *   - Renders helpText under the prompt when teachMode is true
 *   - Renders ichd3Section reference if provided
 */

import React from 'react';

export interface QuestionAnswer {
  id: string;
  label: string;
  /**
   * For multi-check questions, the special "commit" answer that ends the
   * group. When the user taps a commit answer, the page advances. Detected
   * by the parent via the answer id; this primitive doesn't enforce naming.
   */
}

export interface QuestionScreenProps {
  questionId: string;
  prompt: string;
  type: 'single-choice' | 'multi-check';
  answers: QuestionAnswer[];
  /** Currently-selected answer ids (multi-check) or single id (single-choice). */
  selectedAnswerIds: string[];
  /** Tap handler — called every time an answer button is tapped. */
  onAnswer: (answerId: string) => void;
  /** Teach mode flag (page reads from useTeachMode and prop-drills). */
  teachMode?: boolean;
  /** Teach-mode help text shown under the prompt. */
  helpText?: string;
  /** Optional ICHD-3 section reference shown in Teach mode. */
  ichd3Section?: string;
  /** Optional "I already know the diagnosis" power-user exit handler. */
  onPowerUserExit?: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionId,
  prompt,
  type,
  answers,
  selectedAnswerIds,
  onAnswer,
  teachMode = false,
  helpText,
  ichd3Section,
  onPowerUserExit,
}) => {
  const legendId = `q-${questionId}-prompt`;
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
      <fieldset>
        <legend id={legendId} className="text-[17px] font-semibold text-slate-900 leading-snug mb-1">
          {prompt}
        </legend>

        {teachMode && helpText && (
          <p className="text-[12px] text-slate-500 leading-relaxed mt-2 italic">
            {helpText}
          </p>
        )}
        {teachMode && ichd3Section && (
          <p className="text-[11px] text-neuro-700 font-semibold mt-1">
            {ichd3Section}
          </p>
        )}

        <div className={`mt-4 ${type === 'multi-check' ? 'flex flex-wrap gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'}`}>
          {answers.map(answer => {
            const isSelected = selectedAnswerIds.includes(answer.id);
            if (type === 'single-choice') {
              return (
                <button
                  key={answer.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onAnswer(answer.id)}
                  className={`
                    rounded-xl border px-4 py-4 text-left text-[14px] font-medium min-h-[64px]
                    transition-all touch-manipulation
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                    ${isSelected
                      ? 'border-neuro-500 bg-neuro-50 text-neuro-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-neuro-200 hover:bg-slate-50'}
                  `}
                >
                  {answer.label}
                </button>
              );
            }
            // multi-check
            return (
              <button
                key={answer.id}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onAnswer(answer.id)}
                className={`
                  rounded-full border px-3 py-2 text-[13px] font-medium min-h-[44px]
                  transition-all touch-manipulation
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                  ${isSelected
                    ? 'bg-neuro-50 border-neuro-500 text-neuro-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-neuro-200 hover:bg-slate-50'}
                `}
              >
                {answer.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {onPowerUserExit && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onPowerUserExit}
            className="
              text-[12px] text-neuro-600 hover:text-neuro-700 hover:underline
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 rounded
              touch-manipulation min-h-[44px] px-1
            "
          >
            I already know the diagnosis →
          </button>
        </div>
      )}
    </section>
  );
};

export default QuestionScreen;
