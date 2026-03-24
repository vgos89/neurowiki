import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublishGate } from './components/PublishGate';
import { TrialModalProvider, useTrialModal } from './contexts/TrialModalContext';
import Seo from './components/Seo';
import { STATIC_ROUTE_DEFINITIONS, type StaticRouteKey } from './config/routeManifest';

const DisclaimerModal = lazy(() => import('./components/DisclaimerModal'));
const GlobalTrialModal = lazy(() =>
  import('./components/GlobalTrialModal').then((m) => ({ default: m.GlobalTrialModal }))
);

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Wiki = lazy(() => import('./pages/Wiki'));
const Calculators = lazy(() => import('./pages/Calculators'));
const NihssCalculator = lazy(() => import('./pages/NihssCalculator'));
const IchScoreCalculator = lazy(() => import('./pages/IchScoreCalculator'));
const Abcd2ScoreCalculator = lazy(() => import('./pages/Abcd2ScoreCalculator'));
const HasBledScoreCalculator = lazy(() => import('./pages/HasBledScoreCalculator'));
const RopeScoreCalculator = lazy(() => import('./pages/RopeScoreCalculator'));
const GlasgowComaScaleCalculator = lazy(() => import('./pages/GlasgowComaScaleCalculator'));
const HeidelbergBleedingCalculator = lazy(() => import('./pages/HeidelbergBleedingCalculator'));
const BostonCriteriaCaaCalculator = lazy(() => import('./pages/BostonCriteriaCaaCalculator'));
const AspectScoreCalculator = lazy(() => import('./pages/AspectScoreCalculator'));
const ResidentGuide = lazy(() => import('./pages/ResidentGuide'));
const ResidentToolkit = lazy(() => import('./pages/ResidentToolkit'));
const TrialsPage = lazy(() => import('./pages/TrialsPage'));
const TrialPageNew = lazy(() => import('./pages/trials/TrialPageNew'));
const GCAPathway = lazy(() => import('./pages/GCAPathway'));
const ElanPathway = lazy(() => import('./pages/ElanPathway'));
const EvtPathway = lazy(() => import('./pages/EvtPathway'));
const StatusEpilepticusPathway = lazy(() => import('./pages/StatusEpilepticusPathway'));
const MigrainePathway = lazy(() => import('./pages/MigrainePathway'));
const ExtendedIVTPathway = lazy(() => import('./pages/ExtendedIVTPathway'));
const EmBillingCalculator = lazy(() => import('./pages/EmBillingCalculator'));
const StrokeGuidelineMindmap = lazy(() => import('./pages/guide/StrokeGuidelineMindmap'));

// Lazy load guide articles
const StrokeBasics = lazy(() => import('./pages/guide/StrokeBasics'));
const StrokeBasicsDesktop = lazy(() => import('./pages/guide/StrokeBasicsDesktop'));
const StrokeBasicsMobile = lazy(() => import('./pages/guide/StrokeBasicsMobile'));
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

const ROUTE_COMPONENTS: Record<StaticRouteKey, React.ReactNode> = {
  home: <Home />,
  calculators: <Calculators />,
  'aspect-score': <AspectScoreCalculator />,
  nihss: <NihssCalculator />,
  'ich-score': <IchScoreCalculator />,
  'abcd2-score': <Abcd2ScoreCalculator />,
  'has-bled-score': <HasBledScoreCalculator />,
  'rope-score': <RopeScoreCalculator />,
  'glasgow-coma-scale': <GlasgowComaScaleCalculator />,
  'heidelberg-bleeding-classification': <HeidelbergBleedingCalculator />,
  'boston-criteria-caa': <BostonCriteriaCaaCalculator />,
  'gca-pathway': <GCAPathway />,
  'elan-pathway': <ElanPathway />,
  'evt-pathway': <EvtPathway />,
  'late-window-ivt': <ExtendedIVTPathway />,
  'se-pathway': <StatusEpilepticusPathway />,
  'migraine-pathway': <MigrainePathway />,
  'stroke-code': <StrokeBasics />,
  'em-billing': <EmBillingCalculator />,
  'guide-hub': <ResidentToolkit />,
  'aha-2026-guideline': <StrokeGuidelineMindmap />,
  'stroke-basics': <StrokeBasics />,
  'stroke-basics-desktop': <StrokeBasicsDesktop />,
  'stroke-basics-mobile': <StrokeBasicsMobile />,
  'iv-tpa': <IvTpa />,
  'tpa-eligibility': <IvTpa />,
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
  'trials-hub': <TrialsPage />,
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
  return (
    <Router>
      <TrialModalProvider>
        <ErrorBoundary>
          <Seo />
          <Suspense fallback={null}>
            <DisclaimerModal />
          </Suspense>
          <Layout>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
          <Route path="/wiki/:topic" element={<Wiki />} />
          <Route path="/guide/:topicId" element={<PublishGate><ResidentGuide context="guide" /></PublishGate>} />
          <Route path="/trials/:topicId" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </Layout>
          <TrialModalWrapper />
        </ErrorBoundary>
      </TrialModalProvider>
    </Router>
  );
};

export default App;
