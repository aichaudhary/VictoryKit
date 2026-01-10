import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EmailDefenderTool from "./components/EmailDefenderTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EmailDefenderTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
