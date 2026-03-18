import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@hci/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { cn } from '@hci/shared/lib/utils';
import type { FacilityFilters as FilterState } from '@/hooks/useFacilities';
import {
  FACILITY_TYPE_COLORS,
  FACILITY_STATUS_DOT_COLORS,
  SORT_OPTIONS,
} from '@/lib/mobile-docs-constants';

interface FacilityFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

const TYPE_OPTIONS = ['all', 'SNF', 'Board & Care', 'Homebound'] as const;
const STATUS_OPTIONS = ['all', 'Prospecting', 'Onboarding', 'Active', 'Inactive'] as const;

export function FacilityFilters({ filters, onFiltersChange }: FacilityFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const stableOnFiltersChange = useCallback(onFiltersChange, [onFiltersChange]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      stableOnFiltersChange({ search: searchInput || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, stableOnFiltersChange]);

  const currentSort = `${filters.sortColumn || 'name'}-${filters.sortDirection || 'asc'}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search facilities..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Type filter chips */}
      <div className="flex items-center gap-1">
        {TYPE_OPTIONS.map((type) => {
          const active = (filters.type || 'all') === type;
          const colors = type !== 'all' ? FACILITY_TYPE_COLORS[type as keyof typeof FACILITY_TYPE_COLORS] : null;
          return (
            <button
              key={type}
              onClick={() => onFiltersChange({ type: type as FilterState['type'] })}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
              style={active && colors ? { borderColor: colors.fill, color: colors.text, backgroundColor: colors.bg } : undefined}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          );
        })}
      </div>

      {/* Status filter chips */}
      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map((status) => {
          const active = (filters.status || 'all') === status;
          const dotColor = status !== 'all' ? FACILITY_STATUS_DOT_COLORS[status] : null;
          return (
            <button
              key={status}
              onClick={() => onFiltersChange({ status: status as FilterState['status'] })}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors inline-flex items-center gap-1.5',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
            >
              {dotColor && <span className={cn('h-2 w-2 rounded-full', dotColor)} />}
              {status === 'all' ? 'All Status' : status}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <Select
        value={currentSort}
        onValueChange={(v) => {
          const lastDash = v.lastIndexOf('-');
          const col = v.slice(0, lastDash) as FilterState['sortColumn'];
          const dir = v.slice(lastDash + 1) as FilterState['sortDirection'];
          onFiltersChange({ sortColumn: col, sortDirection: dir });
        }}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
