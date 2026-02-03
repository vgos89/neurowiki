import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { ArrowLeft, RefreshCw, Copy, Star, Info } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { NIHSS_ITEMS, calculateTotal, getItemWarning, calculateLvoProbability } from '../utils/nihssShortcuts';
import NihssItemCard from '../components/NihssItemCard';

const NihssCalculator: React.FC = () => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [userMode] = useState<'resident' | 'attending'>('resident'); // Keep for warnings/pearls logic
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLvoTooltip, setShowLvoTooltip] = useState(false);
  const lvoTooltipRef = useRef<HTMLDivElement>(null);
  const nihssHeaderRef = useRef<HTMLDivElement>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getBackPath } = useNavigationSource();

  // Memoize LVO calculation to ensure it updates properly when nihssValues change
  const lvoData = useMemo(() => calculateLvoProbability(nihssValues), [nihssValues]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lvoTooltipRef.current && !lvoTooltipRef.current.contains(event.target as Node)) {
        setShowLvoTooltip(false);
      }
    };

    if (showLvoTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLvoTooltip]);

  const handleNihssChange = (id: string, val: number) => {
    setNihssValues((prev) => ({ ...prev, [id]: val }));
    const idx = NIHSS_ITEMS.findIndex((i) => i.id === id);
    if (idx >= 0 && idx < NIHSS_ITEMS.length - 1) {
      setTimeout(() => {
        const nextItem = NIHSS_ITEMS[idx + 1];
        const el = document.getElementById(`nihss-row-${nextItem.id}`);
        if (el) {
          // Get the main scroll container
          const main = document.querySelector('main');
          const scrollContainer = main || window;
          // Scroll offset - account for main navigation header (64px) + NIHSS header height
          const mainNavHeight = 64;
          const nihssHeaderHeight = nihssHeaderRef.current?.offsetHeight || 120;
          const offset = mainNavHeight + nihssHeaderHeight + 20;
          
          if (main) {
            const elementTop = el.offsetTop - main.offsetTop;
            const scrollPosition = elementTop - offset;
            main.scrollTo({ top: scrollPosition, behavior: 'smooth' });
          } else {
            const elementTop = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
          }
        }
      }, 300);
    }
  };

  const setAllMotor = (val: number) => {
    setNihssValues((prev) => ({ ...prev, '5a': val, '5b': val, '6a': val, '6b': val }));
  };

  const copyNihss = () => {
    const total = calculateTotal(nihssValues);
    const breakdown = NIHSS_ITEMS.map((i) => `${i.shortName}: ${nihssValues[i.id] ?? 0}`).join('\n');
    navigator.clipboard.writeText(`NIHSS Total: ${total}\n\n${breakdown}`);
    setToastMessage('Copied to Clipboard');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('nihss');
    setToastMessage(isNowFav ? 'Saved NIHSS' : 'Removed NIHSS');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const isFav = isFavorite('nihss');

  return (
    <>
      {/* Scoring Tally Bar Header - Sticky below navigation */}
      <div 
        ref={nihssHeaderRef} 
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-5xl mx-auto px-2 md:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between gap-1 md:gap-4">
            {/* Left Section: Back Button + NIHSS Total */}
            <div className="flex items-center gap-1 md:gap-4">
              <Link to={getBackPath()} className="p-1 md:p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
              </Link>
              <div>
                <div className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0 md:mb-0.5">NIHSS TOTAL</div>
                <div className="flex items-baseline gap-1 md:gap-1.5">
                  <span className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white leading-none">{calculateTotal(nihssValues).toString().padStart(2, '0')}</span>
                  <span className="text-sm md:text-lg text-slate-400 dark:text-slate-500">/ 42</span>
                </div>
              </div>
            </div>

            {/* Middle Section: LVO Probability - Compact on mobile */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-0.5 md:gap-1.5 mb-0 md:mb-0.5">
                <div className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden md:inline">LVO PROBABILITY</div>
                <div className="text-[8px] md:hidden font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">LVO</div>
                <div className="relative" ref={lvoTooltipRef}>
                  <button
                    onClick={() => setShowLvoTooltip(!showLvoTooltip)}
                    className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="LVO Probability Information"
                  >
                    <Info className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-slate-400 dark:text-slate-500 cursor-help" />
                  </button>
                  {showLvoTooltip && (
                    <div className="fixed md:absolute inset-x-4 md:inset-x-auto top-32 md:top-full md:right-0 md:mt-2 w-auto md:w-80 max-w-md mx-auto md:mx-0 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">LVO Probability (RACE Scale)</div>
                      
                      {/* RACE Score Summary */}
                      <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your RACE Score: {lvoData.raceScore}/9</div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                          <div>Facial Palsy: {lvoData.breakdown.facial}/2</div>
                          <div>Arm Motor (worst): {lvoData.breakdown.arm}/2</div>
                          <div>Leg Motor (worst): {lvoData.breakdown.leg}/2</div>
                          <div>Gaze Deviation: {lvoData.breakdown.gaze}/1</div>
                          <div>Aphasia: {lvoData.breakdown.aphasia}/2</div>
                          <div>Agnosia/Neglect: {lvoData.breakdown.agnosia}/1</div>
                        </div>
                      </div>
                      
                      {/* Interpretation */}
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-3">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">RACE Scale Interpretation:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>0-4:</strong> Low probability (20%) - Unlikely LVO</li>
                          <li><strong>5-6:</strong> Moderate probability (55%) - Probable LVO</li>
                          <li><strong>7-9:</strong> High probability (85%) - Very likely LVO</li>
                        </ul>
                        <p className="mt-2 text-[11px]"><strong>Clinical Pearl:</strong> RACE ≥5 has 85% sensitivity for LVO detection and should prompt urgent vascular imaging (CTA/CTP/MRA) and thrombectomy evaluation.</p>
                      </div>
                      
                      {/* Source */}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                        <strong>Source:</strong> Pérez de la Ossa N et al. Design and validation of a prehospital stroke scale to predict large arterial occlusion: the Rapid Arterial Occlusion Evaluation scale. Stroke. 2014.
                      </div>
                      
                      <button
                        onClick={() => setShowLvoTooltip(false)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <span className={`text-xs md:text-base font-semibold uppercase leading-none ${
                  lvoData.label === 'High' 
                    ? 'text-red-600 dark:text-red-400'
                    : lvoData.label === 'Moderate'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {lvoData.label}
                </span>
                <span className="text-xs md:text-base text-slate-500 dark:text-slate-400 leading-none">
                  {lvoData.probability}%
                </span>
              </div>
            </div>
            
            {/* Right Section: Mode Toggle and Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Rapid/Detailed Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md md:rounded-lg p-0.5 md:p-1">
                <button 
                  onClick={() => setNihssMode('rapid')} 
                  className={`px-2 py-1 md:px-3 md:py-1.5 rounded-sm md:rounded-md text-[9px] md:text-xs font-medium transition-colors ${nihssMode === 'rapid' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Rapid
                </button>
                <button 
                  onClick={() => setNihssMode('detailed')} 
                  className={`px-2 py-1 md:px-3 md:py-1.5 rounded-sm md:rounded-md text-[9px] md:text-xs font-medium transition-colors ${nihssMode === 'detailed' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Detailed
                </button>
              </div>
              
              {/* Action Buttons */}
              <button 
                onClick={handleFavToggle} 
                className="hidden md:flex p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors items-center justify-center"
              >
                <Star size={18} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400 dark:text-slate-500'} />
              </button>
              <button 
                onClick={() => setNihssValues({})} 
                className="p-1 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <RefreshCw size={14} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button 
                onClick={copyNihss} 
                className="bg-slate-900 dark:bg-slate-800 text-white px-2 md:px-6 py-1.5 md:py-2.5 rounded-full text-[10px] md:text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-all uppercase tracking-wide flex-shrink-0"
              >
                <span className="hidden md:inline">Copy to EMR</span>
                <span className="md:hidden">COPY</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 pt-6 pb-8">
        <div className="grid grid-cols-1 gap-6">
          {NIHSS_ITEMS.map((item) => {
            const warning = userMode === 'resident' ? getItemWarning(item.id, nihssValues[item.id] ?? 0, nihssValues) : null;
            const showPearl = userMode === 'resident' || activePearl === item.id;
            const isRequired = item.id === '1a';
            
            if (item.id === '5a') {
              return (
                <React.Fragment key="motor-header">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-black text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest">Motor</h3>
                    <button 
                      onClick={() => setAllMotor(0)} 
                      className="text-xs font-bold text-[#007AFF] bg-[#007AFF]/10 px-3 py-1.5 rounded-lg hover:bg-[#007AFF]/20 transition-colors"
                    >
                      Normal Exam
                    </button>
                  </div>
                  <NihssItemCard 
                    key={item.id} 
                    item={item} 
                    value={nihssValues[item.id] ?? 0} 
                    onChange={(v) => handleNihssChange(item.id, v)} 
                    mode={nihssMode} 
                    userMode={userMode} 
                    showPearl={showPearl} 
                    onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))} 
                    warning={warning}
                  />
                </React.Fragment>
              );
            }
            return (
              <NihssItemCard 
                key={item.id} 
                item={item} 
                value={nihssValues[item.id] ?? 0} 
                onChange={(v) => handleNihssChange(item.id, v)} 
                mode={nihssMode} 
                userMode={userMode} 
                showPearl={showPearl} 
                onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))} 
                warning={warning}
                isRequired={isRequired}
              />
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-in fade-in zoom-in-95 duration-200 z-[60] whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default NihssCalculator;
