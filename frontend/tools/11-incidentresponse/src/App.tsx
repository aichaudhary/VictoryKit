import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IncidentResponseTool from './components/IncidentResponseTool';

function App() {
  return (
    <Routes>
      <Route path="/" element={<IncidentResponseTool />} />
    </Routes>
  );
}

export default App;
