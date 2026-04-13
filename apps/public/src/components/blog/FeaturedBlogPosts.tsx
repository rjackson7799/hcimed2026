import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { getFeaturedPosts } from '@/lib/blog';

export function FeaturedBlogPosts() {
  const featured = getFeaturedPosts().slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            From Our Health Blog
          </h2>
          <p className="text-muted-foreground text-lg">
            Expert health insights from our medical team
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {featured.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-secondary font-medium hover:underline"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
