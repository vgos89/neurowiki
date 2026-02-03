import React, { useState } from 'react';
import { ThrombolysisEligibilityModal, ThrombolysisEligibilityData } from './ThrombolysisEligibilityModal';
import { CompactVitals } from './CompactVitals';

interface EligibilityCheckerV2Props {
  onLkwCalculated?: (lkwTime: Date, hoursElapsed: number) => void;
  onEligibilityComplete?: (data: ThrombolysisEligibilityData) => void;
  onOutsideWindow?: (hoursElapsed: number) => void;
}

export const EligibilityCheckerV2: React.FC<EligibilityCheckerV2Props> = ({ onLkwCalculated, onEligibilityComplete, onOutsideWindow }) => {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [calculated, setCalculated] = useState(false);
  const [hoursElapsed, setHoursElapsed] = useState<number | null>(null);
  const [lkwTime, setLkwTime] = useState<Date | null>(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [savedEligibilityData, setSavedEligibilityData] = useState<ThrombolysisEligibilityData | null>(null);

  const setToCurrentTime = () => {
    const now = new Date();
    const hrs = now.getHours();
    const mins = now.getMinutes();
    setHour(((hrs % 12) || 12).toString());
    setMinute(mins.toString().padStart(2, '0'));
    setPeriod(hrs >= 12 ? 'PM' : 'AM');
  };

  const calculateWindow = () => {
    const now = new Date();
    const calculatedLkwTime = new Date();
    
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    calculatedLkwTime.setHours(hour24, parseInt(minute), 0, 0);
    if (calculatedLkwTime > now) calculatedLkwTime.setDate(calculatedLkwTime.getDate() - 1);
    
    const diffHours = (now.getTime() - calculatedLkwTime.getTime()) / (1000 * 60 * 60);
    setHoursElapsed(diffHours);
    setLkwTime(calculatedLkwTime);
    setCalculated(true);
    
    // Open eligibility modal if within 4.5 hour window
    if (diffHours < 4.5) {
      setShowEligibilityModal(true);
    } else if (diffHours > 4.5 && onOutsideWindow) {
      // Notify parent that we're outside the 4.5-hour window
      onOutsideWindow(diffHours);
    }
  };

  const handleEligibilityComplete = (data: ThrombolysisEligibilityData) => {
    setSavedEligibilityData(data);
    setShowEligibilityModal(false);
    // Trigger callback to notify parent
    if (onEligibilityComplete) {
      onEligibilityComplete(data);
    }
  };

  const getStatus = () => {
    if (!calculated || hoursElapsed === null) return null;

    if (hoursElapsed > 24) {
      return { 
        type: 'outside', 
        color: 'red', 
        icon: '❌',
        title: 'Outside Treatment Window',
        message: '>24h from LKW. Thrombolysis not indicated. Focus on supportive care and secondary prevention.' 
      };
    }

    if (hoursElapsed <= 4.5) {
      return { 
        type: 'eligible', 
        color: 'green', 
        icon: '✓',
        title: 'tPA Candidate - Proceed',
        message: 'Within 4.5h window. Complete eligibility assessment to proceed with thrombolysis.' 
      };
    }

    return { 
      type: 'extended', 
      color: 'yellow', 
      icon: 'ⓘ',
      title: 'Extended Window (4.5-24h)',
      message: 'Consider CT perfusion. If mismatch present, patient may be thrombectomy candidate per DAWN/DEFUSE-3 criteria.' 
    };
  };

  const status = getStatus();

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-icons-outlined text-blue-600 dark:text-blue-400">event</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Eligibility Assessment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Treatment window & contraindications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Time Input and Vitals - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Last Known Well Time
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-14 h-12 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500/20 text-slate-900 dark:text-white font-medium"
              />
              <span className="text-slate-300 font-bold text-lg">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value.padStart(2, '0'))}
                className="w-14 h-12 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500/20 text-slate-900 dark:text-white font-medium"
              />

              <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    period === 'AM'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-500'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    period === 'PM'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-500'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            <button
              onClick={setToCurrentTime}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <span className="material-icons-outlined text-sm">access_time</span>
              Set to current time
            </button>
          </div>

          {/* Compact Vitals */}
          <div>
            <CompactVitals />
          </div>
        </div>

        <button
          onClick={calculateWindow}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          Calculate Treatment Window
        </button>

        {/* Status Display */}
        {status && (
          <div className={`p-4 rounded-2xl border ${
            status.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
            status.color === 'yellow' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="text-center mb-3">
              <div className={`text-4xl font-black mb-1 ${
                status.color === 'green' ? 'text-green-600 dark:text-green-400' :
                status.color === 'yellow' ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {hoursElapsed?.toFixed(1)}h
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                since last known well
              </div>
            </div>

            <div className="text-center">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                status.color === 'green' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                status.color === 'yellow' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {status.icon} {status.title}
              </span>
              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mt-2">
                {status.message}
              </div>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0">info</span>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold">LKW Definition: </span>
              If patient woke with symptoms, LKW is when last seen normal before sleep.
              Work backwards: when did they go to bed? Be precise - &quot;yesterday&quot; is not sufficient.
            </div>
          </div>
        </div>

        {/* Button to open eligibility modal if within window */}
        {calculated && hoursElapsed !== null && hoursElapsed < 4.5 && (
          <button
            onClick={() => setShowEligibilityModal(true)}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-icons-outlined text-lg">event</span>
            {savedEligibilityData ? 'Review Eligibility Assessment' : 'Complete Eligibility Assessment'}
          </button>
        )}

        {/* Prompt for LVO Screen if outside 4.5 hour window */}
        {calculated && hoursElapsed !== null && hoursElapsed > 4.5 && hoursElapsed <= 24 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="material-icons-outlined text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">error_outline</span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
                  Outside IV tPA Window - Proceed to LVO Screening
                </h4>
                <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-300 mb-3">
                  Patient is outside the 4.5-hour window for IV tPA. However, mechanical thrombectomy may still be an option if LVO is present (up to 24 hours with appropriate imaging). Proceed to LVO screening.
                </p>
                {onOutsideWindow && (
                  <button
                    onClick={() => onOutsideWindow(hoursElapsed)}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Continue to LVO Screening</span>
                    <span className="material-icons-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show saved eligibility summary */}
        {savedEligibilityData && (
          <div className={`mt-4 p-4 rounded-2xl border ${
            savedEligibilityData.eligibilityStatus === 'eligible'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : savedEligibilityData.eligibilityStatus === 'relative-contraindication'
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`text-2xl ${
                savedEligibilityData.eligibilityStatus === 'eligible' ? 'text-green-600' :
                savedEligibilityData.eligibilityStatus === 'relative-contraindication' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {savedEligibilityData.eligibilityStatus === 'eligible' ? '✓' :
                 savedEligibilityData.eligibilityStatus === 'relative-contraindication' ? '⚠' :
                 '✗'}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-bold mb-1 ${
                  savedEligibilityData.eligibilityStatus === 'eligible' ? 'text-green-800 dark:text-green-200' :
                  savedEligibilityData.eligibilityStatus === 'relative-contraindication' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-red-800 dark:text-red-200'
                }`}>
                  Eligibility Assessment Complete
                </h4>
                <p className={`text-xs leading-relaxed ${
                  savedEligibilityData.eligibilityStatus === 'eligible' ? 'text-green-700 dark:text-green-300' :
                  savedEligibilityData.eligibilityStatus === 'relative-contraindication' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  Status: {savedEligibilityData.eligibilityStatus === 'eligible' ? 'ELIGIBLE FOR IV tPA' :
                           savedEligibilityData.eligibilityStatus === 'relative-contraindication' ? 'RELATIVE CONTRAINDICATION' :
                           savedEligibilityData.eligibilityStatus === 'absolute-contraindication' ? 'IV tPA CONTRAINDICATED' :
                           'DOES NOT MEET CRITERIA'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Eligibility Modal */}
      <ThrombolysisEligibilityModal
        isOpen={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        onComplete={handleEligibilityComplete}
        initialData={savedEligibilityData || (lkwTime && hoursElapsed !== null ? {
          lkwTime,
          timeDifferenceHours: hoursElapsed,
          inclusionCriteriaMet: false,
          absoluteContraindications: [],
          relativeContraindications: [],
          eligibilityStatus: 'not-eligible',
          notes: '',
        } : null)}
      />
    </div>
  );
};
