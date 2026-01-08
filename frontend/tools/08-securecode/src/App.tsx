import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SecureCodeTool from "./components/SecureCodeTool";
import NeuralLinkInterface from "../../../neural-link-interface/App";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/maula" replace />} />
      <Route path="/maula" element={<SecureCodeTool />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
      <Route path="/*" element={<Navigate to="/maula" replace />} />
    </Routes>
  );
};

export default App;
