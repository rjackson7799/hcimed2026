import { marked } from 'marked';
import type { BlogPost, BlogPostMeta, BlogPostFrontmatter } from '@/types/blog';

// Import all markdown files from the blog content directory at build time
const blogFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Simple frontmatter parser (browser-compatible, no Buffer needed)
function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const [, frontmatterStr, markdownContent] = match;
  const data: Record<string, unknown> = {};

  // Parse YAML-like frontmatter (simple key: value pairs)
  const lines = frontmatterStr.split('\n');
  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Check if this is an array item
    if (trimmedLine.startsWith('- ') && inArray) {
      const value = trimmedLine.slice(2).replace(/^["']|["']$/g, '');
      arrayValues.push(value);
      continue;
    }

    // If we were in an array, save it
    if (inArray && currentKey) {
      data[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }

    // Check for key: value pair
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.slice(0, colonIndex).trim();
      const value = trimmedLine.slice(colonIndex + 1).trim();

      // Check if this starts an array
      if (value === '' || value === '[]') {
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array like ["tag1", "tag2"]
        const arrayContent = value.slice(1, -1);
        data[key] = arrayContent
          .split(',')
          .map((item) => item.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        // Regular value - remove quotes if present
        data[key] = value.replace(/^["']|["']$/g, '');

        // Convert boolean strings
        if (data[key] === 'true') data[key] = true;
        if (data[key] === 'false') data[key] = false;
      }
    }
  }

  // Handle any remaining array
  if (inArray && currentKey) {
    data[currentKey] = arrayValues;
  }

  return { data, content: markdownContent };
}

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
