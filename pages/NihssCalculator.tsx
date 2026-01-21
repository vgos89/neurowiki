
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star, Zap, UserCog } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { NIHSS_ITEMS, calculateTotal, getItemWarning } from '../utils/nihssShortcuts';
import NihssItemRow from '../components/NihssItemRow';

const NihssCalculator: React.FC = () => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [userMode, setUserMode] = useState<'resident' | 'attending'>('resident');
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const handleScroll = () => {
      if (main.scrollTop > 60 && !isHeaderCompact) setIsHeaderCompact(true);
      else if (main.scrollTop < 10 && isHeaderCompact) setIsHeaderCompact(false);
    };
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, [isHeaderCompact]);

  const handleNihssChange = (id: string, val: number) => {
    setNihssValues((prev) => ({ ...prev, [id]: val }));
    const idx = NIHSS_ITEMS.findIndex((i) => i.id === id);
    if (idx >= 0 && idx < NIHSS_ITEMS.length - 1) {
      setTimeout(() => {
        const el = document.getElementById(`nihss-row-${NIHSS_ITEMS[idx + 1].id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
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
    <div className="max-w-xl mx-auto pb-32">
      <div
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors duration-300 ease-in-out px-4 overflow-hidden ${isHeaderCompact ? 'py-2 cursor-pointer' : 'py-3'}`}
        onClick={() => isHeaderCompact && setIsHeaderCompact(false)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/calculators" onClick={(e) => e.stopPropagation()} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className={`font-black text-slate-900 ml-2 transition-colors duration-150 ${isHeaderCompact ? 'text-lg' : 'text-xl'}`}>NIHSS</h1>
          </div>
          {isHeaderCompact && <div className="text-sm font-black text-slate-900 animate-in fade-in">Score: {calculateTotal(nihssValues)}</div>}
          {!isHeaderCompact && (
            <button onClick={handleFavToggle} className="p-3 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">
              <Star size={20} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
            </button>
          )}
        </div>
        <div className={`transition-colors duration-300 ease-in-out overflow-hidden ${isHeaderCompact ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100 mt-4'}`}>
          <div className="flex flex-col gap-3 pb-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center bg-slate-100 rounded-lg p-1 w-full">
              <button onClick={() => setNihssMode('rapid')} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors duration-150 ${nihssMode === 'rapid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Rapid</button>
              <button onClick={() => setNihssMode('detailed')} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors duration-150 ${nihssMode === 'detailed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Detailed</button>
            </div>
            <div className="relative flex bg-slate-100 rounded-lg p-1 h-9 cursor-pointer w-full" onClick={() => setUserMode((m) => (m === 'resident' ? 'attending' : 'resident'))}>
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-colors duration-300 ease-out border border-black/5 ${userMode === 'resident' ? 'left-1' : 'left-[calc(50%+0px)]'}`} />
              <button onClick={(e) => { e.stopPropagation(); setUserMode('resident'); }} className={`relative z-10 flex-1 flex items-center justify-center px-2 text-xs font-bold transition-colors min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${userMode === 'resident' ? 'text-slate-900' : 'text-slate-500'}`}>
                <UserCog size={12} className={`mr-1.5 ${userMode === 'resident' ? 'text-neuro-600' : ''}`} /> Resident
              </button>
              <button onClick={(e) => { e.stopPropagation(); setUserMode('attending'); }} className={`relative z-10 flex-1 flex items-center justify-center px-2 text-xs font-bold transition-colors min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${userMode === 'attending' ? 'text-slate-900' : 'text-slate-500'}`}>
                <Zap size={12} className={`mr-1.5 ${userMode === 'attending' ? 'text-amber-500' : ''}`} /> Attending
              </button>
            </div>
          </div>
        </div>
        {isHeaderCompact && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />}
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-6">
          {NIHSS_ITEMS.map((item) => {
            const warning = userMode === 'resident' ? getItemWarning(item.id, nihssValues[item.id] ?? 0, nihssValues) : null;
            const showPearl = userMode === 'resident' || activePearl === item.id;
            if (item.id === '5a') {
              return (
                <React.Fragment key="motor-header">
                  <div className="flex justify-between items-end border-b border-slate-100 pb-2 mt-8 mb-4">
                    <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Motor</h3>
                    <button onClick={() => setAllMotor(0)} className="text-xs font-bold text-neuro-600 bg-neuro-50 px-2 py-1 rounded hover:bg-neuro-100">Normal Exam</button>
                  </div>
                  <NihssItemRow key={item.id} item={item} value={nihssValues[item.id] ?? 0} onChange={(v) => handleNihssChange(item.id, v)} mode={nihssMode} userMode={userMode} showPearl={showPearl} onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))} warning={warning} />
                </React.Fragment>
              );
            }
            return <NihssItemRow key={item.id} item={item} value={nihssValues[item.id] ?? 0} onChange={(v) => handleNihssChange(item.id, v)} mode={nihssMode} userMode={userMode} showPearl={showPearl} onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))} warning={warning} />;
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Total Score</div>
            <div className="text-3xl font-black text-slate-900">{calculateTotal(nihssValues)}</div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setNihssValues({})} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"><RefreshCw size={20} /></button>
            <button onClick={copyNihss} className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 active:scale-95 transform-gpu flex items-center transition-colors duration-150"><Copy size={18} className="mr-2" /> Copy</button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-in fade-in zoom-in-95 duration-200 z-[60] whitespace-nowrap">{toastMessage}</div>
      )}
    </div>
  );
};

export default NihssCalculator;
