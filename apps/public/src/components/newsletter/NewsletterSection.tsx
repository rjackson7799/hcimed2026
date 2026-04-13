import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogContent } from '@/components/blog/BlogContent';
import { cn } from '@hci/shared/lib/utils';
import type { NewsletterSection as NewsletterSectionType } from '@/types/newsletter';

interface NewsletterSectionProps {
  section: NewsletterSectionType;
}

const sectionStyles: Record<NewsletterSectionType['type'], string> = {
  message: 'bg-muted/50 border-muted',
  feature: 'bg-background border-border',
  alert: 'bg-accent/5 border-accent',
};

export function NewsletterSection({ section }: NewsletterSectionProps) {
  const isExternal = section.cta_link?.startsWith('http');

  return (
    <div className={cn('rounded-xl border p-6 md:p-8', sectionStyles[section.type])}>
      <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4">
        {section.title}
      </h3>

      <BlogContent content={section.content} />

      {section.cta_text && section.cta_link && (
        <div className="mt-6">
          {isExternal ? (
            <a
              href={section.cta_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors"
            >
              {section.cta_text}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link
              to={section.cta_link}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors"
            >
              {section.cta_text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
