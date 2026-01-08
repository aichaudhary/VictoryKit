import React from "react";
import { Routes, Route } from "react-router-dom";
import IncidentResponseTool from "./components/IncidentResponseTool";
import NeuralLinkInterface from "./components/NeuralLinkInterface";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<IncidentResponseTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
