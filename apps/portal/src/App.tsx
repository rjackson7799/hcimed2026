import { Suspense, lazy } from "react";
import { Toaster } from "@hci/shared/ui/sonner";
import { TooltipProvider } from "@hci/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PortalRedirect } from "@/components/auth/PortalRedirect";
import { AppShell } from "@/components/layout/AppShell";

// Login pages (no auth required)
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const PartnerLoginPage = lazy(() => import("@/pages/PartnerLoginPage").then(m => ({ default: m.PartnerLoginPage })));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));

// Admin pages
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminProjectsPage = lazy(() => import("@/pages/AdminProjectsPage").then(m => ({ default: m.AdminProjectsPage })));
const AdminProjectDetailPage = lazy(() => import("@/pages/AdminProjectDetailPage").then(m => ({ default: m.AdminProjectDetailPage })));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminAuditLogPage = lazy(() => import("@/pages/AdminAuditLogPage").then(m => ({ default: m.AdminAuditLogPage })));
const PracticeHealthPage = lazy(() => import("@/pages/PracticeHealthPage").then(m => ({ default: m.PracticeHealthPage })));
const MobileDocsPage = lazy(() => import("@/components/mobile-docs/MobileDocsPage").then(m => ({ default: m.MobileDocsPage })));
const AwvTrackerPage = lazy(() => import("@/components/awv-tracker/AwvTrackerPage").then(m => ({ default: m.AwvTrackerPage })));
const CcmRpmPage = lazy(() => import("@/components/ccm-rpm/CcmRpmPage").then(m => ({ default: m.CcmRpmPage })));
const StaffCalendarPage = lazy(() => import("@/pages/StaffCalendarPage").then(m => ({ default: m.StaffCalendarPage })));

// Staff & Broker pages
const StaffDashboardPage = lazy(() => import("@/pages/StaffDashboardPage").then(m => ({ default: m.StaffDashboardPage })));
const BrokerDashboardPage = lazy(() => import("@/pages/BrokerDashboardPage").then(m => ({ default: m.BrokerDashboardPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
          <Routes>
            {/* Login routes (no auth) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/partner-login" element={<PartnerLoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated routes */}
            <Route element={<AuthProvider><AuthGuard /></AuthProvider>}>
              <Route path="/" element={<PortalRedirect />} />

              {/* Portal routes with sidebar layout */}
              <Route element={<AppShell />}>
                {/* Admin routes */}
                <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminDashboardPage /></RoleGuard>} />
                <Route path="/admin/projects" element={<RoleGuard allowedRoles={['admin']}><AdminProjectsPage /></RoleGuard>} />
                <Route path="/admin/projects/:id" element={<RoleGuard allowedRoles={['admin']}><AdminProjectDetailPage /></RoleGuard>} />
                <Route path="/admin/users" element={<RoleGuard allowedRoles={['admin']}><AdminUsersPage /></RoleGuard>} />
                <Route path="/admin/audit-log" element={<RoleGuard allowedRoles={['admin']}><AdminAuditLogPage /></RoleGuard>} />
                <Route path="/admin/practice-health" element={<RoleGuard allowedRoles={['admin']}><PracticeHealthPage /></RoleGuard>} />
                <Route path="/admin/mobile-docs" element={<RoleGuard allowedRoles={['admin']}><MobileDocsPage /></RoleGuard>} />
                <Route path="/admin/awv-tracker" element={<RoleGuard allowedRoles={['admin', 'staff']}><AwvTrackerPage /></RoleGuard>} />
                <Route path="/admin/ccm-rpm" element={<RoleGuard allowedRoles={['admin', 'staff']}><CcmRpmPage /></RoleGuard>} />
                <Route path="/admin/calendar" element={<RoleGuard allowedRoles={['admin', 'staff', 'provider']}><StaffCalendarPage /></RoleGuard>} />

                {/* Staff routes */}
                <Route path="/staff" element={<RoleGuard allowedRoles={['admin', 'staff', 'provider']}><StaffDashboardPage /></RoleGuard>} />

                {/* Broker routes */}
                <Route path="/broker" element={<RoleGuard allowedRoles={['broker']}><BrokerDashboardPage /></RoleGuard>} />
              </Route>

              {/* Catch-all → redirect based on role */}
              <Route path="*" element={<PortalRedirect />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
