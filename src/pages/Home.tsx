
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Zap,
  Activity,
  BookOpen,
  Calculator,
  FlaskConical,
  ChevronRight,
  Stethoscope,
  AlertCircle,
  TrendingUp,
  Star,
  GitBranch,
} from 'lucide-react';

// ── Featured Tools (quick-access grid) ─────────────────────────────────────

const FEATURED_TOOLS = [
  {
    id: 'stroke-code',
    name: 'Stroke Code',
    subtitle: 'Door-to-needle protocol',
    path: '/calculators/stroke-code',
    icon: Zap,
    accentColor: 'bg-red-500',
    ringColor: 'ring-red-200 dark:ring-red-900',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-300',
    tag: 'Emergency',
    tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  {
    id: 'late-window-ivt',
    name: 'Long Window IVT',
    subtitle: 'Extended IVT eligibility',
    path: '/calculators/late-window-ivt',
    icon: Activity,
    accentColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-200 dark:ring-emerald-900',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    tag: 'Pathway',
    tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  {
    id: 'evt-pathway',
    name: 'EVT Pathway',
    subtitle: 'Thrombectomy eligibility',
    path: '/calculators/evt-pathway',
    icon: Brain,
    accentColor: 'bg-neuro-500',
    ringColor: 'ring-neuro-200 dark:ring-neuro-900',
    bgColor: 'bg-neuro-50 dark:bg-neuro-950/40',
    textColor: 'text-neuro-700 dark:text-neuro-300',
    tag: 'Pathway',
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
    id: 'em-billing',
    name: 'E/M Calculator',
    subtitle: 'Billing & MDM coding',
    path: '/calculators/em-billing',
    icon: Stethoscope,
    accentColor: 'bg-teal-500',
    ringColor: 'ring-teal-200 dark:ring-teal-900',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    tag: 'Billing',
    tagColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
];


// ── Featured Trials ─────────────────────────────────────────────────────────

const FEATURED_TRIALS = [
  { name: 'DAWN', subtitle: 'Late-window EVT up to 24h', path: '/trials/dawn-trial', tag: 'Thrombectomy' },
  { name: 'DEFUSE-3', subtitle: 'Perfusion-guided late-window EVT', path: '/trials/defuse-3-trial', tag: 'Thrombectomy' },
  { name: 'NINDS', subtitle: 'IV tPA within 3h — pivotal trial', path: '/trials/ninds-trial', tag: 'Thrombolysis' },
  { name: 'ELAN', subtitle: 'Early vs late anticoagulation after AF stroke', path: '/trials/elan-study', tag: 'Prevention' },
];

// ── Component ────────────────────────────────────────────────────────────────

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">

      {/* ── Hero / Header ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-neuro-500 items-center justify-center flex-shrink-0 shadow-lg shadow-neuro-200 dark:shadow-neuro-900">
              <Brain size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                Neurology Toolkit
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                Evidence-based protocols, calculators, and clinical guides
              </p>
            </div>
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

        {/* ── Two-column: Calculators CTA + Landmark Trials ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Browse all calculators (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
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
                  <div className="text-xs text-slate-500 dark:text-slate-400">NIHSS, ICH Score, EVT, SE, ELAN…</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-neuro-500 transition-colors flex-shrink-0" aria-hidden="true" />
            </Link>

            {/* 2026 AHA Stroke Guideline Mindmap */}
            <Link
              to="/guide/aha-2026-guideline"
              className="flex items-center justify-between w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-neuro-300 dark:hover:border-neuro-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <GitBranch size={16} className="text-emerald-600" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">2026 AHA Stroke Guideline</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">NEW</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Interactive mindmap · IVT, EVT, BP, DAPT…</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-neuro-500 transition-colors flex-shrink-0" aria-hidden="true" />
            </Link>

            {/* About Neurowiki */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-neuro-50 to-neuro-100 dark:from-neuro-950/50 dark:to-neuro-900/30 border border-neuro-200 dark:border-neuro-800">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-neuro-500" aria-hidden="true" />
                <span className="text-xs font-bold text-neuro-700 dark:text-neuro-300 uppercase tracking-wider">About NeuroWiki</span>
              </div>
              <p className="text-xs text-neuro-700 dark:text-neuro-300 leading-relaxed">
                Free, evidence-based neurology tools for physicians. Stroke tools follow <strong>AHA/ASA 2026 guidelines</strong>; billing tools follow AMA 2021/2023 CPT guidelines. For clinical decision support — not a substitute for professional judgment.
              </p>
            </div>
          </div>

          {/* Right: Landmark Trials (1/3 width) */}
          <div>
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
          </div>
        </div>

        {/* ── Stats strip ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3" aria-label="Site statistics">
          {[
            { value: '14+', label: 'Calculators', icon: Calculator },
            { value: '20+', label: 'Landmark Trials', icon: TrendingUp },
            { value: 'Free', label: 'Always', icon: FlaskConical },
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

export default Home;
