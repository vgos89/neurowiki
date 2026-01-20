
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Wiki from '../pages/Wiki';
import Calculators from '../pages/Calculators';
import ResidentGuide from '../pages/ResidentGuide';
import TrialsPage from '../pages/TrialsPage';
import GCAPathway from '../pages/GCAPathway';
import ElanPathway from '../pages/ElanPathway';
import EvtPathway from '../pages/EvtPathway';
import StatusEpilepticusPathway from '../pages/StatusEpilepticusPathway';
import MigrainePathway from '../pages/MigrainePathway';
import AspectsCalculator from '../pages/AspectsCalculator';
import DisclaimerModal from '../components/DisclaimerModal';

const App: React.FC = () => {
  return (
    <Router>
      <DisclaimerModal />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wiki/:topic" element={<Wiki />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/calculators/gca-pathway" element={<GCAPathway />} />
          <Route path="/calculators/elan-pathway" element={<ElanPathway />} />
          <Route path="/calculators/evt-pathway" element={<EvtPathway />} />
          <Route path="/calculators/se-pathway" element={<StatusEpilepticusPathway />} />
          <Route path="/calculators/migraine-pathway" element={<MigrainePathway />} />
          <Route path="/calculators/aspects" element={<AspectsCalculator />} />
          <Route path="/guide" element={<ResidentGuide context="guide" />} />
          <Route path="/guide/:topicId" element={<ResidentGuide context="guide" />} />
          <Route path="/trials" element={<TrialsPage />} />
          <Route path="/trials/:topicId" element={<ResidentGuide context="trials" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
