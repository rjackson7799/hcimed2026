import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { pageSEO } from '@/config/seo';
import { PageHero } from '@/components/PageHero';
import { BlogCard } from '@/components/blog/BlogCard';
import { getAllPosts } from '@/lib/blog';
import { FileText } from 'lucide-react';

export default function Blog() {
  const posts = getAllPosts();

  return (
    <Layout>
      <SEO {...pageSEO.blog} />
      <PageHero
        title="Health Resources"
        subtitle="Health tips, medical insights, and wellness information from our team"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Coming Soon
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on bringing you helpful health resources and articles.
                Check back soon for updates from our medical team.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
