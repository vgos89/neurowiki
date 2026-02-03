import React, { useState, useRef, useEffect } from 'react';

interface AnalogClockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeSelect: (hours: number, minutes: number, period: 'AM' | 'PM') => void;
  initialHours?: number;
  initialMinutes?: number;
  initialPeriod?: 'AM' | 'PM';
}

export const AnalogClockPicker: React.FC<AnalogClockPickerProps> = ({
  isOpen,
  onClose,
  onTimeSelect,
  initialHours = 12,
  initialMinutes = 0,
  initialPeriod = 'AM'
}) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialPeriod);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour'); // Track which mode we're in
  const [isDragging, setIsDragging] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHours(initialHours);
      setMinutes(initialMinutes);
      setPeriod(initialPeriod);
      setMode('hour'); // Always start with hour selection
    }
  }, [initialHours, initialMinutes, initialPeriod, isOpen]);

  const calculateAngleFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!clockRef.current) return 0;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientX - centerX, centerY - e.clientY);
    let degrees = (angle * 180 / Math.PI + 360) % 360;

    return degrees;
  };

  const handleClockInteraction = (e: MouseEvent | React.MouseEvent) => {
    const degrees = calculateAngleFromMouse(e);

    if (mode === 'hour') {
      const newHours = Math.round(degrees / 30) || 12;
      setHours(newHours === 0 ? 12 : newHours);
    } else {
      const newMinutes = Math.round(degrees / 6) % 60;
      setMinutes(newMinutes);
    }
  };

  const handleClockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    handleClockInteraction(e);

    // Auto-advance from hour to minute
    if (mode === 'hour') {
      setTimeout(() => setMode('minute'), 300);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleClockInteraction(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Auto-advance from hour to minute after dragging
    if (mode === 'hour') {
      setTimeout(() => setMode('minute'), 300);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, mode]);

  if (!isOpen) return null;

  // Calculate hand angles
  const hourAngle = (hours % 12) * 30;
  const minuteAngle = minutes * 6;

  return (
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[90] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white/85 backdrop-blur-[25px] p-4 rounded-lg border border-white/30 shadow-2xl w-80 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Select Time
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors rounded-lg -m-2"
            aria-label="Close"
          >
            <span className="material-icons-outlined text-xl">close</span>
          </button>
        </div>

        {/* Time display with mode toggle - 44px touch targets */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setMode('hour')}
            className={`min-h-[44px] text-xl font-light tabular-nums px-4 py-2 rounded-lg transition-colors ${
              mode === 'hour'
                ? 'bg-blue-100 text-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {String(hours).padStart(2, '0')}
          </button>
          <span className="text-xl text-slate-400">:</span>
          <button
            type="button"
            onClick={() => setMode('minute')}
            className={`min-h-[44px] text-xl font-light tabular-nums px-4 py-2 rounded-lg transition-colors ${
              mode === 'minute'
                ? 'bg-blue-100 text-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {String(minutes).padStart(2, '0')}
          </button>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 ml-2">
            <button
              type="button"
              onClick={() => setPeriod('AM')}
              className={`min-h-[44px] px-3 py-2 text-sm font-bold rounded transition-all ${
                period === 'AM'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setPeriod('PM')}
              className={`min-h-[44px] px-3 py-2 text-sm font-bold rounded transition-all ${
                period === 'PM'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Clock Face */}
        <div
          ref={clockRef}
          className="w-[180px] h-[180px] rounded-full border border-slate-200 relative flex justify-center items-center bg-white cursor-pointer select-none"
          onClick={handleClockClick}
          onMouseDown={() => setIsDragging(true)}
        >
          {/* Numbers */}
          {mode === 'hour' ? (
            // Hour numbers (1-12)
            [...Array(12)].map((_, i) => {
              const num = i + 1;
              const angle = num * 30;
              const radian = (angle - 90) * (Math.PI / 180);
              const x = 68 * Math.cos(radian);
              const y = 68 * Math.sin(radian);
              return (
                <span
                  key={i}
                  className="absolute text-sm font-normal text-slate-400 pointer-events-none w-6 h-6 flex items-center justify-center"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    fontFamily: 'SF Pro Display, Inter, system-ui'
                  }}
                >
                  {num}
                </span>
              );
            })
          ) : (
            // Minute numbers (00, 05, 10, ..., 55)
            [...Array(12)].map((_, i) => {
              const num = i * 5;
              const angle = num * 6;
              const radian = (angle - 90) * (Math.PI / 180);
              const x = 68 * Math.cos(radian);
              const y = 68 * Math.sin(radian);
              return (
                <span
                  key={i}
                  className="absolute text-sm font-normal text-slate-400 pointer-events-none w-6 h-6 flex items-center justify-center"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    fontFamily: 'SF Pro Display, Inter, system-ui'
                  }}
                >
                  {String(num).padStart(2, '0')}
                </span>
              );
            })
          )}

          {/* Hand – same length for hour and minute for consistent design */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom pointer-events-none"
            style={{
              width: '3px',
              height: '64px',
              backgroundColor: '#3b82f6',
              borderRadius: '10px',
              transform: `translate(-50%, -100%) rotate(${mode === 'hour' ? hourAngle : minuteAngle}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          />

          {/* Hand tip circle */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${
                64 * Math.sin((mode === 'hour' ? hourAngle : minuteAngle) * Math.PI / 180)
              }px, ${
                -64 * Math.cos((mode === 'hour' ? hourAngle : minuteAngle) * Math.PI / 180)
              }px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {mode === 'hour' ? hours : minutes}
          </div>

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" />
        </div>

        {/* Mode indicator */}
        <p className="text-xs uppercase tracking-widest font-bold mt-4 h-4">
          <span className="text-blue-500">
            {mode === 'hour' ? 'Select Hour' : 'Select Minute'}
          </span>
        </p>

        {/* Footer buttons */}
        <div className="mt-4 w-full flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onTimeSelect(hours, minutes, period);
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
