
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { PublishGate } from './components/PublishGate';
import DisclaimerModal from './components/DisclaimerModal';
import { TrialModalProvider, useTrialModal } from './contexts/TrialModalContext';
import { GlobalTrialModal } from './components/GlobalTrialModal';

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
const ResidentGuide = lazy(() => import('./pages/ResidentGuide'));
const TrialsPage = lazy(() => import('./pages/TrialsPage'));
const TrialPageNew = lazy(() => import('./pages/trials/TrialPageNew'));
const GCAPathway = lazy(() => import('./pages/GCAPathway'));
const ElanPathway = lazy(() => import('./pages/ElanPathway'));
const EvtPathway = lazy(() => import('./pages/EvtPathway'));
const StatusEpilepticusPathway = lazy(() => import('./pages/StatusEpilepticusPathway'));
const MigrainePathway = lazy(() => import('./pages/MigrainePathway'));

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

const TrialModalWrapper: React.FC = () => {
  const { isOpen, trialSlug, closeTrial } = useTrialModal();
  
  if (!trialSlug) return null;
  
  return (
    <GlobalTrialModal 
      trialSlug={trialSlug} 
      isOpen={isOpen} 
      onClose={closeTrial} 
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <TrialModalProvider>
        <DisclaimerModal />
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
          <Route path="/" element={<Home />} />
          <Route path="/wiki/:topic" element={<Wiki />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/calculators/nihss" element={<PublishGate><NihssCalculator /></PublishGate>} />
          <Route path="/calculators/ich-score" element={<PublishGate><IchScoreCalculator /></PublishGate>} />
          <Route path="/calculators/abcd2-score" element={<PublishGate><Abcd2ScoreCalculator /></PublishGate>} />
          <Route path="/calculators/has-bled-score" element={<PublishGate><HasBledScoreCalculator /></PublishGate>} />
          <Route path="/calculators/rope-score" element={<PublishGate><RopeScoreCalculator /></PublishGate>} />
          <Route path="/calculators/glasgow-coma-scale" element={<PublishGate><GlasgowComaScaleCalculator /></PublishGate>} />
          <Route path="/calculators/heidelberg-bleeding-classification" element={<PublishGate><HeidelbergBleedingCalculator /></PublishGate>} />
          <Route path="/calculators/boston-criteria-caa" element={<PublishGate><BostonCriteriaCaaCalculator /></PublishGate>} />
          <Route path="/calculators/gca-pathway" element={<PublishGate><GCAPathway /></PublishGate>} />
          <Route path="/calculators/elan-pathway" element={<PublishGate><ElanPathway /></PublishGate>} />
          <Route path="/calculators/evt-pathway" element={<PublishGate><EvtPathway /></PublishGate>} />
          <Route path="/calculators/se-pathway" element={<PublishGate><StatusEpilepticusPathway /></PublishGate>} />
          <Route path="/calculators/migraine-pathway" element={<PublishGate><MigrainePathway /></PublishGate>} />
          <Route path="/guide" element={<ResidentGuide context="guide" />} />
          <Route path="/guide/stroke-basics" element={<PublishGate><StrokeBasics /></PublishGate>} />
          <Route path="/guide/stroke-basics-desktop" element={<StrokeBasicsDesktop />} />
          <Route path="/guide/stroke-basics-mobile" element={<StrokeBasicsMobile />} />
          <Route path="/guide/iv-tpa" element={<PublishGate><IvTpa /></PublishGate>} />
          <Route path="/guide/tpa-eligibility" element={<PublishGate><IvTpa /></PublishGate>} />
          <Route path="/guide/thrombectomy" element={<PublishGate><Thrombectomy /></PublishGate>} />
          <Route path="/guide/acute-stroke-mgmt" element={<PublishGate><AcuteStrokeMgmt /></PublishGate>} />
          <Route path="/guide/status-epilepticus" element={<PublishGate><StatusEpilepticus /></PublishGate>} />
          <Route path="/guide/ich-management" element={<PublishGate><IchManagement /></PublishGate>} />
          <Route path="/guide/meningitis" element={<PublishGate><Meningitis /></PublishGate>} />
          <Route path="/guide/gbs" element={<PublishGate><Gbs /></PublishGate>} />
          <Route path="/guide/myasthenia-gravis" element={<PublishGate><MyastheniaGravis /></PublishGate>} />
          <Route path="/guide/multiple-sclerosis" element={<PublishGate><MultipleSclerosis /></PublishGate>} />
          <Route path="/guide/seizure-workup" element={<PublishGate><SeizureWorkup /></PublishGate>} />
          <Route path="/guide/altered-mental-status" element={<PublishGate><AlteredMentalStatus /></PublishGate>} />
          <Route path="/guide/headache-workup" element={<PublishGate><HeadacheWorkup /></PublishGate>} />
          <Route path="/guide/vertigo" element={<PublishGate><Vertigo /></PublishGate>} />
          <Route path="/guide/weakness-workup" element={<PublishGate><WeaknessWorkup /></PublishGate>} />
          <Route path="/guide/:topicId" element={<PublishGate><ResidentGuide context="guide" /></PublishGate>} />
          <Route path="/trials" element={<TrialsPage />} />
          {/* Specific routes for trials using TrialPageNew - must come BEFORE catch-all */}
          {/* Thrombolysis Trials */}
          <Route path="/trials/ninds-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/ecass3-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/extend-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/eagle-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/wake-up" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/wake-up-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          {/* Thrombectomy Trials */}
          <Route path="/trials/distal-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/escape-mevo-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/defuse-3-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/dawn-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/select2-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/angel-aspect-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          {/* Basilar Artery Trials */}
          <Route path="/trials/attention-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/baoche-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          {/* Antiplatelet & Secondary Prevention Trials */}
          <Route path="/trials/chance-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/point-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/sammpris-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/weave-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/socrates-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/sps3-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/sparcl-trial" element={<PublishGate><TrialPageNew /></PublishGate>} />
          <Route path="/trials/elan-study" element={<PublishGate><TrialPageNew /></PublishGate>} />
          {/* Catch-all route for other trials - must come AFTER specific routes */}
          <Route path="/trials/:topicId" element={<PublishGate><ResidentGuide context="trials" /></PublishGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </Layout>
        <TrialModalWrapper />
      </TrialModalProvider>
    </Router>
  );
};

export default App;
