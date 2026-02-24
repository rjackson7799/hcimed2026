import { useAuth } from '@/portal/context/AuthContext';
import { LayoutDashboard } from 'lucide-react';

export function AdminDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="rounded-full bg-primary/10 p-4">
        <LayoutDashboard className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {profile?.full_name ?? 'Admin'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Dashboard features coming in Milestone 6
        </p>
      </div>
    </div>
  );
}
