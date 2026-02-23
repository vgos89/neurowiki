import React, { ReactNode, useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, LockOpen } from 'lucide-react';

interface ProtocolSectionProps {
  number: number;
  title: string;
  description?: string;
  status: 'in-progress' | 'pending' | 'completed';
  isActive?: boolean;
  children: ReactNode;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  completionButtonLabel?: string;
  completionSummary?: string;
  // Deep Learning badge props
  showDeepLearningBadge?: boolean;
  pearlCount?: number;
  onDeepLearningClick?: () => void;
  // Parallel team workflow unlock
  onUnlock?: () => void;
}

export const ProtocolSection: React.FC<ProtocolSectionProps> = ({
  number,
  title,
  description,
  status,
  isActive = false,
  children,
  onComplete,
  showCompleteButton = false,
  completionButtonLabel = 'Next',
  completionSummary,
  showDeepLearningBadge = false,
  pearlCount = 0,
  onDeepLearningClick,
}) => {
  // Auto-collapse when completed; user can re-expand
  const [userExpanded, setUserExpanded] = useState(false);

  useEffect(() => {
    if (status === 'completed') setUserExpanded(false);
  }, [status]);

  const isCollapsed = status === 'completed' && !userExpanded;

  // Compact summary row — shown when step is completed and collapsed
  if (isCollapsed) {
    return (
      <div className="relative pl-4 border-l-4 border-green-500">
        <button
          type="button"
          onClick={() => setUserExpanded(true)}
          className="w-full flex items-start gap-3 py-2 pr-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors group"
          aria-label={`Step ${number} completed — click to expand`}
        >
          {/* Green step number badge */}
          <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-green-600/20 flex-shrink-0">
            {number}
          </div>

          <div className="flex-1 min-w-0 pl-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</span>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase tracking-wide">
                Completed
              </span>
            </div>
            {completionSummary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{completionSummary}</p>
            )}
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0 mt-1.5" aria-hidden />
        </button>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'in-progress':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase tracking-wide">
            IN PROGRESS
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wide">
            PENDING
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wide">
            COMPLETED
          </span>
        );
    }
  };

  return (
    <div className={`relative ${isActive ? 'pl-4 border-l-4 border-red-600' : 'pl-4 border-l-4 border-transparent'}`}>
      {/* Header */}
      <div className="mb-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          {/* Left Side: Step Number + Title */}
          <div className="flex items-center gap-3 pl-6 sm:pl-6">
            <div className={`absolute -left-[22px] sm:-left-[17px] top-0 w-11 h-11 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base ${
              status === 'completed' ? 'bg-green-600 shadow-lg shadow-green-600/20' :
              status === 'in-progress' ? 'bg-red-600 shadow-lg shadow-red-600/20' :
'bg-slate-300 text-slate-600'
}`}>
              {number}
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>
          </div>

          {/* Right Side: Status Badge + Collapse button (when expanded completed) + Deep Learning */}
          <div className="flex items-center gap-2 ml-14 sm:ml-11 lg:ml-0 flex-wrap">
            {getStatusBadge()}

            {/* Collapse button — only shown when user re-expanded a completed step */}
            {status === 'completed' && userExpanded && (
              <button
                type="button"
                onClick={() => setUserExpanded(false)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronDown className="w-3 h-3" aria-hidden />
                Collapse
              </button>
            )}

            {/* Deep Learning Badge */}
            {showDeepLearningBadge && onDeepLearningClick && (
              <button
                onClick={onDeepLearningClick}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                aria-label={`View ${pearlCount} clinical pearls`}
              >
                <span>Deep Learning</span>
                <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            {description}
          </p>
        )}
      </div>

      {/* Section Content */}
      <div className="space-y-3">
        {children}
      </div>

      {/* Complete / Next Button */}
      {showCompleteButton && onComplete && status !== 'completed' && (
        <div className="mt-6 flex justify-end safe-area-pb md:pb-0">
          <button
            onClick={() => {
              if (onComplete) onComplete();

              // For non-final steps, scroll to the next section
              if (completionButtonLabel === 'Next') {
                setTimeout(() => {
                  const nextSectionId = `step-${number + 1}`;
                  const nextSection = document.getElementById(nextSectionId);

                  if (nextSection) {
                    const stickyHeader = document.querySelector('[data-header-height]') as HTMLElement ||
                                        document.querySelector('.sticky.top-0') as HTMLElement;
                    let headerOffset = 120;

                    if (stickyHeader) {
                      const dataHeight = stickyHeader.getAttribute('data-header-height');
                      headerOffset = dataHeight ? parseInt(dataHeight, 10) : stickyHeader.offsetHeight;
                    }

                    const elementRect = nextSection.getBoundingClientRect();
                    const absoluteElementTop = elementRect.top + window.pageYOffset;
                    const offsetPosition = absoluteElementTop - headerOffset;

                    requestAnimationFrame(() => {
                      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });

                      setTimeout(() => {
                        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                        if (Math.abs(currentScroll - Math.max(0, offsetPosition)) > 100) {
                          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setTimeout(() => window.scrollBy({ top: -headerOffset, behavior: 'smooth' }), 100);
                        }
                      }, 300);
                    });
                  }
                }, 250);
              }
            }}
            className="w-full md:w-auto min-h-[44px] px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            {completionButtonLabel !== 'Next' ? (
              <>
                <CheckCircle className="w-4 h-4" aria-hidden />
                <span>{completionButtonLabel}</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
