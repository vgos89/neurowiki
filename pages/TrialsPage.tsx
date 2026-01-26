
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen, Layers, Activity } from 'lucide-react';
import { GUIDE_CONTENT } from '../data/guideContent';

type Subcategory = {
  title: string;
  description: string;
  ids: string[];
};

type Category = {
  title: string;
  subcategories: Subcategory[];
};

const TRIAL_STRUCTURE: Category[] = [
  {
    title: "Vascular Neurology",
    subcategories: [
      {
        title: "Thrombolysis",
        description: "IV Alteplase & Tenecteplase Evidence",
        ids: ['ninds-trial', 'ecass3-trial', 'extend-trial', 'eagle-trial']
      },
      {
        title: "Thrombectomy",
        description: "Large & Medium Vessel Occlusion evidence",
        ids: ['distal-trial', 'escape-mevo-trial', 'defuse-3-trial', 'dawn-trial', 'select2-trial', 'angel-aspect-trial', 'attention-trial', 'baoche-trial']
      },
      {
        title: "Antiplatelets & Prevention",
        description: "DAPT, Anticoagulation, Lipids",
        ids: ['chance-trial', 'point-trial', 'sps3-trial', 'socrates-trial', 'elan-study', 'sparcl-trial']
      },
      {
        title: "Carotid & Intracranial Disease",
        description: "Stenting vs Endarterectomy vs Medical",
        ids: ['nascet-trial', 'crest-trial', 'sammpris-trial', 'weave-trial']
      },
      {
        title: "Acute Management",
        description: "Glycemic control & Systemic care",
        ids: ['shine-trial']
      }
    ]
  }
];

const TrialsPage: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const orphans = useMemo(() => {
    const structuredIds = new Set(TRIAL_STRUCTURE.flatMap(c => c.subcategories.flatMap(s => s.ids)));
    return Object.values(GUIDE_CONTENT)
      .filter(t => t.category === 'Neuro Trials' && !structuredIds.has(t.id));
  }, []);

  return (
    <div className="flex flex-col relative items-start">
      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Landmark Trials</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">Curated summaries of pivotal studies shaping modern neurology.</p>
          </div>

          {TRIAL_STRUCTURE.map((cat) => (
            <div key={cat.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-slate-100 dark:border-slate-700">
                 <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                    <Layers size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{cat.title}</h2>
              </div>

              <div className="space-y-10">
                {cat.subcategories.map(sub => (
                  <div key={sub.title} id={sub.title.replace(/\s+/g, '-').toLowerCase()} className="scroll-mt-24">
                    <div className="mb-4 ml-1">
                        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></div>
                            {sub.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-4.5 mt-0.5">{sub.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {sub.ids.map(id => {
                        const trial = GUIDE_CONTENT[id];
                        if (!trial) return null;
                        
                        return (
                          <Link
                            key={id}
                            to={`/trials/${id}?from=trials&category=${encodeURIComponent(sub.title)}`}
                            className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 hover:shadow-md dark:hover:shadow-slate-900/70 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors duration-150 flex flex-col relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -mr-8 -mt-8"></div>
                            
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-lg leading-tight pr-4">
                                    {trial.title.replace('Trial:', '').replace('Study:', '').trim()}
                                </h4>
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors shrink-0">
                                    <BookOpen size={18} />
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                                {trial.content.split('\n').find(l => l.length > 40 && !l.startsWith('#'))?.replace(/\*+/g, '') || "Clinical summary available."}
                            </p>

                            <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-auto">
                                View Summary <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Orphans */}
          {orphans.length > 0 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400"><Activity size={20} /></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Other Trials</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {orphans.map(trial => (
                        <Link
                            key={trial.id}
                            to={`/trials/${trial.id}?from=trials`}
                            className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 hover:shadow-md dark:hover:shadow-slate-900/70 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors duration-150"
                        >
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-lg mb-2">
                                {trial.title}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {trial.content.split('\n').find(l => l.length > 40 && !l.startsWith('#'))?.replace(/\*+/g, '')}
                            </p>
                        </Link>
                    ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialsPage;
