import { Input } from '@hci/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { cn } from '@hci/shared/lib/utils';
import { Search } from 'lucide-react';
import type {
  CcmRegistryFilters,
  CcmEnrollmentStatus,
  CcmProgramType,
  CcmServiceLine,
} from '@/types/ccm-rpm';

interface CcmRpmFilterBarProps {
  filters: CcmRegistryFilters;
  onFiltersChange: (filters: CcmRegistryFilters) => void;
}

const enrollmentStatusOptions: Array<{ value: CcmEnrollmentStatus | 'All'; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'Eligible', label: 'Eligible' },
  { value: 'Enrolled', label: 'Enrolled' },
  { value: 'Declined', label: 'Declined' },
  { value: 'Disenrolled', label: 'Disenrolled' },
  { value: 'Inactive', label: 'Inactive' },
];

export function CcmRpmFilterBar({ filters, onFiltersChange }: CcmRpmFilterBarProps) {
  function update(partial: Partial<CcmRegistryFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Row 1: Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or eCW ID..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Row 2: Enrollment status chips */}
      <div className="flex flex-wrap gap-2">
        {enrollmentStatusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update({ enrollmentStatus: opt.value })}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              filters.enrollmentStatus === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Row 3: Dropdowns */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.programType}
          onValueChange={(v) => update({ programType: v as CcmProgramType | 'All' })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Program Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Programs</SelectItem>
            <SelectItem value="CCM Only">CCM Only</SelectItem>
            <SelectItem value="RPM Only">RPM Only</SelectItem>
            <SelectItem value="CCM + RPM">CCM + RPM</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.serviceLine}
          onValueChange={(v) => update({ serviceLine: v as CcmServiceLine | 'All' })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Service Line" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Lines</SelectItem>
            <SelectItem value="HCI Office">HCI Office</SelectItem>
            <SelectItem value="Mobile Docs">Mobile Docs</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.providerId}
          onValueChange={(v) => update({ providerId: v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Providers</SelectItem>
            <SelectItem value="prov-chen">Dr. Chen</SelectItem>
            <SelectItem value="prov-np1">NP1</SelectItem>
            <SelectItem value="prov-np2">NP2</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.deviceFilter}
          onValueChange={(v) => update({ deviceFilter: v as CcmRegistryFilters['deviceFilter'] })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Devices</SelectItem>
            <SelectItem value="Has Active Devices">Has Active Devices</SelectItem>
            <SelectItem value="No Devices">No Devices</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
