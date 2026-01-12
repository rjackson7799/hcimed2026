import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AccessibilityControls } from "@/components/AccessibilityControls";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />

      {/* Floating accessibility controls */}
      <AccessibilityControls />
    </div>
  );
}