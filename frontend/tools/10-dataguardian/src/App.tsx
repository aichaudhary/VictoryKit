import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DataGuardianTool from "./components/DataGuardianTool";
import NeuralLinkInterface from "../../../neural-link-interface/App";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/maula" replace />} />
      <Route path="/maula" element={<DataGuardianTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
      <Route path="/*" element={<Navigate to="/maula" replace />} />
    </Routes>
  );
}

export default App;
