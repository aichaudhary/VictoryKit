import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ComplianceCheckTool from "./components/ComplianceCheckTool";
import NeuralLinkInterface from "../../../neural-link-interface/App";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/maula" replace />} />
      <Route path="/maula" element={<ComplianceCheckTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
      <Route path="/*" element={<Navigate to="/maula" replace />} />
    </Routes>
  );
};

export default App;
