import { Link, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { getAllCategories, getAllTags } from '@/lib/blog';
import type { BlogCategory } from '@/types/blog';

export function BlogFilterBar() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') as BlogCategory | null;
  const activeTag = searchParams.get('tag');

  const categories = getAllCategories();
  const tags = getAllTags();

  const isFiltered = activeCategory || activeTag;

  return (
    <div className="mb-8 space-y-4">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          to="/blog"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !isFiltered
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            to={`/blog?category=${encodeURIComponent(category)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category}
          </Link>
        ))}
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            to={`/blog?tag=${encodeURIComponent(tag)}`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeTag === tag
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Active filter indicator */}
      {isFiltered && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing results for{' '}
            <strong className="text-foreground">
              {activeCategory || activeTag}
            </strong>
          </span>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-secondary hover:text-secondary/80 font-medium"
          >
            <X className="h-3 w-3" />
            Clear
          </Link>
        </div>
      )}
    </div>
  );
}
