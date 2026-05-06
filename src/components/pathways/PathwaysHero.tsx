// PATHWAY_SPEC §1.1 — Pathways hub hero
// Mirrors CalculatorsHero pattern: eyebrow · count headline · lede.
import React from 'react';
import { PATHWAYS } from '../../data/pathways';

export default function PathwaysHero() {
  const count = PATHWAYS.length;
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">
        Pathways
      </p>
      <h1 className="text-[22px] md:text-[28px] font-medium tracking-[-0.01em] text-slate-900 dark:text-white mb-2">
        {count} decision pathways.
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Step-through workflows for time-critical decisions.
      </p>
    </div>
  );
}
