// LAYOUT_SPEC v1.2 — top-level chrome shell
// Wraps every route. Mobile vs desktop chrome rendered via CSS (md: breakpoint).
// LAYOUT_SPEC §6.3 — composition structure.
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopRail } from './DesktopRail';
import { DesktopTopBar } from './DesktopTopBar';
import { STATIC_ROUTE_DEFINITIONS } from '../../config/routeManifest';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  // LAYOUT_SPEC §8 — one-shot localStorage cleanup of vestigial sidebar-tools key
  useEffect(() => {
    try {
      localStorage.removeItem('neurowiki-sidebar-tools');
    } catch {
      // localStorage throws in some private browsing modes — safe to ignore
    }
  }, []);

  // Determine width zone from route manifest — LAYOUT_SPEC §7
  const routeDef = STATIC_ROUTE_DEFINITIONS.find((r) => r.path === pathname);
  const zone = routeDef?.zone ?? 'none';
  const zoneClass =
    zone === 'reading'   ? 'zone-reading'   :
    zone === 'reference' ? 'zone-reference' : '';

  return (
    <>
      {/* Skip link — LAYOUT_SPEC §10 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-neuro-500 text-white px-3 py-1.5 rounded text-sm z-[100]"
      >
        Skip to main content
      </a>

      {/* LAYOUT_SPEC §6.3 — shell composition */}
      <div className="md:flex h-screen overflow-hidden bg-white dark:bg-slate-900">
        {/* Desktop left rail — LAYOUT_SPEC §6.1 (hidden below md:) */}
        <DesktopRail />

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile header — LAYOUT_SPEC §1 (md:hidden) */}
          <MobileHeader />
          {/* Desktop top bar — LAYOUT_SPEC §6.2 (hidden md:flex) */}
          <DesktopTopBar />

          {/* Scrollable main — LAYOUT_SPEC §6.3 */}
          <main
            id="main"
            className="flex-1 overflow-y-auto pb-[60px] md:pb-0"
          >
            {/* Width zone wrapper — LAYOUT_SPEC §7. Zone class is opt-in, applied here. */}
            <div className={zoneClass || undefined}>
              {children}
            </div>
          </main>

          {/* Mobile bottom nav — LAYOUT_SPEC §2 (md:hidden) */}
          <MobileBottomNav />
        </div>
      </div>
    </>
  );
};

export default Layout;
