// LAYOUT_SPEC §6.1
// 224px fixed left rail. Brand lockup top, 5 nav items, footer bottom.
// Active state: .rail-item-active (CSS class in index.css — cobalt-50 bg + 2px cobalt left edge).
// navHref preserves ?scenario= for scenario-aware routes and ?favs= for all hubs.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { CalcsIcon } from './icons/CalcsIcon';
import { PathwaysIcon } from './icons/PathwaysIcon';
import { GuideIcon } from './icons/GuideIcon';
import { TrialsIcon } from './icons/TrialsIcon';

// LAYOUT_SPEC §6.1.2 — same order as mobile bottom nav §2.2
const RAIL_ITEMS = [
  { label: 'Home',        path: '/',            Icon: Home,         isActive: (p: string) => p === '/' },
  { label: 'Trials',      path: '/trials',      Icon: TrialsIcon,   isActive: (p: string) => p.startsWith('/trials') },
  { label: 'Calculators', path: '/calculators', Icon: CalcsIcon,    isActive: (p: string) => p.startsWith('/calculators') },
  { label: 'Pathways',    path: '/pathways',    Icon: PathwaysIcon, isActive: (p: string) => p.startsWith('/pathways') },
  { label: 'Guide',       path: '/guide',       Icon: GuideIcon,    isActive: (p: string) => p.startsWith('/guide') },
] as const;

// Routes that share the ?scenario= vocabulary (HUB_SPEC §1.4.2)
const SCENARIO_ROUTES = new Set(['/', '/pathways']);

/**
 * Compute the href for a rail link, forwarding relevant URL params from
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

export const DesktopRail: React.FC = () => {
  const { pathname, search } = useLocation();

  return (
    <aside
      className="hidden md:flex w-[224px] flex-shrink-0 bg-white border-r border-slate-100 flex-col py-[18px] px-[14px] sticky top-0 h-screen"
    >
      {/* Brand lockup — LAYOUT_SPEC §6.1.1 */}
      <Link to="/" className="flex items-center gap-2.5 px-2 pb-5 mb-3 border-b border-slate-100">
        <div
          className="w-[30px] h-[30px] rounded-lg bg-neuro-500 flex items-center justify-center text-white font-semibold text-[15px]"
          style={{ fontFamily: 'serif', letterSpacing: '-0.04em' }}
        >
          N
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900">
          Neuro<span className="text-neuro-500">Wiki</span>
        </span>
      </Link>

      {/* Nav items — LAYOUT_SPEC §6.1.2 */}
      <nav role="navigation" aria-label="Main" className="flex flex-col gap-0.5">
        {RAIL_ITEMS.map(({ label, path, Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={path}
              to={navHref(path, search)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium hover:bg-slate-50 transition-colors ${active ? 'rail-item-active' : 'text-slate-700'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0 opacity-85" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer — LAYOUT_SPEC §6.1.4 — Phase 4D legal links */}
      <div className="border-t border-slate-100 pt-3.5 px-3 flex flex-col gap-1">
        <div className="flex gap-2.5 flex-wrap">
          <Link to="/privacy" className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Privacy</Link>
          <span className="text-[11px] text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
          <Link to="/terms" className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Terms</Link>
          <span className="text-[11px] text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
          <Link to="/accessibility" className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Accessibility</Link>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">© 2026 Tidbit Health</p>
      </div>
    </aside>
  );
};
