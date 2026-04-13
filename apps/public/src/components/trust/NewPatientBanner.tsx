import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';

const STORAGE_KEY = 'hci-banner-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function NewPatientBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
      return;
    }
    const dismissedAt = new Date(dismissed).getTime();
    if (Date.now() - dismissedAt > DISMISS_DURATION_MS) {
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="bg-secondary text-secondary-foreground">
      <div className="container py-3 flex items-center justify-between gap-4">
        <p className="text-sm md:text-base font-medium text-center flex-1">
          Now Accepting New Patients — Schedule Your Visit Today
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-secondary-foreground/40 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary"
          >
            <Link to="/appointments">Request Appointment</Link>
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-secondary-foreground/20 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
