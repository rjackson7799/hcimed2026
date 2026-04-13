import { Badge } from '@hci/shared/ui/badge';
import { cn } from '@hci/shared/lib/utils';

const insurers = [
  'Medicare',
  'Regal Medical Group',
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'United Healthcare',
];

interface InsuranceLogosProps {
  className?: string;
}

export function InsuranceLogos({ className }: InsuranceLogosProps) {
  return (
    <div className={cn('text-center', className)}>
      <p className="text-sm font-medium text-muted-foreground mb-4">
        We Accept Most Major Insurance Plans
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {insurers.map((name) => (
          <Badge
            key={name}
            variant="outline"
            className="text-sm px-4 py-1.5 font-normal text-muted-foreground border-border"
          >
            {name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
