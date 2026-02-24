import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Phone, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { supabase } from '@/portal/lib/supabase';
import { useAuth } from '@/portal/context/AuthContext';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { StatusUpdater } from './StatusUpdater';
import { MessageThread } from './MessageThread';
import { TableSkeleton } from '@/portal/components/shared/LoadingStates';
import { formatPhone, formatPatientName, formatRelativeTime } from '@/portal/utils/formatters';
import { BROKER_STATUS_CONFIG, SEARCH_DEBOUNCE_MS } from '@/portal/utils/constants';
import type { Patient, BrokerStatus } from '@/portal/types';

function useBrokerPatients(userId: string) {
  return useQuery({
    queryKey: ['broker-patients', userId],
    queryFn: async () => {
      // Get patients that have been forwarded to broker
      // Broker sees patients from projects they're assigned to
      const { data: assignments } = await supabase
        .from('project_assignments')
        .select('project_id')
        .eq('user_id', userId)
        .eq('role_in_project', 'broker');

      if (!assignments || assignments.length === 0) return [];

      const projectIds = assignments.map((a: any) => a.project_id);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .in('project_id', projectIds)
        .in('outreach_status', ['forwarded_to_broker', 'completed', 'unable_to_complete'])
        .order('forwarded_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function ForwardedList() {
  const { user } = useAuth();
  const { data: patients, isLoading } = useBrokerPatients(user?.id || '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messagePatientId, setMessagePatientId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton rows={5} />;

  if (!patients || patients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No patients have been forwarded to you yet.</p>
      </div>
    );
  }

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = !search ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.phone_primary.includes(search) ||
      (p.member_id && p.member_id.includes(search));

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'forwarded_to_broker' && p.outreach_status === 'forwarded_to_broker') ||
      (statusFilter === 'completed' && p.outreach_status === 'completed') ||
      (statusFilter === 'unable_to_complete' && p.outreach_status === 'unable_to_complete');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="forwarded_to_broker">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="unable_to_complete">Unable to Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
      </p>

      {/* Patient cards */}
      <div className="space-y-2">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="overflow-hidden">
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(expandedId === patient.id ? null : patient.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">
                    {formatPatientName(patient.first_name, patient.last_name)}
                  </span>
                  <StatusBadge status={patient.outreach_status} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{formatPhone(patient.phone_primary)}</span>
                  {patient.member_id && <span>ID: {patient.member_id}</span>}
                  {patient.forwarded_at && (
                    <span>Forwarded {formatRelativeTime(patient.forwarded_at)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${patient.phone_primary}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md p-2 hover:bg-muted transition-colors"
                  title="Call patient"
                >
                  <Phone className="h-4 w-4 text-primary" />
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessagePatientId(
                      messagePatientId === patient.id ? null : patient.id
                    );
                    if (messagePatientId !== patient.id) setExpandedId(patient.id);
                  }}
                  className="rounded-md p-2 hover:bg-muted transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </button>
                {expandedId === patient.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedId === patient.id && (
              <div className="border-t p-4 space-y-4">
                {/* Patient details */}
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  {patient.current_insurance && (
                    <div>
                      <span className="text-muted-foreground">Current Insurance: </span>
                      {patient.current_insurance}
                    </div>
                  )}
                  {patient.target_insurance && (
                    <div>
                      <span className="text-muted-foreground">Target Insurance: </span>
                      {patient.target_insurance}
                    </div>
                  )}
                  {patient.address_line1 && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Address: </span>
                      {[patient.address_line1, patient.address_city, patient.address_state, patient.address_zip]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>

                {/* Status updater */}
                <StatusUpdater patient={patient} />

                {/* Message thread */}
                {messagePatientId === patient.id && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <MessageThread patient={patient} />
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
