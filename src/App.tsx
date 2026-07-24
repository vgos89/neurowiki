import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublishGate } from './components/PublishGate';
import { TrialModalProvider, useTrialModal } from './contexts/TrialModalContext';
import Seo from './components/Seo';
import { STATIC_ROUTE_DEFINITIONS, type StaticRouteKey } from './config/routeManifest';
import { CONSENT_STORAGE_KEY, loadGA, reportAiTrafficToGA } from './utils/analytics';
import { getStorageItem } from './utils/storage';
import { analyticsEnabled } from './lib/consent';
import { useConsentRegion } from './hooks/useConsentRegion';

const FirstRunConsentBar = lazy(() => import('./components/FirstRunConsentBar'));
const InstallBubble = lazy(() => import('./components/InstallBubble'));
const InstallPromptOverlay = lazy(() => import('./components/InstallPromptOverlay'));
const OnboardingTour = lazy(() => import('./components/OnboardingTour'));
const GlobalTrialModal = lazy(() =>
  import('./components/GlobalTrialModal').then((m) => ({ default: m.GlobalTrialModal }))
);

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Wiki = lazy(() => import('./pages/Wiki'));
const Calculators = lazy(() => import('./pages/Calculators'));
const Pathways = lazy(() => import('./pages/Pathways'));
const NihssCalculator = lazy(() => import('./pages/NihssCalculator'));
const MrsCalculator = lazy(() => import('./pages/MrsCalculator'));
const MyCases = lazy(() => import('./pages/MyCases'));
const ImportCases = lazy(() => import('./pages/ImportCases'));
const MyFavorites = lazy(() => import('./pages/MyFavorites'));
const IchScoreCalculator = lazy(() => import('./pages/IchScoreCalculator'));
const Abcd2ScoreCalculator = lazy(() => import('./pages/Abcd2ScoreCalculator'));
const HasBledScoreCalculator = lazy(() => import('./pages/HasBledScoreCalculator'));
const RopeScoreCalculator = lazy(() => import('./pages/RopeScoreCalculator'));
const Cha2ds2VascCalculator = lazy(() => import('./pages/Cha2ds2VascCalculator'));
const GlasgowComaScaleCalculator = lazy(() => import('./pages/GlasgowComaScaleCalculator'));
const HeidelbergBleedingCalculator = lazy(() => import('./pages/HeidelbergBleedingCalculator'));
const BostonCriteriaCaaCalculator = lazy(() => import('./pages/BostonCriteriaCaaCalculator'));
const AspectScoreCalculator = lazy(() => import('./pages/AspectScoreCalculator'));
const AscvdRiskCalculator = lazy(() => import('./pages/AscvdRiskCalculator'));
const ResidentGuide = lazy(() => import('./pages/ResidentGuide'));
const Guide = lazy(() => import('./pages/Guide'));
const TrialsPage = lazy(() => import('./pages/TrialsPage'));
const TrialPageNew = lazy(() => import('./pages/trials/TrialPageNew'));
const ComingSoon = lazy(() => import('./components/ComingSoon').then((m) => ({ default: m.ComingSoon })));
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage'));
// GCA pathway retired 2026-05-15 (scoring tool was not validated; see
// commit-log + docs/audits/2026-05-15/missing-trials-catalog.md context).
const ElanPathway = lazy(() => import('./pages/ElanPathway'));
const EvtPathway = lazy(() => import('./pages/EvtPathway'));
const StatusEpilepticusPathway = lazy(() => import('./pages/StatusEpilepticusPathway'));
const MigrainePathway = lazy(() => import('./pages/MigrainePathway'));
const ClinicHeadachePathway = lazy(() => import('./pages/ClinicHeadachePathwayV4'));
const ExtendedIVTPathway = lazy(() => import('./pages/ExtendedIVTPathway'));
const EmBillingCalculator = lazy(() => import('./pages/EmBillingCalculator'));
const StrokeGuidelineMindmap = lazy(() => import('./pages/guide/StrokeGuidelineMindmap'));
const PostStrokeLipidManagement = lazy(() => import('./pages/guide/PostStrokeLipidManagement'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));

// Dev-only pages — not included in production bundle
const RCTChainTest = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/RCTChainTest'))
  : null;

// Lazy load guide articles
const StrokeBasics = lazy(() => import('./pages/guide/StrokeBasics'));
const IvTpa = lazy(() => import('./pages/guide/IvTpa'));
const Thrombectomy = lazy(() => import('./pages/guide/Thrombectomy'));
const AcuteStrokeMgmt = lazy(() => import('./pages/guide/AcuteStrokeMgmt'));
const StatusEpilepticus = lazy(() => import('./pages/guide/StatusEpilepticus'));
const IchManagement = lazy(() => import('./pages/guide/IchManagement'));
const Meningitis = lazy(() => import('./pages/guide/Meningitis'));
const Gbs = lazy(() => import('./pages/guide/Gbs'));
const MyastheniaGravis = lazy(() => import('./pages/guide/MyastheniaGravis'));
const MultipleSclerosis = lazy(() => import('./pages/guide/MultipleSclerosis'));
const SeizureWorkup = lazy(() => import('./pages/guide/SeizureWorkup'));
const AlteredMentalStatus = lazy(() => import('./pages/guide/AlteredMentalStatus'));
const HeadacheWorkup = lazy(() => import('./pages/guide/HeadacheWorkup'));
const Vertigo = lazy(() => import('./pages/guide/Vertigo'));
const WeaknessWorkup = lazy(() => import('./pages/guide/WeaknessWorkup'));
const ReadTheScanHub = lazy(() => import('./pages/guide/ReadTheScanHub'));
const ReadCtHead = lazy(() => import('./pages/guide/ReadCtHead'));

const ROUTE_COMPONENTS: Record<StaticRouteKey, React.ReactNode> = {
  home: <Home />,
  calculators: <Calculators />,
  'aspect-score': <AspectScoreCalculator />,
  'ascvd-risk': <AscvdRiskCalculator />,
  nihss: <NihssCalculator />,
  mrs: <MrsCalculator />,
  'ich-score': <IchScoreCalculator />,
  'abcd2-score': <Abcd2ScoreCalculator />,
  'has-bled-score': <HasBledScoreCalculator />,
  'rope-score': <RopeScoreCalculator />,
  'chads-vasc': <Cha2ds2VascCalculator />,
  'glasgow-coma-scale': <GlasgowComaScaleCalculator />,
  'heidelberg-bleeding-classification': <HeidelbergBleedingCalculator />,
  'boston-criteria-caa': <BostonCriteriaCaaCalculator />,
  'em-billing': <EmBillingCalculator />,
  'pathways-hub': <Pathways />,
  'pathways-elan': <ElanPathway />,
  'pathways-evt': <EvtPathway />,
  'pathways-late-ivt': <ExtendedIVTPathway />,
  'pathways-se': <StatusEpilepticusPathway />,
  'pathways-migraine': <MigrainePathway />,
  'pathways-headache-clinic': <ClinicHeadachePathway />,
  'pathways-stroke-code': <StrokeBasics />,
  'guide-hub': <Guide />,
  'aha-2026-guideline': <StrokeGuidelineMindmap />,
  'stroke-basics': <StrokeBasics />,
  'iv-tpa': <IvTpa />,
  thrombectomy: <Thrombectomy />,
  'acute-stroke-mgmt': <AcuteStrokeMgmt />,
  'status-epilepticus': <StatusEpilepticus />,
  'ich-management': <IchManagement />,
  meningitis: <Meningitis />,
  gbs: <Gbs />,
  'myasthenia-gravis': <MyastheniaGravis />,
  'multiple-sclerosis': <MultipleSclerosis />,
  'seizure-workup': <SeizureWorkup />,
  'altered-mental-status': <AlteredMentalStatus />,
  'headache-workup': <HeadacheWorkup />,
  vertigo: <Vertigo />,
  'weakness-workup': <WeaknessWorkup />,
  'post-stroke-lipid': <PostStrokeLipidManagement />,
  'imaging-hub': <ReadTheScanHub />,
  'imaging-ct-head': <ReadCtHead />,
  'trials-hub': <TrialsPage />,
  // Legal / compliance pages — Phase 4D
  privacy: <PrivacyPage />,
  terms: <TermsPage />,
  accessibility: <AccessibilityPage />,

  // On-device case memory (Flavor 1) — added 2026-05-19
  'my-cases': <MyCases />,
  'import-cases': <ImportCases />,

  // My Favorites — added 2026-05-24 per V feature request. Aggregates
  // starred calculators / pathways / trials into one quick-access view.
  'my-favorites': <MyFavorites />,
};

const TrialModalWrapper: React.FC = () => {
  const { isOpen, trialSlug, closeTrial } = useTrialModal();

  if (!trialSlug) return null;

  return (
    <Suspense fallback={null}>
      <GlobalTrialModal
        trialSlug={trialSlug}
        isOpen={isOpen}
        onClose={closeTrial}
      />
    </Suspense>
  );
};

const App: React.FC = () => {
  const { region, resolved } = useConsentRegion();

  // Load GA when analytics is effectively enabled for this visitor: explicit
  // 'accepted' anywhere, or no choice yet in a default-on region. Strict and
  // unknown regions wait for an explicit opt-in via the consent bar.
  useEffect(() => {
    if (!resolved) return;
    const consent = getStorageItem(CONSENT_STORAGE_KEY);
    if (analyticsEnabled(consent, region)) {
      loadGA();
      reportAiTrafficToGA();
    }
  }, [region, resolved]);

  return (
    <Router>
      <TrialModalProvider>
        <ErrorBoundary>
          <Seo />
          <Suspense fallback={null}>
            <OnboardingTour />
          </Suspense>
          <Suspense fallback={null}>
            <InstallPromptOverlay />
          </Suspense>
          <Suspense fallback={null}>
            <InstallBubble />
          </Suspense>
          <Layout>
            <Suspense fallback={
              <div className="min-h-dvh flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neuro-500"></div>
                  <p className="mt-4 text-slate-600">Loading...</p>
                </div>
              </div>
            }>
            <Routes>
          {STATIC_ROUTE_DEFINITIONS.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.publishGate ? <PublishGate>{ROUTE_COMPONENTS[route.key]}</PublishGate> : ROUTE_COMPONENTS[route.key]}
            />
          ))}
          {/* Client-side fallback redirects for pathway routes moved to /pathways/* — Part 3 */}
          <Route path="/calculators/stroke-code" element={<Navigate to="/pathways/stroke-code" replace />} />
          <Route path="/calculators/evt-pathway" element={<Navigate to="/pathways/evt" replace />} />
          <Route path="/calculators/evt" element={<Navigate to="/pathways/evt" replace />} />
          <Route path="/pathways/evt-pathway" element={<Navigate to="/pathways/evt" replace />} />
          <Route path="/calculators/late-window-ivt" element={<Navigate to="/pathways/late-window-ivt" replace />} />
          <Route path="/calculators/elan-pathway" element={<Navigate to="/pathways/elan-pathway" replace />} />
          <Route path="/calculators/se-pathway" element={<Navigate to="/pathways/se-pathway" replace />} />
          <Route path="/calculators/migraine-pathway" element={<Navigate to="/pathways/migraine-pathway" replace />} />
          {/* GCA pathway retired 2026-05-15. Legacy URL redirects to pathways hub. */}
          <Route path="/calculators/gca-pathway" element={<Navigate to="/pathways" replace />} />
          <Route path="/pathways/gca-pathway" element={<Navigate to="/pathways" replace />} />
          <Route path="/wiki/:topic" element={<Wiki />} />
          <Route path="/guide/:topicId" element={<PublishGate><ResidentGuide context="guide" /></PublishGate>} />
          <Route path="/trials/q/:questionId" element={<QuestionDetailPage />} />
          <Route path="/trials/:topicId" element={<PublishGate><TrialPageNew /></PublishGate>} />
          {import.meta.env.DEV && RCTChainTest && (
            <Route path="/dev/rct-chain-test" element={<RCTChainTest />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </Layout>
          <TrialModalWrapper />
          <Suspense fallback={null}>
            <FirstRunConsentBar />
          </Suspense>
        </ErrorBoundary>
      </TrialModalProvider>
    </Router>
  );
};

export default App;
