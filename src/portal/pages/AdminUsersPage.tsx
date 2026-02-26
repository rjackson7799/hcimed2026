import { useState, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserX, ImagePlus, Upload, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers, useDeactivateUser, useDeleteUser, useUploadPartnerLogo, useUpdateUser } from '@/portal/hooks/useUsers';
import { TableSkeleton } from '@/portal/components/shared/LoadingStates';
import { InviteUserDialog } from '@/portal/components/admin/InviteUserDialog';
import { formatDate, formatPhone } from '@/portal/utils/formatters';
import type { Profile } from '@/portal/types';

export function AdminUsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const deactivateUser = useDeactivateUser();
  const deleteUser = useDeleteUser();
  const uploadLogo = useUploadPartnerLogo();
  const updateUser = useUpdateUser();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [logoDialogUser, setLogoDialogUser] = useState<Profile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will no longer be able to log in.`)) return;
    try {
      await deactivateUser.mutateAsync(userId);
      toast.success(`${name} has been deactivated`);
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser.mutateAsync(userId);
      toast.success(`${name} has been deleted`);
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const openLogoDialog = (user: Profile) => {
    setLogoDialogUser(user);
    setSelectedFile(null);
    setPreview(user.logo_url ?? null);
    setCompanyName(user.company_name ?? '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2 MB');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveLogo = async () => {
    if (!logoDialogUser) return;

    try {
      if (selectedFile) {
        await uploadLogo.mutateAsync({
          userId: logoDialogUser.id,
          file: selectedFile,
          companyName: companyName || undefined,
        });
      } else if (companyName !== (logoDialogUser.company_name ?? '')) {
        // Only company name changed, no new file
        await updateUser.mutateAsync({
          id: logoDialogUser.id,
          company_name: companyName || null,
        });
      }
      toast.success('Partner branding updated');
      setLogoDialogUser(null);
    } catch (err) {
      console.error('Partner branding upload failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to update partner branding';
      toast.error(message);
    }
  };

  if (isLoading) return <TableSkeleton rows={5} />;
  if (error) return <p className="text-destructive">Failed to load users.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage staff, admin, provider, and broker accounts.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {u.role === 'broker' && u.logo_url && (
                      <img src={u.logo_url} alt="" className="h-6 w-6 rounded object-contain" />
                    )}
                    {u.full_name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{u.role}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.company_name || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {u.phone ? formatPhone(u.phone) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? 'default' : 'secondary'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(u.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {u.role === 'broker' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openLogoDialog(u)}
                        title="Manage partner branding"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    )}
                    {u.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(u.id, u.full_name)}
                        disabled={deactivateUser.isPending}
                        title="Deactivate user"
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    {!u.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u.id, u.full_name)}
                        disabled={deleteUser.isPending}
                        title="Permanently delete user"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Partner Logo Upload Dialog */}
      <Dialog open={!!logoDialogUser} onOpenChange={(open) => !open && setLogoDialogUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partner Branding</DialogTitle>
            <DialogDescription>
              Upload a logo and set the company name for {logoDialogUser?.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Regal IPA"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Logo preview" className="max-h-20 w-auto object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload logo</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WebP. Recommended: 200x60px or similar.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoDialogUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLogo}
              disabled={uploadLogo.isPending || updateUser.isPending}
            >
              {uploadLogo.isPending ? 'Uploading...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
