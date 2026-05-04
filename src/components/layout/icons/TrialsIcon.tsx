// LAYOUT_SPEC §0.1 — Trials uses a flask SVG (from layout-reference.html)
import React from 'react';
export const TrialsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 3h6"/>
    <path d="M10 3v6L5 19a2 2 0 002 3h10a2 2 0 002-3l-5-10V3"/>
  </svg>
);
