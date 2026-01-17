
import React from 'react';
import { NihssItemDef } from '../utils/nihssShortcuts';
import { Info, HelpCircle, AlertTriangle } from 'lucide-react';

interface NihssItemRowProps {
  item: NihssItemDef;
  value: number | undefined;
  onChange: (val: number) => void;
  onShowPearl: () => void;
  showPearl: boolean;
  mode: 'rapid' | 'detailed';
  userMode: 'resident' | 'attending';
  warning?: string | null;
}

const NihssItemRow: React.FC<NihssItemRowProps> = ({ item, value, onChange, onShowPearl, showPearl, mode, userMode, warning }) => {
  const isSelected = (val: number) => value === val;

  // In detailed mode, we show the description immediately below the buttons
  const isDetailed = mode === 'detailed';
  
  // Logic to hide the help button if pearls are forced visible (Resident mode)
  // In Resident mode, pearls are always visible, so no need for the question mark toggle.
  const showHelpToggle = userMode !== 'resident';

  return (
    <div className={`py-4 border-b border-gray-100 last:border-0 scroll-mt-32 ${isDetailed ? 'bg-slate-50/50 -mx-4 px-4 py-6 mb-2 border-b-2' : ''}`} id={`nihss-row-${item.id}`}>
      
      <div className="flex justify-between items-center mb-3">
        <label className={`${isDetailed ? 'text-lg text-slate-900' : 'text-sm text-slate-700'} font-bold flex items-center`}>
          {item.name}
          {warning && <AlertTriangle size={16} className="text-amber-500 ml-2 animate-pulse" />}
        </label>
        
        {/* Toggle for Pearl - Hidden in Resident Mode (Always on), Visible otherwise */}
        {showHelpToggle && (
          <button onClick={onShowPearl} className="text-slate-300 hover:text-neuro-500 p-1 transition-colors">
            <HelpCircle size={18} className={showPearl ? "text-neuro-500 fill-neuro-100" : ""} />
          </button>
        )}
      </div>
      
      {/* Buttons */}
      <div className={`flex gap-2 ${isDetailed ? 'flex-wrap' : 'h-12'}`}>
        {item.rapidOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              ${isDetailed ? 'flex-none px-4 py-3 text-sm' : 'flex-1 text-xs md:text-sm'}
              rounded-lg font-bold transition-all touch-manipulation active:scale-95 border
              ${isSelected(opt.value)
                ? 'bg-neuro-600 text-white shadow-md border-neuro-600'
                : 'bg-white text-slate-600 border-gray-200 hover:border-neuro-300 hover:bg-neuro-50'
              }
            `}
          >
            {isDetailed ? opt.label : (
              <>
                {opt.label.split(':')[0]} 
                <span className="hidden sm:inline text-[10px] opacity-80 font-normal ml-1">
                   {opt.label.split(':')[1]}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Description (Detailed Mode Only - Placed below buttons) */}
      {isDetailed && (
        <div className="mt-4 text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm whitespace-pre-line">
          {item.detailedInfo}
        </div>
      )}
      
      {/* Pearls & Warnings */}
      {(showPearl || warning) && (
        <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-1">
          {warning && (
            <div className="text-xs font-bold text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start">
               <AlertTriangle size={14} className="mr-2 mt-0.5 shrink-0" />
               {warning}
            </div>
          )}
          {showPearl && (
            <div className="text-xs text-neuro-700 bg-neuro-50 p-3 rounded-lg border border-neuro-100 flex items-start">
               <Info size={14} className="mr-2 mt-0.5 shrink-0" />
               {item.pearl}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NihssItemRow;
