import { Navigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { LoginForm } from '@/portal/components/auth/LoginForm';
import { AuthProvider, useAuth } from '@/portal/context/AuthContext';

function PartnerLoginInner() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <>
      <SEO
        title="Partner Portal Login | HCI Medical Group"
        description="Secure login for HCI Medical Group insurance broker partners."
        noIndex
      />
      <div className="flex min-h-screen">
        {/* Left side - branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-gradient-to-br from-slate-700 to-slate-900">
          <div className="max-w-md">
            <img src="/email/hci-logo.png" alt="HCI Medical Group" className="h-14 w-auto mb-6 brightness-0 invert" />
            <h1 className="text-4xl font-bold text-white font-display mb-4">
              Partner Portal
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Insurance Broker Access
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              View forwarded patients, update transition status, and
              communicate with the HCI Medical Group team.
            </p>
          </div>
        </div>

        {/* Right side - login form */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-16 bg-white">
          <div className="mx-auto w-full max-w-sm">
            {/* Mobile header */}
            <div className="mb-8 lg:hidden">
              <img src="/email/hci-logo.png" alt="HCI Medical Group" className="h-10 w-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-800 font-display">
                Partner Portal
              </h1>
              <p className="text-muted-foreground">Insurance Broker Access</p>
            </div>

            <div className="mb-8 hidden lg:block">
              <h2 className="text-2xl font-semibold text-foreground">
                Partner Sign In
              </h2>
              <p className="text-muted-foreground mt-1">
                Access your broker dashboard
              </p>
            </div>

            <LoginForm variant="partner" />
          </div>
        </div>
      </div>
    </>
  );
}

export function PartnerLoginPage() {
  return (
    <AuthProvider>
      <PartnerLoginInner />
    </AuthProvider>
  );
}
