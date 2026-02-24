import { useAuth } from '@/portal/context/AuthContext';
import { Briefcase } from 'lucide-react';

export function BrokerDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="rounded-full bg-slate-100 p-4">
        <Briefcase className="h-8 w-8 text-slate-700" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display">Broker Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {profile?.full_name ?? 'Partner'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Forwarded patients and status updates coming in Milestone 5
        </p>
      </div>
    </div>
  );
}
