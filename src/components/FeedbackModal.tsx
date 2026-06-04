/**
 * FeedbackModal — page-level feedback form.
 *
 * Visual anatomy mirrors DisclaimerModal (the initial entry modal) so
 * the two reads of the app to the user feel consistent: brand-lockup
 * header (icon + eyebrow + title), max-w-lg, neuro-500 primary CTA,
 * slate-50 footer, slate-900/60 backdrop, useModalFocusTrap.
 *
 * Re-skinned 2026-05-17 per V direction.
 *
 * 2026-06-03: Cloudflare Turnstile removed (the Cloudflare account was
 * deleted, so the widget could no longer issue a token, which left the
 * submit button permanently disabled). Bot protection now lives server-side
 * in api/feedback.ts (honeypot + same-origin guard); this form contributes
 * the invisible honeypot field below.
 */
import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageType: string;
  pagePath: string;
}

type FeedbackType = 'error' | 'suggestion' | 'question' | 'praise';

const feedbackTypes: { value: FeedbackType; label: string }[] = [
  { value: 'error', label: 'Report an error' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'question', label: 'Question' },
  { value: 'praise', label: 'Praise' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  pageTitle,
  pageType,
  pagePath,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Honeypot: bound to a hidden, non-tabbable input real users never see.
  // A non-empty value at submit time signals a bot; the server silently
  // drops those. Kept in state only so the value rides along in the POST.
  const [company, setCompany] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // a11y: focus trap + Escape + Tab cycle (matches Disclaimer + Protocol modals)
  useModalFocusTrap(isOpen, onClose, dialogRef, closeButtonRef);

  const apiUrl = import.meta.env.VITE_FEEDBACK_API_URL || '/api/feedback';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message: message.trim(),
          email: email.trim() || null,
          pageTitle,
          pageType,
          pagePath,
          company,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        // Fire GA4 event on successful submit (lazy import to keep modal
        // bundle small + analytics is best-effort).
        import('../utils/analytics').then(({ trackFeedbackSubmitted }) => {
          trackFeedbackSubmitted(feedbackType, Boolean(email.trim()));
        }).catch(() => { /* noop */ });
        setSubmitStatus('success');
        setMessage('');
        setEmail('');
        setCompany('');
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSubmitStatus('idle');
      setMessage('');
      setEmail('');
      setCompany('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header — brand-lockup (matches DisclaimerModal anatomy) */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/icon-192.png"
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Feedback</p>
                <h2 id="feedback-modal-title" className="text-[17px] font-semibold text-slate-900 leading-tight">
                  Send Feedback
                </h2>
                <p className="text-[12px] text-slate-500 mt-1 truncate">
                  About: <span className="font-medium text-slate-700">{pageTitle}</span>
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </button>
          </div>
        </div>

        {submitStatus === 'success' ? (
          /* Success state — text-only confirmation per clinical pattern */
          <div className="px-6 py-10">
            <p className="text-[15px] font-semibold text-slate-900">Thank you.</p>
            <p className="text-[13.5px] text-slate-600 mt-1">Your feedback has been submitted.</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="px-6 py-5">
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-slate-900 mb-2">Type of feedback</label>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Feedback type">
                  {feedbackTypes.map((t) => {
                    const isActive = feedbackType === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setFeedbackType(t.value)}
                        className={`px-3 py-2 rounded-lg border text-[13.5px] font-medium transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                          isActive
                            ? 'border-neuro-500 bg-neuro-50 text-neuro-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="feedback-message" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  Your feedback <span className="text-rose-600" aria-hidden="true">*</span>
                  <span className="sr-only">required</span>
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think…"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13.5px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="feedback-email" className="block text-[13px] font-semibold text-slate-900 mb-2">
                  Email <span className="text-slate-400 font-normal">(optional, for follow-up)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13.5px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                />
              </div>

              {/*
                Honeypot — invisible to humans, irresistible to naive bots.
                Positioned off-screen (NOT display:none, which some bots skip)
                and removed from the a11y tree + tab order so no real user or
                screen reader ever encounters it. A non-empty value at submit
                time tells the server this was a bot (silently dropped).
              */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" style={{ position: 'absolute' }}>
                <label htmlFor="feedback-company">Company (leave blank)</label>
                <input
                  id="feedback-company"
                  type="text"
                  name="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {submitStatus === 'error' && (
                <div
                  className="mt-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-[13px] text-rose-700"
                  role="alert"
                  aria-live="assertive"
                >
                  Something went wrong. Please try again.
                </div>
              )}
            </div>

            {/* Footer (matches DisclaimerModal: bg-slate-50, neuro-500 primary CTA) */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-lg text-[14px] font-semibold transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none focus-visible:ring-offset-2 ${
                  isSubmitting
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-neuro-500 text-white hover:bg-neuro-600 active:bg-neuro-700'
                }`}
              >
                {isSubmitting ? 'Sending…' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
