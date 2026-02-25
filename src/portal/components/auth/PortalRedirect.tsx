import { Navigate } from 'react-router-dom';
import { useAuth } from '@/portal/context/AuthContext';

export function PortalRedirect() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  switch (role) {
    case 'admin':
      return <Navigate to="/portal/admin" replace />;
    case 'staff':
      return <Navigate to="/portal/staff" replace />;
    case 'provider':
      return <Navigate to="/portal/staff" replace />;
    case 'broker':
      return <Navigate to="/portal/broker" replace />;
    default:
      return <Navigate to="/hci-login" replace />;
  }
}
