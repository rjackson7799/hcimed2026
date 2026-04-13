import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { ArticleSchema } from '@/components/ArticleSchema';
import { PageHero } from '@/components/PageHero';
import { NewsletterIssueView } from '@/components/newsletter/NewsletterIssueView';
import { NewsletterArchive } from '@/components/newsletter/NewsletterArchive';
import { getLatestNewsletter, getAllNewsletters } from '@/lib/newsletters';
import { pageSEO } from '@/config/seo';
import { siteConfig } from '@/config/site';
import { Newspaper } from 'lucide-react';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';

export default function Newsletters() {
  const latest = getLatestNewsletter();
  const allNewsletters = getAllNewsletters();

  return (
    <Layout>
      <SEO {...pageSEO.newsletters} />
      <PageHero
        title="Newsletters"
        subtitle="Monthly health updates, practice news, and wellness tips from our team"
      />

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          {latest ? (
            <>
              <ArticleSchema
                title={latest.title}
                description={latest.description}
                datePublished={latest.date}
                url={`${siteConfig.url}/newsletters/${latest.slug}`}
              />
              <NewsletterIssueView newsletter={latest} />
              <NewsletterArchive newsletters={allNewsletters} currentSlug={latest.slug} />
              <div className="mt-12">
                <NewsletterSignup variant="inline" />
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Coming Soon
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our first newsletter is on the way. Check back soon for health updates
                and practice news from our medical team.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
