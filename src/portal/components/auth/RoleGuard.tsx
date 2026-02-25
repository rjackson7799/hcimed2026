import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/portal/context/AuthContext';
import type { UserRole } from '@/portal/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/portal" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
