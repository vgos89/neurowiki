
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FlaskConical, ChevronRight, ChevronDown, BookOpen, Layers, Activity } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const [openSubcategory, setOpenSubcategory] = useState<string | null>('Thrombectomy');

  // When returning with ?open=, expand that subcategory
  useEffect(() => {
    const o = searchParams.get('open');
    if (o) setOpenSubcategory(o);
  }, [searchParams]);

  const toggleSubcategory = (title: string) => {
    setOpenSubcategory(prev => (prev === title ? null : title));
  };

  const orphans = useMemo(() => {
    const structuredIds = new Set(TRIAL_STRUCTURE.flatMap(c => c.subcategories.flatMap(s => s.ids)));
    return Object.values(GUIDE_CONTENT)
      .filter(t => t.category === 'Neuro Trials' && !structuredIds.has(t.id));
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row relative items-start">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white flex-shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto self-start">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FlaskConical className="text-neuro-500" size={20} />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Neuro Trials</h2>
              <p className="text-xs text-slate-500 mt-0.5">Evidence pearls</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {TRIAL_STRUCTURE.map((cat) => (
            <div key={cat.title} className="mt-4 first:mt-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {cat.title}
              </h3>
              <div className="space-y-0.5">
                {cat.subcategories.map(sub => {
                  const isOpen = openSubcategory === sub.title;
                  return (
                    <div key={sub.title}>
                        <button
                          onClick={() => toggleSubcategory(sub.title)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 group min-h-[40px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                            isOpen ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50 font-normal'
                          }`}
                        >
                          <span className="text-left">{sub.title}</span>
                          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isOpen && (
                           <div className="mt-0.5 space-y-0.5 pl-3 animate-in slide-in-from-top-1 fade-in duration-200">
                              {sub.ids.map(id => {
                                 const trial = GUIDE_CONTENT[id];
                                 if(!trial) return null;
                                 return (
                                   <Link 
                                     key={id} 
                                     to={`/trials/${id}?from=trials&category=${encodeURIComponent(sub.title)}`}
                                     className="block px-3 py-2 text-sm rounded-lg transition-colors duration-150 truncate text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                   >
                                     {trial.title.replace(/Trial:|Study:/gi, '').trim()}
                                   </Link>
                                 );
                              })}
                           </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {orphans.length > 0 && (
             <div className="mt-4">
               <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Other Trials</h3>
               <div className="space-y-0.5">
                 {orphans.map(t => (
                    <Link
                      key={t.id}
                      to={`/trials/${t.id}?from=trials`}
                      className="block px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 truncate text-slate-700 hover:bg-slate-50 font-normal"
                    >
                      {t.title}
                    </Link>
                 ))}
               </div>
             </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Landmark Trials</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">Curated summaries of pivotal studies shaping modern neurology.</p>
          </div>

          {TRIAL_STRUCTURE.map((cat) => (
            <div key={cat.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-slate-100">
                 <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Layers size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900">{cat.title}</h2>
              </div>

              <div className="space-y-10">
                {cat.subcategories.map(sub => (
                  <div key={sub.title} id={sub.title.replace(/\s+/g, '-').toLowerCase()} className="scroll-mt-24">
                    <div className="mb-4 ml-1">
                        <h3 className="text-lg font-bold text-emerald-800 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></div>
                            {sub.title}
                        </h3>
                        <p className="text-sm text-slate-500 ml-4.5 mt-0.5">{sub.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {sub.ids.map(id => {
                        const trial = GUIDE_CONTENT[id];
                        if (!trial) return null;
                        
                        return (
                          <Link
                            key={id}
                            to={`/trials/${id}?from=trials&category=${encodeURIComponent(sub.title)}`}
                            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-colors duration-150 flex flex-col relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -mr-8 -mt-8"></div>
                            
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-lg leading-tight pr-4">
                                    {trial.title.replace('Trial:', '').replace('Study:', '').trim()}
                                </h4>
                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors shrink-0">
                                    <BookOpen size={18} />
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                                {trial.content.split('\n').find(l => l.length > 40 && !l.startsWith('#'))?.replace(/\*+/g, '') || "Clinical summary available."}
                            </p>

                            <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-wider mt-auto">
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
                <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-slate-100">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Activity size={20} /></div>
                    <h2 className="text-2xl font-bold text-slate-900">Other Trials</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {orphans.map(trial => (
                        <Link
                            key={trial.id}
                            to={`/trials/${trial.id}?from=trials`}
                            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-colors duration-150"
                        >
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-lg mb-2">
                                {trial.title}
                            </h4>
                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
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
