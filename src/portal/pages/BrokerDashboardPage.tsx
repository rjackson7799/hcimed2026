import { useAuth } from '@/portal/context/AuthContext';
import { ForwardedList } from '@/portal/components/broker/ForwardedList';

export function BrokerDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Forwarded Patients</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome, {profile?.full_name ?? 'Partner'}. Manage patients forwarded to you below.
        </p>
      </div>

      <ForwardedList />
    </div>
  );
}
