import { Button } from '@/components/ui/button';
import { useAuth } from '@/portal/context/AuthContext';
import { LogOut, Briefcase } from 'lucide-react';

export function BrokerDashboardPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
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
      <Button variant="outline" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
