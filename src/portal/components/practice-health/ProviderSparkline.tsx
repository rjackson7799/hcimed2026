import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { SparklinePoint } from '@/portal/types/practice-health';

interface ProviderSparklineProps {
  data: SparklinePoint[];
}

export function ProviderSparkline({ data }: ProviderSparklineProps) {
  if (data.length < 2) return <span className="text-xs text-muted-foreground">--</span>;

  return (
    <div className="w-[60px] h-[20px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
