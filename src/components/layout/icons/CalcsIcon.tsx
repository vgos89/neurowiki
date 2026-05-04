// LAYOUT_SPEC §3 — 3×3 numpad, 9 filled circles
import React from 'react';
export const CalcsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="6" cy="7" r="1.4"/><circle cx="12" cy="7" r="1.4"/><circle cx="18" cy="7" r="1.4"/>
    <circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>
    <circle cx="6" cy="17" r="1.4"/><circle cx="12" cy="17" r="1.4"/><circle cx="18" cy="17" r="1.4"/>
  </svg>
);
