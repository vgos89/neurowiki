import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ProtocolSectionProps {
  number: number;
  title: string;
  description?: string;
  status: 'in-progress' | 'pending' | 'completed';
  isActive?: boolean;
  children: ReactNode;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  // Deep Learning badge props
  showDeepLearningBadge?: boolean;
  pearlCount?: number;
  onDeepLearningClick?: () => void;
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
  showDeepLearningBadge = false,
  pearlCount = 0,
  onDeepLearningClick,
}) => {
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
      {/* Header - tight Stitch spacing */}
      <div className="mb-3">
        {/* Desktop: Single row with everything */}
        {/* Mobile: Two rows - title on top, badges below */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          {/* Left Side: Step Number + Title - badge 44px tap target on mobile */}
          <div className="flex items-center gap-3 pl-6 sm:pl-6">
            {/* Step number badge - min 44px for touch */}
            <div className={`absolute -left-[22px] sm:-left-[17px] top-0 w-11 h-11 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base ${
              status === 'completed' ? 'bg-green-600 shadow-lg shadow-green-600/20' :
              status === 'in-progress' ? 'bg-red-600 shadow-lg shadow-red-600/20' :
'bg-slate-300 text-slate-600'
}`}>
              {number}
            </div>
            
            {/* Title - tight Stitch sizing */}
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>
          </div>

          {/* Right Side: Status Badge + Deep Learning Badge */}
          <div className="flex items-center gap-2 ml-14 sm:ml-11 lg:ml-0 flex-wrap">
            {/* Status Badge */}
            {getStatusBadge()}

            {/* Deep Learning Badge - 44px touch target */}
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

        {/* Description - tight Stitch sizing */}
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            {description}
          </p>
        )}
      </div>

      {/* Section Content - tight spacing */}
      <div className="space-y-3">
        {children}
      </div>

      {/* Complete Button - 44px touch, full width on mobile, safe area */}
      {showCompleteButton && onComplete && status !== 'completed' && (
        <div className="mt-6 flex justify-end safe-area-pb md:pb-0">
          <button
            onClick={() => {
              // Call the existing onComplete first
              if (onComplete) {
                onComplete();
              }

              // Scroll to next section after a brief delay to allow state updates
              setTimeout(() => {
                const nextSectionId = `step-${number + 1}`;
                const nextSection = document.getElementById(nextSectionId);
                
                if (nextSection) {
                  // Dynamically measure the sticky header height (bottom of clock)
                  const stickyHeader = document.querySelector('[data-header-height]') as HTMLElement || 
                                      document.querySelector('.sticky.top-0') as HTMLElement;
                  let headerOffset = 120; // Default fallback
                  
                  if (stickyHeader) {
                    const dataHeight = stickyHeader.getAttribute('data-header-height');
                    headerOffset = dataHeight ? parseInt(dataHeight, 10) : stickyHeader.offsetHeight;
                  }
                  
                  const elementRect = nextSection.getBoundingClientRect();
                  const absoluteElementTop = elementRect.top + window.pageYOffset;
                  const offsetPosition = absoluteElementTop - headerOffset;

                  // Primary scroll method
                  requestAnimationFrame(() => {
                    window.scrollTo({
                      top: Math.max(0, offsetPosition),
                      behavior: 'smooth'
                    });
                    
                    // Fallback for mobile browsers
                    setTimeout(() => {
                      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                      const expectedScroll = Math.max(0, offsetPosition);
                      
                      if (Math.abs(currentScroll - expectedScroll) > 100) {
                        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setTimeout(() => {
                          window.scrollBy({ top: -headerOffset, behavior: 'smooth' });
                        }, 100);
                      }
                    }, 300);
                  });
                }
              }, 250);
            }}
            className="w-full md:w-auto min-h-[44px] px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
};
