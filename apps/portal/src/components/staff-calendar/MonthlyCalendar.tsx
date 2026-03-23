import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import { cn } from '@hci/shared/lib/utils';
import type { DayStaffing } from '@/types/staff-calendar';
import { DAY_LABELS } from '@/types/staff-calendar';

interface MonthlyCalendarProps {
  year: number;
  month: number;
  staffing: DayStaffing[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthlyCalendar({
  year,
  month,
  staffing,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthlyCalendarProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  // Build staffing lookup
  const staffingMap = new Map<string, DayStaffing>();
  for (const day of staffing) {
    staffingMap.set(day.date, day);
  }

  // Build calendar grid cells
  const cells: (DayStaffing | null)[] = [];
  // Leading blanks
  for (let i = 0; i < firstDay; i++) cells.push(null);
  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(staffingMap.get(dateStr) ?? null);
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-px">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`blank-${i}`} className="bg-background min-h-[80px]" />;
          }

          const dateNum = parseInt(day.date.split('-')[2], 10);
          const isToday = day.date === todayStr;
          const isSelected = day.date === selectedDate;
          const isWeekend = new Date(day.date + 'T00:00:00').getDay() === 0 || new Date(day.date + 'T00:00:00').getDay() === 6;

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'bg-background min-h-[80px] p-1.5 text-left transition-colors hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring',
                isSelected && 'ring-2 ring-primary bg-primary/5',
                day.hasCoverageGap && 'bg-red-50',
                isWeekend && 'bg-muted/30',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    isToday && 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center',
                  )}
                >
                  {dateNum}
                </span>
                {day.working.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {day.working.length}
                  </span>
                )}
              </div>
              {/* Staff initials */}
              <div className="flex flex-wrap gap-0.5">
                {day.working.slice(0, 4).map((w) => (
                  <div
                    key={w.profile_id}
                    className={cn(
                      'h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-medium',
                      w.role === 'provider' || w.role === 'admin'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                    title={w.full_name}
                  >
                    {w.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                ))}
                {day.working.length > 4 && (
                  <span className="text-[9px] text-muted-foreground self-center">
                    +{day.working.length - 4}
                  </span>
                )}
              </div>
              {/* Time off indicators */}
              {day.off.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {day.off.slice(0, 2).map((o) => (
                    <span
                      key={o.profile_id}
                      className="text-[8px] bg-amber-100 text-amber-700 rounded px-1"
                      title={`${o.full_name} - ${o.reason}`}
                    >
                      {o.full_name.split(' ')[0]}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
