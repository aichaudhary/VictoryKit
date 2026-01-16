import React from "react";
import { Routes, Route } from "react-router-dom";
import RuntimeGuardTool from "./components/RuntimeGuardTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RuntimeGuardTool />} />
    </Routes>
  );
}

export default App;
