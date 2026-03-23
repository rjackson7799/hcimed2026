import { Badge } from '@hci/shared/ui/badge';
import { Button } from '@hci/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hci/shared/ui/table';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { toast } from 'sonner';
import { useMyTimeOffRequests } from '@/hooks/useStaffCalendar';
import { useWithdrawTimeOffRequest } from '@/hooks/useStaffCalendarMutations';
import { TIME_OFF_TYPE_LABELS, type TimeOffType } from '@/types/staff-calendar';

const STATUS_BADGE_MAP: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending: { variant: 'secondary', label: 'Pending' },
  approved: { variant: 'default', label: 'Approved' },
  denied: { variant: 'destructive', label: 'Denied' },
  withdrawn: { variant: 'outline', label: 'Withdrawn' },
};

export function TimeOffRequestList() {
  const { data: requests, isLoading } = useMyTimeOffRequests();
  const withdrawMutation = useWithdrawTimeOffRequest();

  const handleWithdraw = async (requestId: string) => {
    try {
      await withdrawMutation.mutateAsync(requestId);
      toast.success('Request withdrawn');
    } catch (err) {
      toast.error('Failed to withdraw request');
      console.error(err);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!requests || requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        You haven't submitted any time off requests yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dates</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Director</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => {
            const statusInfo = STATUS_BADGE_MAP[r.effective_status] ?? STATUS_BADGE_MAP.pending;
            const adminInfo = STATUS_BADGE_MAP[r.admin_status] ?? STATUS_BADGE_MAP.pending;
            const directorInfo = STATUS_BADGE_MAP[r.director_status] ?? STATUS_BADGE_MAP.pending;

            return (
              <TableRow key={r.id}>
                <TableCell className="text-sm">
                  {r.start_date} — {r.end_date}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {TIME_OFF_TYPE_LABELS[r.time_off_type as TimeOffType] ?? r.time_off_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={adminInfo.variant} className="text-xs">
                    {adminInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={directorInfo.variant} className="text-xs">
                    {directorInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant} className="text-xs">
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.effective_status === 'pending' && r.status !== 'withdrawn' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleWithdraw(r.id)}
                      disabled={withdrawMutation.isPending}
                    >
                      Withdraw
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
