import yaml from 'js-yaml';

/**
 * Parses YAML frontmatter from a markdown string.
 * Supports nested objects and arrays (unlike the previous hand-rolled parser).
 */
export function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const [, frontmatterStr, markdownContent] = match;
  const data = (yaml.load(frontmatterStr) as Record<string, unknown>) || {};

  return { data, content: markdownContent };
}
