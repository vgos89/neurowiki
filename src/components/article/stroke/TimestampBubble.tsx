import React, { useState, useEffect, useRef } from 'react';
import { Clock, X, CheckCircle } from 'lucide-react';

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

export const TimestampBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThought, setShowThought] = useState(true);
  const [showPulse, setShowPulse] = useState(false);
  const [timestamps, setTimestamps] = useState<Record<EventName, Date | null>>({
    'Code Activation': null,
    'Neurology Evaluation': null,
    'CT Read Time': null,
  });

  // Auto-hide the thought bubble after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowThought(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Show pulse ring after 10s if no stamps yet
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 10000);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => {
    setShowThought(false);
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

  return (
    <>
      {/* Thought bubble — shown until tapped or 5s elapsed */}
      {showThought && !isExpanded && (
        <div className="fixed bottom-36 right-4 z-50 thought-in pointer-events-none">
          {/* Bubble body */}
          <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl px-3 py-2 shadow-lg max-w-[200px]">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug text-center">
              Record Stroke Time Stamps
            </p>
            {/* Tail dots pointing down-right toward the bubble */}
            <div className="absolute -bottom-2 right-6 flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full" />
            </div>
            <div className="absolute -bottom-4 right-4">
              <div className="w-1.5 h-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={handleOpen}
        aria-label="Open timestamp tracker"
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isExpanded
            ? 'bg-slate-700 dark:bg-slate-600 scale-90'
            : `bg-neuro-600 hover:bg-neuro-700 dark:bg-neuro-500 dark:hover:bg-neuro-600 ${showThought ? 'bubble-wobble' : ''} ${needsAttention ? 'ring-4 ring-neuro-400 ring-offset-2 animate-pulse' : ''}`
        }`}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Clock className="w-6 h-6 text-white" />
            {stampedCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {stampedCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="fixed bottom-36 right-4 z-50 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
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
    </>
  );
};
