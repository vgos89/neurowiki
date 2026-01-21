import React from 'react';

export const Critical: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-red-700">{children}</strong>
);

export const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="px-1 py-0.5 bg-slate-100 text-slate-800 rounded text-sm">{children}</code>
);

export const Warning: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-5 py-3 px-4 text-red-800 bg-red-50 border-l-2 border-red-400 rounded-r">
    {children}
  </p>
);

export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-5 py-3 px-4 text-slate-600 bg-slate-50 border-l-2 border-slate-300 rounded-r italic">
    {children}
  </p>
);
