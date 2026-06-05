import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { loadGA, reportAiTrafficToGA, unloadGA, CONSENT_STORAGE_KEY } from '../utils/analytics';
import { analyticsEnabled } from '../lib/consent';
import { useConsentRegion } from '../hooks/useConsentRegion';

/**
 * PrivacyChoices — the persistent analytics opt-out control required for
 * default-on regions (CPRA). Rendered in the site footer on every page. Opens a
 * small dialog with an on/off toggle that reflects the current effective state
 * and writes an explicit decision (loads or disables GA at once).
 */
export const PrivacyChoices: React.FC = () => {
  const { region } = useConsentRegion();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setEnabled(analyticsEnabled(getStorageItem(CONSENT_STORAGE_KEY), region));
    restoreRef.current = (document.activeElement as HTMLElement) ?? null;
    cardRef.current?.focus();
  }, [open, region]);

  const setAnalytics = (on: boolean) => {
    if (on) {
      setStorageItem(CONSENT_STORAGE_KEY, 'accepted');
      loadGA();
      reportAiTrafficToGA();
    } else {
      setStorageItem(CONSENT_STORAGE_KEY, 'declined');
      unloadGA();
    }
    setEnabled(on);
  };

  const close = () => {
    setOpen(false);
    const t = restoreRef.current;
    if (t && document.contains(t)) t.focus();
  };

  const toggleBtn = (active: boolean) =>
    `min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
      active ? 'bg-neuro-500 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-neuro-600 underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none rounded"
      >
        Privacy choices
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-choices-title"
          onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" onClick={close} />
          <div
            ref={cardRef}
            tabIndex={-1}
            className="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl p-5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>

            <h2 id="privacy-choices-title" className="text-base font-semibold text-slate-900 pr-8">
              Privacy choices
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              NeuroWiki uses anonymous analytics to understand how clinicians use the tool. No patient
              identifiers are collected. Turn it off any time.{' '}
              <Link to="/privacy" onClick={close} className="text-neuro-600 underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-800">Anonymous analytics</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAnalytics(false)} aria-pressed={!enabled} className={toggleBtn(!enabled)}>
                  Off
                </button>
                <button type="button" onClick={() => setAnalytics(true)} aria-pressed={enabled} className={toggleBtn(enabled)}>
                  On
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              className="mt-4 w-full min-h-[44px] rounded-full text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacyChoices;
