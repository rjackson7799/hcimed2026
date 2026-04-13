import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogPostMeta } from '@/types/blog';

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-12 border-t border-border">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
        Related Articles
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
