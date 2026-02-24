import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { internalMedicineLinks, seniorCareLinks } from "./nav-data";

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  const [internalMedicineOpen, setInternalMedicineOpen] = useState(false);
  const [seniorCareOpen, setSeniorCareOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="lg:hidden fixed inset-0 top-[104px] bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        id="mobile-navigation"
        className="lg:hidden border-t border-border bg-background relative z-50"
        aria-label="Mobile navigation"
      >
        <div className="container py-4 space-y-1">
          <Link
            to="/"
            className="block py-3 px-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors touch-target"
          >
            Home
          </Link>
          <Link
            to="/our-story"
            className="block py-3 px-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors touch-target"
          >
            Our Story
          </Link>

          <div className="space-y-1">
            <button
              onClick={() => setInternalMedicineOpen(!internalMedicineOpen)}
              className="flex items-center justify-between w-full py-3 px-2 font-medium text-foreground hover:bg-accent/50 rounded-md transition-colors touch-target"
              aria-expanded={internalMedicineOpen}
            >
              <span>Internal Medicine</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  internalMedicineOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            <div
              className={cn(
                "pl-4 space-y-1 overflow-hidden transition-all duration-200",
                internalMedicineOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {internalMedicineLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors touch-target"
                  >
                    <IconComponent className="h-5 w-5 text-primary/70" aria-hidden="true" />
                    <span>{link.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSeniorCareOpen(!seniorCareOpen)}
              className="flex items-center justify-between w-full py-3 px-2 font-medium text-foreground hover:bg-accent/50 rounded-md transition-colors touch-target"
              aria-expanded={seniorCareOpen}
            >
              <span>Senior Care</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  seniorCareOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            <div
              className={cn(
                "pl-4 space-y-1 overflow-hidden transition-all duration-200",
                seniorCareOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {seniorCareLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-secondary hover:bg-accent/50 rounded-md transition-colors touch-target"
                  >
                    <IconComponent className="h-5 w-5 text-secondary/70" aria-hidden="true" />
                    <span>{link.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            to="/faq"
            className="block py-3 px-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors touch-target"
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            className="block py-3 px-2 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors touch-target"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-border space-y-2">
            <a
              href={`tel:${siteConfig.contact.phoneRaw}`}
              className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground hover:text-primary transition-colors touch-target"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{siteConfig.contact.phone}</span>
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground hover:text-primary transition-colors touch-target"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>{siteConfig.contact.email}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground min-h-[48px]">
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </a>
            </Button>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground min-h-[48px]">
              <Link to="/appointments">Request</Link>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}
