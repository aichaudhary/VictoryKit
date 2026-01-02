import React from "react";
import { Routes, Route } from "react-router-dom";
import DLPTool from "./components/DLPTool";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DLPTool />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
