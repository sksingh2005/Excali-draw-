import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DrawingPage from './components/DrawingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/draw" element={<DrawingPage />} />
          <Route path="/draw/:roomId" element={<DrawingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;