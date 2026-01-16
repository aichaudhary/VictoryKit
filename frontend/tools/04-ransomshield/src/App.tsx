import React from "react";
import { Routes, Route } from "react-router-dom";
import RansomShieldTool from "./components/RansomShieldTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RansomShieldTool />} />
    </Routes>
  );
}

export default App;
