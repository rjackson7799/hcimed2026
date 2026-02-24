import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers, useDeactivateUser } from '@/portal/hooks/useUsers';
import { TableSkeleton } from '@/portal/components/shared/LoadingStates';
import { formatDate } from '@/portal/utils/formatters';

export function AdminUsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const deactivateUser = useDeactivateUser();

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will no longer be able to log in.`)) return;
    try {
      await deactivateUser.mutateAsync(userId);
      toast.success(`${name} has been deactivated`);
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  if (isLoading) return <TableSkeleton rows={5} />;
  if (error) return <p className="text-destructive">Failed to load users.</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">User Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage staff, admin, and broker accounts. Users are created via Supabase Auth.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{u.role}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={u.is_active ? 'default' : 'secondary'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatDate(u.created_at)}
                </TableCell>
                <TableCell>
                  {u.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeactivate(u.id, u.full_name)}
                      disabled={deactivateUser.isPending}
                    >
                      <UserX className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
