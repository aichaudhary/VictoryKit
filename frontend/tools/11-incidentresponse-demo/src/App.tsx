import { Routes, Route } from 'react-router-dom';
import { DemoPage } from './pages/DemoPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DemoPage />} />
      <Route path="/*" element={<DemoPage />} />
    </Routes>
  );
}

export default App;
