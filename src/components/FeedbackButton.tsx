import React, { useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

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
        className="feedback-btn fixed bottom-24 right-4 md:right-6 z-40 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg hover:border-neuro-300 hover:bg-neuro-50 active:scale-[0.98] transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2"
        aria-label="Send feedback about this page"
      >
        <MessageSquare
          size={15}
          className="text-slate-500 group-hover:text-neuro-600 transition-colors"
          aria-hidden="true"
        />
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
