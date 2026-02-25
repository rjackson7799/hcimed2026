import React, { useState, useEffect, useCallback } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Phone, ChevronDown, ChevronUp, MessageSquare, RefreshCw, LayoutGrid, TableProperties } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/portal/lib/supabase';
import { useAuth } from '@/portal/context/AuthContext';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { StatusUpdater } from './StatusUpdater';
import { MessageThread } from './MessageThread';
import { CallLogPrompt } from './CallLogPrompt';
import { usePullToRefresh } from '@/portal/hooks/usePullToRefresh';
import { formatPhone, formatPatientName, formatRelativeTime, formatDateOfBirth } from '@/portal/utils/formatters';
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

function PatientCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-[44px] w-[44px] rounded-md" />
          <Skeleton className="h-[44px] w-[44px] rounded-md" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

type ViewMode = 'card' | 'table';

const BROKER_TABLE_COL_COUNT = 9;

interface BrokerListProps {
  patients: Patient[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  messagePatientId: string | null;
  setMessagePatientId: (id: string | null) => void;
  callLogPatientId: string | null;
  setCallLogPatientId: (id: string | null) => void;
  handlePhoneTap: (patientId: string) => void;
}

function PatientCardList({
  patients,
  expandedId,
  setExpandedId,
  messagePatientId,
  setMessagePatientId,
  callLogPatientId,
  setCallLogPatientId,
  handlePhoneTap,
}: BrokerListProps) {
  return (
    <div className="space-y-2">
      {patients.map((patient) => (
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

            <div className="flex items-center gap-1">
              <a
                href={`tel:${patient.phone_primary}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhoneTap(patient.id);
                }}
                className="rounded-md p-2 hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                className="rounded-md p-2 hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Messages"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="w-6 flex items-center justify-center">
                {expandedId === patient.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {callLogPatientId === patient.id && (
            <CallLogPrompt
              patient={patient}
              onDismiss={() => setCallLogPatientId(null)}
            />
          )}

          {expandedId === patient.id && (
            <div className="border-t p-4 space-y-4">
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

              <StatusUpdater patient={patient} />

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
  );
}

function BrokerPatientTable({
  patients,
  expandedId,
  setExpandedId,
  messagePatientId,
  setMessagePatientId,
  callLogPatientId,
  setCallLogPatientId,
  handlePhoneTap,
}: BrokerListProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Member ID</TableHead>
            <TableHead className="hidden lg:table-cell">Current Insurance</TableHead>
            <TableHead className="hidden lg:table-cell">Target Insurance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Forwarded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <React.Fragment key={patient.id}>
              <TableRow
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === patient.id ? null : patient.id)}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {formatPatientName(patient.first_name, patient.last_name)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateOfBirth(patient.date_of_birth)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatPhone(patient.phone_primary)}
                </TableCell>
                <TableCell>{patient.member_id || '—'}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {patient.current_insurance || '—'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {patient.target_insurance || '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={patient.outreach_status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {patient.forwarded_at ? formatRelativeTime(patient.forwarded_at) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={`tel:${patient.phone_primary}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhoneTap(patient.id);
                      }}
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
                    <div className="w-5 flex items-center justify-center">
                      {expandedId === patient.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>

              {callLogPatientId === patient.id && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={BROKER_TABLE_COL_COUNT} className="p-0">
                    <CallLogPrompt
                      patient={patient}
                      onDismiss={() => setCallLogPatientId(null)}
                    />
                  </TableCell>
                </TableRow>
              )}

              {expandedId === patient.id && (
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableCell colSpan={BROKER_TABLE_COL_COUNT} className="p-4">
                    <div className="space-y-4">
                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
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
                        {patient.phone_secondary && (
                          <div>
                            <span className="text-muted-foreground">Secondary Phone: </span>
                            {formatPhone(patient.phone_secondary)}
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

                      <StatusUpdater patient={patient} />

                      {messagePatientId === patient.id && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <MessageThread patient={patient} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ForwardedList() {
  const { user } = useAuth();
  const { data: patients, isLoading, refetch } = useBrokerPatients(user?.id || '');
  const isMobile = useIsMobile();
  const [viewOverride, setViewOverride] = useState<ViewMode | null>(null);
  const viewMode: ViewMode = viewOverride ?? (isMobile ? 'card' : 'table');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messagePatientId, setMessagePatientId] = useState<string | null>(null);
  const [callLogPatientId, setCallLogPatientId] = useState<string | null>(null);

  // Pull-to-refresh
  const { containerRef, pullDistance, refreshing, isActive } = usePullToRefresh({
    onRefresh: () => refetch(),
  });

  // Call log prompt: track when user taps a phone link
  const handlePhoneTap = useCallback((patientId: string) => {
    // Store the patient ID so we can show the log prompt when they return
    sessionStorage.setItem('hci-call-patient', patientId);
  }, []);

  // Listen for visibility change (user returns from phone dialer)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const calledPatientId = sessionStorage.getItem('hci-call-patient');
        if (calledPatientId) {
          sessionStorage.removeItem('hci-call-patient');
          setCallLogPatientId(calledPatientId);
          setExpandedId(calledPatientId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <PatientCardSkeleton key={i} />
        ))}
      </div>
    );
  }

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
    <div ref={containerRef} className="space-y-4">
      {/* Pull-to-refresh indicator */}
      {isActive && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance > 0 ? `${Math.min(pullDistance, 60)}px` : 0 }}
        >
          <RefreshCw
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: refreshing ? undefined : `rotate(${Math.min(pullDistance * 3, 360)}deg)`,
              opacity: Math.min(pullDistance / 60, 1),
            }}
          />
        </div>
      )}

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

      {/* Count + view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
        </p>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewOverride(value as ViewMode);
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="card" aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <TableProperties className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Patient list */}
      {viewMode === 'card' ? (
        <PatientCardList
          patients={filteredPatients}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          messagePatientId={messagePatientId}
          setMessagePatientId={setMessagePatientId}
          callLogPatientId={callLogPatientId}
          setCallLogPatientId={setCallLogPatientId}
          handlePhoneTap={handlePhoneTap}
        />
      ) : (
        <BrokerPatientTable
          patients={filteredPatients}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          messagePatientId={messagePatientId}
          setMessagePatientId={setMessagePatientId}
          callLogPatientId={callLogPatientId}
          setCallLogPatientId={setCallLogPatientId}
          handlePhoneTap={handlePhoneTap}
        />
      )}
    </div>
  );
}
