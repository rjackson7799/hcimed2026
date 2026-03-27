import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@hci/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { Button } from '@hci/shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@hci/shared/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@hci/shared/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@hci/shared/ui/toggle-group';
import { Search, ChevronLeft, ChevronRight, Phone, ChevronDown, ChevronUp, LayoutGrid, TableProperties, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@hci/shared/hooks/use-mobile';
import { usePatients, useDeletePatient } from '@/hooks/usePatients';
import { useAuth } from '@/context/AuthContext';
import { PatientCard } from './PatientCard';
import { CallLogger } from './CallLogger';
import { CallHistory } from './CallHistory';
import { BrokerForward } from './BrokerForward';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/shared/LoadingStates';
import { formatPhone, formatPatientName, formatDateOfBirth, formatRelativeTime } from '@/utils/formatters';
import { STATUS_CONFIG, SEARCH_DEBOUNCE_MS, PATIENTS_PAGE_SIZE } from '@/utils/constants';
import type { Patient, OutreachStatus } from '@/types';

type ViewMode = 'card' | 'table';

const TABLE_COL_COUNT = 7;

interface StaffPatientTableProps {
  patients: Patient[];
}

function StaffPatientTable({ patients }: StaffPatientTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [callLoggerId, setCallLoggerId] = useState<string | null>(null);
  const { role } = useAuth();
  const deletePatient = useDeletePatient();

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Attempts</TableHead>
            <TableHead className="hidden lg:table-cell">Last Contact</TableHead>
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
                <TableCell className="font-medium truncate max-w-0">
                  {formatPatientName(patient.first_name, patient.last_name)}
                </TableCell>
                <TableCell>
                  {formatDateOfBirth(patient.date_of_birth)}
                </TableCell>
                <TableCell>
                  {formatPhone(patient.phone_primary)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={patient.outreach_status} />
                </TableCell>
                <TableCell className="text-center">{patient.total_attempts}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground truncate max-w-0">
                  {patient.last_contacted_at ? formatRelativeTime(patient.last_contacted_at) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {role === 'admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Delete patient"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {formatPatientName(patient.first_name, patient.last_name)} from
                              this project. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                deletePatient.mutate(
                                  { patientId: patient.id, projectId: patient.project_id },
                                  {
                                    onSuccess: () => toast.success('Patient deleted'),
                                    onError: () =>
                                      toast.error(
                                        'Failed to delete patient. They may have existing call records.'
                                      ),
                                  }
                                );
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <a
                      href={`tel:${patient.phone_primary}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md p-2 hover:bg-muted transition-colors"
                      title="Call patient"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                    </a>
                    <Button
                      size="sm"
                      variant={patient.outreach_status === 'not_called' ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCallLoggerId(callLoggerId === patient.id ? null : patient.id);
                        if (callLoggerId !== patient.id) setExpandedId(patient.id);
                      }}
                    >
                      Log Call
                    </Button>
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

              {expandedId === patient.id && (
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableCell colSpan={TABLE_COL_COUNT} className="p-4">
                    <div className="space-y-4">
                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        {patient.current_insurance && (
                          <div>
                            <span className="text-muted-foreground">Insurance: </span>
                            {patient.current_insurance}
                          </div>
                        )}
                        {patient.last_contacted_at && (
                          <div>
                            <span className="text-muted-foreground">Last contact: </span>
                            {formatRelativeTime(patient.last_contacted_at)}
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

                      <BrokerForward patient={patient} />

                      {callLoggerId === patient.id && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <CallLogger
                            patient={patient}
                            onComplete={() => setCallLoggerId(null)}
                          />
                        </div>
                      )}

                      <CallHistory patientId={patient.id} />
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

interface PatientQueueProps {
  projectId: string;
}

export function PatientQueue({ projectId }: PatientQueueProps) {
  const isMobile = useIsMobile();
  const [viewOverride, setViewOverride] = useState<ViewMode | null>(null);
  const viewMode: ViewMode = viewOverride ?? (isMobile ? 'card' : 'table');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | 'all'>('all');
  const [page, setPage] = useState(0);

  // Debounce search
  const debounceTimer = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(0);
      }, SEARCH_DEBOUNCE_MS);
    };
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    debounceTimer(value);
  }, [debounceTimer]);

  const { data, isLoading, error } = usePatients(projectId, {
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
  });

  const totalPages = data ? Math.ceil(data.total / PATIENTS_PAGE_SIZE) : 0;

  if (error) return <p className="text-destructive">Failed to load patients.</p>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or member ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v as OutreachStatus | 'all'); setPage(0); }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Patient count + view toggle */}
      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} patient{data.total !== 1 ? 's' : ''} found
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
      )}

      {/* Patient list */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : data && data.patients.length > 0 ? (
        viewMode === 'card' ? (
          <div className="space-y-2">
            {data.patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <StaffPatientTable patients={data.patients} />
        )
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {debouncedSearch || statusFilter !== 'all'
              ? 'No patients match your filters.'
              : 'No patients in this project yet.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
