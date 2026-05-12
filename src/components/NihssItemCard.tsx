import React from 'react';
import { NihssItemDef } from '../utils/nihssShortcuts';
import { AlertTriangle, Info } from 'lucide-react';

interface NihssItemCardProps {
  item: NihssItemDef;
  value: number | undefined;
  onChange: (val: number) => void;
  onShowPearl: () => void;
  showPearl: boolean;
  mode: 'rapid' | 'detailed';
  userMode: 'resident' | 'attending';
  warning?: string | null;
  isRequired?: boolean;
}

const NihssItemCard: React.FC<NihssItemCardProps> = ({ 
  item, 
  value, 
  onChange, 
  onShowPearl, 
  showPearl, 
  mode, 
  userMode, 
  warning,
  isRequired = false
}) => {
  const isSelected = (val: number) => value === val;

  // Parse detailed info for scoring rubric
  const parseDetailedInfo = (info: string) => {
    const lines = info.split('\n').filter(l => l.trim());
    const rubric: { value: string; label: string }[] = [];
    
    lines.forEach(line => {
      const match = line.match(/^•\s*(\d+):\s*(.+)$/);
      if (match) {
        rubric.push({ value: match[1], label: match[2].trim() });
      }
    });
    
    return rubric;
  };

  const rubric = parseDetailedInfo(item.detailedInfo);

  return (
    <div id={`nihss-row-${item.id}`} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200">
      {/* Header - Item number + Name */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{item.id}</span>
          <h2 id={`nihss-label-${item.id}`} className="text-lg font-semibold text-slate-900 dark:text-white">
            {item.name.replace(/^\d+[a-z]?\.\s*/i, '')}
          </h2>
        </div>
        {isRequired && (
          <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
            REQUIRED
          </span>
        )}
      </div>

      {/* Scoring Rubric & Pro Tip Section - Only in Detailed Mode */}
      {mode === 'detailed' && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Rubric */}
          {rubric.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                RUBRIC
              </h3>
              <div className="space-y-2">
                {rubric.map((r, idx) => (
                  <div key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{r.value}:</span> {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Right Column: Plain English */}
          {item.plainEnglish && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                PLAIN ENGLISH
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 prose-sm">
                {item.plainEnglish.split('\n').map((line, idx) => {
                  if (line.trim() === '') return null;
                  
                  // Handle markdown-style bold
                  if (line.includes('**')) {
                    const parts = line.split('**');
                    return (
                      <p key={idx} className="leading-relaxed">
                        {parts.map((part, i) => 
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </p>
                    );
                  }
                  
                  // Handle bullet points
                  if (line.trim().startsWith('•')) {
                    return (
                      <div key={idx} className="flex items-start gap-2 ml-2">
                        <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">•</span>
                        <span className="flex-1">{line.trim().substring(1).trim()}</span>
                      </div>
                    );
                  }
                  
                  return <p key={idx} className="leading-relaxed">{line}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      {warning && (
        <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{warning}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`nihss-label-${item.id}`}>
        {item.rapidOptions.map((opt) => {
          const isActive = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.value)}
              className={`flex-1 min-w-0 px-3 py-2 md:px-5 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-neuro-500 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NihssItemCard;
