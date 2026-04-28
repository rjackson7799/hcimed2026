import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@hci/shared/ui/dialog";
import { Button } from "@hci/shared/ui/button";
import { Gift } from "lucide-react";

const STORAGE_KEY = "hci-ff-popup-seen";
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PAGE_GRACE_MS = 8000;
const MOBILE_BREAKPOINT = 768;
const MOBILE_SCROLL_TRIGGER_DEPTH = 0.5;
const MOBILE_SCROLL_UP_DELTA = 80;

function trackEvent(name: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, { event_category: "engagement" });
  }
}

interface FriendsFamilyPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaim: () => void;
}

export function FriendsFamilyPopup({
  open,
  onOpenChange,
  onClaim,
}: FriendsFamilyPopupProps) {
  const triggeredRef = useRef(false);
  const mountedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip auto-trigger if recently dismissed (the bubble can still force-open it)
    const seenRaw = localStorage.getItem(STORAGE_KEY);
    if (seenRaw) {
      const seenAt = new Date(seenRaw).getTime();
      if (!Number.isNaN(seenAt) && Date.now() - seenAt < DISMISS_DURATION_MS) {
        return;
      }
    }

    const trigger = () => {
      if (triggeredRef.current) return;
      if (Date.now() - mountedAtRef.current < PAGE_GRACE_MS) return;
      triggeredRef.current = true;
      onOpenChange(true);
      trackEvent("ff_popup_shown");
    };

    const isMobile = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;

    // Desktop: exit-intent (mouse leaves through the top of the viewport)
    const onMouseOut = (e: MouseEvent) => {
      if (isMobile()) return;
      if (e.relatedTarget) return; // moved to another element, not out
      if (e.clientY > 0) return; // not exiting through top
      trigger();
    };

    // Mobile: rapid scroll-up after passing 50% depth
    let lastY = window.scrollY;
    let maxDepth = 0;
    const onScroll = () => {
      if (!isMobile()) {
        lastY = window.scrollY;
        return;
      }
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = window.scrollY / docHeight;
        if (depth > maxDepth) maxDepth = depth;
      }
      const delta = lastY - window.scrollY;
      lastY = window.scrollY;
      if (maxDepth >= MOBILE_SCROLL_TRIGGER_DEPTH && delta >= MOBILE_SCROLL_UP_DELTA) {
        trigger();
      }
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onOpenChange]);

  function persistDismissal() {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore (storage disabled / private mode)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && open) {
      persistDismissal();
      trackEvent("ff_popup_dismissed");
    }
    onOpenChange(next);
  }

  function handleClaim() {
    persistDismissal();
    trackEvent("ff_popup_cta_click");
    onOpenChange(false);
    onClaim();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        <div className="hero-gradient text-primary-foreground px-6 pt-7 pb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <Gift className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-80 mb-1">
            For Our HCI Patients
          </p>
          <h2 className="font-display text-2xl font-bold leading-tight">
            A Special Gift —{" "}
            <span className="text-white">15% Off</span>
          </h2>
        </div>
        <div className="px-6 pb-6 pt-5 text-center">
          <p className="text-sm text-foreground leading-relaxed mb-3">
            As a thank-you to our HCI patients, save{" "}
            <strong>15% on our new Medical Weight Loss and TRT programs</strong> — for
            you, your family, and your friends.
          </p>
          <div className="bg-accent border border-secondary/30 rounded-md px-4 py-2.5 mb-5">
            <p className="text-xs font-semibold text-foreground">
              Limited Time —{" "}
              <span className="text-secondary">
                New patients must register by May 31, 2026
              </span>
            </p>
          </div>
          <Button
            onClick={handleClaim}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground min-h-[48px] text-base font-semibold"
          >
            Claim Your 15% →
          </Button>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
