import React from "react";
import { Routes, Route } from "react-router-dom";
import PhishNetAITool from "./components/PhishNetAITool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PhishNetAITool />} />
    </Routes>
  );
}

export default App;
