export interface NewsletterSectionMeta {
  id: string;
  title: string;
  type: 'message' | 'feature' | 'alert';
  cta_text?: string;
  cta_link?: string;
}

export interface NewsletterFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  issue: number;
  author: string;
  sections: NewsletterSectionMeta[];
}

export interface NewsletterSection extends NewsletterSectionMeta {
  content: string; // HTML for this section
}

export interface Newsletter extends Omit<NewsletterFrontmatter, 'sections'> {
  sections: NewsletterSection[]; // sections with parsed HTML content
}

// For archive listing — only the fields needed to render a list item
export type NewsletterMeta = Pick<
  NewsletterFrontmatter,
  'title' | 'slug' | 'description' | 'date' | 'issue' | 'author'
>;
