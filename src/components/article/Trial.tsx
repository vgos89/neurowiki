import React from 'react';
import { Link } from 'react-router-dom';

interface TrialProps {
  name: string;
  path?: string;
}

export const Trial: React.FC<TrialProps> = ({ name, path }) => {
  const trialPath = path || `/trials/${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  return (
    <Link
      to={trialPath}
      className="text-neuro-700 dark:text-neuro-300 hover:text-neuro-900 dark:hover:text-neuro-100 underline decoration-neuro-200 dark:decoration-neuro-700 decoration-1 underline-offset-2 hover:decoration-neuro-500 font-medium transition-colors"
    >
      {name}
    </Link>
  );
};
