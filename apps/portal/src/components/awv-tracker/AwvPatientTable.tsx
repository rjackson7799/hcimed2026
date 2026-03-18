import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@hci/shared/ui/table';
import { Button } from '@hci/shared/ui/button';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { cn } from '@hci/shared/lib/utils';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { AwvStatusBadge } from './AwvStatusBadge';
import { SERVICE_LINE_CONFIG } from '@/lib/awv-tracker-constants';
import type { AwvPatientWithTracking } from '@/types/awv-tracker';

interface AwvPatientTableProps {
  patients: AwvPatientWithTracking[];
  isLoading: boolean;
  onSelectPatient: (patient: AwvPatientWithTracking) => void;
}

type SortField = 'last_name' | 'provider' | 'service_line' | 'eligibility' | 'completion' | 'last_awv_date' | 'next_eligible_date';
type SortDir = 'asc' | 'desc';

export function AwvPatientTable({ patients, isLoading, onSelectPatient }: AwvPatientTableProps) {
  const [sortField, setSortField] = useState<SortField>('last_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...patients].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'last_name':
        return a.last_name.localeCompare(b.last_name) * dir;
      case 'provider':
        return (a.provider_name ?? '').localeCompare(b.provider_name ?? '') * dir;
      case 'service_line':
        return a.service_line.localeCompare(b.service_line) * dir;
      case 'eligibility':
        return a.tracking.eligibility_status.localeCompare(b.tracking.eligibility_status) * dir;
      case 'completion':
        return a.tracking.completion_status.localeCompare(b.tracking.completion_status) * dir;
      case 'last_awv_date':
        return (a.tracking.last_awv_date ?? '').localeCompare(b.tracking.last_awv_date ?? '') * dir;
      case 'next_eligible_date':
        return (a.tracking.next_eligible_date ?? '').localeCompare(b.tracking.next_eligible_date ?? '') * dir;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">No patients match the current filters.</p>
      </div>
    );
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-xs font-medium uppercase tracking-wider"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    </TableHead>
  );

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="last_name">Patient</SortableHeader>
            <SortableHeader field="provider">Provider</SortableHeader>
            <SortableHeader field="service_line">Service Line</SortableHeader>
            <SortableHeader field="eligibility">Eligibility</SortableHeader>
            <SortableHeader field="completion">Completion</SortableHeader>
            <SortableHeader field="last_awv_date">Last AWV</SortableHeader>
            <SortableHeader field="next_eligible_date">Next Eligible</SortableHeader>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((patient) => {
            const slConfig = SERVICE_LINE_CONFIG[patient.service_line];
            const isOverdue =
              patient.tracking.eligibility_status === 'Eligible' &&
              patient.tracking.completion_status === 'Not Started' &&
              patient.tracking.next_eligible_date &&
              patient.tracking.next_eligible_date < new Date().toISOString().split('T')[0];

            return (
              <TableRow
                key={patient.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectPatient(patient)}
              >
                <TableCell className="font-medium">
                  {patient.last_name}
                  <span className="ml-1.5 text-muted-foreground">— ECW#{patient.ecw_patient_id}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{patient.provider_name ?? '—'}</TableCell>
                <TableCell>
                  <span className={cn('rounded px-2 py-0.5 text-xs font-medium', slConfig.bg, slConfig.text)}>
                    {patient.service_line}
                  </span>
                </TableCell>
                <TableCell>
                  <AwvStatusBadge type="eligibility" status={patient.tracking.eligibility_status} />
                </TableCell>
                <TableCell>
                  <AwvStatusBadge type="completion" status={patient.tracking.completion_status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.tracking.last_awv_date ?? '—'}
                </TableCell>
                <TableCell className={cn(isOverdue ? 'text-amber-400 font-medium' : 'text-muted-foreground')}>
                  {patient.tracking.next_eligible_date ?? '—'}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
