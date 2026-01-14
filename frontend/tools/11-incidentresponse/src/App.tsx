import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import incidentcommandTool from './components/incidentcommandTool';

function App() {
  return (
    <Routes>
      <Route path="/" element={<incidentcommandTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
