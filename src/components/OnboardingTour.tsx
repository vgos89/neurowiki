/**
 * OnboardingTour — first-time-user walkthrough.
 *
 * V feedback 2026-05-20: "Can we do tutorials for first time users that
 * some apps do? where it highlights how to click through the app?"
 *
 * Approach: a centered carousel of 5 slides walking the clinician through
 * the major surfaces (pathways, calculators, trials, save case,
 * timestamp tracker). No DOM-anchored spotlight — that pattern is fragile
 * across viewports and the home page is the right place to introduce the
 * navigation in plain language anyway. Each slide has a title, a short
 * description, and a representative icon.
 *
 * Trigger gates (all must be true):
 *   - Disclaimer modal acknowledged (neurowiki:disclaimer:v1).
 *   - Tour not previously completed or dismissed
 *     (neurowiki:tour-complete:v1).
 *   - On the home route only on first open (so the tour doesn't ambush a
 *     clinician mid-pathway; deep-linked first visits skip it until they
 *     return to home).
 *
 * Replay: any consumer can call `replayOnboardingTour()` to clear the
 * localStorage flag and force the tour to re-trigger on next home visit.
 * DisclaimerModal exposes a "Replay tour" link.
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Activity, Calculator, BookOpen, Bookmark, Clock, ArrowRight } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

const DISCLAIMER_KEY = 'neurowiki:disclaimer:v1';
const TOUR_COMPLETE_KEY = 'neurowiki:tour-complete:v1';
// Mirror of InstallPromptOverlay's keys/event so the tour can sequence behind
// the install overlay — the two share the disclaimer-ack flag, so without this
// coordination both would become eligible on the same home load and stack.
const OVERLAY_SHOWN_KEY = 'neurowiki:install-overlay:v2';
const DISCLAIMER_ACCEPTED_EVENT = 'neurowiki:disclaimer-accepted';

/** Public helper for the disclaimer modal's "Replay tour" link. */
export function replayOnboardingTour(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOUR_COMPLETE_KEY);
  // Force a re-render path — the cleanest way is to nudge the URL so the
  // tour component's home-route check re-fires. The disclaimer modal can
  // also just close itself and the user navigates home; either works.
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
  const { status, ready } = usePwaInstall();
  const [eligible, setEligible] = useState(false);
  const [step, setStep] = useState(0);

  // Re-check eligibility on route change, when the install status settles, and
  // when the disclaimer is accepted. The tour only auto-launches on the home
  // route (deep-linked first visits aren't ambushed) AND only once the install
  // overlay has had its turn — so the two first-run modals never stack.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const recheck = () => {
      const disclaimerAcked = window.localStorage.getItem(DISCLAIMER_KEY) === '1';
      const tourDone = window.localStorage.getItem(TOUR_COMPLETE_KEY) === '1';
      const onHome = location.pathname === '/' || location.pathname === '/home';
      if (!disclaimerAcked || tourDone || !onHome) {
        setEligible(false);
        return;
      }
      // Wait until the PWA install status is settled before judging whether the
      // overlay applies (Chrome's beforeinstallprompt is async).
      if (!ready) {
        setEligible(false);
        return;
      }
      const overlayShown = window.localStorage.getItem(OVERLAY_SHOWN_KEY) === '1';
      const overlayApplicable =
        status === 'installable' || status === 'ios-manual' || status === 'ios-other-browser';
      // Show the tour once the overlay has shown, or when it will never apply
      // on this device (e.g. desktop, or already installed).
      setEligible(overlayShown || !overlayApplicable);
    };
    recheck();
    window.addEventListener(DISCLAIMER_ACCEPTED_EVENT, recheck);
    return () => window.removeEventListener(DISCLAIMER_ACCEPTED_EVENT, recheck);
  }, [location.pathname, status, ready]);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOUR_COMPLETE_KEY, '1');
    }
    setEligible(false);
  };

  if (!eligible) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[94] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Card */}
      <div
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Skip button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Skip tour"
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors px-2 py-1"
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
        <div className="px-6 py-3 flex items-center justify-center gap-1.5" aria-label={`Step ${step + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-neuro-500' : i < step ? 'w-1.5 bg-neuro-300' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
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
