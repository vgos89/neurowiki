import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { getLegendEntry } from '../../data/legendTerms';

interface LegendTermProps {
  termId: string;
  children: React.ReactNode;
  variant?: 'inline' | 'badge';
  className?: string;
}

export const LegendTerm: React.FC<LegendTermProps> = ({
  termId,
  children,
  variant = 'inline',
  className = '',
}) => {
  const entry = getLegendEntry(termId);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' as 'bottom' | 'top' });
  const [isPositioned, setIsPositioned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const popupId = `legend-popup-${uid}`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setIsPositioned(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!triggerRef.current || !popupRef.current) return;
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const popupRect = popupRef.current.getBoundingClientRect();
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const scrollY = window.scrollY;
          const scrollX = window.scrollX;

          let top = triggerRect.bottom + scrollY + 8;
          let left = triggerRect.left + scrollX + triggerRect.width / 2 - popupRect.width / 2;
          let placement: 'bottom' | 'top' = 'bottom';

          if (left + popupRect.width > scrollX + vw - 16) {
            left = scrollX + vw - popupRect.width - 16;
          }
          if (left < scrollX + 16) {
            left = scrollX + 16;
          }
          if (top + popupRect.height > scrollY + vh - 16) {
            top = triggerRect.top + scrollY - popupRect.height - 8;
            placement = 'top';
          }
          if (top < scrollY + 16) {
            top = scrollY + 16;
          }

          setPosition({ top, left, placement });
          setIsPositioned(true);
        });
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        popupRef.current &&
        triggerRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      if (!triggerRef.current || !popupRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = triggerRect.bottom + scrollY + 8;
      let left = triggerRect.left + scrollX + triggerRect.width / 2 - popupRect.width / 2;
      let placement: 'bottom' | 'top' = 'bottom';

      if (left + popupRect.width > scrollX + vw - 16) left = scrollX + vw - popupRect.width - 16;
      if (left < scrollX + 16) left = scrollX + 16;
      if (top + popupRect.height > scrollY + vh - 16) {
        top = triggerRect.top + scrollY - popupRect.height - 8;
        placement = 'top';
      }
      if (top < scrollY + 16) top = scrollY + 16;

      setPosition({ top, left, placement });
    };
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [isOpen]);

  if (!entry) return <>{children}</>;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => {
        if (!prev) {
          setTimeout(() => popupRef.current?.focus(), 50);
          return true;
        }
        return false;
      });
    }
  };

  const hoverProps = isMobile
    ? {}
    : { onMouseEnter: handleOpen, onMouseLeave: () => setIsOpen(false) };

  const triggerClassName =
    variant === 'inline'
      ? `border-b border-dotted border-slate-400 hover:border-slate-600 cursor-pointer bg-transparent focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm ${className}`
      : `cursor-pointer bg-transparent focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm ${className}`;

  const popupContent = isOpen ? (
    <div
      ref={popupRef}
      id={popupId}
      role="tooltip"
      tabIndex={0}
      className="fixed z-[9999]"
      style={{
        top: isPositioned ? `${position.top}px` : '-9999px',
        left: isPositioned ? `${position.left}px` : '-9999px',
        opacity: isPositioned ? 1 : 0,
        pointerEvents: isPositioned ? 'auto' : 'none',
        minWidth: '200px',
        maxWidth: window.innerWidth <= 640 ? '280px' : undefined,
        boxShadow: '0 4px 16px rgba(15,23,42,0.10)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white border border-slate-100 rounded-xl px-3.5 py-3 max-w-xs relative">
        <div
          className={`absolute w-2 h-2 bg-white border-slate-100 transform rotate-45 ${
            position.placement === 'top'
              ? '-bottom-1 left-4 border-r border-b'
              : '-top-1 left-4 border-l border-t'
          }`}
        />
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-900 leading-snug">{entry.term}</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 -m-1 min-h-[24px] min-w-[24px] flex items-center justify-center rounded shrink-0 focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
          {entry.categoryLabel}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{entry.definition}</p>
        {entry.example && (
          <p className="text-sm text-slate-500 leading-relaxed mt-1 italic">{entry.example}</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? popupId : undefined}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        {...hoverProps}
      >
        {children}
      </button>
      {typeof document !== 'undefined' && createPortal(popupContent, document.body)}
    </>
  );
};
