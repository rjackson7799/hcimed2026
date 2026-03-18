import { Card } from '@hci/shared/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { VisitVolumePoint } from '@/hooks/useOperationalMetrics';

interface VisitVolumeChartProps {
  data: VisitVolumePoint[];
}

export function VisitVolumeChart({ data }: VisitVolumeChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Visit Volume</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Visit Volume</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="newPatients" name="New Patients" stackId="visits" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="established" name="Established" stackId="visits" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
