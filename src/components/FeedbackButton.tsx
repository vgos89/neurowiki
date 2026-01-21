import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FeedbackModal from './FeedbackModal';

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
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl hover:border-slate-300 transition-all group"
        aria-label="Send feedback"
      >
        <svg
          className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 hidden sm:inline">
          Feedback
        </span>
      </button>

      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pageTitle={pageTitle}
        pageType={pageType}
        pagePath={pagePath}
      />
    </>
  );
};

export default FeedbackButton;
