import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { cn } from "@hci/shared/lib/utils";

const APPEAR_DELAY_MS = 2500;

interface FriendsFamilyBubbleProps {
  onClick: () => void;
}

export function FriendsFamilyBubble({ onClick }: FriendsFamilyBubbleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Friends & Family discount details"
      className={cn(
        // Stacked above the AccessibilityControls floater (which sits at
        // bottom-24 / lg:bottom-6, right-6, h-14 w-14). We sit on the same
        // right edge but offset upward so the two never overlap.
        "fixed z-40 bottom-44 lg:bottom-24 right-6",
        "flex items-center gap-2 pl-3 pr-4 py-2.5",
        "rounded-full bg-secondary text-secondary-foreground",
        "shadow-lg hover:shadow-xl",
        "border border-secondary/50",
        "font-semibold text-sm",
        "transition-all duration-300",
        "hover:scale-105 hover:bg-secondary/90",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
        <Gift className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="leading-tight text-left">
        <span className="block text-[10px] font-bold tracking-wider uppercase opacity-80">
          HCI Patients
        </span>
        <span className="block text-sm font-bold">Save 15%</span>
      </span>
    </button>
  );
}
