import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMobileDocsFacilityMix } from '@/hooks/useMobileDocsPipeline';
import { FACILITY_TYPE_COLORS } from '@/lib/mobile-docs-constants';
import type { FacilityType } from '@/types/mobile-docs';

export function FacilityMixDonut() {
  const { data, isLoading } = useMobileDocsFacilityMix();

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-[220px] rounded" />
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Facility Mix</h3>

      <div className="relative" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => {
                const colors = FACILITY_TYPE_COLORS[entry.type as FacilityType];
                return <Cell key={entry.type} fill={colors?.fill ?? '#475569'} />;
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-100">{total}</span>
          <span className="text-xs text-slate-400">total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {data.map((entry) => {
          const colors = FACILITY_TYPE_COLORS[entry.type as FacilityType];
          return (
            <div key={entry.type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors?.fill ?? '#475569' }}
                />
                <span className="text-slate-300">{entry.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">{entry.count}</span>
                <span className="text-slate-500">({entry.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
