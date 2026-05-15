import React, { useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

const FeedbackModal = lazy(() => import('./FeedbackModal'));

export type PageType = 'article' | 'calculator' | 'pathway' | 'trial';

interface FeedbackButtonProps {
  pageTitle?: string;
  pageType?: PageType;
  pagePath?: string;
}

function humanizePath(path: string): string {
  const segment = path.split('/').filter(Boolean).pop() || '';
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPageType(pathname: string): PageType {
  if (pathname.startsWith('/guide')) return 'article';
  if (pathname.startsWith('/trials')) return 'trial';
  if (pathname.startsWith('/calculators')) {
    return pathname.toLowerCase().includes('pathway') ? 'pathway' : 'calculator';
  }
  return 'article';
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const pagePath = props.pagePath ?? location.pathname;
  const pageType = props.pageType ?? getPageType(pagePath);
  const pageTitle = props.pageTitle ?? ((typeof document !== 'undefined' ? document.title : '') || humanizePath(pagePath) || 'Page');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="feedback-btn fixed bottom-24 right-4 md:right-6 z-40 flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg hover:border-neuro-300 hover:bg-neuro-50 active:scale-[0.98] transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2"
        aria-label="Send feedback about this page"
      >
        <svg
          className="w-4 h-4 text-slate-500 group-hover:text-neuro-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="text-[13px] font-medium text-slate-700 group-hover:text-neuro-700 hidden sm:inline">
          Feedback
        </span>
      </button>

      {isOpen && (
        <Suspense fallback={null}>
          <FeedbackModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            pageTitle={pageTitle}
            pageType={pageType}
            pagePath={pagePath}
          />
        </Suspense>
      )}
    </>
  );
};

export default FeedbackButton;
