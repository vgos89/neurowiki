import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface MedicalTooltipProps {
  term: string;
  definition: string;
  className?: string;
}

/**
 * MedicalTooltip Component
 *
 * Displays an inline info icon with a tooltip containing medical term definitions.
 *
 * Usage:
 * <MedicalTooltip term="p-Value" definition="Probability the result occurred by chance..." />
 *
 * Features:
 * - Hover on desktop, tap on mobile
 * - Dark mode support
 * - Accessible (ARIA labels)
 * - Smart positioning (prevents off-screen overflow)
 * - Portal rendering (escapes overflow-hidden containers)
 */
export const MedicalTooltip: React.FC<MedicalTooltipProps> = ({
  term,
  definition,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' as 'bottom' | 'top' | 'left' | 'right' });
  const [isPositioned, setIsPositioned] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calculate tooltip position to prevent off-screen overflow
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setIsPositioned(false);
      // Use double requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            // Default: position below and center-aligned
            let top = triggerRect.bottom + scrollY + 8;
            let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
            let placement: 'bottom' | 'top' | 'left' | 'right' = 'bottom';

            // Check if tooltip goes off right edge
            if (left + tooltipRect.width > scrollX + viewportWidth - 16) {
              left = scrollX + viewportWidth - tooltipRect.width - 16;
            }

            // Check if tooltip goes off left edge
            if (left < scrollX + 16) {
              left = scrollX + 16;
            }

            // Check if tooltip goes off bottom edge - flip to top
            if (top + tooltipRect.height > scrollY + viewportHeight - 16) {
              top = triggerRect.top + scrollY - tooltipRect.height - 8;
              placement = 'top';
            }

            // Check if tooltip goes off top edge - keep at bottom but adjust
            if (top < scrollY + 16) {
              top = scrollY + 16;
            }

            setPosition({ top, left, placement });
            setIsPositioned(true);
          }
        });
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid immediate closure on mobile tap
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close tooltip on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle window resize/scroll to reposition tooltip
  useEffect(() => {
    if (isOpen) {
      const handleReposition = () => {
        if (triggerRef.current && tooltipRef.current) {
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const scrollY = window.scrollY;
          const scrollX = window.scrollX;

          let top = triggerRect.bottom + scrollY + 8;
          let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
          let placement: 'bottom' | 'top' | 'left' | 'right' = 'bottom';

          if (left + tooltipRect.width > scrollX + viewportWidth - 16) {
            left = scrollX + viewportWidth - tooltipRect.width - 16;
          }
          if (left < scrollX + 16) {
            left = scrollX + 16;
          }
          if (top + tooltipRect.height > scrollY + viewportHeight - 16) {
            top = triggerRect.top + scrollY - tooltipRect.height - 8;
            placement = 'top';
          }
          if (top < scrollY + 16) {
            top = scrollY + 16;
          }

          setPosition({ top, left, placement });
        }
      };

      window.addEventListener('resize', handleReposition);
      window.addEventListener('scroll', handleReposition, true);

      return () => {
        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('scroll', handleReposition, true);
      };
    }
  }, [isOpen]);

  const tooltipContent = isOpen ? (
    <div
      ref={tooltipRef}
      className={`fixed z-[9999] px-3 py-2 max-w-[calc(100vw-32px)] sm:max-w-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-sm ${
        isPositioned ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        top: isPositioned ? `${position.top}px` : '-9999px',
        left: isPositioned ? `${position.left}px` : '-9999px',
      }}
      role="tooltip"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-semibold text-slate-900 dark:text-white mb-1 break-words">
        {term}
      </div>
      <div className="text-slate-700 dark:text-slate-300 leading-relaxed break-words">
        {definition}
      </div>
      {/* Arrow - positioned based on placement */}
      <div
        className={`absolute w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45 ${
          position.placement === 'top'
            ? '-bottom-1 left-4'
            : '-top-1 left-4'
        }`}
      />
    </div>
  ) : null;

  return (
    <>
      <span className={`inline-flex items-center relative ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="inline-flex items-center justify-center ml-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded flex-shrink-0 z-10 relative"
          aria-label={`Definition of ${term}`}
          aria-expanded={isOpen}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};
