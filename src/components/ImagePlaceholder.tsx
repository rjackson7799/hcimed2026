import { User, Image, Building2, Heart, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlaceholderType = 'avatar' | 'hero' | 'office' | 'senior-care' | 'internal-medicine';

interface ImagePlaceholderProps {
  type: PlaceholderType;
  alt: string;
  src?: string;
  className?: string;
}

const placeholderConfig: Record<PlaceholderType, { icon: React.ElementType; gradient: string }> = {
  avatar: {
    icon: User,
    gradient: 'from-primary/20 to-secondary/20',
  },
  hero: {
    icon: Image,
    gradient: 'from-primary/10 to-secondary/10',
  },
  office: {
    icon: Building2,
    gradient: 'from-secondary/15 to-accent/30',
  },
  'senior-care': {
    icon: Heart,
    gradient: 'from-secondary/20 to-primary/10',
  },
  'internal-medicine': {
    icon: Stethoscope,
    gradient: 'from-primary/20 to-secondary/10',
  },
};

export function ImagePlaceholder({ type, alt, src, className }: ImagePlaceholderProps) {
  const config = placeholderConfig[type];
  const Icon = config.icon;

  // If src is provided, show the actual image
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('object-cover', className)}
        loading="lazy"
      />
    );
  }

  // Show styled placeholder
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br',
        config.gradient,
        className
      )}
      role="img"
      aria-label={alt}
    >
      <Icon
        className="w-1/3 h-1/3 text-muted-foreground/40 max-w-16 max-h-16"
        aria-hidden="true"
      />
    </div>
  );
}

// Convenience components for common use cases
export function AvatarPlaceholder({
  src,
  alt,
  className,
  size = 'md',
}: {
  src?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32 md:w-40 md:h-40',
  };

  return (
    <ImagePlaceholder
      type="avatar"
      src={src}
      alt={alt}
      className={cn(sizeClasses[size], 'rounded-full', className)}
    />
  );
}

export function HeroImagePlaceholder({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <ImagePlaceholder
      type="hero"
      src={src}
      alt={alt}
      className={cn('w-full h-auto rounded-xl', className)}
    />
  );
}

export function OfficeImagePlaceholder({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <ImagePlaceholder
      type="office"
      src={src}
      alt={alt}
      className={cn('w-full h-48 md:h-64 rounded-xl', className)}
    />
  );
}

export function ServiceCardImagePlaceholder({
  src,
  alt,
  type,
  className,
}: {
  src?: string;
  alt: string;
  type: 'internal-medicine' | 'senior-care';
  className?: string;
}) {
  return (
    <ImagePlaceholder
      type={type}
      src={src}
      alt={alt}
      className={cn('w-full h-48 md:h-56 rounded-t-xl', className)}
    />
  );
}
