import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}

export function PageHero({ title, subtitle, backgroundImage, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24 relative overflow-hidden",
        backgroundImage ? "" : "hero-gradient",
        className
      )}
    >
      {/* Background image with overlay */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-primary/80" aria-hidden="true" />
        </>
      )}

      <div className="container text-center relative z-10">
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}