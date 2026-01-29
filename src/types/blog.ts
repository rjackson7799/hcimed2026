export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  tags: string[];
  featured?: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
}

export interface BlogPostMeta extends BlogPostFrontmatter {
  // Same as BlogPost but without content (for listing)
}
