import React from 'react';
import PartnersSection from '../components/PartnersSection';
import { useAppContext } from '../context/AppContext';

export default function PartnersPage() {
  const { user, showToast } = useAppContext();

  return (
    <PartnersSection user={user} showToast={showToast} />
  );
}
