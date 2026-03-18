import { cn } from '@hci/shared/lib/utils';
import { ENROLLMENT_STATUS_CONFIG, PROGRAM_TYPE_CONFIG } from '@/lib/ccm-rpm-constants';
import type { CcmEnrollmentStatus, CcmProgramType } from '@/types/ccm-rpm';

interface EnrollmentStatusBadgeProps {
  status: CcmEnrollmentStatus;
  className?: string;
}

export function EnrollmentStatusBadge({ status, className }: EnrollmentStatusBadgeProps) {
  const config = ENROLLMENT_STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {status}
    </span>
  );
}

interface ProgramTypeBadgeProps {
  programType: CcmProgramType | null;
  className?: string;
}

export function ProgramTypeBadge({ programType, className }: ProgramTypeBadgeProps) {
  if (!programType) return null;

  const config = PROGRAM_TYPE_CONFIG[programType];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {programType}
    </span>
  );
}
