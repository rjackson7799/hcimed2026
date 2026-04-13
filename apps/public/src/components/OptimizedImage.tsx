interface OptimizedImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function OptimizedImage({
  src,
  webpSrc,
  alt,
  width,
  height,
  sizes,
  className,
  loading = 'lazy',
  priority = false,
}: OptimizedImageProps) {
  const imgLoading = priority ? 'eager' : loading;

  const imgProps = {
    src,
    alt,
    width,
    height,
    sizes,
    className,
    loading: imgLoading,
    decoding: priority ? ('sync' as const) : ('async' as const),
    ...(priority && { fetchPriority: 'high' as const }),
  };

  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img {...imgProps} />
      </picture>
    );
  }

  return <img {...imgProps} />;
}
