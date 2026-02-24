import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveUsers } from '@/portal/hooks/useUsers';
import { useProjectAssignments, useAssignUser, useUnassignUser } from '@/portal/hooks/useProjectAssignments';
import { useAuth } from '@/portal/context/AuthContext';

interface StaffAssignmentProps {
  projectId: string;
}

export function StaffAssignment({ projectId }: StaffAssignmentProps) {
  const { user } = useAuth();
  const { data: staffUsers, isLoading: loadingUsers } = useActiveUsers('staff');
  const { data: assignments, isLoading: loadingAssignments } = useProjectAssignments(projectId);
  const assignUser = useAssignUser();
  const unassignUser = useUnassignUser();

  const assignedUserIds = new Set(assignments?.map((a: any) => a.user_id) || []);

  const handleAssign = async (userId: string) => {
    try {
      await assignUser.mutateAsync({
        project_id: projectId,
        user_id: userId,
        role_in_project: 'staff',
        assigned_by: user!.id,
      });
      toast.success('Staff member assigned');
    } catch {
      toast.error('Failed to assign staff member');
    }
  };

  const handleUnassign = async (userId: string) => {
    try {
      await unassignUser.mutateAsync({ projectId, userId });
      toast.success('Staff member unassigned');
    } catch {
      toast.error('Failed to unassign staff member');
    }
  };

  if (loadingUsers || loadingAssignments) {
    return <Card><CardContent className="p-6"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Staff Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {staffUsers && staffUsers.length > 0 ? (
          <div className="space-y-2">
            {staffUsers.map((staffUser) => {
              const isAssigned = assignedUserIds.has(staffUser.id);
              return (
                <div
                  key={staffUser.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {staffUser.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{staffUser.full_name}</p>
                      <p className="text-xs text-muted-foreground">{staffUser.email}</p>
                    </div>
                  </div>
                  {isAssigned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnassign(staffUser.id)}
                      disabled={unassignUser.isPending}
                    >
                      <UserMinus className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAssign(staffUser.id)}
                      disabled={assignUser.isPending}
                    >
                      <UserPlus className="mr-1 h-3 w-3" />
                      Assign
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No staff users available. Create staff accounts first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
