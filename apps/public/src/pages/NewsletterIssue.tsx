import { useParams, Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { ArticleSchema } from '@/components/ArticleSchema';
import { NewsletterIssueView } from '@/components/newsletter/NewsletterIssueView';
import { NewsletterArchive } from '@/components/newsletter/NewsletterArchive';
import { getNewsletterBySlug, getAllNewsletters } from '@/lib/newsletters';
import { siteConfig } from '@/config/site';
import { ArrowLeft } from 'lucide-react';

export default function NewsletterIssue() {
  const { slug } = useParams<{ slug: string }>();
  const newsletter = slug ? getNewsletterBySlug(slug) : null;

  if (!newsletter) {
    return <Navigate to="/newsletters" replace />;
  }

  const allNewsletters = getAllNewsletters();
  const canonicalUrl = `${siteConfig.url}/newsletters/${newsletter.slug}`;

  return (
    <Layout>
      <SEO
        title={`${newsletter.title} — Issue ${newsletter.issue}`}
        description={newsletter.description}
        canonical={canonicalUrl}
        ogType="article"
        article={{
          publishedTime: newsletter.date,
          author: newsletter.author,
          tags: ['Newsletter', 'Health Updates'],
        }}
      />
      <ArticleSchema
        title={newsletter.title}
        description={newsletter.description}
        datePublished={newsletter.date}
        url={canonicalUrl}
      />

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <Link
            to="/newsletters"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Newsletters
          </Link>

          <NewsletterIssueView newsletter={newsletter} />
          <NewsletterArchive newsletters={allNewsletters} currentSlug={newsletter.slug} />
        </div>
      </section>
    </Layout>
  );
}
