import React from "react";
import { Routes, Route } from "react-router-dom";
import DataGuardianTool from "./components/DataGuardianTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DataGuardianTool />} />
    </Routes>
  );
}

export default App;
