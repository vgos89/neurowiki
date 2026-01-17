
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight, Calculator, User, Zap, Activity } from 'lucide-react';

const categories = [
  { 
    name: 'Vascular Neurology', 
    icon: (
      <div className="relative">
        <Brain className="text-slate-400" size={24} />
        <Zap className="absolute -top-1 -right-1 text-red-500 fill-red-500" size={14} />
      </div>
    ), 
    desc: 'Stroke, TIA, Hemorrhage' 
  },
  { 
    name: 'Epilepsy', 
    icon: (
      <div className="w-8 h-6 overflow-hidden flex items-center">
        <style>
          {`
            @keyframes eeg-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .eeg-wave {
              display: flex;
              animation: eeg-scroll 2.5s linear infinite;
            }
          `}
        </style>
        <div className="eeg-wave text-yellow-500">
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12L4 12L6 4L10 20L12 12L16 12L18 8L20 16L22 12L26 12L28 2L32 22L34 12L40 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12L4 12L6 4L10 20L12 12L16 12L18 8L20 16L22 12L26 12L28 2L32 22L34 12L40 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    ), 
    desc: 'Seizures, Status Epilepticus' 
  },
  { 
    name: 'Neuromuscular', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
        <rect x="2" y="14" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 16H12M12 16V10M12 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="5" cy="11" r="1" fill="currentColor" opacity="0.4"/>
      </svg>
    ), 
    desc: 'ALS, Myasthenia Gravis, Neuropathy' 
  },
  { 
    name: 'Neuroimmunology', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ), 
    desc: 'Multiple Sclerosis, NMOSD' 
  },
  { 
    name: 'Movement Disorders', 
    icon: (
      <div className="flex items-center justify-center">
        <style>
          {`
            @keyframes shaking-body {
              0% { transform: translateX(0); }
              25% { transform: translateX(-0.5px) rotate(-0.5deg); }
              50% { transform: translateX(0.5px) rotate(0.5deg); }
              75% { transform: translateX(-0.5px) rotate(-0.5deg); }
              100% { transform: translateX(0); }
            }
            .shaking-icon {
              animation: shaking-body 0.15s infinite ease-in-out;
            }
          `}
        </style>
        <div className="shaking-icon text-amber-500">
          <User size={24} strokeWidth={2.5} />
        </div>
      </div>
    ), 
    desc: "Parkinson's, Tremor, Dystonia" 
  },
  { 
    name: 'Cognitive', 
    icon: (
      <div className="relative">
        <Brain className="text-purple-500" size={24} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full border border-purple-600 shadow-sm"></div>
      </div>
    ), 
    desc: "Alzheimer's, Dementia, MCI" 
  },
];

const featuredCalculators = [
  { id: 'gcs', name: 'Glasgow Coma Scale', desc: 'Assess level of consciousness' },
  { id: 'abcd2', name: 'ABCD² Score', desc: 'TIA stroke risk' },
  { id: 'ich', name: 'ICH Score', desc: 'Intracerebral hemorrhage mortality' },
];

const Home: React.FC = () => {
  return (
    <div className="space-y-8 md:space-y-10">
      {/* Hero Section - Optimized for Mobile */}
      <section className="bg-white rounded-3xl md:p-10 p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 md:w-64 h-32 md:h-64 bg-neuro-50 rounded-full opacity-30 blur-2xl md:blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="max-w-2xl space-y-6 md:space-y-6 text-center md:text-left w-full">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              The Digital <span className="text-neuro-600">Neurology</span> Companion
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0">
              Protocols, calculators, and guidelines for Neurologists.
            </p>
            
            {/* Pathway Tools Links - Enhanced for Touch */}
            <div className="pt-4 md:pt-2">
                 <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 md:mb-3 text-center md:text-left">Try Pathways & Calculators</span>
                 <div className="flex flex-wrap justify-center md:justify-start gap-3">
                     <Link to="/calculators/evt-pathway" className="group flex items-center space-x-2 text-sm font-bold text-neuro-700 bg-white border border-neuro-100 px-4 py-2.5 rounded-xl hover:border-neuro-300 hover:shadow-sm transition-all touch-manipulation active:scale-95">
                        <span className="w-2 h-2 bg-neuro-500 rounded-full group-hover:scale-125 transition-transform"></span>
                        <span>Thrombectomy</span>
                     </Link>
                     <Link to="/calculators/elan-pathway" className="group flex items-center space-x-2 text-sm font-bold text-purple-700 bg-white border border-purple-100 px-4 py-2.5 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all touch-manipulation active:scale-95">
                        <span className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></span>
                        <span>ELAN Protocol</span>
                     </Link>
                     <Link to="/calculators/se-pathway" className="group flex items-center space-x-2 text-sm font-bold text-red-700 bg-white border border-red-100 px-4 py-2.5 rounded-xl hover:border-red-300 hover:shadow-sm transition-all touch-manipulation active:scale-95">
                        <span className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform"></span>
                        <span>Status Epilepticus</span>
                     </Link>
                     <Link to="/calculators/migraine-pathway" className="group flex items-center space-x-2 text-sm font-bold text-indigo-700 bg-white border border-indigo-100 px-4 py-2.5 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all touch-manipulation active:scale-95">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform"></span>
                        <span>Migraine</span>
                     </Link>
                     <Link to="/calculators/gca-pathway" className="group flex items-center space-x-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all touch-manipulation active:scale-95">
                        <span className="w-2 h-2 bg-slate-500 rounded-full group-hover:scale-125 transition-transform"></span>
                        <span>GCA Helper</span>
                     </Link>
                </div>
            </div>

            {/* Quick Search Chips - Larger Tap Targets */}
            <div className="pt-6 border-t border-gray-50/50">
              <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 md:mb-3 text-center md:text-left">Quick Search Wiki</span>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link to="/wiki/Stroke" className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-full text-sm font-bold hover:bg-neuro-100 hover:text-neuro-700 transition-all border border-gray-200 touch-manipulation active:scale-95">Stroke</Link>
                <Link to="/wiki/Sclerosis" className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-full text-sm font-bold hover:bg-neuro-100 hover:text-neuro-700 transition-all border border-gray-200 touch-manipulation active:scale-95">MS</Link>
                <Link to="/wiki/Epilepsy" className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-full text-sm font-bold hover:bg-neuro-100 hover:text-neuro-700 transition-all border border-gray-200 touch-manipulation active:scale-95">Epilepsy</Link>
                <Link to="/wiki/Meningitis" className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-full text-sm font-bold hover:bg-neuro-100 hover:text-neuro-700 transition-all border border-gray-200 touch-manipulation active:scale-95">Meningitis</Link>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
              <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-xl border border-neuro-50">
                  <Brain size={80} className="text-neuro-500 animate-pulse" />
              </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Subspecialties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/wiki/${cat.name}`} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-neuro-200 hover:-translate-y-1 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-neuro-50 transition-colors flex items-center justify-center w-16 h-16 shadow-inner shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-neuro-600 transition-colors leading-tight">{cat.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{cat.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Calculators Quick Access */}
      <section className="pb-10">
        <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Calculators</h2>
            <Link to="/calculators" className="text-neuro-600 text-sm font-bold hover:text-neuro-800 flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 transition-all uppercase tracking-wider active:scale-95">
                View All <ChevronRight size={16} className="ml-1" />
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {featuredCalculators.map(calc => (
                <Link key={calc.id} to={`/calculators?id=${calc.id}`} className="block bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-neuro-200 transition-all group active:scale-[0.98]">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-neuro-50 rounded-lg text-neuro-500 group-hover:bg-neuro-600 group-hover:text-white transition-all">
                            <Calculator size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-neuro-600 transition-colors">{calc.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{calc.desc}</p>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
