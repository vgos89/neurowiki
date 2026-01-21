import React, { useState, useEffect, useRef } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageType: string;
  pagePath: string;
}

type FeedbackType = 'error' | 'suggestion' | 'question' | 'praise';

const feedbackTypes: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'error', label: 'Report Error', icon: '🐛' },
  { value: 'suggestion', label: 'Suggestion', icon: '💡' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'praise', label: 'Praise', icon: '🌟' },
];

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const apiUrl = import.meta.env.VITE_FEEDBACK_API_URL || '/.netlify/functions/feedback';

  const doRender = () => {
    if (!window.turnstile || !turnstileRef.current) return;
    setTurnstileToken(null);
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (_) {}
      widgetIdRef.current = null;
    }
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: (token: string) => setTurnstileToken(token),
      'error-callback': () => setTurnstileToken(null),
      appearance: 'interaction-only',
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    setTurnstileToken(null);
    const run = () => {
      doRender();
    };

    if (window.turnstile) {
      run();
      return () => {
        if (widgetIdRef.current) {
          try {
            window.turnstile?.remove(widgetIdRef.current);
          } catch (_) {}
          widgetIdRef.current = null;
        }
      };
    }

    if (document.querySelector(`script[src="${TURNSTILE_SCRIPT}"]`)) {
      const check = () => {
        if (window.turnstile) {
          run();
          return true;
        }
        return false;
      };
      if (check()) {
        return () => {
          if (widgetIdRef.current) {
            try {
              window.turnstile?.remove(widgetIdRef.current);
            } catch (_) {}
            widgetIdRef.current = null;
          }
        };
      }
      const t = setInterval(() => {
        if (check()) clearInterval(t);
      }, 50);
      return () => {
        clearInterval(t);
        if (widgetIdRef.current) {
          try {
            window.turnstile?.remove(widgetIdRef.current);
          } catch (_) {}
          widgetIdRef.current = null;
        }
      };
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
    script.onload = run;

    return () => {
      if (widgetIdRef.current) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      return;
    }
    if (!message.trim()) {
      return;
    }
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
          turnstileToken,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setMessage('');
        setEmail('');
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" role="dialog" aria-labelledby="feedback-title">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 id="feedback-title" className="text-lg font-semibold text-slate-900">Send Feedback</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            About: <span className="font-medium text-slate-700">{pageTitle}</span>
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-900">Thank you!</p>
            <p className="text-sm text-slate-500 mt-1">Your feedback has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Type of feedback</label>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFeedbackType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      feedbackType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-slate-400 font-normal">(optional, for follow-up)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div ref={turnstileRef} className="min-h-[40px] flex items-center justify-center" />

            {submitStatus === 'error' && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Something went wrong. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isSubmitting || !turnstileToken ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
