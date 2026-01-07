import AccessControlTool from './components/AccessControlTool';
import NeuralLinkInterface from './components/NeuralLinkInterface';
import { useState } from 'react';

export default function App() {
  const [showNeuralLink, setShowNeuralLink] = useState(false);

  if (showNeuralLink) {
    return <NeuralLinkInterface onClose={() => setShowNeuralLink(false)} />;
  }

  return <AccessControlTool onShowNeuralLink={() => setShowNeuralLink(true)} />;
}
