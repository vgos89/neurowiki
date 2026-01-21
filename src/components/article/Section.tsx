import React from 'react';

interface SectionProps {
  number: string | number;
  title: string;
}

export const Section: React.FC<SectionProps> = ({ number, title }) => (
  <h2 className="text-xl font-semibold text-slate-900 mt-10 mb-4 tracking-tight">
    <span className="text-slate-400 font-normal mr-2">{number}.</span>
    {title}
  </h2>
);

export const SubSection: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-base font-semibold text-slate-800 mt-6 mb-3">{title}</h3>
);
