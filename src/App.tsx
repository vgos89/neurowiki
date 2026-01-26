
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Layout from '../components/Layout';
import { PublishGate } from './components/PublishGate';
import Home from '../pages/Home';
import Wiki from '../pages/Wiki';
import Calculators from '../pages/Calculators';
import NihssCalculator from '../pages/NihssCalculator';
import ResidentGuide from '../pages/ResidentGuide';
import StrokeBasics from './pages/guide/StrokeBasics';
import IvTpa from './pages/guide/IvTpa';
import Thrombectomy from './pages/guide/Thrombectomy';
import AcuteStrokeMgmt from './pages/guide/AcuteStrokeMgmt';
import StatusEpilepticus from './pages/guide/StatusEpilepticus';
import IchManagement from './pages/guide/IchManagement';
import Meningitis from './pages/guide/Meningitis';
import Gbs from './pages/guide/Gbs';
import MyastheniaGravis from './pages/guide/MyastheniaGravis';
import MultipleSclerosis from './pages/guide/MultipleSclerosis';
import SeizureWorkup from './pages/guide/SeizureWorkup';
import AlteredMentalStatus from './pages/guide/AlteredMentalStatus';
import HeadacheWorkup from './pages/guide/HeadacheWorkup';
import Vertigo from './pages/guide/Vertigo';
import WeaknessWorkup from './pages/guide/WeaknessWorkup';
import TrialsPage from '../pages/TrialsPage';
import GCAPathway from '../pages/GCAPathway';
import ElanPathway from '../pages/ElanPathway';
import EvtPathway from '../pages/EvtPathway';
import StatusEpilepticusPathway from '../pages/StatusEpilepticusPathway';
import MigrainePathway from '../pages/MigrainePathway';
import DisclaimerModal from './components/DisclaimerModal';

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <Router>
        <DisclaimerModal />
        <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wiki/:topic" element={<Wiki />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/calculators/nihss" element={<PublishGate><NihssCalculator /></PublishGate>} />
          <Route path="/calculators/gca-pathway" element={<PublishGate><GCAPathway /></PublishGate>} />
          <Route path="/calculators/elan-pathway" element={<PublishGate><ElanPathway /></PublishGate>} />
          <Route path="/calculators/evt-pathway" element={<PublishGate><EvtPathway /></PublishGate>} />
          <Route path="/calculators/se-pathway" element={<PublishGate><StatusEpilepticusPathway /></PublishGate>} />
          <Route path="/calculators/migraine-pathway" element={<PublishGate><MigrainePathway /></PublishGate>} />
          <Route path="/guide" element={<ResidentGuide context="guide" />} />
          <Route path="/guide/stroke-basics" element={<PublishGate><StrokeBasics /></PublishGate>} />
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
          <Route path="/trials/:topicId" element={<PublishGate><ResidentGuide context="trials" /></PublishGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Layout>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
