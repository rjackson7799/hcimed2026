import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/portal/context/AuthContext';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';

const LOADING_TIMEOUT_MS = 8_000;

export function AuthGuard() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowRetry(false);
      return;
    }
    const timer = setTimeout(() => setShowRetry(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {showRetry && (
          <div className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Taking longer than expected...
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        )}
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
