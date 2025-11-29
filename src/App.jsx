import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginModal from './components/LoginModal';
import LiveOps from './pages/LiveOps';
import Predictions from './pages/Predictions';
import PatientPortal from './pages/PatientPortal';
import WeatherPredictionDashboard from './components/WeatherPredictionDashboard';
import LocationTest from './pages/LocationTest';

// Wrapper to handle global UI elements like the Login Modal
const AppContent = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      <Routes>
        <Route path="/" element={<LandingPage onOpenLogin={() => setIsLoginOpen(true)} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live-ops" element={<LiveOps />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/weather" element={<WeatherPredictionDashboard />} />
        <Route path="/location-test" element={<LocationTest />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;