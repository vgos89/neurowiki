
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ChevronRight, BookOpen } from 'lucide-react';
import { GUIDE_CONTENT } from '../data/guideContent';

const TrialsPage: React.FC = () => {
  const trialTopics = Object.values(GUIDE_CONTENT).filter(
    (item) => item.category === 'Neuro Trials'
  );

  const categories = useMemo(() => {
    const map: Record<string, typeof trialTopics> = {
      'Vascular Neurology': [],
      'Neurocritical Care': [],
      'Epilepsy': [],
      'Neuromuscular': [],
      'General Neurology': []
    };

    trialTopics.forEach(trial => {
      const content = trial.content.toLowerCase();
      if (content.includes('stroke') || content.includes('tia')) map['Vascular Neurology'].push(trial);
      else if (content.includes('icp') || content.includes('sah') || content.includes('coma')) map['Neurocritical Care'].push(trial);
      else if (content.includes('seizure') || content.includes('epilepsy')) map['Epilepsy'].push(trial);
      else if (content.includes('nerve') || content.includes('muscle')) map['Neuromuscular'].push(trial);
      else map['General Neurology'].push(trial);
    });

    return Object.entries(map).filter(([_, items]) => items.length > 0);
  }, [trialTopics]);

  return (
    <div className="flex flex-col md:flex-row relative items-start">
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 md:sticky md:top-0 md:h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar self-start">
        <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/95">
            <h2 className="font-bold text-slate-900 flex items-center text-lg">
              <FlaskConical className="mr-2 text-emerald-600" size={24} /> Neuro Trials
            </h2>
            <p className="text-xs text-slate-500 mt-1 ml-8">Evidence-based medicine pearls</p>
        </div>
        <div className="p-4 space-y-8">
          {categories.map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">{cat}</h3>
              <div className="space-y-1">
                {items.map(topic => (
                  <Link
                    key={topic.id}
                    to={`/trials/${topic.id}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                  >
                    <span>{topic.title}</span>
                    <ChevronRight size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Landmark Trials</h1>
            <p className="text-slate-500 mt-2 font-medium">Quick reference summaries for key neurological evidence.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {trialTopics.map((trial) => (
              <Link
                key={trial.id}
                to={`/trials/${trial.id}`}
                className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all flex items-start justify-between"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                      Neuro Trials
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {trial.title}
                  </h2>
                  <p className="text-slate-500 mt-3 text-base leading-relaxed italic line-clamp-2">
                    {trial.content.split('\n').find(l => l.length > 50 && !l.startsWith('#'))?.substring(0, 180)}...
                  </p>
                  <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm uppercase tracking-widest">
                    Read Trial Summary <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                  <BookOpen size={28} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialsPage;
