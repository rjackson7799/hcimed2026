import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const sanitizedContent = useMemo(() => DOMPurify.sanitize(content), [content]);

  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-display prose-headings:text-foreground
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground
        prose-ul:text-muted-foreground prose-ol:text-muted-foreground
        prose-li:marker:text-secondary
        prose-blockquote:border-secondary prose-blockquote:text-muted-foreground
        prose-code:text-secondary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-muted prose-pre:text-foreground
        prose-img:rounded-xl prose-img:shadow-lg"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
