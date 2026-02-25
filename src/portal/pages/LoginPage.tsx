import { Navigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { LoginForm } from '@/portal/components/auth/LoginForm';
import { AuthProvider, useAuth } from '@/portal/context/AuthContext';

function LoginPageInner() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <>
      <SEO
        title="Staff Portal Login | HCI Medical Group"
        description="Secure login for HCI Medical Group staff and administrators."
        noIndex
      />
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

        {/* Right side - login form */}
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

            <div className="mb-8 hidden lg:block">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome back
              </h2>
              <p className="text-muted-foreground mt-1">
                Sign in to your staff account
              </p>
            </div>

            <LoginForm variant="hci" />
          </div>
        </div>
      </div>
    </>
  );
}

export function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageInner />
    </AuthProvider>
  );
}
