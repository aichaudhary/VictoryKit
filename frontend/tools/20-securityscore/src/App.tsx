import React from "react";
import { Routes, Route } from "react-router-dom";
import SecurityScoreTool from './components/SecurityScoreTool';
import NeuralLinkInterface from "./components/NeuralLinkInterface";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<SecurityScoreTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
