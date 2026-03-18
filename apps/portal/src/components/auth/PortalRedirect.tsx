import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

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
      return <Navigate to="/admin" replace />;
    case 'staff':
      return <Navigate to="/staff" replace />;
    case 'provider':
      return <Navigate to="/staff" replace />;
    case 'broker':
      return <Navigate to="/broker" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
