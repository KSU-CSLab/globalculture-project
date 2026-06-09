import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpView } from '../components/AuthComponents';
import { useAppContext } from '../context/AppContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  return (
    <SignUpView
      onNavigateToLogin={() => navigate('/auth/login')}
      showToast={showToast}
    />
  );
}
