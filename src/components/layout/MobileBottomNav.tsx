// LAYOUT_SPEC §2
// 5 tabs, fixed bottom, 60px height + safe-area-inset-bottom.
// Tab order locked per §2.2: Home → Trials → Calcs → Pathways → Guide.
// Active tab = text-neuro-500 + aria-current="page". Inactive = text-slate-400.
// navHref preserves ?scenario= for scenario-aware routes and ?favs= for all hubs.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase } from 'lucide-react';
import { CalcsIcon } from './icons/CalcsIcon';
import { PathwaysIcon } from './icons/PathwaysIcon';
import { GuideIcon } from './icons/GuideIcon';
import { TrialsIcon } from './icons/TrialsIcon';

// LAYOUT_SPEC §2.4 — active tab matching rules.
// 2026-05-19: added Cases tab (6th) per V audit — phone users need direct
// access to /my-cases without going through a stack of menus.
const NAV_TABS = [
  { label: 'Home',     path: '/',            Icon: Home,         isActive: (p: string) => p === '/' },
  { label: 'Trials',   path: '/trials',      Icon: TrialsIcon,   isActive: (p: string) => p.startsWith('/trials') },
  { label: 'Calcs',    path: '/calculators', Icon: CalcsIcon,    isActive: (p: string) => p.startsWith('/calculators') },
  { label: 'Pathways', path: '/pathways',    Icon: PathwaysIcon, isActive: (p: string) => p.startsWith('/pathways') },
  { label: 'Guide',    path: '/guide',       Icon: GuideIcon,    isActive: (p: string) => p.startsWith('/guide') },
  { label: 'Cases',    path: '/my-cases',    Icon: Briefcase,    isActive: (p: string) => p.startsWith('/my-cases') },
] as const;

// Routes that share the ?scenario= vocabulary (HUB_SPEC §1.4.2)
const SCENARIO_ROUTES = new Set(['/', '/pathways']);

/**
 * Compute the href for a nav link, forwarding relevant URL params from
 * the current location so the user doesn't lose their active filter when
 * switching between top-level hubs.
 *
 * Forwarding rules:
 *  - ?scenario=  preserved only for SCENARIO_ROUTES (Home + Pathways)
 *  - ?favs=true  preserved for all hubs
 *  - All other params are dropped (they're page-local)
 */
function navHref(targetPath: string, currentSearch: string): string {
  const params = new URLSearchParams(currentSearch);
  const out = new URLSearchParams();

  if (SCENARIO_ROUTES.has(targetPath) && params.has('scenario')) {
    out.set('scenario', params.get('scenario')!);
  }
  if (params.get('favs') === 'true') {
    out.set('favs', 'true');
  }

  const qs = out.toString();
  return qs ? `${targetPath}?${qs}` : targetPath;
}

export const MobileBottomNav: React.FC = () => {
  const { pathname, search } = useLocation();

  return (
    <nav
      className="md:hidden bg-white border-t border-slate-100 flex fixed bottom-0 left-0 right-0 z-40"
      style={{
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="navigation"
      aria-label="Main"
    >
      {NAV_TABS.map(({ label, path, Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={path}
            to={navHref(path, search)}
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
