import React from 'react';
import { setStorageItem } from '../utils/storage';
import { loadGA, reportAiTrafficToGA, CONSENT_STORAGE_KEY } from '../utils/analytics';

interface Props {
  onConsent: () => void;
}

const CookieConsentBanner: React.FC<Props> = ({ onConsent }) => {
  const accept = () => {
    setStorageItem(CONSENT_STORAGE_KEY, 'accepted');
    loadGA();
    // First-time consent → fire AI-traffic detection so this session is
    // tagged before the next page_view event.
    reportAiTrafficToGA();
    onConsent();
  };

  const decline = () => {
    setStorageItem(CONSENT_STORAGE_KEY, 'declined');
    onConsent();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 shadow-lg px-4 py-3 sm:px-6 safe-area-pb">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="flex-1 text-sm text-slate-600">
          We use analytics cookies to understand how clinicians use NeuroWiki and improve the tool.{' '}
          <a href="/privacy" className="text-neuro-600 underline underline-offset-2">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-3 py-1.5 text-sm text-white bg-neuro-600 rounded-md hover:bg-neuro-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
