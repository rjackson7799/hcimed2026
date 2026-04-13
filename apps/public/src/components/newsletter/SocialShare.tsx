import { Facebook, Mail } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Share:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span>Facebook</span>
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors"
        aria-label="Share via email"
      >
        <Mail className="h-4 w-4" />
        <span>Email</span>
      </a>
    </div>
  );
}
