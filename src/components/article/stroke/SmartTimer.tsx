import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

export const SmartTimer: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    if (!isRunning && elapsedSeconds === 0) {
      const now = new Date();
      setStartTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (confirm('Reset timer? This will clear elapsed time.')) {
      setIsRunning(false);
      setElapsedSeconds(0);
      setStartTime('');
    }
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const elapsedMinutes = elapsedSeconds / 60;

  // Determine background color based on time
  const getBackgroundColor = () => {
    if (!isRunning) return 'bg-slate-100 dark:bg-slate-800';
    if (elapsedMinutes >= 60) return 'bg-red-100 dark:bg-red-900/30';
    if (elapsedMinutes >= 25) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  const getTextColor = () => {
    if (!isRunning) return 'text-slate-600 dark:text-slate-400';
    if (elapsedMinutes >= 60) return 'text-red-700 dark:text-red-300';
    if (elapsedMinutes >= 25) return 'text-yellow-700 dark:text-yellow-300';
    return 'text-green-700 dark:text-green-300';
  };

  const getMilestoneAlert = () => {
    if (elapsedMinutes >= 60) return '⚠️ Door-to-needle target exceeded';
    if (elapsedMinutes >= 25) return '⚠️ CT imaging target exceeded';
    return null;
  };

  const alert = getMilestoneAlert();

  return (
    <div className={`${getBackgroundColor()} transition-colors duration-500 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800`}>
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Timer Display */}
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${getTextColor()}`} />
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tabular-nums ${getTextColor()}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isRunning ? 'elapsed' : 'ready'}
            </span>
          </div>
          {startTime && (
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              | Started {startTime}
            </span>
          )}
          {alert && (
            <span className="text-xs font-bold text-red-600 dark:text-red-400 hidden md:inline">
              | {alert}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStart}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              isRunning
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </button>

          {elapsedSeconds > 0 && (
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Alert */}
      {alert && (
        <div className="md:hidden px-4 pb-2">
          <div className="text-xs font-bold text-red-600 dark:text-red-400 text-center">
            {alert}
          </div>
        </div>
      )}
    </div>
  );
};
