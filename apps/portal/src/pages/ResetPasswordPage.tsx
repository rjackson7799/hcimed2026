import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@hci/shared/ui/form';
import { Input } from '@hci/shared/ui/input';
import { Button } from '@hci/shared/ui/button';
import { Alert, AlertDescription } from '@hci/shared/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPageInner() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-gradient-to-br from-[hsl(207,44%,24%)] to-[hsl(199,67%,38%)]">
        <div className="max-w-md">
          <img src="/email/hci-logo.png" alt="HCI Medical Group" className="h-14 w-auto mb-6 brightness-0 invert" />
          <p className="text-xl text-blue-100 mb-2">
            Staff Portal
          </p>
          <p className="text-blue-200/80 text-sm leading-relaxed">
            Secure access to patient outreach tracking, project management,
            and operational tools for HCI Medical Group team members.
          </p>
        </div>
      </div>

      {/* Right side - reset form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-16 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile header */}
          <div className="mb-8 lg:hidden">
            <img src="/email/hci-logo.png" alt="HCI Medical Group" className="h-10 w-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary font-display">
              HCI Medical Group
            </h1>
            <p className="text-muted-foreground">Staff Portal</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Reset your password
            </h2>
            <p className="text-muted-foreground mt-1">
              Enter a new password for your account
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Password updated successfully. Redirecting to login...
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        New Password <span aria-hidden="true">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Confirm Password <span aria-hidden="true">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full min-h-[48px]"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
                  <span>Secured connection &middot; HIPAA compliant</span>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  return <ResetPasswordPageInner />;
}
