
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Undo2, Info, Brain, Check, X, AlertTriangle, Star } from 'lucide-react';
import AspectsBrainMap from '../components/AspectsBrainMap';
import { useFavorites } from '../hooks/useFavorites';

type Side = 'left' | 'right';

const AspectsCalculator: React.FC = () => {
  const [side, setSide] = useState<Side>('left');
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]); 

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const isFav = isFavorite('aspects');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('aspects');
      setLastAction(newVal ? 'Saved to Favorites' : 'Removed from Favorites');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  // Score Calculation
  const currentSideSelections = useMemo(() => {
    return Array.from(selectedRegions).filter(id => id.startsWith(side === 'left' ? 'L-' : 'R-'));
  }, [selectedRegions, side]);

  const score = 10 - currentSideSelections.length;

  // Handlers
  const handleToggle = (id: string) => {
    const regionSide = id.startsWith('L-') ? 'left' : 'right';
    if (regionSide !== side) {
      setSide(regionSide);
    }

    const next = new Set(selectedRegions);
    if (next.has(id)) {
      next.delete(id);
      setLastAction(`Removed ${id.split('-')[1]}`);
    } else {
      next.add(id);
      setLastAction(`Selected ${id.split('-')[1]}`);
    }
    setSelectedRegions(next);
    setHistory(prev => [...prev, id]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastId = history[history.length - 1];
    const next = new Set(selectedRegions);
    if (next.has(lastId)) next.delete(lastId);
    else next.add(lastId);
    
    setSelectedRegions(next);
    setHistory(prev => prev.slice(0, -1));
    setLastAction(`Undid ${lastId.split('-')[1]}`);
  };

  const handleReset = () => {
    setSelectedRegions(new Set());
    setHistory([]);
    setLastAction("Reset");
  };

  const getInterpretation = (s: number) => {
    if (s >= 8) return { text: "Small core. Favorable outcome likely with reperfusion.", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (s >= 5) return { text: "Moderate core. Benefit from EVT likely (SELECT2/ANGEL-ASPECT).", color: "text-amber-600", bg: "bg-amber-50" };
    return { text: "Large core. High risk. Benefit uncertain/limited (Individualize).", color: "text-red-600", bg: "bg-red-50" };
  };

  const interpretation = getInterpretation(score);

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-white md:bg-gray-50 md:min-h-screen">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link to="/calculators" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ASPECTS Score</span>
             <span className={`text-3xl font-black leading-none ${score < 6 ? 'text-red-600' : score < 8 ? 'text-amber-500' : 'text-emerald-600'}`}>
               {score}
             </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
                onClick={handleFavToggle}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
                <Star size={20} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
            </button>
            <button 
                onClick={handleUndo} 
                disabled={history.length === 0}
                className={`p-2 -mr-2 rounded-full transition-colors ${history.length === 0 ? 'text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
                <Undo2 size={20} />
            </button>
          </div>
        </div>

        {/* Side Toggle Segmented Control */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setSide('left')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${side === 'left' ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Left MCA
          </button>
          <button 
            onClick={() => setSide('right')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${side === 'right' ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Right MCA
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Interpretation Banner */}
        <div className={`${interpretation.bg} px-4 py-3 flex items-start space-x-3 transition-colors duration-300`}>
           <Info size={16} className={`mt-0.5 shrink-0 ${interpretation.color}`} />
           <p className={`text-xs font-medium leading-relaxed ${interpretation.color}`}>
             {interpretation.text}
           </p>
        </div>

        {/* Brain Map */}
        <div className="px-4 py-6 flex justify-center bg-white">
           <AspectsBrainMap side={side} selectedRegions={selectedRegions} onToggle={handleToggle} />
        </div>

        {/* Selected List */}
        <div className="px-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Selected Regions ({currentSideSelections.length})</h3>
           <div className="flex flex-wrap gap-2 min-h-[40px]">
              {currentSideSelections.length === 0 ? (
                <span className="text-sm text-slate-300 italic">No early ischemic changes marked</span>
              ) : (
                currentSideSelections.map(id => (
                  <button 
                    key={id}
                    onClick={() => handleToggle(id)}
                    className="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold border border-rose-100 hover:bg-rose-100 transition-colors animate-in zoom-in-95"
                  >
                    {id.replace('L-', '').replace('R-', '')}
                    <X size={12} className="ml-1.5 opacity-60" />
                  </button>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom max-w-md mx-auto">
         <div className="flex gap-3">
            <button 
              onClick={handleReset}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> Reset
            </button>
         </div>
         <div className="text-[10px] text-center text-slate-400 mt-3 font-medium">
           Tap regions to subtract points. 10 = Normal.
         </div>
      </div>

      {/* Toast Notification */}
      {lastAction && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {lastAction}
        </div>
      )}
    </div>
  );
};

export default AspectsCalculator;
