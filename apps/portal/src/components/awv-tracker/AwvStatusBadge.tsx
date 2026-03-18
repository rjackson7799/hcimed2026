import { cn } from '@hci/shared/lib/utils';
import { ELIGIBILITY_STATUS_CONFIG, COMPLETION_STATUS_CONFIG } from '@/lib/awv-tracker-constants';
import type { AwvEligibilityStatus, AwvCompletionStatus } from '@/types/awv-tracker';

interface AwvStatusBadgeProps {
  type: 'eligibility' | 'completion';
  status: AwvEligibilityStatus | AwvCompletionStatus;
  className?: string;
}

export function AwvStatusBadge({ type, status, className }: AwvStatusBadgeProps) {
  const config = type === 'eligibility'
    ? ELIGIBILITY_STATUS_CONFIG[status as AwvEligibilityStatus]
    : COMPLETION_STATUS_CONFIG[status as AwvCompletionStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {status}
    </span>
  );
}
