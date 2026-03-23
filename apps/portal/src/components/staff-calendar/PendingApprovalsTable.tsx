import { useState } from 'react';
import { Badge } from '@hci/shared/ui/badge';
import { Button } from '@hci/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hci/shared/ui/table';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePendingApprovals } from '@/hooks/useStaffCalendar';
import { useReviewTimeOffRequest } from '@/hooks/useStaffCalendarMutations';
import { useAuth } from '@/context/AuthContext';
import { TIME_OFF_TYPE_LABELS, APPROVAL_STATUS_LABELS, type TimeOffType } from '@/types/staff-calendar';
import type { CalTimeOffEffective } from '@/types/staff-calendar';
import { ApprovalDialog } from './ApprovalDialog';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  denied: 'destructive',
};

export function PendingApprovalsTable() {
  const { profile } = useAuth();
  const { data: pendingRequests, isLoading } = usePendingApprovals();
  const reviewMutation = useReviewTimeOffRequest();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<CalTimeOffEffective | null>(null);
  const [activeDecision, setActiveDecision] = useState<'approved' | 'denied'>('approved');

  const isDirector = profile?.title === 'Medical Director';
  const isAdmin = profile?.role === 'admin';
  const reviewerType = isDirector ? 'director' : 'admin';

  const openDialog = (request: CalTimeOffEffective, decision: 'approved' | 'denied') => {
    setActiveRequest(request);
    setActiveDecision(decision);
    setDialogOpen(true);
  };

  const handleConfirm = async (notes: string) => {
    if (!activeRequest || !profile) return;

    try {
      await reviewMutation.mutateAsync({
        requestId: activeRequest.id,
        reviewerType,
        decision: activeDecision,
        reviewerId: profile.id,
        reviewerNotes: notes || undefined,
        requesterName: activeRequest.requester_name,
      });
      toast.success(`Request ${activeDecision}`);
      setDialogOpen(false);
      setActiveRequest(null);
    } catch (err) {
      toast.error('Failed to process review');
      console.error(err);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No pending time off requests.
      </p>
    );
  }

  // Check if current user has already reviewed each request
  const hasReviewed = (r: CalTimeOffEffective) => {
    if (reviewerType === 'admin') return r.admin_status !== 'pending';
    return r.director_status !== 'pending';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Director</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRequests.map((r) => {
              const alreadyReviewed = hasReviewed(r);

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-sm">{r.requester_name}</TableCell>
                  <TableCell className="text-sm">
                    {r.start_date} — {r.end_date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {TIME_OFF_TYPE_LABELS[r.time_off_type as TimeOffType] ?? r.time_off_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.admin_status] ?? 'secondary'} className="text-xs">
                      {APPROVAL_STATUS_LABELS[r.admin_status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.director_status] ?? 'secondary'} className="text-xs">
                      {APPROVAL_STATUS_LABELS[r.director_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {r.notes ?? '—'}
                  </TableCell>
                  <TableCell>
                    {alreadyReviewed ? (
                      <span className="text-xs text-muted-foreground">Reviewed</span>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => openDialog(r, 'approved')}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDialog(r, 'denied')}
                          title="Deny"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {activeRequest && (
        <ApprovalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          decision={activeDecision}
          requesterName={activeRequest.requester_name}
          onConfirm={handleConfirm}
          isPending={reviewMutation.isPending}
        />
      )}
    </>
  );
}
