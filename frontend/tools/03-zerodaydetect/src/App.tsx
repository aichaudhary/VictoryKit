import React from "react";
import { Routes, Route } from "react-router-dom";
import ZeroDayDetectTool from "./components/ZeroDayDetectTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ZeroDayDetectTool />} />
    </Routes>
  );
}

export default App;
