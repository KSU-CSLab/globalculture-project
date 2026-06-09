import React from 'react';
import EventsSection from '../components/EventsSection';
import { useAppContext } from '../context/AppContext';

export default function EventsPage() {
  const { user, showToast } = useAppContext();

  return (
    <EventsSection user={user} showToast={showToast} />
  );
}
