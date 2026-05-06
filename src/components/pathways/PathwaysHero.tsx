// PATHWAY_SPEC §1.1 — Pathways hub hero
// Mirrors CalculatorsHero pattern exactly: eyebrow · count headline · lede.
import React from 'react';
import { PATHWAYS } from '../../data/pathways';

export default function PathwaysHero() {
  const count = PATHWAYS.length;
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Pathways
      </div>
      <h1 className="text-[24px] font-medium text-slate-900 leading-tight tracking-tight mb-2">
        {count} pathways.
      </h1>
      <p className="text-[14.5px] text-slate-500 leading-snug">
        Step-through workflows for time-critical decisions.
      </p>
    </div>
  );
}
