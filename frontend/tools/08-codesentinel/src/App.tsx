import React from "react";
import { Routes, Route } from "react-router-dom";
import CodeSentinelTool from "./components/CodeSentinelTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CodeSentinelTool />} />
    </Routes>
  );
}

export default App;
