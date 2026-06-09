import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function ProtectedRoute() {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
