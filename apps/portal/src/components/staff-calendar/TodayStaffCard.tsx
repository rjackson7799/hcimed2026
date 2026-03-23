import { Card, CardContent, CardHeader, CardTitle } from '@hci/shared/ui/card';
import { Badge } from '@hci/shared/ui/badge';
import { Users } from 'lucide-react';
import type { DayStaffing } from '@/types/staff-calendar';

interface TodayStaffCardProps {
  today: DayStaffing | undefined;
  isLoading: boolean;
}

export function TodayStaffCard({ today, isLoading }: TodayStaffCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Who's In Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!today) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Who's In Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No schedule data available.</p>
        </CardContent>
      </Card>
    );
  }

  const roleBadgeVariant = (role: string) => {
    if (role === 'provider') return 'default' as const;
    if (role === 'admin') return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Who's In Today
          <Badge variant="outline" className="ml-auto font-normal">
            {today.working.length} staff
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {today.working.length === 0 ? (
          <p className="text-sm text-muted-foreground">No one is scheduled today.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {today.working.map((w) => (
              <div
                key={w.profile_id}
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                  {w.full_name.charAt(0)}
                </div>
                <span className="text-sm">{w.full_name}</span>
                <Badge variant={roleBadgeVariant(w.role)} className="text-[10px] px-1 py-0">
                  {w.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
        {today.off.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">Off today:</p>
            <div className="flex flex-wrap gap-1.5">
              {today.off.map((o) => (
                <span key={o.profile_id} className="text-xs text-muted-foreground bg-amber-50 rounded px-1.5 py-0.5">
                  {o.full_name} ({o.reason})
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
