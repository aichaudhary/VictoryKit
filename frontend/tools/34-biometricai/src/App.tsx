/**
 * BiometricAI - AI-Powered Biometric Authentication
 * Tool 34 - Multi-Modal Biometric Security
 */

import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BiometricAI from './components/BiometricAI';
import NeuralLinkInterface from './components/NeuralLinkInterface';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<BiometricAI />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
