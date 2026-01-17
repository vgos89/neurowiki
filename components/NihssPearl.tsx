
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface NihssPearlProps {
  text: string;
}

const NihssPearl: React.FC<NihssPearlProps> = ({ text }) => {
  if (!text) return null;
  
  return (
    <div className="flex items-start space-x-3 bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400 mt-4 animate-in fade-in">
      <div className="mt-0.5 text-amber-600 shrink-0">
        <Lightbulb size={18} />
      </div>
      <p className="text-sm text-amber-900 font-medium leading-relaxed">
        {text}
      </p>
    </div>
  );
};

export default NihssPearl;
