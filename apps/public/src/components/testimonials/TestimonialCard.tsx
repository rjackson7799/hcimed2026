import { Star } from 'lucide-react';
import { Card, CardContent } from '@hci/shared/ui/card';
import type { Testimonial } from '@/data/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="bg-card card-shadow">
      <CardContent className="pt-6">
        <div className="flex gap-0.5 mb-3" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-muted text-muted'
              }`}
            />
          ))}
        </div>
        <blockquote className="text-muted-foreground mb-4 leading-relaxed">
          &ldquo;{testimonial.text}&rdquo;
        </blockquote>
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground text-sm">
            {testimonial.name}
          </span>
          {testimonial.source && (
            <span className="text-xs text-muted-foreground">
              via {testimonial.source}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
