// HUB_SPEC v1.4 §1.7 — Guide hub quick-access strip
// 6 tool cards linking to pathways and calculators most relevant at the bedside.
// Stroke Code links to /pathways/stroke-code (not /guide/stroke-basics, which is
// removed from the Guide hub nav per Prompt 5f).
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Activity, Calculator, AlertCircle, Clock } from 'lucide-react';

const FEATURED_TOOLS = [
  {
    id: 'stroke-code',
    name: 'Stroke Code',
    subtitle: 'Door-to-needle protocol',
    path: '/pathways/stroke-code',
    Icon: Zap,
    accentColor: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    tag: 'Emergency',
    tagColor: 'bg-red-100 text-red-700',
  },
  {
    id: 'evt-pathway',
    name: 'EVT Pathway',
    subtitle: 'Thrombectomy eligibility',
    path: '/pathways/evt',
    Icon: Activity,
    accentColor: 'bg-neuro-500',
    bgColor: 'bg-neuro-50',
    textColor: 'text-neuro-700',
    borderColor: 'border-neuro-200',
    tag: 'Pathway',
    tagColor: 'bg-neuro-100 text-neuro-700',
  },
  {
    id: 'nihss',
    name: 'NIHSS',
    subtitle: 'NIH Stroke Scale',
    path: '/calculators/nihss',
    Icon: Calculator,
    accentColor: 'bg-violet-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    tag: 'Calculator',
    tagColor: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'aspects',
    name: 'ASPECTS',
    subtitle: 'Alberta CT Score',
    path: '/calculators/aspects-score',
    Icon: Brain,
    accentColor: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    tag: 'Calculator',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'se-pathway',
    name: 'Status Epilepticus',
    subtitle: 'Stage 1–3 SE pathway',
    path: '/pathways/se-pathway',
    Icon: AlertCircle,
    accentColor: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    tag: 'Emergency',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'elan-pathway',
    name: 'ELAN Pathway',
    subtitle: 'Anticoagulation timing',
    path: '/pathways/elan-pathway',
    Icon: Clock,
    accentColor: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    tag: 'Pathway',
    tagColor: 'bg-teal-100 text-teal-700',
  },
] as const;

const GuideFeaturedStrip: React.FC = () => {
  return (
    <section className="mb-8" aria-labelledby="guide-featured-heading">
      <h2
        id="guide-featured-heading"
        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
      >
        Quick Access
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {FEATURED_TOOLS.map((tool) => {
          const Icon = tool.Icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className={`relative flex flex-col gap-2 p-3.5 rounded-xl border ${tool.borderColor} ${tool.bgColor} hover:shadow-sm transition-all`}
            >
              <div
                className={`w-7 h-7 rounded-lg ${tool.accentColor} flex items-center justify-center`}
              >
                <Icon size={14} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <div className={`text-[13px] font-bold leading-tight ${tool.textColor}`}>
                  {tool.name}
                </div>
                <div className="text-[11.5px] text-slate-500 mt-0.5 leading-tight">
                  {tool.subtitle}
                </div>
              </div>
              <span
                className={`absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tool.tagColor}`}
              >
                {tool.tag}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default GuideFeaturedStrip;
