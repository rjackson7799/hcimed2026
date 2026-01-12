import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "hci-cookie-consent";
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

function loadGoogleAnalytics() {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;

  // Load gtag script
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_TRACKING_ID, {
    anonymize_ip: true,
  });
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);

    if (consent === "accepted") {
      loadGoogleAnalytics();
    } else if (consent === null) {
      // Show banner if no choice made yet
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setIsVisible(false);
    loadGoogleAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-md",
        "transform transition-all duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-description"
    >
      <div className="bg-card border border-border shadow-xl m-4 rounded-xl p-4 lg:m-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-display font-semibold text-foreground">
            We value your privacy
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-1"
            onClick={handleDecline}
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p id="cookie-description" className="text-sm text-muted-foreground mb-4">
          We use cookies to analyze site traffic and improve your experience.
          By clicking "Accept", you consent to our use of analytics cookies.{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="flex-1"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
