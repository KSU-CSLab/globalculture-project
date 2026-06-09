import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginView } from '../components/AuthComponents';
import { useAppContext } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLoginSuccess, showToast } = useAppContext();

  return (
    <LoginView
      onLoginSuccess={handleLoginSuccess}
      onNavigateToSignUp={() => navigate('/auth/signup')}
      onNavigateToForgot={() => navigate('/auth/forgot')}
      showToast={showToast}
    />
  );
}
