// LAYOUT_SPEC §2
// 5 tabs, fixed bottom, 60px height + safe-area-inset-bottom.
// Tab order locked per §2.2: Home → Trials → Calcs → Pathways → Guide.
// Active tab = text-neuro-500 + aria-current="page". Inactive = text-slate-400.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { CalcsIcon } from './icons/CalcsIcon';
import { PathwaysIcon } from './icons/PathwaysIcon';
import { GuideIcon } from './icons/GuideIcon';
import { TrialsIcon } from './icons/TrialsIcon';

// LAYOUT_SPEC §2.4 — active tab matching rules
const NAV_TABS = [
  { label: 'Home',     path: '/',            Icon: Home,         isActive: (p: string) => p === '/' },
  { label: 'Trials',   path: '/trials',      Icon: TrialsIcon,   isActive: (p: string) => p.startsWith('/trials') },
  { label: 'Calcs',    path: '/calculators', Icon: CalcsIcon,    isActive: (p: string) => p.startsWith('/calculators') },
  { label: 'Pathways', path: '/pathways',    Icon: PathwaysIcon, isActive: (p: string) => p.startsWith('/pathways') },
  { label: 'Guide',    path: '/guide',       Icon: GuideIcon,    isActive: (p: string) => p.startsWith('/guide') },
] as const;

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden h-[60px] bg-white border-t border-slate-100 flex fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Main"
    >
      {NAV_TABS.map(({ label, path, Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${active ? 'text-neuro-500' : 'text-slate-400'}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
