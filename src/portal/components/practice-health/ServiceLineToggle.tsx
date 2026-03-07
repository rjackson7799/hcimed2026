import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SERVICE_LINE_OPTIONS } from '@/portal/lib/practice-health-constants';
import type { ServiceLineFilter } from '@/portal/types/practice-health';

interface ServiceLineToggleProps {
  value: ServiceLineFilter;
  onChange: (value: ServiceLineFilter) => void;
}

export function ServiceLineToggle({ value, onChange }: ServiceLineToggleProps) {
  return (
    <div className="flex items-center rounded-md border p-0.5">
      {SERVICE_LINE_OPTIONS.map(opt => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-3 text-xs rounded-sm',
            value === opt.value && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
          )}
          onClick={() => onChange(opt.value as ServiceLineFilter)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
