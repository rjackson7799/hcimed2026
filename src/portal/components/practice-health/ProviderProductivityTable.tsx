import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProviderSparkline } from './ProviderSparkline';
import { formatCurrency, formatNumber, formatRvu } from '@/portal/utils/practice-health-formatters';
import { cn } from '@/lib/utils';
import type { ProviderMetrics } from '@/portal/types/practice-health';

interface ProviderProductivityTableProps {
  data: ProviderMetrics[];
}

const ROLE_LABELS: Record<string, string> = {
  physician: 'MD',
  np: 'NP',
  pa: 'PA',
};

const BENCHMARK_COLORS = {
  above: 'bg-emerald-100 text-emerald-700',
  at: 'bg-blue-100 text-blue-700',
  below: 'bg-red-100 text-red-700',
};

export function ProviderProductivityTable({ data }: ProviderProductivityTableProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Provider Productivity</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Provider Productivity</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">FTE</TableHead>
              <TableHead className="text-right">Visits</TableHead>
              <TableHead className="text-right">Visits/Day</TableHead>
              <TableHead className="text-right">wRVUs</TableHead>
              <TableHead className="text-right">wRVU/Day</TableHead>
              <TableHead className="text-right">Billed</TableHead>
              <TableHead className="text-right">Avg Wait</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((provider) => (
              <TableRow key={provider.providerId}>
                <TableCell className="font-medium">{provider.providerName}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {ROLE_LABELS[provider.role] || provider.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{provider.fte.toFixed(1)}</TableCell>
                <TableCell className="text-right">{formatNumber(provider.visits)}</TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium',
                    BENCHMARK_COLORS[provider.benchmarkStatus]
                  )}>
                    {provider.visitsPerScheduledDay.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatRvu(provider.wrvuTotal)}</TableCell>
                <TableCell className="text-right">{formatRvu(provider.wrvuPerDay)}</TableCell>
                <TableCell className="text-right">{formatCurrency(provider.billedCharges, true)}</TableCell>
                <TableCell className="text-right">{provider.avgWaitTime.toFixed(0)} min</TableCell>
                <TableCell className="text-center">
                  <ProviderSparkline data={provider.sparklineData} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
