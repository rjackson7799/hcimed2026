import { BlogCard } from '@/components/blog/BlogCard';
import { getPostsByTag } from '@/lib/blog';
import type { BlogPostMeta } from '@/types/blog';

interface TopicRelatedPostsProps {
  tags: string[];
}

export function TopicRelatedPosts({ tags }: TopicRelatedPostsProps) {
  // Collect posts matching any tag, deduplicate by slug
  const seen = new Set<string>();
  const posts: BlogPostMeta[] = [];

  for (const tag of tags) {
    for (const post of getPostsByTag(tag)) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        posts.push(post);
      }
    }
  }

  // Sort by date descending, limit to 6
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const limited = posts.slice(0, 6);

  if (limited.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          More articles on this topic coming soon. Check back for updates from our medical team.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {limited.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
