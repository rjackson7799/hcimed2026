import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { KpiMetricCard } from './KpiMetricCard';
import { DateRangeSelector } from './DateRangeSelector';
import { ServiceLineToggle } from './ServiceLineToggle';
import { ReportUploader } from './ReportUploader';
import { useKpiData } from '@/portal/hooks/useKpiData';
import { formatCurrency, formatNumber, formatRvu, formatPercentage, formatTrend } from '@/portal/utils/practice-health-formatters';
import type { KpiFilters } from '@/portal/types/practice-health';

interface SummaryHeaderProps {
  filters: KpiFilters;
  onFiltersChange: (filters: KpiFilters) => void;
}

export function SummaryHeader({ filters, onFiltersChange }: SummaryHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data } = useKpiData(filters);

  const current = data?.current;
  const previous = data?.previous;

  const visitsTrend = current && previous ? formatTrend(current.totalVisits, previous.totalVisits) : { direction: 'flat' as const, percentage: 0, label: 'N/A' };
  const billedTrend = current && previous ? formatTrend(current.billedCharges, previous.billedCharges) : { direction: 'flat' as const, percentage: 0, label: 'N/A' };
  const collTrend = current && previous ? formatTrend(current.estCollections, previous.estCollections) : { direction: 'flat' as const, percentage: 0, label: 'N/A' };
  const wrvuTrend = current && previous ? formatTrend(current.totalWrvu, previous.totalWrvu) : { direction: 'flat' as const, percentage: 0, label: 'N/A' };
  const rateTrend = current && previous ? formatTrend(current.collectionRate, previous.collectionRate) : { direction: 'flat' as const, percentage: 0, label: 'N/A' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangeSelector
            value={filters.dateRange}
            onChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
          />
          <ServiceLineToggle
            value={filters.serviceLine}
            onChange={(serviceLine) => onFiltersChange({ ...filters, serviceLine })}
          />
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ReportUploader onUploadComplete={() => setUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <KpiMetricCard
          label="Total Visits"
          value={formatNumber(current?.totalVisits ?? 0)}
          trend={visitsTrend}
        />
        <KpiMetricCard
          label="Billed Charges"
          value={formatCurrency(current?.billedCharges ?? 0, true)}
          trend={billedTrend}
        />
        <KpiMetricCard
          label="Est. Collections"
          value={formatCurrency(current?.estCollections ?? 0, true)}
          trend={collTrend}
        />
        <KpiMetricCard
          label="wRVUs"
          value={formatRvu(current?.totalWrvu ?? 0)}
          trend={wrvuTrend}
        />
        <KpiMetricCard
          label="Collection Rate"
          value={formatPercentage(current?.collectionRate ?? 0)}
          trend={rateTrend}
        />
      </div>
    </div>
  );
}
