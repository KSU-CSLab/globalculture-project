import React from 'react';
import BenefitsSection from '../components/BenefitsSection';
import { useAppContext } from '../context/AppContext';

export default function BenefitsPage() {
  const { user, showToast } = useAppContext();

  return (
    <BenefitsSection user={user} showToast={showToast} />
  );
}
