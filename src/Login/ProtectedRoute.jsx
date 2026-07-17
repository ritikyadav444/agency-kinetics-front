import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ isAdmin }) => {
  const isAuthenticated = useSelector((state) => state.logMember.isAuthenticated);
  const combined = useSelector((state) => state.logMember.combined);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin && combined?.user?.role !== 'SUPERADMIN' && combined?.user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
