import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Eagerly load homepage for fast initial render
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load all other pages
const OurStory = lazy(() => import("./pages/OurStory"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));

// Internal Medicine Pages
const PhysicalExams = lazy(() => import("./pages/internal-medicine/PhysicalExams"));
const AcuteCare = lazy(() => import("./pages/internal-medicine/AcuteCare"));
const WomensHealth = lazy(() => import("./pages/internal-medicine/WomensHealth"));
const MensHealth = lazy(() => import("./pages/internal-medicine/MensHealth"));
const Diagnostics = lazy(() => import("./pages/internal-medicine/Diagnostics"));

// Senior Care Pages
const SeniorCarePlus = lazy(() => import("./pages/SeniorCarePlus"));
const PreventionWellness = lazy(() => import("./pages/senior-care/PreventionWellness"));
const ChronicCare = lazy(() => import("./pages/senior-care/ChronicCare"));
const TransitionCare = lazy(() => import("./pages/senior-care/TransitionCare"));
const RemoteMonitoring = lazy(() => import("./pages/senior-care/RemoteMonitoring"));

// Other Pages
const Careers = lazy(() => import("./pages/Careers"));
const Appointments = lazy(() => import("./pages/Appointments"));
const InsuranceUpdate = lazy(() => import("./pages/InsuranceUpdate"));

// Blog Pages
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// Portal Pages (lazy-loaded, isolated from public site)
const LoginPage = lazy(() => import("@/portal/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const PartnerLoginPage = lazy(() => import("@/portal/pages/PartnerLoginPage").then(m => ({ default: m.PartnerLoginPage })));
const AdminDashboardPage = lazy(() => import("@/portal/pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const StaffDashboardPage = lazy(() => import("@/portal/pages/StaffDashboardPage").then(m => ({ default: m.StaffDashboardPage })));
const BrokerDashboardPage = lazy(() => import("@/portal/pages/BrokerDashboardPage").then(m => ({ default: m.BrokerDashboardPage })));
const AdminProjectsPage = lazy(() => import("@/portal/pages/AdminProjectsPage").then(m => ({ default: m.AdminProjectsPage })));
const AdminProjectDetailPage = lazy(() => import("@/portal/pages/AdminProjectDetailPage").then(m => ({ default: m.AdminProjectDetailPage })));
const AdminUsersPage = lazy(() => import("@/portal/pages/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminAuditLogPage = lazy(() => import("@/portal/pages/AdminAuditLogPage").then(m => ({ default: m.AdminAuditLogPage })));

// Portal Auth Components
import { AuthProvider } from "@/portal/context/AuthContext";
import { AuthGuard } from "@/portal/components/auth/AuthGuard";
import { RoleGuard } from "@/portal/components/auth/RoleGuard";
import { PortalRedirect } from "@/portal/components/auth/PortalRedirect";
import { AppShell } from "@/portal/components/layout/AppShell";

const queryClient = new QueryClient();

const App = () => (
  <AccessibilityProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />

              {/* Internal Medicine Routes */}
              <Route path="/internal-medicine/physical-exams" element={<PhysicalExams />} />
              <Route path="/internal-medicine/acute-care" element={<AcuteCare />} />
              <Route path="/internal-medicine/womens-health" element={<WomensHealth />} />
              <Route path="/internal-medicine/mens-health" element={<MensHealth />} />
              <Route path="/internal-medicine/diagnostics" element={<Diagnostics />} />

              {/* Senior Care Routes */}
              <Route path="/senior-care-plus" element={<SeniorCarePlus />} />
              <Route path="/senior-care/prevention-wellness" element={<PreventionWellness />} />
              <Route path="/senior-care/chronic-care" element={<ChronicCare />} />
              <Route path="/senior-care/transition-care" element={<TransitionCare />} />
              <Route path="/senior-care/remote-monitoring" element={<RemoteMonitoring />} />

              {/* Careers */}
              <Route path="/careers" element={<Careers />} />

              {/* Appointments */}
              <Route path="/appointments" element={<Appointments />} />

              {/* Insurance Update */}
              <Route path="/insurance-update" element={<InsuranceUpdate />} />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Portal Login Routes (no public layout) */}
              <Route path="/hci-login" element={<LoginPage />} />
              <Route path="/partner-login" element={<PartnerLoginPage />} />

              {/* Portal Authenticated Routes */}
              <Route element={<AuthProvider><AuthGuard /></AuthProvider>}>
                <Route path="/portal" element={<PortalRedirect />} />
                {/* Portal routes with sidebar layout */}
                <Route element={<AppShell />}>
                  {/* Admin routes — admin only */}
                  <Route path="/portal/admin" element={<RoleGuard allowedRoles={['admin']}><AdminDashboardPage /></RoleGuard>} />
                  <Route path="/portal/admin/projects" element={<RoleGuard allowedRoles={['admin']}><AdminProjectsPage /></RoleGuard>} />
                  <Route path="/portal/admin/projects/:id" element={<RoleGuard allowedRoles={['admin']}><AdminProjectDetailPage /></RoleGuard>} />
                  <Route path="/portal/admin/users" element={<RoleGuard allowedRoles={['admin']}><AdminUsersPage /></RoleGuard>} />
                  <Route path="/portal/admin/audit-log" element={<RoleGuard allowedRoles={['admin']}><AdminAuditLogPage /></RoleGuard>} />
                  {/* Staff routes — admin, staff, and providers can access */}
                  <Route path="/portal/staff" element={<RoleGuard allowedRoles={['admin', 'staff', 'provider']}><StaffDashboardPage /></RoleGuard>} />
                  {/* Broker routes — broker only */}
                  <Route path="/portal/broker" element={<RoleGuard allowedRoles={['broker']}><BrokerDashboardPage /></RoleGuard>} />
                </Route>
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AccessibilityProvider>
);

export default App;
