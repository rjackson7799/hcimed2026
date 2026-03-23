import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hci/shared/ui/tabs';
import { Button } from '@hci/shared/ui/button';
import { Badge } from '@hci/shared/ui/badge';
import { CalendarPlus, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCalendarStaffing } from '@/hooks/useStaffCalendar';
import { usePendingApprovals } from '@/hooks/useStaffCalendar';
import { TodayStaffCard } from '@/components/staff-calendar/TodayStaffCard';
import { CoverageGapAlert } from '@/components/staff-calendar/CoverageGapAlert';
import { MonthlyCalendar } from '@/components/staff-calendar/MonthlyCalendar';
import { DayDetail } from '@/components/staff-calendar/DayDetail';
import { CalendarLegend } from '@/components/staff-calendar/CalendarLegend';
import { TimeOffRequestList } from '@/components/staff-calendar/TimeOffRequestList';
import { TimeOffRequestForm } from '@/components/staff-calendar/TimeOffRequestForm';
import { PendingApprovalsTable } from '@/components/staff-calendar/PendingApprovalsTable';
import { WeeklyScheduleEditor } from '@/components/staff-calendar/WeeklyScheduleEditor';
import { ScheduleOverrideDialog } from '@/components/staff-calendar/ScheduleOverrideDialog';

export function StaffCalendarPage() {
  const { role, profile } = useAuth();
  const isAdmin = role === 'admin';
  const isDirector = profile?.title === 'Medical Director';
  const canApprove = isAdmin || isDirector;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeOffFormOpen, setTimeOffFormOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);

  const { data: staffing, isLoading } = useCalendarStaffing(year, month);
  const { data: pendingRequests } = usePendingApprovals();
  const pendingCount = canApprove ? (pendingRequests?.length ?? 0) : 0;

  // Find today's staffing
  const todayStr = today.toISOString().split('T')[0];
  const todayStaffing = staffing?.find((d) => d.date === todayStr);

  // Find selected day's staffing
  const selectedDayStaffing = selectedDate
    ? staffing?.find((d) => d.date === selectedDate) ?? null
    : null;

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Calendar</h1>
          <p className="text-sm text-muted-foreground">
            View schedules, manage time off, and track coverage.
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setOverrideDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add Override
            </Button>
          )}
          <Button size="sm" onClick={() => setTimeOffFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Time Off
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="my-time-off">My Time Off</TabsTrigger>
          {canApprove && (
            <TabsTrigger value="approvals" className="gap-1.5">
              Pending Approvals
              {pendingCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="schedules">Manage Schedules</TabsTrigger>
          )}
        </TabsList>

        {/* Calendar tab */}
        <TabsContent value="calendar" className="space-y-4">
          <TodayStaffCard today={todayStaffing} isLoading={isLoading} />
          <CoverageGapAlert staffing={staffing ?? []} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            <div className="space-y-3">
              <MonthlyCalendar
                year={year}
                month={month}
                staffing={staffing ?? []}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
              <CalendarLegend />
            </div>
            <DayDetail day={selectedDayStaffing} />
          </div>
        </TabsContent>

        {/* My Time Off tab */}
        <TabsContent value="my-time-off" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setTimeOffFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
          </div>
          <TimeOffRequestList />
        </TabsContent>

        {/* Pending Approvals tab */}
        {canApprove && (
          <TabsContent value="approvals">
            <PendingApprovalsTable />
          </TabsContent>
        )}

        {/* Manage Schedules tab */}
        {isAdmin && (
          <TabsContent value="schedules" className="space-y-4">
            <WeeklyScheduleEditor />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <TimeOffRequestForm open={timeOffFormOpen} onOpenChange={setTimeOffFormOpen} />
      <ScheduleOverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        defaultDate={selectedDate ?? undefined}
      />
    </div>
  );
}
