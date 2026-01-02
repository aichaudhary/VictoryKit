import React from "react";
import { Routes, Route } from "react-router-dom";
import EnhancedIntelliScoutTool from "./components/EnhancedIntelliScoutTool";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EnhancedIntelliScoutTool />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
      <Route path="/*" element={<EnhancedIntelliScoutTool />} />
    </Routes>
  );
}

export default App;
