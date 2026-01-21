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
      className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
    >
      {name}
    </Link>
  );
};
