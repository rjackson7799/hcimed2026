import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePatients } from '@/portal/hooks/usePatients';
import { PatientCard } from './PatientCard';
import { TableSkeleton } from '@/portal/components/shared/LoadingStates';
import { STATUS_CONFIG, SEARCH_DEBOUNCE_MS, PATIENTS_PAGE_SIZE } from '@/portal/utils/constants';
import type { OutreachStatus } from '@/portal/types';

interface PatientQueueProps {
  projectId: string;
}

export function PatientQueue({ projectId }: PatientQueueProps) {
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
        <div className="relative flex-1">
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

      {/* Patient count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          {data.total} patient{data.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Patient list */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : data && data.patients.length > 0 ? (
        <div className="space-y-2">
          {data.patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
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
