import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

export function ContactBar() {
  return (
    <div className="hidden md:block bg-primary text-primary-foreground">
      <div className="container flex h-10 items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{siteConfig.address.city}, {siteConfig.address.state}</span>
          </span>
          <a href={`tel:${siteConfig.contact.phoneRaw}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Phone className="h-3.5 w-3.5" />
            <span>{siteConfig.contact.phone}</span>
          </a>
          <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Mail className="h-3.5 w-3.5" />
            <span>{siteConfig.contact.email}</span>
          </a>
        </div>
        <div className="text-primary-foreground/80">
          {siteConfig.hours.weekdays}
        </div>
      </div>
    </div>
  );
}
