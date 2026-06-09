import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPage from './pages/ForgotPage';
import CommunityPage from './pages/CommunityPage';
import EventsPage from './pages/EventsPage';
import BenefitsPage from './pages/BenefitsPage';
import PartnersPage from './pages/PartnersPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="forgot" element={<ForgotPage />} />
        </Route>

        {/* Redirect shortcuts */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/forgot" element={<Navigate to="/auth/forgot" replace />} />

        {/* Protected Dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/community" replace />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/partners" element={<PartnersPage />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/community" replace />} />
      </Routes>
    </AppProvider>
  );
}
