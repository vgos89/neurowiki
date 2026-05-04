// LAYOUT_SPEC §4 — branching nodes, 4 circles + 3 path edges, stroked
import React from 'react';
export const PathwaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="5" cy="6" r="1.8"/>
    <circle cx="12" cy="12" r="1.8"/>
    <circle cx="19" cy="6" r="1.8"/>
    <circle cx="19" cy="18" r="1.8"/>
    <path d="M6.5 7.2L10.5 11"/>
    <path d="M13.5 11L17.5 7.2"/>
    <path d="M13.5 13L17.5 16.8"/>
  </svg>
);
