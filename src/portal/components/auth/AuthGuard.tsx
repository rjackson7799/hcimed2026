import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/portal/context/AuthContext';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';

export function AuthGuard() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isBrokerPath = location.pathname.startsWith('/portal/broker');
    const loginPath = (role === 'broker' || isBrokerPath) ? '/partner-login' : '/hci-login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return (
    <>
      <SessionTimeoutWarning />
      <Outlet />
    </>
  );
}
