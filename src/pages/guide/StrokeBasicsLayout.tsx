import React, { useState, ReactNode, createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface StrokeBasicsLayoutProps {
  leftSidebar?: ReactNode;
  mainContent: ReactNode;
}

// Context for mobile sidebar controls
interface LayoutContextType {
  openMobileLeft: () => void;
  closeMobileLeft: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useStrokeBasicsLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useStrokeBasicsLayout must be used within StrokeBasicsLayout');
  }
  return context;
};

export const StrokeBasicsLayout: React.FC<StrokeBasicsLayoutProps> = ({
  leftSidebar,
  mainContent,
}) => {
  // Start with left sidebar hidden
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false);

  // Toggle left sidebar collapse (desktop)
  const toggleLeftSidebar = () => {
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  };

  // Close mobile overlay when clicking backdrop
  const closeMobileLeft = () => setIsMobileLeftOpen(false);
  const openMobileLeft = () => setIsMobileLeftOpen(true);

  // Prevent body scroll when mobile overlay is open
  React.useEffect(() => {
    if (isMobileLeftOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileLeftOpen]);

  const layoutContextValue: LayoutContextType = {
    openMobileLeft,
    closeMobileLeft,
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Layout: 3-column flex structure with floating toggles */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar - Optional, show/hide */}
        {leftSidebar && (
          <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 overflow-hidden ${
            isLeftSidebarCollapsed ? 'w-0' : 'w-[280px]'
          }`}>
            <div className={`w-[280px] h-full overflow-y-auto ${isLeftSidebarCollapsed ? 'hidden' : ''}`}>
              <div className="p-4">
                {leftSidebar}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content - With floating toggle buttons */}
        <main className="flex-1 min-w-0 relative bg-slate-50 dark:bg-slate-900">
          {/* LEFT TOGGLE BUTTON - Only show if leftSidebar exists */}
          {leftSidebar && (
            <button
              onClick={toggleLeftSidebar}
              className="fixed top-1/2 -translate-y-1/2 w-10 h-20 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-r-xl shadow-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-50 group hover:scale-105"
              style={{
                left: isLeftSidebarCollapsed ? '64px' : '344px', // 64px = main nav width, 344px = 64px (main nav) + 280px (sidebar)
                transition: 'left 0.3s ease-in-out'
              }}
              aria-label={isLeftSidebarCollapsed ? "Show left sidebar" : "Collapse sidebar"}
            >
              {isLeftSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              )}
            </button>
          )}

          {/* Article Content */}
          <div className="min-h-screen">
            {/* Content Container - centered with max-width */}
            {/* Remove top padding to allow sticky header to stick to top */}
            <div className="max-w-[900px] mx-auto px-6 pb-6">
              {mainContent}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Layout: Single column with overlays */}
      <div className="lg:hidden">
        {/* Main Content - Mobile */}
        <main className="w-full">
          <div className="px-4 py-4">
            {mainContent}
          </div>
        </main>

        {/* Left Sidebar Overlay - Mobile */}
        {isMobileLeftOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={closeMobileLeft}
            />
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300">
              <div className="h-full overflow-y-auto p-4">
                {/* Close Button */}
                <div className="flex justify-end mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={closeMobileLeft}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {leftSidebar}
              </div>
            </aside>
          </>
        )}

      </div>

      </div>
    </LayoutContext.Provider>
  );
};
