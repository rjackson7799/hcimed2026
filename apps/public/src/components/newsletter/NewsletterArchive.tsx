import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import type { NewsletterMeta } from '@/types/newsletter';

interface NewsletterArchiveProps {
  newsletters: NewsletterMeta[];
  currentSlug?: string;
}

export function NewsletterArchive({ newsletters, currentSlug }: NewsletterArchiveProps) {
  const pastIssues = newsletters.filter((n) => n.slug !== currentSlug);

  if (pastIssues.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Past Issues</h2>
      <div className="space-y-4">
        {pastIssues.map((issue) => {
          const formattedDate = new Date(issue.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          });

          return (
            <Link
              key={issue.slug}
              to={`/newsletters/${issue.slug}`}
              className="block rounded-lg border border-border p-5 hover:border-secondary/50 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-secondary transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                    <span className="mx-1">·</span>
                    <span>Issue {issue.issue}</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
