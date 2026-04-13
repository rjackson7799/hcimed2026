import { marked } from 'marked';
import type { BlogPost, BlogPostMeta, BlogCategory } from '@/types/blog';
import { parseFrontmatter } from '@/lib/frontmatter';

// Import all markdown files from the blog content directory at build time
const blogFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parsePost(filename: string, content: string): BlogPost {
  const { data, content: markdownContent } = parseFrontmatter(content);

  // Convert markdown to HTML
  const htmlContent = marked(markdownContent) as string;

  return {
    title: (data.title as string) || 'Untitled',
    slug: (data.slug as string) || filename.replace('.md', ''),
    description: (data.description as string) || '',
    date: (data.date as string) || new Date().toISOString().split('T')[0],
    author: (data.author as string) || 'HCI Medical Group',
    image: data.image as string | undefined,
    tags: (data.tags as string[]) || [],
    featured: (data.featured as boolean) || false,
    category: (data.category as BlogCategory | undefined),
    content: htmlContent,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const posts = Object.entries(blogFiles).map(([path, content]) => {
    const filename = path.split('/').pop() || '';
    const post = parsePost(filename, content);
    // Return without content for listing
    const { content: _, ...meta } = post;
    return meta;
  });

  // Sort by date descending (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = Object.entries(blogFiles);

  for (const [path, content] of posts) {
    const filename = path.split('/').pop() || '';
    const post = parsePost(filename, content);

    if (post.slug === slug) {
      return post;
    }
  }

  return null;
}

export function getFeaturedPosts(): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.featured);
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tagSet = new Set<string>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

export function getAllCategories(): BlogCategory[] {
  return ['Internal Medicine', 'Senior Care', 'Wellness', 'Practice News'];
}

export function getPostsByCategory(category: BlogCategory): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPostMeta[] {
  const allPosts = getAllPosts();
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current || current.tags.length === 0) return [];

  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));

  const scored = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((post) => {
      const shared = post.tags.filter((t) => currentTags.has(t.toLowerCase())).length;
      return { post, shared };
    })
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    });

  return scored.slice(0, limit).map(({ post }) => post);
}
