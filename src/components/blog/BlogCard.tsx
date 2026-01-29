import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { BlogPostMeta } from '@/types/blog';

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="bg-card rounded-xl overflow-hidden card-shadow card-hover-lift group">
      {post.image && (
        <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      )}

      <div className="p-6">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {post.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-secondary font-medium text-sm hover:underline"
        >
          Read more
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
