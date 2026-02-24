import { useAuth } from '@/portal/context/AuthContext';
import { ClipboardList } from 'lucide-react';

export function StaffDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="rounded-full bg-primary/10 p-4">
        <ClipboardList className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {profile?.full_name ?? 'Staff'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Patient queue and call logging coming in Milestone 4
        </p>
      </div>
    </div>
  );
}
