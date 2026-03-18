import { Input } from '@hci/shared/ui/input';
import { Button } from '@hci/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { cn } from '@hci/shared/lib/utils';
import { Search, Plus } from 'lucide-react';
import { ELIGIBILITY_TIMING_OPTIONS } from '@/lib/awv-tracker-constants';
import { useAwvProviders } from '@/hooks/useAwvProviders';
import { useAuth } from '@/context/AuthContext';
import type { AwvRegistryFilters, AwvEligibilityStatus, AwvCompletionStatus, AwvServiceLine } from '@/types/awv-tracker';

interface AwvFilterBarProps {
  filters: AwvRegistryFilters;
  onFiltersChange: (filters: AwvRegistryFilters) => void;
  onAddPatient: () => void;
}

const eligibilityOptions: Array<{ value: AwvEligibilityStatus | 'All'; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'Pending Review', label: 'Pending' },
  { value: 'Eligible', label: 'Eligible' },
  { value: 'Not Eligible', label: 'Not Eligible' },
];

const completionOptions: Array<{ value: AwvCompletionStatus | 'All'; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'Not Started', label: 'Not Started' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Refused', label: 'Refused' },
  { value: 'Unable to Complete', label: 'Unable' },
];

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-xs text-muted-foreground">{label}:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded px-2.5 py-1 text-xs font-medium transition-colors',
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function AwvFilterBar({ filters, onFiltersChange, onAddPatient }: AwvFilterBarProps) {
  const { data: providers = [] } = useAwvProviders();
  const { canWriteAwv } = useAuth();

  const update = (partial: Partial<AwvRegistryFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Row 1: Search + Add button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or eCW ID..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        {canWriteAwv && (
          <Button onClick={onAddPatient} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Patient
          </Button>
        )}
      </div>

      {/* Row 2: Chip filters + dropdowns */}
      <div className="flex flex-wrap items-center gap-4">
        <ChipGroup
          label="Eligibility"
          options={eligibilityOptions}
          value={filters.eligibilityStatus}
          onChange={(v) => update({ eligibilityStatus: v })}
        />

        <div className="h-5 w-px bg-border" />

        <ChipGroup
          label="Completion"
          options={completionOptions}
          value={filters.completionStatus}
          onChange={(v) => update({ completionStatus: v })}
        />
      </div>

      {/* Row 3: Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.serviceLine}
          onValueChange={(v) => update({ serviceLine: v as AwvServiceLine | 'All' })}
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
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.eligibilityTiming}
          onValueChange={(v) => update({ eligibilityTiming: v as AwvRegistryFilters['eligibilityTiming'] })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Timing" />
          </SelectTrigger>
          <SelectContent>
            {ELIGIBILITY_TIMING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
