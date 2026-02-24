import React, { useState, useEffect } from 'react';
import { Clock, X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const EVENTS = ['Code Activation', 'Neurology Evaluation', 'CT Read Time'] as const;
type EventName = typeof EVENTS[number];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getElapsed(from: Date, to: Date): string {
  const diffMs = to.getTime() - from.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `+${hours}h ${minutes}m`;
  return `+${minutes}m`;
}

interface TimestampBubbleProps {
  onTpaReversal?: () => void;
  onOrolingualEdema?: () => void;
}

// Shared left-pointing thought bubble (arrow points right toward its FAB)
const ThoughtBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute right-[calc(100%+0.625rem)] top-1/2 -translate-y-1/2 pointer-events-none z-10">
    <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap">
      {children}
      {/* Right-pointing arrow toward FAB */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -right-[7px]"
        style={{
          width: 0, height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '7px solid white',
        }}
        aria-hidden
      />
    </div>
  </div>
);

export const TimestampBubble: React.FC<TimestampBubbleProps> = ({
  onTpaReversal,
  onOrolingualEdema,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClockThought, setShowClockThought] = useState(true);
  const [showEmergencyThought, setShowEmergencyThought] = useState(true);
  const [showPulse, setShowPulse] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [timestamps, setTimestamps] = useState<Record<EventName, Date | null>>({
    'Code Activation': null,
    'Neurology Evaluation': null,
    'CT Read Time': null,
  });

  // Auto-hide both thought bubbles after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowClockThought(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowEmergencyThought(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Show pulse ring after 10s if no stamps yet
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 10000);
    return () => clearTimeout(t);
  }, []);

  // Listen for CT Read Time stamp event fired from CodeModeStep2
  useEffect(() => {
    const handler = () => {
      setShowPulse(false);
      setTimestamps(prev => {
        if (prev['CT Read Time']) return prev;
        return { ...prev, 'CT Read Time': new Date() };
      });
    };
    window.addEventListener('stroke:stamp-ct-read', handler);
    return () => window.removeEventListener('stroke:stamp-ct-read', handler);
  }, []);

  const handleOpen = () => {
    setShowClockThought(false);
    setShowPulse(false);
    setIsExpanded(prev => !prev);
  };

  const handleStamp = (event: EventName) => {
    if (timestamps[event]) return;
    setShowPulse(false);
    setTimestamps(prev => ({ ...prev, [event]: new Date() }));
  };

  const handleClear = (event: EventName, e: React.MouseEvent) => {
    e.stopPropagation();
    setTimestamps(prev => ({ ...prev, [event]: null }));
  };

  const anchorTime = timestamps['Code Activation'];
  const stampedCount = Object.values(timestamps).filter(Boolean).length;
  const needsAttention = showPulse && stampedCount === 0 && !isExpanded;

  const hasEmergency = onTpaReversal || onOrolingualEdema;

  return (
    <>
      {/* ── Emergency FAB — bottom LEFT ── */}
      {hasEmergency && (
        <div className="fixed bottom-24 md:bottom-4 left-4 z-[60]">
          <div className="relative flex flex-col items-start gap-2">
            {/* Emergency thought bubble */}
            {showEmergencyThought && !emergencyOpen && (
              <ThoughtBubble>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 leading-snug">
                  Emergency protocols
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  tPA reversal · orolingual edema
                </p>
              </ThoughtBubble>
            )}

            {/* Submenus — expand upward */}
            {emergencyOpen && (
              <div className="flex flex-col items-start gap-2">
                {onTpaReversal && (
                  <button
                    type="button"
                    onClick={() => { onTpaReversal(); setEmergencyOpen(false); }}
                    className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors animate-in slide-in-from-bottom-2 duration-200"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden />
                    tPA/TNK Reversal
                  </button>
                )}
                {onOrolingualEdema && (
                  <button
                    type="button"
                    onClick={() => { onOrolingualEdema(); setEmergencyOpen(false); }}
                    className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors animate-in slide-in-from-bottom-2 duration-150"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />
                    Orolingual Edema
                  </button>
                )}
              </div>
            )}

            {/* Emergency button */}
            <button
              type="button"
              onClick={() => { setEmergencyOpen(prev => !prev); setShowEmergencyThought(false); }}
              className={`w-10 h-10 rounded-full shadow-lg transition-all border-2 flex items-center justify-center ${
                emergencyOpen
                  ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
              }`}
              aria-label={emergencyOpen ? 'Close emergency protocols menu' : 'Open emergency protocols'}
              aria-expanded={emergencyOpen}
            >
              {emergencyOpen
                ? <X className="w-5 h-5" aria-hidden />
                : <AlertTriangle className="w-5 h-5" aria-hidden />
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Clock FAB — bottom RIGHT ── */}
      <div className="fixed bottom-36 md:bottom-20 right-4 z-[60]">
        <div className="relative">
        {/* Clock thought bubble */}
        {showClockThought && !isExpanded && (
          <ThoughtBubble>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug text-center">
              Record Stroke Time Stamps
            </p>
          </ThoughtBubble>
        )}

        {/* Expanded timestamps panel — anchored above clock button */}
        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neuro-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Stroke Timestamps</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tap to record time of each event</p>
            </div>

            {/* Timestamp Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {EVENTS.map((event) => {
                const stamped = timestamps[event];
                const isFirst = event === 'Code Activation';
                const elapsed = stamped && anchorTime && !isFirst
                  ? getElapsed(anchorTime, stamped)
                  : null;

                return (
                  <div key={event} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
                          {event}
                        </div>
                        {stamped ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-semibold text-slate-800 dark:text-white tabular-nums">
                              {formatTime(stamped)}
                            </span>
                            {elapsed && (
                              <span className="text-xs text-neuro-500 font-medium">{elapsed}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">Not yet recorded</span>
                        )}
                      </div>

                      {stamped ? (
                        <button
                          onClick={(e) => handleClear(event, e)}
                          className="text-xs text-slate-400 hover:text-red-400 dark:text-slate-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded"
                          title="Clear timestamp"
                        >
                          Clear
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStamp(event)}
                          className="px-3 py-1.5 text-xs font-semibold bg-neuro-500 hover:bg-neuro-600 text-white rounded-lg transition-colors whitespace-nowrap"
                        >
                          Stamp
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {stampedCount > 0 && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setTimestamps({ 'Code Activation': null, 'Neurology Evaluation': null, 'CT Read Time': null })}
                  className="text-xs text-slate-400 hover:text-red-400 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                >
                  Clear all timestamps
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clock button */}
        <button
          onClick={handleOpen}
          aria-label="Open timestamp tracker"
          className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            isExpanded
              ? 'bg-slate-700 dark:bg-slate-600 scale-90'
              : `bg-neuro-600 hover:bg-neuro-700 dark:bg-neuro-500 dark:hover:bg-neuro-600 ${showClockThought ? 'bubble-wobble' : ''} ${needsAttention ? 'ring-4 ring-neuro-400 ring-offset-2 animate-pulse' : ''}`
          }`}
        >
          {isExpanded ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <div className="relative">
              <Clock className="w-5 h-5 text-white" />
              {stampedCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {stampedCount}
                </span>
              )}
            </div>
          )}
        </button>
        </div>
      </div>
    </>
  );
};
