/**
 * ProtocolModal — shared clinical protocol modal primitive.
 *
 * Consolidates 3 identical modal shells into one primitive:
 *   - TpaReversalProtocolModal (sICH after thrombolysis)
 *   - OrolingualEdemaProtocolModal (post-thrombolysis angioedema)
 *   - HemorrhageProtocolModal (acute spontaneous ICH)
 *
 * All clinical text (titles, step body, references) is passed in by
 * consumers as data — this primitive does NOT carry any clinical
 * content of its own. It is render-only.
 *
 * Improvements over the per-modal originals:
 *   - Tab-cycle focus trap (a11y baseline lift; the originals only had
 *     focus-on-open + Escape-closes, not full Tab cycling)
 *   - Single source-of-truth focus / escape / portal behavior
 *
 * Extracted 2026-05-17 per audit-stroke-code-design-2026-05-17.md G-02
 * and audit-stroke-code-a11y-2026-05-17.md (modal focus-pattern
 * consolidation).
 *
 * Tokens: design-tokens skill (neuro-500 cobalt CTAs, slate-* neutral
 * chrome, red-400 / amber-400 severity strip per severity prop).
 */
import React, { useRef } from 'react';
import { X, Copy } from 'lucide-react';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';
import { ShareButton } from '../../calculators/ShareButton';

export interface ProtocolStep {
  title: string;
  /**
   * Step body text. Some sources use `body`, some use `detail` —
   * this primitive standardizes on `body`. Consumer pre-maps if its
   * source data uses a different field name.
   */
  body: string;
  /**
   * Optional evidence-class tag rendered as a small slate line below
   * the body (e.g., "INTERACT2", "Class IIa"). Used by the ICH protocol;
   * other consumers omit.
   */
  evidence?: string;
}

export interface ProtocolModalSeverity {
  /** Tone keyword. Drives left-border + eyebrow color. */
  tone: 'red' | 'amber';
  /** Short uppercase eyebrow, e.g. "Life-threatening" / "Airway risk". */
  eyebrow: string;
  /**
   * Description rendered below the eyebrow. ReactNode to allow inline
   * <strong> emphasis from the consumer.
   */
  description: React.ReactNode;
}

export interface ProtocolModalReferences {
  /** Footer reference text. Also included verbatim in the EMR copy payload. */
  text: string;
  /** Optional inline link rendered after the text (e.g., "Full guideline"). */
  link?: { href: string; label: string };
}

export interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
  /** Stable id used for aria-labelledby / aria-describedby. */
  id: string;
  /** Short header title (e.g., "tPA/TNK Reversal"). */
  shortTitle: string;
  /** Short header subtitle line (e.g., "AHA/ASA 2026 · Act in sequence"). */
  shortSubtitle: string;
  /** Full title for EMR copy payload (longer than shortTitle). */
  fullTitle: string;
  severity: ProtocolModalSeverity;
  steps: ProtocolStep[];
  references: ProtocolModalReferences;
}

export function ProtocolModal({
  isOpen,
  onClose,
  onCopySuccess,
  id,
  shortTitle,
  shortSubtitle,
  fullTitle,
  severity,
  steps,
  references,
}: ProtocolModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Modal focus + keyboard wiring (focus-on-open, return-focus-on-close,
  // Escape, Tab-cycle trap) per useModalFocusTrap hook.
  useModalFocusTrap(isOpen, onClose, dialogRef, closeButtonRef);

  const buildEmrText = (): string => {
    const lines = [
      fullTitle,
      `Date/Time: ${new Date().toLocaleString()}`,
      '',
      ...steps.map((s, i) => {
        const evidence = s.evidence ? ` (${s.evidence})` : '';
        return `${i + 1}. ${s.title}. ${s.body}${evidence}`;
      }),
      '',
      references.text,
    ];
    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildEmrText()).then(() => {
      onCopySuccess?.();
    });
  };

  // useModalFocusTrap restores focus on close — handler is now just onClose.
  const handleClose = onClose;

  if (!isOpen) return null;

  const severityBorder = severity.tone === 'red' ? 'border-red-400' : 'border-amber-400';
  const severityText = severity.tone === 'red' ? 'text-red-600' : 'text-amber-600';

  const titleId = `${id}-modal-title`;
  const descId = `${id}-modal-desc`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg max-h-[90dvh] sm:min-h-0 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 bg-white flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-slate-900 tracking-tight">
              {shortTitle}
            </h2>
            <p id={descId} className="text-xs text-slate-400 mt-0.5">
              {shortSubtitle}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className={`border-l-2 ${severityBorder} pl-4 mb-6`}>
            <p className={`text-[10px] font-bold ${severityText} uppercase tracking-widest`}>
              {severity.eyebrow}
            </p>
            <p className="text-sm text-slate-600 mt-0.5">{severity.description}</p>
          </div>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs font-bold text-neuro-500 flex-shrink-0 mt-0.5 w-5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{step.body}</p>
                  {step.evidence && (
                    <p className="text-xs text-slate-400 mt-0.5">{step.evidence}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            {references.text}
            {references.link && (
              <>
                {' '}
                <a
                  href={references.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neuro-500 hover:underline"
                >
                  {references.link.label}
                </a>
                .
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-[44px] bg-neuro-500 hover:bg-neuro-600 text-white text-sm font-semibold rounded-full transition-colors inline-flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" aria-hidden />
            Copy to EMR
          </button>
          <ShareButton
            text={buildEmrText}
            title={shortTitle}
            onResult={(r) => { if (r === 'shared') onCopySuccess?.(); }}
            variant="pill"
            label="Send"
          />
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProtocolModal;
