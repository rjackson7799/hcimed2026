import { useState } from 'react';
import { Card } from '@hci/shared/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@hci/shared/ui/table';
import { useMobileDocsFacilityRevenue } from '@/hooks/useMobileDocsRevenue';
import { formatCurrency, formatNumber } from '@/utils/practice-health-formatters';
import { FACILITY_TYPE_COLORS } from '@/lib/mobile-docs-constants';
import { ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { cn } from '@hci/shared/lib/utils';
import type { FacilityRevenue } from '@/types/mobile-docs';

type SortColumn = keyof FacilityRevenue;
type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

const SORTABLE_COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'Facility' },
  { key: 'type', label: 'Type' },
  { key: 'activePatients', label: 'Patients' },
  { key: 'visits', label: 'Visits' },
  { key: 'monthlyCharges', label: 'Revenue' },
  { key: 'revenuePerVisit', label: '$/Visit' },
];

function sortFacilities(
  facilities: FacilityRevenue[],
  { column, direction }: SortState
): FacilityRevenue[] {
  return [...facilities].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    let cmp: number;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      cmp = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = 0;
    }

    return direction === 'asc' ? cmp : -cmp;
  });
}

function TrendIndicator({ trend }: { trend: FacilityRevenue['trend'] }) {
  if (trend.direction === 'up') {
    return <span className="text-emerald-400">▲ {trend.label}</span>;
  }
  if (trend.direction === 'down') {
    return <span className="text-red-400">▼ {trend.label}</span>;
  }
  return <span className="text-muted-foreground">—</span>;
}

export function FacilityRevenueTable() {
  const { data, isLoading } = useMobileDocsFacilityRevenue();
  const [sort, setSort] = useState<SortState>({
    column: 'monthlyCharges',
    direction: 'desc',
  });

  function handleSort(column: SortColumn) {
    setSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'desc' }
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </Card>
    );
  }

  const sorted = sortFacilities(data, sort);

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Facility Revenue Ranking
      </h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {SORTABLE_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown
                      className={cn(
                        'h-3 w-3',
                        sort.column === col.key
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                      )}
                    />
                  </span>
                </TableHead>
              ))}
              <TableHead className="whitespace-nowrap">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((facility) => {
              const typeColors =
                FACILITY_TYPE_COLORS[facility.type] ?? FACILITY_TYPE_COLORS.SNF;

              return (
                <TableRow key={facility.facilityId}>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: typeColors.bg,
                        color: typeColors.text,
                      }}
                    >
                      {facility.type}
                    </span>
                  </TableCell>
                  <TableCell>{formatNumber(facility.activePatients)}</TableCell>
                  <TableCell>{formatNumber(facility.visits)}</TableCell>
                  <TableCell>{formatCurrency(facility.monthlyCharges)}</TableCell>
                  <TableCell>{formatCurrency(facility.revenuePerVisit)}</TableCell>
                  <TableCell className="text-xs">
                    <TrendIndicator trend={facility.trend} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
