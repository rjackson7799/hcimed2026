import { Card } from '@hci/shared/ui/card';
import { useMobileDocsAlerts } from '@/hooks/useMobileDocsOperations';
import { ALERT_SEVERITY_CONFIG } from '@/lib/mobile-docs-constants';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import { Skeleton } from '@hci/shared/ui/skeleton';
import type { AttentionAlert as AlertType } from '@/types/mobile-docs';

const SEVERITY_ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
} as const;

export function AttentionAlerts() {
  const { data, isLoading } = useMobileDocsAlerts();

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Attention Needed
      </h3>

      <div className="space-y-3">
        {data.map((alert: AlertType, index: number) => {
          const config = ALERT_SEVERITY_CONFIG[alert.severity];
          const Icon = SEVERITY_ICONS[alert.severity];

          return (
            <div
              key={`${alert.type}-${index}`}
              className={cn(
                'rounded-lg border p-3',
                config.bgClass,
                config.borderClass
              )}
            >
              <div className="flex items-start gap-2.5">
                <Icon
                  className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClass)}
                />
                <div>
                  <p
                    className={cn('text-sm font-bold', config.textClass)}
                  >
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
