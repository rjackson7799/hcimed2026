import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import OurStory from "./pages/OurStory";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

// Internal Medicine Pages
import PhysicalExams from "./pages/internal-medicine/PhysicalExams";
import WomensHealth from "./pages/internal-medicine/WomensHealth";
import MensHealth from "./pages/internal-medicine/MensHealth";
import Diagnostics from "./pages/internal-medicine/Diagnostics";

// Senior Care Pages
import PreventionWellness from "./pages/senior-care/PreventionWellness";
import ChronicCare from "./pages/senior-care/ChronicCare";
import TransitionCare from "./pages/senior-care/TransitionCare";
import RemoteMonitoring from "./pages/senior-care/RemoteMonitoring";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          
          {/* Internal Medicine Routes */}
          <Route path="/internal-medicine/physical-exams" element={<PhysicalExams />} />
          <Route path="/internal-medicine/womens-health" element={<WomensHealth />} />
          <Route path="/internal-medicine/mens-health" element={<MensHealth />} />
          <Route path="/internal-medicine/diagnostics" element={<Diagnostics />} />
          
          {/* Senior Care Routes */}
          <Route path="/senior-care/prevention-wellness" element={<PreventionWellness />} />
          <Route path="/senior-care/chronic-care" element={<ChronicCare />} />
          <Route path="/senior-care/transition-care" element={<TransitionCare />} />
          <Route path="/senior-care/remote-monitoring" element={<RemoteMonitoring />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;