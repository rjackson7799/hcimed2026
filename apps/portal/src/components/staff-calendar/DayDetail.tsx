import { Card, CardContent, CardHeader, CardTitle } from '@hci/shared/ui/card';
import { Badge } from '@hci/shared/ui/badge';
import { Clock, UserX } from 'lucide-react';
import type { DayStaffing } from '@/types/staff-calendar';
import { DAY_LABELS_FULL, TIME_OFF_TYPE_LABELS, type TimeOffType } from '@/types/staff-calendar';

interface DayDetailProps {
  day: DayStaffing | null;
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function DayDetail({ day }: DayDetailProps) {
  if (!day) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Select a day to see details.
        </CardContent>
      </Card>
    );
  }

  const date = new Date(day.date + 'T00:00:00');
  const dayName = DAY_LABELS_FULL[date.getDay()];
  const formatted = `${dayName}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{formatted}</CardTitle>
        {day.hasCoverageGap && (
          <Badge variant="destructive" className="w-fit text-xs">No Provider Coverage</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Working staff */}
        {day.working.length > 0 ? (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Working ({day.working.length})</h4>
            <div className="space-y-2">
              {day.working.map((w) => (
                <div key={w.profile_id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {w.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{w.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{w.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(w.start_time)} – {formatTime(w.end_time)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserX className="h-4 w-4" />
            No one scheduled
          </div>
        )}

        {/* Staff on time off */}
        {day.off.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Time Off</h4>
            <div className="space-y-1.5">
              {day.off.map((o) => (
                <div key={o.profile_id} className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm">
                  <span>{o.full_name}</span>
                  <Badge variant="outline" className="text-xs bg-amber-100 border-amber-300">
                    {TIME_OFF_TYPE_LABELS[o.reason as TimeOffType] ?? o.reason}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
