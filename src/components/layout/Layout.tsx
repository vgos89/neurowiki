// LAYOUT_SPEC v1.2 — top-level chrome shell
// Wraps every route. Mobile vs desktop chrome rendered via CSS (md: breakpoint).
// LAYOUT_SPEC §6.3 — composition structure.
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import PrivacyChoices from '../PrivacyChoices';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopRail } from './DesktopRail';
import { DesktopTopBar } from './DesktopTopBar';
import FeedbackButton from '../FeedbackButton';
import { SearchProvider } from '../search/SearchProvider';
import { STATIC_ROUTE_DEFINITIONS } from '../../config/routeManifest';

// Lazy-load the search overlay — heavy enough to keep out of the initial bundle.
const SearchOverlay = React.lazy(() => import('../search/SearchOverlay'));

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
    <SearchProvider>
      {/* Skip link — LAYOUT_SPEC §10 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-neuro-500 text-white px-3 py-1.5 rounded text-sm z-[100]"
      >
        Skip to main content
      </a>

      {/* LAYOUT_SPEC §6.3 — shell composition */}
      <div className="flex flex-col md:flex-row h-dvh overflow-hidden bg-white">
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

            {/* Global footer — carries the persistent Privacy choices opt-out
                (required on every page for default-on analytics regions). */}
            <footer className="border-t border-slate-100 mt-8 px-4 py-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <PrivacyChoices />
              <Link to="/privacy" className="hover:text-neuro-600 underline underline-offset-2 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-neuro-600 underline underline-offset-2 transition-colors">Terms</Link>
            </footer>
          </main>

          {/* Mobile bottom nav — LAYOUT_SPEC §2 (md:hidden) */}
          <MobileBottomNav />
        </div>
      </div>

      {/* Floating feedback button — global, bottom-right.
          Lifts above MobileBottomNav (60px) and BottomLineDrawer (per FeedbackButton.tsx
          and BottomLineDrawer.tsx — they publish drawer floor height for this button). */}
      <FeedbackButton />

      {/* Smart search overlay — lazy, opens via ⌘K / "/" / search button click. */}
      <React.Suspense fallback={null}>
        <SearchOverlay />
      </React.Suspense>
    </SearchProvider>
  );
};

export default Layout;
