import { Calendar, Hash } from 'lucide-react';
import { SocialShare } from './SocialShare';
import { NewsletterSection } from './NewsletterSection';
import { siteConfig } from '@/config/site';
import type { Newsletter } from '@/types/newsletter';

interface NewsletterIssueViewProps {
  newsletter: Newsletter;
}

export function NewsletterIssueView({ newsletter }: NewsletterIssueViewProps) {
  const formattedDate = new Date(newsletter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const issueUrl = `${siteConfig.url}/newsletters/${newsletter.slug}`;

  return (
    <article>
      {/* Issue Header */}
      <header className="mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          {newsletter.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-4">{newsletter.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={newsletter.date}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="h-4 w-4" />
            <span>Issue {newsletter.issue}</span>
          </div>
          <SocialShare url={issueUrl} title={newsletter.title} />
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-6">
        {newsletter.sections.map((section) => (
          <NewsletterSection key={section.id} section={section} />
        ))}
      </div>

      {/* Bottom Share Bar */}
      <div className="mt-8 pt-6 border-t border-border flex justify-center">
        <SocialShare url={issueUrl} title={newsletter.title} />
      </div>
    </article>
  );
}
