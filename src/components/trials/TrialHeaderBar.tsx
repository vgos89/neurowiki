import { ArrowLeft } from 'lucide-react';

/**
 * TrialHeaderBar — the sticky top bar shared by every trial archetype page.
 *
 * Extracted from ~105 byte-identical copies inlined across TrialPageNew.tsx
 * (Class D-clinical refactor, arch-PR-trial-header-bar-extraction.md). It is
 * purely presentational: the per-trial abbreviation and the computed category
 * label are passed in, and `onBack` is the shared back-navigation closure. No
 * clinical text lives here — titles/subtitles/sources stay at the call site,
 * flowing from `trialMetadata`.
 *
 * Markup is reproduced verbatim from the inlined original so rendered output is
 * byte-identical; do not restyle here without a design pass.
 *
 * Accessibility: the back button's visible label is the trial abbreviation
 * (WCAG 2.5.3 — name-in-label); the ArrowLeft glyph is aria-hidden.
 */
interface TrialHeaderBarProps {
  /** Trial short name shown as the back-button label, e.g. "WAKE-UP", "ECASS III". */
  abbreviation: string;
  /** Pre-computed category badge text, e.g. "Reperfusion". Derivation stays at the call site. */
  categoryBadgeLabel: string;
  /** Shared back-navigation handler (useBackNavigation('/trials')). */
  onBack: () => void;
}

export function TrialHeaderBar({ abbreviation, categoryBadgeLabel, onBack }: TrialHeaderBarProps) {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>{abbreviation}</span>
        </button>
        <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
      </div>
    </div>
  );
}
