
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight, Calculator, User, Zap, Activity } from 'lucide-react';
import { trackQuickToolClick } from '../utils/analytics';

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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neuro-500">
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
      {/* Hero Section - Clinical Premium */}
      <section className="px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            The Digital{' '}
            <span className="text-neuro-500">Neurology</span>
            {' '}Companion
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Protocols, calculators, and guidelines for Neurologists.
          </p>
        </div>
        
        {/* Pathway Tools - Minimal Text Links */}
        <div className="mt-6">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Pathways & Calculators</span>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/guide/stroke-basics" 
              onClick={() => trackQuickToolClick('stroke_basics')} 
              className="text-sm font-medium text-neuro-500 hover:text-teal-500 hover:underline transition-colors duration-150"
            >
              Stroke Basics →
            </Link>
            <Link 
              to="/calculators/evt-pathway" 
              onClick={() => trackQuickToolClick('thrombectomy')} 
              className="text-sm font-medium text-neuro-500 hover:text-teal-500 hover:underline transition-colors duration-150"
            >
              Thrombectomy →
            </Link>
            <Link 
              to="/calculators/elan-pathway" 
              onClick={() => trackQuickToolClick('elan_protocol')} 
              className="text-sm font-medium text-neuro-500 hover:text-teal-500 hover:underline transition-colors duration-150"
            >
              Post-Stroke Anticoagulation Timing →
            </Link>
            <Link 
              to="/calculators/se-pathway" 
              onClick={() => trackQuickToolClick('status_epilepticus')} 
              className="text-sm font-medium text-neuro-500 hover:text-teal-500 hover:underline transition-colors duration-150"
            >
              Status Epilepticus →
            </Link>
            <Link 
              to="/calculators/migraine-pathway" 
              onClick={() => trackQuickToolClick('migraine_pathway')} 
              className="text-sm font-medium text-neuro-500 hover:text-teal-500 hover:underline transition-colors duration-150"
            >
              Migraine →
            </Link>
            <Link 
              to="/calculators/gca-pathway" 
              onClick={() => trackQuickToolClick('gca_pathway')} 
              className="text-sm font-medium text-neuro-500 hover:text-teal-500 hover:underline transition-colors duration-150"
            >
              GCA Helper →
            </Link>
          </div>
        </div>

        {/* Quick Search - Minimal Chips */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Quick Search</span>
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/wiki/Stroke" 
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-600 transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              Stroke
            </Link>
            <Link 
              to="/wiki/Sclerosis" 
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-600 transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              MS
            </Link>
            <Link 
              to="/wiki/Epilepsy" 
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-600 transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              Epilepsy
            </Link>
            <Link 
              to="/wiki/Meningitis" 
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-600 transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              Meningitis
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subspecialties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/wiki/${cat.name}`} 
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-150"
            >
              <div className="p-2 bg-slate-100 dark:bg-slate-700 group-hover:bg-neuro-50 dark:group-hover:bg-neuro-900/30 rounded-lg transition-colors duration-150">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{cat.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Calculators Quick Access */}
      <section className="pb-10">
        <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Calculators</h2>
            <Link to="/calculators" className="text-sm font-semibold text-neuro-500 dark:text-neuro-400 hover:text-teal-500 dark:hover:text-neuro-300 flex items-center transition-colors duration-150">
                View All <ChevronRight size={16} className="ml-1" />
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {featuredCalculators.map(calc => (
                <Link 
                  key={calc.id} 
                  to={`/calculators?id=${calc.id}`} 
                  onClick={() => trackQuickToolClick(calc.id)} 
                  className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-150"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 group-hover:bg-neuro-50 dark:group-hover:bg-neuro-900/30 rounded-lg transition-colors duration-150">
                    <Calculator size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-neuro-500 dark:group-hover:text-neuro-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{calc.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{calc.desc}</p>
                  </div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
