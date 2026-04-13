import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { TopicHub } from '@/data/topic-hubs';

interface TopicServiceLinksProps {
  services: TopicHub['relatedServices'];
}

export function TopicServiceLinks({ services }: TopicServiceLinksProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <Link
          key={service.href}
          to={service.href}
          className="group p-5 rounded-xl border border-border hover:border-secondary/50 hover:shadow-md transition-all"
        >
          <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
            {service.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {service.description}
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-secondary font-medium">
            Learn more
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      ))}
    </div>
  );
}
