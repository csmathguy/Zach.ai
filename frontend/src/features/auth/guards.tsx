import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { AccessDeniedPage } from '@/features/auth/pages/AccessDeniedPage';

export const RequireAuth = ({ children }: PropsWithChildren): JSX.Element => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
};

export const RequireAdmin = ({ children }: PropsWithChildren): JSX.Element => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};
