import { cn } from '@/lib/utils';
import { STATUS_CONFIG, BROKER_STATUS_CONFIG, PROJECT_STATUS_CONFIG } from '@/portal/utils/constants';
import type { OutreachStatus, BrokerStatus, ProjectStatus } from '@/portal/types';

interface StatusBadgeProps {
  status: OutreachStatus | BrokerStatus | ProjectStatus;
  type?: 'outreach' | 'broker' | 'project';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, type = 'outreach', size = 'sm' }: StatusBadgeProps) {
  const configMap = {
    outreach: STATUS_CONFIG,
    broker: BROKER_STATUS_CONFIG,
    project: PROJECT_STATUS_CONFIG,
  };

  const config = (configMap[type] as Record<string, { color: string; bg: string; label: string }>)[status];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bg,
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {config.label}
    </span>
  );
}
