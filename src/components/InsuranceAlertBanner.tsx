import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "hci-insurance-alert-dismissed-v1";

export function InsuranceAlertBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "bg-accent border-b-2 border-secondary",
        "animate-fade-in"
      )}
      role="region"
      aria-label="Insurance update announcement"
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden sm:flex w-8 h-8 rounded-full bg-secondary/20 items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-secondary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to="/insurance-update"
                className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"
              >
                <span className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Important Insurance Update
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-secondary/80 transition-colors truncate">
                  HCI Medical Group is joining Regal Medical Group
                </span>
                <span className="text-secondary font-medium text-sm underline-offset-2 group-hover:underline hidden md:inline">
                  Learn more
                </span>
              </Link>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 hover:bg-secondary/20"
            onClick={handleDismiss}
            aria-label="Dismiss insurance update notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
