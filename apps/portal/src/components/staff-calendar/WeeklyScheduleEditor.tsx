import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@hci/shared/ui/card';
import { Button } from '@hci/shared/ui/button';
import { Checkbox } from '@hci/shared/ui/checkbox';
import { Input } from '@hci/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hci/shared/ui/select';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffSchedules } from '@/hooks/useStaffCalendar';
import { useBulkUpsertSchedule } from '@/hooks/useStaffCalendarMutations';
import { useActiveUsers } from '@/hooks/useUsers';
import { DAY_LABELS } from '@/types/staff-calendar';
import type { Profile } from '@/types/database';

interface ScheduleRow {
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
}

const DEFAULT_SCHEDULE: ScheduleRow[] = Array.from({ length: 7 }, (_, i) => ({
  day_of_week: i,
  is_working: false,
  start_time: '08:00',
  end_time: '17:00',
}));

export function WeeklyScheduleEditor() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const { data: users, isLoading: usersLoading } = useActiveUsers(['admin', 'staff', 'provider']);
  const { data: schedules, isLoading: schedulesLoading } = useStaffSchedules();
  const bulkUpsert = useBulkUpsertSchedule();

  // Build current schedule for selected profile
  const currentSchedule: ScheduleRow[] = DEFAULT_SCHEDULE.map((row) => {
    const existing = schedules?.find(
      (s) => s.profile_id === selectedProfileId && s.day_of_week === row.day_of_week
    );
    if (existing) {
      return {
        day_of_week: existing.day_of_week,
        is_working: existing.is_working,
        start_time: existing.start_time,
        end_time: existing.end_time,
      };
    }
    return row;
  });

  const [editSchedule, setEditSchedule] = useState<ScheduleRow[]>(currentSchedule);

  // Reset edit state when profile changes
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const newSchedule = DEFAULT_SCHEDULE.map((row) => {
      const existing = schedules?.find(
        (s) => s.profile_id === profileId && s.day_of_week === row.day_of_week
      );
      if (existing) {
        return {
          day_of_week: existing.day_of_week,
          is_working: existing.is_working,
          start_time: existing.start_time,
          end_time: existing.end_time,
        };
      }
      return row;
    });
    setEditSchedule(newSchedule);
  };

  const updateDay = (dayOfWeek: number, updates: Partial<ScheduleRow>) => {
    setEditSchedule((prev) =>
      prev.map((row) =>
        row.day_of_week === dayOfWeek ? { ...row, ...updates } : row
      )
    );
  };

  const handleSave = async () => {
    if (!selectedProfileId) return;
    try {
      await bulkUpsert.mutateAsync({
        profile_id: selectedProfileId,
        schedules: editSchedule,
      });
      toast.success('Schedule saved');
    } catch (err) {
      toast.error('Failed to save schedule');
      console.error(err);
    }
  };

  if (usersLoading || schedulesLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Manage Schedules</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Manage Weekly Schedules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Staff selector */}
        <Select value={selectedProfileId} onValueChange={handleProfileChange}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select a staff member" />
          </SelectTrigger>
          <SelectContent>
            {(users ?? []).map((u: Profile) => (
              <SelectItem key={u.id} value={u.id}>
                {u.full_name} ({u.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProfileId && (
          <>
            {/* Schedule table */}
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">Day</th>
                    <th className="px-3 py-2 text-center font-medium">Working</th>
                    <th className="px-3 py-2 text-center font-medium">Start</th>
                    <th className="px-3 py-2 text-center font-medium">End</th>
                  </tr>
                </thead>
                <tbody>
                  {editSchedule.map((row) => (
                    <tr key={row.day_of_week} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{DAY_LABELS[row.day_of_week]}</td>
                      <td className="px-3 py-2 text-center">
                        <Checkbox
                          checked={row.is_working}
                          onCheckedChange={(checked) =>
                            updateDay(row.day_of_week, { is_working: !!checked })
                          }
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Input
                          type="time"
                          value={row.start_time}
                          onChange={(e) => updateDay(row.day_of_week, { start_time: e.target.value })}
                          disabled={!row.is_working}
                          className="w-28 mx-auto text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Input
                          type="time"
                          value={row.end_time}
                          onChange={(e) => updateDay(row.day_of_week, { end_time: e.target.value })}
                          disabled={!row.is_working}
                          className="w-28 mx-auto text-center"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button onClick={handleSave} disabled={bulkUpsert.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {bulkUpsert.isPending ? 'Saving…' : 'Save Schedule'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
