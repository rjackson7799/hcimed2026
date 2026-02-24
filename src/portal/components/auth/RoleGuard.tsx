import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/portal/context/AuthContext';
import type { UserRole } from '@/portal/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/portal" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
