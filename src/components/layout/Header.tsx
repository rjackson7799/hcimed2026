import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, Phone, Mail, ChevronDown,
  Stethoscope, Zap, HeartPulse, UserRound, Microscope,
  Heart, Shield, Activity, Home, Smartphone,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import hciLogo from "@/assets/hci-logo.png";

interface NavLink {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

const internalMedicineLinks: NavLink[] = [
  { title: "Physical Exams", href: "/internal-medicine/physical-exams", description: "Comprehensive annual wellness visits", icon: Stethoscope },
  { title: "Acute Care", href: "/internal-medicine/acute-care", description: "Illness, infections & minor injuries", icon: Zap },
  { title: "Women's Health", href: "/internal-medicine/womens-health", description: "Preventive screenings & hormonal health", icon: HeartPulse },
  { title: "Men's Health", href: "/internal-medicine/mens-health", description: "Prostate health & cardiovascular screening", icon: UserRound },
  { title: "Diagnostics", href: "/internal-medicine/diagnostics", description: "In-office testing & lab services", icon: Microscope },
];

const seniorCareLinks: NavLink[] = [
  { title: "Senior Care+ Program", href: "/senior-care-plus", description: "Our comprehensive senior care management program", icon: Heart },
  { title: "Prevention & Wellness", href: "/senior-care/prevention-wellness", description: "Age-appropriate screenings & vaccinations", icon: Shield },
  { title: "Chronic Care Management", href: "/senior-care/chronic-care", description: "Diabetes, hypertension & heart disease", icon: Activity },
  { title: "Transition of Care", href: "/senior-care/transition-care", description: "Hospital discharge support", icon: Home },
  { title: "Remote Monitoring", href: "/senior-care/remote-monitoring", description: "Telehealth & remote patient monitoring", icon: Smartphone },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalMedicineOpen, setInternalMedicineOpen] = useState(false);
  const [seniorCareOpen, setSeniorCareOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Close mobile menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile menu and reset accordions on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setInternalMedicineOpen(false);
    setSeniorCareOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top bar with contact info */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:626-792-4185" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="h-3.5 w-3.5" />
              <span>626-792-4185</span>
            </a>
            <a href="mailto:care@hcimed.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Mail className="h-3.5 w-3.5" />
              <span>care@hcimed.com</span>
            </a>
          </div>
          <div className="text-primary-foreground/80">
            Mon - Fri: 9AM - 5PM
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={hciLogo} alt="HCI Medical Group" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  isActive("/") && location.pathname === "/" && "bg-accent text-accent-foreground"
                )}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/our-story">
                <NavigationMenuLink className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  isActive("/our-story") && "bg-accent text-accent-foreground"
                )}>
                  Our Story
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(isActive("/internal-medicine") && "bg-accent text-accent-foreground")}>
                Internal Medicine
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-2 p-4 md:w-[540px] md:grid-cols-2">
                  {internalMedicineLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={link.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.href}
                            className="flex items-start gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <IconComponent className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div className="pt-0.5">
                              <div className="text-sm font-medium leading-none mb-1.5">{link.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn((isActive("/senior-care") || isActive("/senior-care-plus")) && "bg-accent text-accent-foreground")}>
                Senior Care
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-2 p-4 md:w-[540px] md:grid-cols-2">
                  {seniorCareLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={link.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.href}
                            className="flex items-start gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                          >
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                              <IconComponent className="h-5 w-5 text-secondary" aria-hidden="true" />
                            </div>
                            <div className="pt-0.5">
                              <div className="text-sm font-medium leading-none mb-1.5">{link.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/faq">
                <NavigationMenuLink className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  isActive("/faq") && "bg-accent text-accent-foreground"
                )}>
                  FAQ
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/contact">
                <NavigationMenuLink className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  isActive("/contact") && "bg-accent text-accent-foreground"
                )}>
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
            <a href="tel:626-792-4185">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </a>
          </Button>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Link to="/appointments">Request Appointment</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden touch-target"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="lg:hidden fixed inset-0 top-[104px] bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
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
                  href="tel:626-792-4185"
                  className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground hover:text-primary transition-colors touch-target"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>626-792-4185</span>
                </a>
                <a
                  href="mailto:care@hcimed.com"
                  className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground hover:text-primary transition-colors touch-target"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>care@hcimed.com</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground min-h-[48px]">
                  <a href="tel:626-792-4185">
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
      )}
    </header>
  );
}