import { Link } from 'react-router-dom';
import { CalendarCheck, Phone, HelpCircle, BookOpen, Users } from 'lucide-react';

const quickLinks = [
  {
    title: 'Schedule Appointment',
    description: 'Request a visit with our team',
    href: '/appointments',
    icon: CalendarCheck,
  },
  {
    title: 'Contact Us',
    description: 'Reach us by phone, email, or form',
    href: '/contact',
    icon: Phone,
  },
  {
    title: 'FAQ',
    description: 'Answers to common questions',
    href: '/faq',
    icon: HelpCircle,
  },
  {
    title: 'Health Resources',
    description: 'Articles from our medical team',
    href: '/blog',
    icon: BookOpen,
  },
  {
    title: 'Our Providers',
    description: 'Meet the doctors and NPs',
    href: '/providers',
    icon: Users,
  },
];

export function ResourceQuickLinks() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-secondary/50 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
            <link.icon className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm group-hover:text-secondary transition-colors">
              {link.title}
            </h3>
            <p className="text-xs text-muted-foreground">{link.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
