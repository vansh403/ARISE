import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SpotlightHero from './components/SpotlightHero';
import RankSystem from './components/RankSystem';
import QuestBoard from './components/QuestBoard';
import StatsPanel from './components/StatsPanel';
import Testimonials from './components/Testimonials';
import LandingFeatures from './components/LandingFeatures';
import Footer from './components/Footer';
import Awaken from './components/ui/awaken';
import Login from './components/ui/login';
import FitnessOnboarding from './components/onboarding/FitnessOnboarding';
import FitnessDashboard from './components/FitnessDashboard';
import OnboardingWizard from './components/OnboardingWizard';
import Dashboard from './components/Dashboard';
import { Toaster } from './components/ui/toaster';

function Landing() {
  useEffect(() => {
    document.title = 'ARISE // Ranked Gym Protocol';
  }, []);

  const currentUser = JSON.parse(window.localStorage.getItem('arise-current-user') || 'null');
  if (currentUser) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <SpotlightHero />
      <LandingFeatures />
      <Testimonials />
      <Footer />
      <Toaster />
    </div>
  );
}

function Signup() {
  useEffect(() => {
    document.title = 'Awaken // Create Hunter Profile';
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <div className="pt-16">
        <Awaken />
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route
            path="/login"
            element={(
              <div className="min-h-screen bg-black text-slate-100">
                <Navbar />
                <Login />
                <Toaster />
              </div>
            )}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fitness-onboarding" element={<FitnessOnboarding />} />
          <Route path="/fitness-dashboard" element={<FitnessDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;