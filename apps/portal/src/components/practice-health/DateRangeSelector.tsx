import { Button } from '@hci/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@hci/shared/ui/popover';
import { Calendar } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import type { DatePreset, DateRange } from '@/types/practice-health';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { id: DatePreset; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

function getPresetRange(preset: DatePreset): DateRange {
  const end = new Date();
  const start = new Date();

  if (preset === 'day') {
    // Today
  } else if (preset === 'week') {
    start.setDate(start.getDate() - 6);
  } else if (preset === 'month') {
    start.setDate(start.getDate() - 29);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    preset,
  };
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {presets.map(p => (
        <Button
          key={p.id}
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 px-3 text-xs',
            value.preset === p.id && 'bg-muted font-semibold'
          )}
          onClick={() => onChange(getPresetRange(p.id))}
        >
          {p.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3 text-xs',
              value.preset === 'custom' && 'bg-muted font-semibold'
            )}
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Custom
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Start</label>
              <input
                type="date"
                value={value.start}
                onChange={(e) => onChange({ start: e.target.value, end: value.end, preset: 'custom' })}
                className="h-8 rounded-md border px-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">End</label>
              <input
                type="date"
                value={value.end}
                onChange={(e) => onChange({ start: value.start, end: e.target.value, preset: 'custom' })}
                className="h-8 rounded-md border px-2 text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
