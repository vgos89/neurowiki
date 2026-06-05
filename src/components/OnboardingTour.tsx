/**
 * OnboardingTour — first-time-user walkthrough.
 *
 * V feedback 2026-05-20: "Can we do tutorials for first time users that
 * some apps do? where it highlights how to click through the app?"
 *
 * A centered carousel walking the clinician through the major surfaces
 * (pathways, calculators, trials, save case, timestamp tracker). The install
 * ("add to your phone") prompt is a SEPARATE pop-up (InstallPromptOverlay) that
 * fires after the tour finishes or is skipped — on dismiss the tour emits
 * TOUR_COMPLETE_EVENT so the two first-run modals never stack.
 *
 * Trigger gates (all must be true):
 *   - Disclaimer accepted (the `neurowiki:disclaimer:v1` flag, set by the
 *     FirstRunConsentBar on Continue / backfilled on mount).
 *   - Tour not previously completed/dismissed (neurowiki:tour-complete:v1).
 *   - On the home route only (deep-linked first visits aren't ambushed).
 *
 * Replay: `replayOnboardingTour()` clears the flag and returns home so the tour
 * re-triggers.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Activity, Calculator, BookOpen, Bookmark, Clock, ArrowRight } from 'lucide-react';
import {
  DISCLAIMER_FLAG_KEY,
  DISCLAIMER_ACCEPTED_EVENT,
  TOUR_COMPLETE_KEY,
  TOUR_COMPLETE_EVENT,
} from '../lib/consent';

/** Public helper for a "Replay tour" affordance. */
export function replayOnboardingTour(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOUR_COMPLETE_KEY);
  window.location.assign('/');
}

interface Slide {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: <Activity className="w-7 h-7 text-neuro-600" aria-hidden />,
    eyebrow: 'Welcome',
    title: 'Bedside neurology, organized',
    body: 'NeuroWiki gives you pathways, calculators, and trial references that load fast and work offline. Built for the moments when you need an answer in seconds.',
  },
  {
    icon: <BookOpen className="w-7 h-7 text-neuro-600" aria-hidden />,
    eyebrow: 'Pathways',
    title: 'Time-critical workflows',
    body: 'Open Pathways for guided decision trees: stroke code, ICH protocol, extended IVT window, migraine, status epilepticus. Each pathway tracks timestamps as you go.',
  },
  {
    icon: <Calculator className="w-7 h-7 text-neuro-600" aria-hidden />,
    eyebrow: 'Calculators',
    title: 'NIHSS, GCS, ABCD², CHA₂DS₂-VASc and more',
    body: 'Tap Calculators for quick scoring. Every result gives you a numeric output plus a clinical interpretation drawer. Copy the summary to your EMR with one tap.',
  },
  {
    icon: <Bookmark className="w-7 h-7 text-neuro-600" aria-hidden />,
    eyebrow: 'Save Case',
    title: 'Keep cases for follow-up',
    body: 'The Save button on every calculator captures the inputs, the score, and any timestamps. Useful for handoff notes, M&M prep, or revisiting a complex patient later. Data stays on your device.',
  },
  {
    icon: <Clock className="w-7 h-7 text-neuro-600" aria-hidden />,
    eyebrow: 'Stroke timestamps',
    title: 'Clock FAB tracks the codes',
    body: 'On NIHSS and the stroke pathway, the cobalt clock button in the corner records Code Activation, CT Read, Neuro IR, and sign-out times. The first tap auto-fills your neurology evaluation time. Tap the pencil on any row to edit by typing.',
  },
];

export const OnboardingTour: React.FC = () => {
  const location = useLocation();
  const [eligible, setEligible] = useState(false);
  const [step, setStep] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Re-check on route change and when the disclaimer is accepted (the event lets
  // the tour launch the instant the consent bar's Continue is tapped). The tour
  // only auto-launches on home. The install overlay it used to sequence behind
  // is gone, so there is no overlay handshake any more.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const recheck = () => {
      const disclaimerAcked = window.localStorage.getItem(DISCLAIMER_FLAG_KEY) === '1';
      const tourDone = window.localStorage.getItem(TOUR_COMPLETE_KEY) === '1';
      const onHome = location.pathname === '/' || location.pathname === '/home';
      setEligible(disclaimerAcked && !tourDone && onHome);
    };
    recheck();
    window.addEventListener(DISCLAIMER_ACCEPTED_EVENT, recheck);
    return () => window.removeEventListener(DISCLAIMER_ACCEPTED_EVENT, recheck);
  }, [location.pathname]);

  // Move focus into the dialog when it opens (proper modal pattern) and remember
  // where focus was, so it can be returned on dismiss.
  useEffect(() => {
    if (!eligible) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    cardRef.current?.focus();
  }, [eligible]);

  const slides = SLIDES;

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOUR_COMPLETE_KEY, '1');
      // Tell the install pop-up the tour is done so it can take its turn.
      window.dispatchEvent(new Event(TOUR_COMPLETE_EVENT));
    }
    setEligible(false);
    // Return focus where it was, or to the main landmark, so keyboard /
    // screen-reader users aren't dropped to <body> when the dialog unmounts.
    const prev = restoreFocusRef.current;
    const target = prev && document.contains(prev) ? prev : document.querySelector('main');
    if (target instanceof HTMLElement) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
    }
  };

  if (!eligible) return null;

  const safeStep = Math.min(step, slides.length - 1);
  const slide = slides[safeStep];
  const isLast = safeStep === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[94] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      onKeyDown={(e) => { if (e.key === 'Escape') dismiss(); }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Card */}
      <div
        ref={cardRef}
        tabIndex={-1}
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SR-only live announcement so step changes are spoken */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Step {safeStep + 1} of {slides.length}: {slide.title}
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Skip tour"
          className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 min-h-[44px] px-3 py-2 rounded text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
        >
          Skip <X className="w-3.5 h-3.5" aria-hidden />
        </button>

        {/* Slide body */}
        <div className="px-6 pt-12 pb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neuro-50 mb-4">
            {slide.icon}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-neuro-600 mb-1">
            {slide.eyebrow}
          </p>
          <h2 id="onboarding-tour-title" className="text-lg font-bold text-slate-900 mb-2 leading-tight">
            {slide.title}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{slide.body}</p>
        </div>

        {/* Progress dots */}
        <div className="px-6 py-3 flex items-center justify-center gap-1.5" aria-label={`Step ${safeStep + 1} of ${slides.length}`}>
          {slides.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                i === safeStep ? 'w-6 bg-neuro-500' : i < safeStep ? 'w-1.5 bg-neuro-300' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={safeStep === 0}
            className="min-h-[44px] text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-2 rounded disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {isLast ? 'Get started' : 'Next'}
            {!isLast && <ArrowRight className="w-4 h-4" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
