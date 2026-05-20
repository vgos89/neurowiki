// LAYOUT_SPEC §6.1
// 224px fixed left rail. Brand lockup top, 5 nav items, footer bottom.
// Active state: .rail-item-active (CSS class in index.css — cobalt-50 bg + 2px cobalt left edge).
// navHref preserves ?scenario= for scenario-aware routes and ?favs= for all hubs.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Download } from 'lucide-react';
import { CalcsIcon } from './icons/CalcsIcon';
import { PathwaysIcon } from './icons/PathwaysIcon';
import { GuideIcon } from './icons/GuideIcon';
import { TrialsIcon } from './icons/TrialsIcon';
import { isSupabaseConfigured } from '../../lib/supabase';

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
      <Link to="/" className="flex items-center gap-2.5 px-2 pb-5 mb-3 border-b border-slate-100" aria-label="NeuroWiki home">
        <img
          src="/icon-192.png"
          alt=""
          width={30}
          height={30}
          className="w-[30px] h-[30px] rounded-lg flex-shrink-0"
        />
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

      {/* Receive-from-phone entry — only when Supabase relay is configured.
          Placed above the legal footer so a desktop user who just generated
          a transfer code on their phone has a one-click path to /import.
          V audit 2026-05-19. */}
      {isSupabaseConfigured() && (
        <Link
          to="/import"
          className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-[12px] font-medium text-neuro-700 bg-neuro-50/60 hover:bg-neuro-50 border border-neuro-100 transition-colors"
        >
          <Download className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span>Receive case from phone</span>
        </Link>
      )}

      {/* Footer — single-line legal strip + copyright. V audit 2026-05-19. */}
      <div className="border-t border-slate-100 pt-3 px-3">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap">
          <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
          <span aria-hidden="true">·</span>
          <Link to="/accessibility" className="hover:text-slate-700 transition-colors">Accessibility</Link>
          <span aria-hidden="true">·</span>
          <span>© 2026</span>
        </div>
      </div>
    </aside>
  );
};
