import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Loader2, AlertCircle, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      { redirectTo: `${window.location.origin}/reset-password` },
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setEmailSent(true);
    setIsSubmitting(false);
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

      {/* Right side - forgot password form */}
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
              Forgot your password?
            </h2>
            <p className="text-muted-foreground mt-1">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6">
              <Alert>
                <Mail className="h-4 w-4 text-primary" />
                <AlertDescription>
                  If an account exists with that email, you'll receive a password reset link shortly. Check your inbox and spam folder.
                </AlertDescription>
              </Alert>

              <Link
                to="/login"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span aria-hidden="true">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          placeholder="you@hcimed.com"
                          autoComplete="email"
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>

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
