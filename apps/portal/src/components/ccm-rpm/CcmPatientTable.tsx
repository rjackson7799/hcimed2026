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
import { ArrowUpDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { EnrollmentStatusBadge, ProgramTypeBadge } from './CcmStatusBadge';
import { CCM_SERVICE_LINE_CONFIG } from '@/lib/ccm-rpm-constants';
import type { CcmPatientWithEnrollment } from '@/types/ccm-rpm';

interface CcmPatientTableProps {
  patients: CcmPatientWithEnrollment[];
  isLoading: boolean;
  onPatientClick: (patient: CcmPatientWithEnrollment) => void;
}

type SortField =
  | 'last_name'
  | 'provider'
  | 'service_line'
  | 'status'
  | 'program'
  | 'devices'
  | 'consent'
  | 'enrolled_since';
type SortDir = 'asc' | 'desc';

function getSortValue(patient: CcmPatientWithEnrollment, field: SortField): string | number {
  switch (field) {
    case 'last_name':
      return patient.last_name;
    case 'provider':
      return patient.provider_name ?? '';
    case 'service_line':
      return patient.service_line;
    case 'status':
      return patient.enrollment.enrollment_status;
    case 'program':
      return patient.enrollment.program_type ?? '';
    case 'devices':
      return patient.active_device_count;
    case 'consent':
      if (patient.enrollment.enrollment_status !== 'Enrolled') return '';
      return patient.enrollment.consent_obtained ? 'a' : 'b';
    case 'enrolled_since':
      return patient.enrollment.enrollment_date ?? '';
    default:
      return '';
  }
}

export function CcmPatientTable({ patients, isLoading, onPatientClick }: CcmPatientTableProps) {
  const [sortField, setSortField] = useState<SortField>('last_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sorted = [...patients].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const aVal = getSortValue(a, sortField);
    const bVal = getSortValue(b, sortField);

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir;
    }
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
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

  function SortableHeader({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
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
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="last_name">Patient</SortableHeader>
            <SortableHeader field="provider">Provider</SortableHeader>
            <SortableHeader field="service_line">Service Line</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="program">Program</SortableHeader>
            <SortableHeader field="devices">Devices</SortableHeader>
            <SortableHeader field="consent">Consent</SortableHeader>
            <SortableHeader field="enrolled_since">Enrolled Since</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((patient) => {
            const slConfig = CCM_SERVICE_LINE_CONFIG[patient.service_line];
            const isEnrolled = patient.enrollment.enrollment_status === 'Enrolled';

            return (
              <TableRow
                key={patient.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onPatientClick(patient)}
              >
                <TableCell className="font-medium">
                  {patient.last_name}
                  <span className="ml-1.5 text-muted-foreground">
                    — {patient.ecw_patient_id}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.provider_name ?? '—'}
                </TableCell>
                <TableCell>
                  <span className={cn('rounded px-2 py-0.5 text-xs font-medium', slConfig.bg, slConfig.text)}>
                    {patient.service_line}
                  </span>
                </TableCell>
                <TableCell>
                  <EnrollmentStatusBadge status={patient.enrollment.enrollment_status} />
                </TableCell>
                <TableCell>
                  {patient.enrollment.program_type ? (
                    <ProgramTypeBadge programType={patient.enrollment.program_type} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.active_device_count > 0 ? patient.active_device_count : '—'}
                </TableCell>
                <TableCell>
                  {isEnrolled && patient.enrollment.consent_obtained && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {isEnrolled && !patient.enrollment.consent_obtained && (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                  {!isEnrolled && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.enrollment.enrollment_date ?? '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
