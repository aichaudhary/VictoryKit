import React from "react";
import { Routes, Route } from "react-router-dom";
import EncryptionManagerTool from './components/EncryptionManagerTool';
import NeuralLinkInterface from "./components/NeuralLinkInterface";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<EncryptionManagerTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}
