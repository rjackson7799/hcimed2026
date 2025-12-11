import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import hciLogo from "@/assets/hci-logo.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <img src={hciLogo} alt="HCI Medical Group" className="h-16 w-auto brightness-0 invert" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Compassionate Care for Every Stage of Life
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/our-story" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Our Story</Link></li>
              <li><Link to="/internal-medicine/physical-exams" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Internal Medicine</Link></li>
              <li><Link to="/senior-care/prevention-wellness" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Senior Care</Link></li>
              <li><Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2">
              <li><Link to="/internal-medicine/physical-exams" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Physical Exams</Link></li>
              <li><Link to="/internal-medicine/womens-health" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Women's Health</Link></li>
              <li><Link to="/internal-medicine/mens-health" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Men's Health</Link></li>
              <li><Link to="/senior-care/chronic-care" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Chronic Care Management</Link></li>
              <li><Link to="/senior-care/remote-monitoring" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Remote Monitoring</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  65 N. Madison Ave. #709<br />
                  Pasadena, CA 91101
                </span>
              </li>
              <li>
                <a href="tel:626-792-4185" className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  626-792-4185
                </a>
              </li>
              <li>
                <a href="mailto:care@hcimed.com" className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  care@hcimed.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span className="text-primary-foreground/80">Mon - Fri: 9AM - 5PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm">
          <p>&copy; {new Date().getFullYear()} HCI Medical Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}