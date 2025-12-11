import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
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

const internalMedicineLinks = [
  { title: "Physical Exams", href: "/internal-medicine/physical-exams", description: "Comprehensive annual wellness visits" },
  { title: "Women's Health", href: "/internal-medicine/womens-health", description: "Preventive screenings & hormonal health" },
  { title: "Men's Health", href: "/internal-medicine/mens-health", description: "Prostate health & cardiovascular screening" },
  { title: "Diagnostics", href: "/internal-medicine/diagnostics", description: "In-office testing & lab services" },
];

const seniorCareLinks = [
  { title: "Prevention & Wellness", href: "/senior-care/prevention-wellness", description: "Age-appropriate screenings & vaccinations" },
  { title: "Chronic Care Management", href: "/senior-care/chronic-care", description: "Diabetes, hypertension & heart disease" },
  { title: "Transition of Care", href: "/senior-care/transition-care", description: "Hospital discharge support" },
  { title: "Remote Monitoring", href: "/senior-care/remote-monitoring", description: "Telehealth & remote patient monitoring" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

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
          <img src={hciLogo} alt="HCI Medical Group" className="h-12 w-auto" />
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
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  {internalMedicineLinks.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{link.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {link.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(isActive("/senior-care") && "bg-accent text-accent-foreground")}>
                Senior Care
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  {seniorCareLinks.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{link.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {link.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
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

        <div className="hidden lg:flex">
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Link to="/contact">Schedule Appointment</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <nav className="container py-4 space-y-4">
            <Link to="/" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/our-story" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Our Story
            </Link>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1 py-2 font-medium text-foreground">
                Internal Medicine <ChevronDown className="h-4 w-4" />
              </div>
              <div className="pl-4 space-y-2">
                {internalMedicineLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="block py-1 text-muted-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 py-2 font-medium text-foreground">
                Senior Care <ChevronDown className="h-4 w-4" />
              </div>
              <div className="pl-4 space-y-2">
                {seniorCareLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="block py-1 text-muted-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/faq" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link to="/contact" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>

            <div className="pt-4 border-t border-border space-y-2">
              <a href="tel:626-792-4185" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> 626-792-4185
              </a>
              <a href="mailto:care@hcimed.com" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> care@hcimed.com
              </a>
            </div>

            <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Schedule Appointment</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}