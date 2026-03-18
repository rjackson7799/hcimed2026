import { useState } from 'react';
import { cn } from '@hci/shared/lib/utils';
import { UserPlus, RefreshCw, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import type { CcmValidationError } from '@/types/ccm-rpm';

interface UploadResultsSummaryProps {
  result: {
    newPatients: number;
    updatedPatients: number;
    flaggedPatients: number;
    errors: CcmValidationError[];
    totalRows: number;
  };
}

const PREVIEW_COUNT = 5;

export function UploadResultsSummary({ result }: UploadResultsSummaryProps) {
  const [showAllErrors, setShowAllErrors] = useState(false);

  const cards = [
    { label: 'New Patients', count: result.newPatients, icon: UserPlus, bg: 'bg-emerald-950/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    { label: 'Updated', count: result.updatedPatients, icon: RefreshCw, bg: 'bg-blue-950/50', text: 'text-blue-300', dot: 'bg-blue-400' },
    { label: 'Flagged', count: result.flaggedPatients, icon: AlertTriangle, bg: 'bg-amber-950/50', text: 'text-amber-300', dot: 'bg-amber-400' },
    { label: 'Errors', count: result.errors.length, icon: XCircle, bg: 'bg-red-950/50', text: 'text-red-300', dot: 'bg-red-400' },
  ];

  const errorsToShow = showAllErrors ? result.errors : result.errors.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Processed <span className="font-medium text-foreground">{result.totalRows}</span> rows
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={cn('rounded-lg p-3', card.bg)}>
            <div className="flex items-center gap-2">
              <card.icon className={cn('h-4 w-4', card.text)} />
              <span className={cn('text-xs font-medium', card.text)}>{card.label}</span>
            </div>
            <p className={cn('mt-1 text-2xl font-bold', card.text)}>{card.count}</p>
          </div>
        ))}
      </div>

      {result.errors.length > 0 && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Warnings & Errors ({result.errors.length})
          </h4>
          <ul className="mt-2 space-y-1">
            {errorsToShow.map((err, i) => (
              <li key={i} className="text-xs text-amber-200/80">
                Row {err.row} — <span className="text-muted-foreground">{err.field}:</span> {err.message}
              </li>
            ))}
          </ul>
          {result.errors.length > PREVIEW_COUNT && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs text-amber-300"
              onClick={() => setShowAllErrors(!showAllErrors)}
            >
              {showAllErrors ? (
                <>Show less <ChevronUp className="ml-1 h-3 w-3" /></>
              ) : (
                <>Show all {result.errors.length} <ChevronDown className="ml-1 h-3 w-3" /></>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
