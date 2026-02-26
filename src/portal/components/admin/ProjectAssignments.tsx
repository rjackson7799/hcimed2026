import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserMinus, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveUsers } from '@/portal/hooks/useUsers';
import { useProjectAssignments, useAssignUser, useUnassignUser } from '@/portal/hooks/useProjectAssignments';
import { useAuth } from '@/portal/context/AuthContext';
import type { Profile } from '@/portal/types';

interface ProjectAssignmentsProps {
  projectId: string;
}

export function ProjectAssignments({ projectId }: ProjectAssignmentsProps) {
  const { user } = useAuth();
  const { data: assignableUsers, isLoading: loadingUsers } = useActiveUsers(['staff', 'broker']);
  const { data: assignments, isLoading: loadingAssignments } = useProjectAssignments(projectId);
  const assignUser = useAssignUser();
  const unassignUser = useUnassignUser();

  const assignedUserIds = new Set(assignments?.map((a: any) => a.user_id) || []);

  const handleAssign = async (u: Profile) => {
    try {
      await assignUser.mutateAsync({
        project_id: projectId,
        user_id: u.id,
        role_in_project: u.role as 'staff' | 'broker',
        assigned_by: user!.id,
      });
      toast.success(`${u.full_name} assigned`);
    } catch {
      toast.error('Failed to assign user');
    }
  };

  const handleUnassign = async (userId: string, name: string) => {
    try {
      await unassignUser.mutateAsync({ projectId, userId });
      toast.success(`${name} removed`);
    } catch {
      toast.error('Failed to remove user');
    }
  };

  if (loadingUsers || loadingAssignments) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const brokers = (assignableUsers || []).filter((u) => u.role === 'broker');
  const staff = (assignableUsers || []).filter((u) => u.role === 'staff');

  const renderGroup = (
    users: Profile[],
    groupLabel: string,
    roleLabel: string,
    roleBadgeVariant: 'default' | 'secondary'
  ) => {
    if (users.length === 0) return null;
    return (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {groupLabel}
        </p>
        <div className="space-y-2">
          {users.map((u) => {
            const isAssigned = assignedUserIds.has(u.id);
            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {u.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{u.full_name}</p>
                      <Badge variant={roleBadgeVariant} className="text-xs">
                        {roleLabel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                {isAssigned ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassign(u.id, u.full_name)}
                    disabled={unassignUser.isPending}
                  >
                    <UserMinus className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAssign(u)}
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
      </div>
    );
  };

  const hasNoUsers = brokers.length === 0 && staff.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {hasNoUsers ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No staff or broker users available.
          </p>
        ) : (
          <div className="space-y-5">
            {renderGroup(brokers, 'Brokers', 'Broker', 'default')}
            {renderGroup(staff, 'Staff', 'Staff', 'secondary')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
