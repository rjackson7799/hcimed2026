import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { Toaster } from "@hci/shared/ui/sonner";
import { TooltipProvider } from "@hci/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Eagerly load homepage for fast initial render
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load all other pages
const OurStory = lazyWithRetry(() => import("./pages/OurStory"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));

// Internal Medicine Pages
const PhysicalExams = lazyWithRetry(() => import("./pages/internal-medicine/PhysicalExams"));
const AcuteCare = lazyWithRetry(() => import("./pages/internal-medicine/AcuteCare"));
const WomensHealth = lazyWithRetry(() => import("./pages/internal-medicine/WomensHealth"));
const MensHealth = lazyWithRetry(() => import("./pages/internal-medicine/MensHealth"));
const Diagnostics = lazyWithRetry(() => import("./pages/internal-medicine/Diagnostics"));

// Senior Care Pages
const SeniorCarePlus = lazyWithRetry(() => import("./pages/SeniorCarePlus"));
const PreventionWellness = lazyWithRetry(() => import("./pages/senior-care/PreventionWellness"));
const ChronicCare = lazyWithRetry(() => import("./pages/senior-care/ChronicCare"));
const TransitionCare = lazyWithRetry(() => import("./pages/senior-care/TransitionCare"));
const RemoteMonitoring = lazyWithRetry(() => import("./pages/senior-care/RemoteMonitoring"));

// Other Pages
const Careers = lazyWithRetry(() => import("./pages/Careers"));
const Appointments = lazyWithRetry(() => import("./pages/Appointments"));
const InsuranceUpdate = lazyWithRetry(() => import("./pages/InsuranceUpdate"));

// Blog Pages
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));

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
