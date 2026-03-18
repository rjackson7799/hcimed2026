import { useState } from 'react';
import { Button } from '@hci/shared/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@hci/shared/ui/dialog';
import { Upload, FileDown, Mail, Loader2 } from 'lucide-react';
import { KpiMetricCard } from './KpiMetricCard';
import { DateRangeSelector } from './DateRangeSelector';
import { ServiceLineToggle } from './ServiceLineToggle';
import { ReportUploader } from './ReportUploader';
import { EmailSummaryModal } from './EmailSummaryModal';
import { useKpiData } from '@/hooks/useKpiData';
import { useDownloadSummary } from '@/hooks/usePracticeHealthSummary';
import { useToast } from '@hci/shared/hooks/use-toast';
import { formatCurrency, formatNumber, formatRvu, formatPercentage, formatTrend } from '@/utils/practice-health-formatters';
import type { KpiFilters } from '@/types/practice-health';

interface SummaryHeaderProps {
  filters: KpiFilters;
  onFiltersChange: (filters: KpiFilters) => void;
}

export function SummaryHeader({ filters, onFiltersChange }: SummaryHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const { data } = useKpiData(filters);
  const downloadMutation = useDownloadSummary();
  const { toast } = useToast();

  const handleDownload = () => {
    downloadMutation.mutate(filters.dateRange, {
      onSuccess: () => {
        toast({ title: 'Summary downloaded', description: 'PDF saved to your downloads.' });
      },
      onError: (err) => {
        toast({ title: 'Download failed', description: err.message, variant: 'destructive' });
      },
    });
  };

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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
          >
            {downloadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Download Summary
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEmailOpen(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Summary
          </Button>
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
      </div>

      <EmailSummaryModal
        open={emailOpen}
        onOpenChange={setEmailOpen}
        dateRange={filters.dateRange}
      />

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
