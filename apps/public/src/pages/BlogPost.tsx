import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { ArticleSchema } from '@/components/ArticleSchema';
import { BlogContent } from '@/components/blog/BlogContent';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { siteConfig } from '@/config/site';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const canonicalUrl = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.description}
        canonical={canonicalUrl}
        ogType="article"
        ogImage={post.image}
        article={{
          publishedTime: post.date,
          author: post.author,
          tags: post.tags,
        }}
      />
      <ArticleSchema
        title={post.title}
        description={post.description}
        datePublished={post.date}
        author={post.author}
        image={post.image}
        url={canonicalUrl}
      />

      <article className="py-16 md:py-24">
        <div className="container max-w-3xl">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Health Resources
          </Link>

          {/* Header */}
          <header className="mb-8">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-border pb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{formattedDate}</time>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <BlogContent content={post.content} />

          {/* Related Posts */}
          <RelatedPosts posts={getRelatedPosts(post.slug, 3)} />

          {/* Newsletter Signup */}
          <div className="mt-12 pt-8 border-t border-border">
            <NewsletterSignup variant="section" />
          </div>
        </div>
      </article>
    </Layout>
  );
}
