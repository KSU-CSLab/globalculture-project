import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotAccountView } from '../components/AuthComponents';
import { useAppContext } from '../context/AppContext';

export default function ForgotPage() {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  return (
    <ForgotAccountView
      onNavigateToLogin={() => navigate('/auth/login')}
      showToast={showToast}
    />
  );
}
