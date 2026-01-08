import React from "react";
import { Routes, Route } from "react-router-dom";
import AccessControlTool from './components/AccessControlTool';
import NeuralLinkInterface from './components/NeuralLinkInterface';
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<AccessControlTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}
