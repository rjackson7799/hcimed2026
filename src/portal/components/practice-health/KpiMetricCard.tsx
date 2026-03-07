import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiMetricCardProps {
  label: string;
  value: string;
  trend: { direction: 'up' | 'down' | 'flat'; percentage: number; label: string };
  trendPositive?: 'up' | 'down'; // Which direction is good? Default 'up'
}

export function KpiMetricCard({ label, value, trend, trendPositive = 'up' }: KpiMetricCardProps) {
  const isGood = trend.direction === 'flat' || trend.direction === trendPositive;

  const TrendIcon = trend.direction === 'up' ? TrendingUp
    : trend.direction === 'down' ? TrendingDown
    : Minus;

  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold font-display mt-1">{value}</p>
      <div className={cn(
        'flex items-center gap-1 mt-1 text-xs font-medium',
        trend.direction === 'flat' ? 'text-muted-foreground' :
        isGood ? 'text-emerald-600' : 'text-red-600'
      )}>
        <TrendIcon className="h-3 w-3" />
        <span>{trend.label}</span>
      </div>
    </Card>
  );
}
