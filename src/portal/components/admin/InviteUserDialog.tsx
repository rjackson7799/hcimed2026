import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useInviteUser } from '@/portal/hooks/useUsers';
import { inviteUserSchema, type InviteUserFormData } from '@/portal/schemas/inviteUserSchema';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', description: 'Full system access' },
  { value: 'staff', label: 'Staff', description: 'Patient queue & call logging' },
  { value: 'provider', label: 'Provider', description: 'Patient queue (physician access)' },
  { value: 'broker', label: 'Broker', description: 'Forwarded patient management' },
] as const;

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const inviteUser = useInviteUser();
  const [result, setResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { full_name: '', email: '', role: undefined },
  });

  const onSubmit = async (data: InviteUserFormData) => {
    setError(null);
    try {
      const response = await inviteUser.mutateAsync(data);
      setResult({
        email: data.email,
        password: response.temporary_password,
      });
      toast.success(`${data.full_name} has been invited as ${data.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user');
    }
  };

  const handleCopyCredentials = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(
      `Email: ${result.email}\nTemporary Password: ${result.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    form.reset();
    setResult(null);
    setError(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{result ? 'User Created' : 'Invite User'}</DialogTitle>
          <DialogDescription>
            {result
              ? 'Share these credentials securely with the new user.'
              : 'Create a new portal account. A temporary password will be generated.'}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm space-y-1">
              <p><span className="text-muted-foreground">Email:</span> {result.email}</p>
              <p><span className="text-muted-foreground">Password:</span> {result.password}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleCopyCredentials}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Credentials'}
            </Button>
            <p className="text-xs text-muted-foreground">
              The user should change their password after first login.
            </p>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@hcimed.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span>{option.label}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              — {option.description}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteUser.isPending}>
                  {inviteUser.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
