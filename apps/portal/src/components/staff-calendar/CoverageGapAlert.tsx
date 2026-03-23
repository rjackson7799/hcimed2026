import { Alert, AlertDescription, AlertTitle } from '@hci/shared/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { DayStaffing } from '@/types/staff-calendar';
import { DAY_LABELS_FULL } from '@/types/staff-calendar';

interface CoverageGapAlertProps {
  staffing: DayStaffing[];
}

export function CoverageGapAlert({ staffing }: CoverageGapAlertProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find upcoming coverage gaps (next 14 days)
  const gaps = staffing
    .filter((d) => {
      const date = new Date(d.date + 'T00:00:00');
      return d.hasCoverageGap && date >= today;
    })
    .slice(0, 5);

  if (gaps.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Coverage Gap{gaps.length > 1 ? 's' : ''} Detected</AlertTitle>
      <AlertDescription>
        No provider is scheduled on{' '}
        {gaps.map((g, i) => {
          const date = new Date(g.date + 'T00:00:00');
          const dayName = DAY_LABELS_FULL[date.getDay()];
          const formatted = `${dayName} ${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <span key={g.date}>
              {i > 0 && (i === gaps.length - 1 ? ' and ' : ', ')}
              <strong>{formatted}</strong>
            </span>
          );
        })}
        . Consider adding an override or adjusting schedules.
      </AlertDescription>
    </Alert>
  );
}
