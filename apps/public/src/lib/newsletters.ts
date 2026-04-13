import { marked } from 'marked';
import { parseFrontmatter } from '@/lib/frontmatter';
import type {
  Newsletter,
  NewsletterMeta,
  NewsletterFrontmatter,
  NewsletterSectionMeta,
} from '@/types/newsletter';

// Import all markdown files from the newsletters content directory at build time
const newsletterFiles = import.meta.glob('../content/newsletters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Splits markdown body by ## headings into individual sections.
 * Returns an array of { heading, content } pairs.
 */
function splitBySections(markdown: string): { heading: string; content: string }[] {
  const sections: { heading: string; content: string }[] = [];
  // Trim leading whitespace so the split doesn't produce a phantom first chunk
  const parts = markdown.trim().split(/^## /m).filter((p) => p.trim());

  for (const part of parts) {
    const newlineIndex = part.indexOf('\n');
    if (newlineIndex === -1) {
      sections.push({ heading: part.trim(), content: '' });
    } else {
      sections.push({
        heading: part.slice(0, newlineIndex).trim(),
        content: part.slice(newlineIndex + 1).trim(),
      });
    }
  }

  return sections;
}

function parseNewsletter(filename: string, raw: string): Newsletter {
  const { data, content: markdownContent } = parseFrontmatter(raw);

  const frontmatter: NewsletterFrontmatter = {
    title: (data.title as string) || 'Untitled',
    slug: (data.slug as string) || filename.replace('.md', ''),
    description: (data.description as string) || '',
    date: (data.date as string) || new Date().toISOString().split('T')[0],
    issue: (data.issue as number) || 1,
    author: (data.author as string) || 'HCI Medical Group',
    sections: (data.sections as NewsletterSectionMeta[]) || [],
  };

  const rawSections = splitBySections(markdownContent);

  // Validate section count
  if (rawSections.length !== frontmatter.sections.length) {
    console.warn(
      `Newsletter "${frontmatter.slug}": found ${rawSections.length} ## headings but ${frontmatter.sections.length} sections in frontmatter`
    );
  }

  // Pair markdown sections with frontmatter metadata
  const sections = rawSections.map((raw, i) => {
    const meta = frontmatter.sections[i] || {
      id: raw.heading.toLowerCase().replace(/\s+/g, '-'),
      title: raw.heading,
      type: 'feature' as const,
    };

    return {
      ...meta,
      content: marked(raw.content) as string,
    };
  });

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    description: frontmatter.description,
    date: frontmatter.date,
    issue: frontmatter.issue,
    author: frontmatter.author,
    sections,
  };
}

export function getAllNewsletters(): NewsletterMeta[] {
  const newsletters = Object.entries(newsletterFiles).map(([path, content]) => {
    const filename = path.split('/').pop() || '';
    const newsletter = parseNewsletter(filename, content);
    return {
      title: newsletter.title,
      slug: newsletter.slug,
      description: newsletter.description,
      date: newsletter.date,
      issue: newsletter.issue,
      author: newsletter.author,
    };
  });

  // Sort by date descending (newest first)
  return newsletters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLatestNewsletter(): Newsletter | null {
  const all = Object.entries(newsletterFiles).map(([path, content]) => {
    const filename = path.split('/').pop() || '';
    return parseNewsletter(filename, content);
  });

  if (all.length === 0) return null;

  // Sort by date descending, return first
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return all[0];
}

export function getNewsletterBySlug(slug: string): Newsletter | null {
  for (const [path, content] of Object.entries(newsletterFiles)) {
    const filename = path.split('/').pop() || '';
    const newsletter = parseNewsletter(filename, content);
    if (newsletter.slug === slug) {
      return newsletter;
    }
  }
  return null;
}
