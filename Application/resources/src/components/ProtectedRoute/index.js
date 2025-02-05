import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthProvider';

const ProtectedRoute = ({ children, allowedRoles, allowPending = false, requireApproved = false }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.reg_status === 'REJECTED') {
    return <Navigate to="/rejected" replace />;
  }

  if (user.reg_status === 'PENDING' && !allowPending) {
    return <Navigate to="/home" replace />;
  }

  if (requireApproved && user.reg_status !== 'APPROVED') {
    return <Navigate to="/home" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
