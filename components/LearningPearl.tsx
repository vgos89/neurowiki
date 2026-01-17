
import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface LearningPearlProps {
  title?: string;
  content: React.ReactNode;
  className?: string;
  variant?: 'indigo' | 'amber' | 'slate' | 'blue';
}

const LearningPearl: React.FC<LearningPearlProps> = ({ title = "Clinical Pearl", content, className = "", variant = 'indigo' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors = {
    indigo: {
      btn: 'text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50',
      box: 'bg-indigo-50 border-indigo-100 text-indigo-900 border-l-indigo-400'
    },
    amber: {
      btn: 'text-amber-700 hover:text-amber-900 bg-amber-50/50 hover:bg-amber-50',
      box: 'bg-amber-50 border-amber-100 text-amber-900 border-l-amber-400'
    },
    slate: {
      btn: 'text-slate-600 hover:text-slate-800 bg-slate-50/50 hover:bg-slate-100',
      box: 'bg-slate-50 border-slate-200 text-slate-700 border-l-slate-400'
    },
    blue: {
      btn: 'text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50',
      box: 'bg-blue-50 border-blue-100 text-blue-900 border-l-blue-400'
    }
  };

  const current = colors[variant] || colors.indigo;

  return (
    <div className={`mt-3 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center text-xs font-bold transition-colors uppercase tracking-wide focus:outline-none px-2 py-1 rounded-md ${current.btn}`}
        type="button"
      >
        <Lightbulb size={12} className="mr-1.5 stroke-[2.5]" />
        {title}
        {isOpen ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
      </button>
      
      {isOpen && (
        <div className={`mt-2 p-3 border rounded-lg text-sm leading-relaxed shadow-sm animate-in slide-in-from-top-1 fade-in duration-200 border-l-4 ${current.box}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default LearningPearl;
