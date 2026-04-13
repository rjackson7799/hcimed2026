import { Link } from 'react-router-dom';
import { Button } from '@hci/shared/ui/button';
import { PageHero } from '@/components/PageHero';
import { TopicRelatedPosts } from '@/components/topics/TopicRelatedPosts';
import { TopicServiceLinks } from '@/components/topics/TopicServiceLinks';
import { ServiceFAQ } from '@/components/faq/ServiceFAQ';
import { faqData } from '@/data/faq-data';
import { siteConfig } from '@/config/site';
import type { TopicHub } from '@/data/topic-hubs';

interface TopicHubPageProps {
  topic: TopicHub;
}

export function TopicHubPage({ topic }: TopicHubPageProps) {
  // Filter FAQs by keywords
  const relevantFaqs = faqData.filter((faq) =>
    topic.faqKeywords.some(
      (keyword) =>
        faq.question.toLowerCase().includes(keyword.toLowerCase()) ||
        faq.answer.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return (
    <>
      <PageHero title={topic.title} subtitle={topic.heroSubtitle} />

      {/* Intro Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="prose prose-lg max-w-none">
            {topic.introContent.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Articles & Resources
          </h2>
          <p className="text-muted-foreground mb-8">
            Read more about {topic.title.toLowerCase()} from our medical team.
          </p>
          <TopicRelatedPosts tags={topic.relatedTags} />
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Related Services
          </h2>
          <p className="text-muted-foreground mb-8">
            Our services to help you with {topic.title.toLowerCase()}.
          </p>
          <TopicServiceLinks services={topic.relatedServices} />
        </div>
      </section>

      {/* Relevant FAQs */}
      {relevantFaqs.length > 0 && (
        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <ServiceFAQ
              faqs={relevantFaqs.map((f) => ({
                question: f.question,
                answer: f.answer,
              }))}
            />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Take the Next Step
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Our team at HCI Medical Group is here to help. Schedule a visit and let's work together on your health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Link to={topic.ctaLink}>{topic.ctaText}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>Call {siteConfig.contact.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
