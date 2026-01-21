import React, { useState, useEffect, useRef, useCallback } from 'react';

const DISCLAIMER_STORAGE_KEY = 'neurowiki-disclaimer-accepted';
const MIN_WAIT_TIME_MS = 5000; // 5 seconds
const DISCLAIMER_VERSION = '1.0'; // Increment to force re-acceptance

interface StoredDisclaimer {
  version: string;
  acceptedAt: string;
  userAgent: string;
}

export const DisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [canAccept, setCanAccept] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalOpenedAt = useRef<number>(0);

  // Check if already accepted
  useEffect(() => {
    const stored = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredDisclaimer = JSON.parse(stored);
        if (data.version === DISCLAIMER_VERSION) {
          setIsOpen(false);
          return;
        }
      } catch {
        // Invalid data, show modal
      }
    }
    setIsOpen(true);
    modalOpenedAt.current = Date.now();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - modalOpenedAt.current;
      const remaining = Math.max(0, Math.ceil((MIN_WAIT_TIME_MS - elapsed) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Check if can accept
  useEffect(() => {
    const timeOk = timeRemaining === 0;
    const allConditionsMet = hasScrolledToBottom && checkboxChecked && timeOk;
    setCanAccept(allConditionsMet);
  }, [hasScrolledToBottom, checkboxChecked, timeRemaining]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20; // 20px threshold

    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  // Handle accept
  const handleAccept = () => {
    if (!canAccept) return;

    const data: StoredDisclaimer = {
      version: DISCLAIMER_VERSION,
      acceptedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    localStorage.setItem(DISCLAIMER_STORAGE_KEY, JSON.stringify(data));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Medical Disclaimer</h2>
              <p className="text-sm text-slate-500">Please read before continuing</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="px-6 py-4 max-h-64 overflow-y-auto text-sm text-slate-600 leading-relaxed"
        >
          <h3 className="font-semibold text-slate-900 mb-2">Important Notice</h3>
          <p className="mb-4">
            The information provided on Neurowiki is intended for educational purposes only and is designed to assist healthcare professionals in their clinical decision-making.
          </p>

          <h3 className="font-semibold text-slate-900 mb-2">Not a Substitute for Professional Judgment</h3>
          <p className="mb-4">
            This content is not intended to replace professional medical judgment, diagnosis, or treatment. All clinical decisions should be made by qualified healthcare providers based on individual patient circumstances.
          </p>

          <h3 className="font-semibold text-slate-900 mb-2">No Patient-Physician Relationship</h3>
          <p className="mb-4">
            Use of this website does not create a physician-patient relationship. The information presented should not be used for self-diagnosis or self-treatment.
          </p>

          <h3 className="font-semibold text-slate-900 mb-2">Accuracy and Currency</h3>
          <p className="mb-4">
            While we strive to keep information accurate and up-to-date, medical knowledge evolves rapidly. Always verify critical information with current guidelines and primary sources.
          </p>

          <h3 className="font-semibold text-slate-900 mb-2">Limitation of Liability</h3>
          <p className="mb-4">
            Neurowiki and its contributors shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of this information.
          </p>

          <h3 className="font-semibold text-slate-900 mb-2">Emergency Situations</h3>
          <p className="mb-4">
            In case of a medical emergency, call your local emergency services immediately. Do not rely on this website for emergency medical guidance.
          </p>

          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">
              By continuing, you acknowledge that you have read, understood, and agree to these terms.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="px-6 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-sm text-blue-600 font-medium">Scroll down to continue</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          {/* Checkbox */}
          <label className={`flex items-start gap-3 mb-4 cursor-pointer ${!hasScrolledToBottom ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="mt-0.5 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-slate-700">
              I am a healthcare professional and I have read and agree to the above disclaimer
            </span>
          </label>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={!canAccept}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              canAccept
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {!hasScrolledToBottom ? (
              'Please scroll to read the disclaimer'
            ) : !checkboxChecked ? (
              'Please check the box above'
            ) : timeRemaining > 0 ? (
              `Please wait... (${timeRemaining}s)`
            ) : (
              'I Accept and Agree'
            )}
          </button>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className={`flex items-center gap-1.5 text-xs ${hasScrolledToBottom ? 'text-green-600' : 'text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {hasScrolledToBottom ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                )}
              </svg>
              <span>Read</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${checkboxChecked ? 'text-green-600' : 'text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {checkboxChecked ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>Agreed</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${timeRemaining === 0 ? 'text-green-600' : 'text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {timeRemaining === 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{timeRemaining === 0 ? 'Ready' : `${timeRemaining}s`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
