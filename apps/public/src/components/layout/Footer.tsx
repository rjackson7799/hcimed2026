import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import hciLogo from "@/assets/hci-logo.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground" role="contentinfo">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <img src={hciLogo} alt="HCI Medical Group" className="h-auto w-48 max-h-16 object-contain brightness-0 invert" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Compassionate Care for Every Stage of Life
            </p>
          </div>

          {/* Quick Links */}
          <nav className="space-y-4" aria-label="Quick links">
            <h3 className="font-display text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/our-story" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Our Story</Link></li>
              <li><Link to="/internal-medicine/physical-exams" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Internal Medicine</Link></li>
              <li><Link to="/senior-care-plus" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Senior Care+</Link></li>
              <li><Link to="/programs/weight-loss-trt" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">New Programs</Link></li>
              <li><Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">FAQ</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Contact Us</Link></li>
              <li><Link to="/blog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Health Resources</Link></li>
              <li><Link to="/newsletters" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Newsletters</Link></li>
              <li><Link to="/resources" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Patient Resources</Link></li>
              <li><Link to="/careers" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Careers</Link></li>
            </ul>
          </nav>

          {/* Areas We Serve */}
          <nav className="space-y-4" aria-label="Areas we serve">
            <h3 className="font-display text-lg font-semibold">Areas We Serve</h3>
            <ul className="space-y-2">
              <li><Link to="/areas/pasadena" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Pasadena</Link></li>
              <li><Link to="/areas/altadena" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Altadena</Link></li>
              <li><Link to="/areas/south-pasadena" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">South Pasadena</Link></li>
              <li><Link to="/areas/san-marino" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">San Marino</Link></li>
              <li><Link to="/areas/arcadia" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Arcadia</Link></li>
              <li><Link to="/areas/sierra-madre" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Sierra Madre</Link></li>
              <li><Link to="/areas/la-canada-flintridge" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">La Cañada Flintridge</Link></li>
              <li><Link to="/areas/monrovia" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Monrovia</Link></li>
              <li><Link to="/areas/temple-city" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Temple City</Link></li>
              <li><Link to="/areas/glendale" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-block py-1">Glendale</Link></li>
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <address className="text-primary-foreground/80 not-italic">
                  {siteConfig.address.street} {siteConfig.address.suite}<br />
                  {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
                </address>
              </li>
              <li>
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors py-1">
                  <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span>{siteConfig.contact.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors py-1">
                  <Mail className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span>{siteConfig.contact.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-primary-foreground/80">{siteConfig.hours.weekdays}</span>
              </li>
            </ul>
            <NewsletterSignup variant="compact" />
          </div>
        </div>

        {/* Health Topics */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <nav aria-label="Health topics" className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center text-sm">
            <span className="font-display font-semibold text-primary-foreground">Health Topics:</span>
            <Link to="/topics/diabetes-care" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Diabetes Care</Link>
            <Link to="/topics/heart-health" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Heart Health</Link>
            <Link to="/topics/medicare-senior-services" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Medicare & Senior Services</Link>
            <Link to="/topics/preventive-care" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Preventive Care</Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}