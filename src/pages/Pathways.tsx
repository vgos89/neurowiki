// Pathways hub placeholder — full anatomy in Prompt 5e (PATHWAY_SPEC)
// LAYOUT_SPEC §9 — /pathways/* routes are wrapped by the same Layout chrome.
import React from 'react';
import { Link } from 'react-router-dom';

const PATHWAY_ITEMS = [
  { name: 'Stroke Code', path: '/pathways/stroke-code', desc: 'Door-to-needle protocol' },
  { name: 'EVT Pathway', path: '/pathways/evt', desc: 'Thrombectomy eligibility' },
  { name: 'Long Window IVT', path: '/pathways/late-window-ivt', desc: 'Extended IVT eligibility' },
  { name: 'ELAN Pathway', path: '/pathways/elan-pathway', desc: 'Anticoagulation timing' },
  { name: 'Status Epilepticus', path: '/pathways/se-pathway', desc: 'Stage 1–3 SE management' },
  { name: 'Migraine Pathway', path: '/pathways/migraine-pathway', desc: 'Acute headache management' },
  { name: 'GCA Pathway', path: '/pathways/gca-pathway', desc: 'Giant cell arteritis workup' },
];

export default function Pathways() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 px-5 pt-8 pb-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">Pathways</p>
      <h1 className="text-[22px] md:text-[28px] font-medium tracking-[-0.01em] text-slate-900 dark:text-white mb-2">
        {PATHWAY_ITEMS.length} decision pathways.
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Step-through workflows for time-critical decisions. Full hub coming soon.
      </p>
      <div className="space-y-0">
        {PATHWAY_ITEMS.map((p) => (
          <Link
            key={p.path}
            to={p.path}
            className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 -mx-5 px-5 transition-colors"
          >
            <div>
              <div className="text-[14.5px] font-semibold text-slate-900 dark:text-white">{p.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{p.desc}</div>
            </div>
            <svg className="w-4 h-4 text-slate-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
