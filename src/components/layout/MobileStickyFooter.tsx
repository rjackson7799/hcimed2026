import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function MobileStickyFooter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-md border-t border-border shadow-lg",
        "transform transition-transform duration-300 ease-out",
        "pb-[env(safe-area-inset-bottom)]",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      role="complementary"
      aria-label="Quick actions"
    >
      <div className="container py-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-h-[48px] font-medium"
          >
            <a href={`tel:${siteConfig.contact.phoneRaw}`}>
              <Phone className="h-5 w-5 mr-2" aria-hidden="true" />
              Call Now
            </a>
          </Button>
          <Button
            asChild
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground min-h-[48px] font-medium"
          >
            <Link to="/appointments">
              <Calendar className="h-5 w-5 mr-2" aria-hidden="true" />
              Schedule
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
