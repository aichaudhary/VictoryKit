import React from "react";
import { Routes, Route } from "react-router-dom";
import EnhancedIntelliScoutTool from "./components/EnhancedIntelliScoutTool";
import IntelliScoutTool from "./components/IntelliScoutTool";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EnhancedIntelliScoutTool />} />
      <Route path="/classic" element={<IntelliScoutTool />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
