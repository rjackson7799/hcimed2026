import { ArrowRight } from 'lucide-react';
import { testimonials, type Testimonial } from '@/data/testimonials';
import { siteConfig } from '@/config/site';
import { TestimonialCard } from './TestimonialCard';

interface TestimonialsSectionProps {
  category?: Testimonial['serviceCategory'];
  limit?: number;
}

export function TestimonialsSection({ category, limit = 3 }: TestimonialsSectionProps) {
  const filtered = category
    ? testimonials.filter((t) => t.serviceCategory === category || t.serviceCategory === 'general')
    : testimonials;

  const displayed = filtered.slice(0, limit);

  if (displayed.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Patients Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from the families and individuals who trust HCI Medical Group with their care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayed.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {siteConfig.links.googleBusinessProfile && (
          <div className="text-center mt-8">
            <a
              href={siteConfig.links.googleBusinessProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              See more reviews on Google
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
