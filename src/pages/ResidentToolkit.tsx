import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Zap,
  Activity,
  BookOpen,
  Calculator,
  FlaskConical,
  ChevronRight,
  Search,
  Clock,
  Shield,
  Heart,
  Stethoscope,
  Eye,
  AlertCircle,
  TrendingUp,
  Star,
} from 'lucide-react';

// ── Featured Tools (quick-access grid) ─────────────────────────────────────

const FEATURED_TOOLS = [
  {
    id: 'stroke-basics',
    name: 'Stroke Code',
    subtitle: 'Door-to-needle protocol',
    path: '/guide/stroke-basics',
    icon: Zap,
    accentColor: 'bg-red-500',
    ringColor: 'ring-red-200 dark:ring-red-900',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-300',
    tag: 'Emergency',
    tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  {
    id: 'evt-pathway',
    name: 'EVT Pathway',
    subtitle: 'Thrombectomy eligibility',
    path: '/calculators/evt-pathway',
    icon: Activity,
    accentColor: 'bg-neuro-500',
    ringColor: 'ring-neuro-200 dark:ring-neuro-900',
    bgColor: 'bg-neuro-50 dark:bg-neuro-950/40',
    textColor: 'text-neuro-700 dark:text-neuro-300',
    tag: 'Calculator',
    tagColor: 'bg-neuro-100 text-neuro-700 dark:bg-neuro-900/50 dark:text-neuro-300',
  },
  {
    id: 'nihss',
    name: 'NIHSS',
    subtitle: 'NIH Stroke Scale',
    path: '/calculators/nihss',
    icon: Calculator,
    accentColor: 'bg-violet-500',
    ringColor: 'ring-violet-200 dark:ring-violet-900',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    textColor: 'text-violet-700 dark:text-violet-300',
    tag: 'Calculator',
    tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  },
  {
    id: 'aspects',
    name: 'ASPECTS',
    subtitle: 'Alberta CT Score',
    path: '/calculators/aspects-score',
    icon: Brain,
    accentColor: 'bg-orange-500',
    ringColor: 'ring-orange-200 dark:ring-orange-900',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    tag: 'New',
    tagColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  },
  {
    id: 'se-pathway',
    name: 'Status Epilepticus',
    subtitle: 'Stage 1–3 SE pathway',
    path: '/calculators/se-pathway',
    icon: AlertCircle,
    accentColor: 'bg-amber-500',
    ringColor: 'ring-amber-200 dark:ring-amber-900',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    tag: 'Emergency',
    tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  {
    id: 'elan-pathway',
    name: 'ELAN Pathway',
    subtitle: 'Anticoagulation timing',
    path: '/calculators/elan-pathway',
    icon: Clock,
    accentColor: 'bg-teal-500',
    ringColor: 'ring-teal-200 dark:ring-teal-900',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    tag: 'Pathway',
    tagColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
];

// ── Guide categories ────────────────────────────────────────────────────────

const GUIDE_CATEGORIES = [
  {
    id: 'vascular',
    name: 'Vascular Neurology',
    description: 'Stroke, TIA, hemorrhage, thrombectomy',
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-900',
    accentDot: 'bg-red-500',
    guides: [
      { name: 'Stroke Code Basics', path: '/guide/stroke-basics', badge: 'Protocol' },
      { name: 'IV Thrombolytic Protocol', path: '/guide/iv-tpa', badge: 'Updated' },
      { name: 'Mechanical Thrombectomy', path: '/guide/thrombectomy', badge: 'Guide' },
      { name: 'ICH Management', path: '/guide/ich-management', badge: 'Protocol' },
      { name: 'Acute Stroke Management', path: '/guide/acute-stroke-mgmt', badge: 'Guide' },
    ],
  },
  {
    id: 'epilepsy',
    name: 'Epilepsy & Seizures',
    description: 'Status epilepticus, seizure workup',
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-900',
    accentDot: 'bg-amber-500',
    guides: [
      { name: 'Status Epilepticus', path: '/guide/status-epilepticus', badge: 'Protocol' },
      { name: 'Seizure Workup', path: '/guide/seizure-workup', badge: 'Guide' },
    ],
  },
  {
    id: 'neurocritical',
    name: 'Neurocritical Care',
    description: 'AMS, meningitis, ICP, emergencies',
    icon: Shield,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-900',
    accentDot: 'bg-violet-500',
    guides: [
      { name: 'Altered Mental Status', path: '/guide/altered-mental-status', badge: 'Guide' },
      { name: 'Bacterial Meningitis', path: '/guide/meningitis', badge: 'Protocol' },
    ],
  },
  {
    id: 'general',
    name: 'General Neurology',
    description: 'Headache, vertigo, weakness, common workups',
    icon: Stethoscope,
    color: 'text-neuro-600 dark:text-neuro-400',
    bgColor: 'bg-neuro-50 dark:bg-neuro-950/30',
    borderColor: 'border-neuro-200 dark:border-neuro-900',
    accentDot: 'bg-neuro-500',
    guides: [
      { name: 'Headache Workup', path: '/guide/headache-workup', badge: 'Guide' },
      { name: 'Vertigo', path: '/guide/vertigo', badge: 'Guide' },
      { name: 'Weakness Workup', path: '/guide/weakness-workup', badge: 'Guide' },
    ],
  },
  {
    id: 'neuromuscular',
    name: 'Neuromuscular & Neuroimmunology',
    description: 'GBS, MG, MS — diagnosis and management',
    icon: FlaskConical,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-900',
    accentDot: 'bg-emerald-500',
    guides: [
      { name: 'Guillain-Barré Syndrome', path: '/guide/gbs', badge: 'Guide' },
      { name: 'Myasthenia Gravis', path: '/guide/myasthenia-gravis', badge: 'Guide' },
      { name: 'Multiple Sclerosis', path: '/guide/multiple-sclerosis', badge: 'Guide' },
    ],
  },
];

// ── Featured Trials ─────────────────────────────────────────────────────────

const FEATURED_TRIALS = [
  { name: 'DAWN', subtitle: 'Late-window EVT up to 24h', path: '/trials/dawn-trial', tag: 'Thrombectomy' },
  { name: 'DEFUSE-3', subtitle: 'Perfusion-guided late-window EVT', path: '/trials/defuse-3-trial', tag: 'Thrombectomy' },
  { name: 'NINDS', subtitle: 'IV tPA within 3h — pivotal trial', path: '/trials/ninds-trial', tag: 'Thrombolysis' },
  { name: 'ELAN', subtitle: 'Early vs late anticoagulation after AF stroke', path: '/trials/elan-study', tag: 'Prevention' },
];

// ── Search data ─────────────────────────────────────────────────────────────

const ALL_SEARCH_ITEMS = [
  ...FEATURED_TOOLS.map((t) => ({ name: t.name, subtitle: t.subtitle, path: t.path, type: 'tool' })),
  ...GUIDE_CATEGORIES.flatMap((cat) =>
    cat.guides.map((g) => ({ name: g.name, subtitle: cat.name, path: g.path, type: 'guide' }))
  ),
  ...FEATURED_TRIALS.map((t) => ({ name: t.name, subtitle: t.subtitle, path: t.path, type: 'trial' })),
];

// ── Component ────────────────────────────────────────────────────────────────

const ResidentToolkit: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_SEARCH_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const toggleCategory = (id: string) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">

      {/* ── Hero / Header ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-6">

          {/* Title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-neuro-500 items-center justify-center flex-shrink-0 shadow-lg shadow-neuro-200 dark:shadow-neuro-900">
              <Brain size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                Resident Toolkit
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                Evidence-based protocols, calculators, and clinical guides — AHA/ASA 2026 aligned
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search guides, protocols, calculators…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-400 dark:focus:ring-neuro-500 transition-shadow"
              aria-label="Search neurology toolkit"
            />
            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                {searchResults.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSearchQuery('')}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4">
                      {item.type}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-6 space-y-8">

        {/* ── Quick-Access Grid ──────────────────────────────────────────── */}
        <section aria-labelledby="featured-tools-heading">
          <h2 id="featured-tools-heading" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className={`group relative flex flex-col gap-2.5 p-4 rounded-2xl border-2 ${tool.ringColor.replace('ring-', 'border-').replace('dark:ring-', 'dark:border-')} ${tool.bgColor} hover:shadow-md transition-all`}
                >
                  <div className={`w-8 h-8 rounded-xl ${tool.accentColor} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold leading-tight ${tool.textColor}`}>{tool.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{tool.subtitle}</div>
                  </div>
                  <span className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${tool.tagColor}`}>
                    {tool.tag}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Desktop: two-column layout ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Guide Categories (2/3 width) */}
          <div className="lg:col-span-2">
            <section aria-labelledby="guide-categories-heading">
              <h2 id="guide-categories-heading" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Clinical Guides
              </h2>
              <div className="space-y-2">
                {GUIDE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isExpanded = expandedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`rounded-2xl border ${cat.borderColor} overflow-hidden transition-all`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${cat.bgColor} hover:opacity-90 transition-opacity`}
                        aria-expanded={isExpanded}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 border ${cat.borderColor}`}>
                          <Icon size={16} className={cat.color} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold ${cat.color}`}>{cat.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{cat.description}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            {cat.guides.length} guides
                          </span>
                          <ChevronRight
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            aria-hidden="true"
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                          {cat.guides.map((guide) => (
                            <Link
                              key={guide.path}
                              to={guide.path}
                              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cat.accentDot}`} aria-hidden="true" />
                                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium">
                                  {guide.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cat.bgColor} ${cat.color}`}>
                                  {guide.badge}
                                </span>
                                <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" aria-hidden="true" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Browse all guides link */}
              <div className="mt-4">
                <Link
                  to="/calculators"
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-neuro-300 dark:hover:border-neuro-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-neuro-50 dark:bg-neuro-950/50 flex items-center justify-center">
                      <Calculator size={16} className="text-neuro-500" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">All Calculators & Pathways</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">NIHSS, ASPECTS, ICH Score, EVT, SE, ELAN…</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-neuro-500 transition-colors flex-shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Trials + Stats (1/3 width) */}
          <div className="space-y-6">

            {/* Landmark Trials */}
            <section aria-labelledby="trials-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="trials-heading" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Landmark Trials
                </h2>
                <Link
                  to="/trials"
                  className="text-xs font-medium text-neuro-600 dark:text-neuro-400 hover:text-neuro-700 dark:hover:text-neuro-300 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {FEATURED_TRIALS.map((trial) => (
                  <Link
                    key={trial.path}
                    to={trial.path}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-neuro-300 dark:hover:border-neuro-700 hover:shadow-sm transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={13} className="text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-neuro-600 dark:group-hover:text-neuro-400 transition-colors">
                        {trial.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{trial.subtitle}</div>
                      <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {trial.tag}
                      </span>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/trials"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 hover:border-neuro-400 hover:text-neuro-600 dark:hover:text-neuro-400 transition-colors"
                >
                  <BookOpen size={13} aria-hidden="true" />
                  All Trials
                </Link>
              </div>
            </section>

            {/* About Neurowiki — compact info card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-neuro-50 to-neuro-100 dark:from-neuro-950/50 dark:to-neuro-900/30 border border-neuro-200 dark:border-neuro-800">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-neuro-500" aria-hidden="true" />
                <span className="text-xs font-bold text-neuro-700 dark:text-neuro-300 uppercase tracking-wider">About NeuroWiki</span>
              </div>
              <p className="text-xs text-neuro-700 dark:text-neuro-300 leading-relaxed">
                Free, evidence-based neurology tools for physicians. All calculators are aligned with <strong>AHA/ASA 2026 stroke guidelines</strong>. For clinical decision support — not a substitute for professional judgment.
              </p>
            </div>

          </div>
        </div>

        {/* ── Stats strip ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3" aria-label="Site statistics">
          {[
            { value: '15+', label: 'Clinical Guides', icon: BookOpen },
            { value: '14+', label: 'Calculators', icon: Calculator },
            { value: '20+', label: 'Landmark Trials', icon: TrendingUp },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
              >
                <Icon size={16} className="text-neuro-500 mb-1.5" aria-hidden="true" />
                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{stat.value}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">{stat.label}</div>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
};

export default ResidentToolkit;
