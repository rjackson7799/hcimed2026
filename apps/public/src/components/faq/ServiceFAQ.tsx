import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@hci/shared/ui/accordion';
import { generateFaqSchema } from '@/data/faq-data';

interface ServiceFAQProps {
  faqs: Array<{ question: string; answer: string }>;
  title?: string;
}

export function ServiceFAQ({ faqs, title = 'Frequently Asked Questions' }: ServiceFAQProps) {
  if (faqs.length === 0) return null;

  const schema = generateFaqSchema(faqs);

  return (
    <div className="py-12 border-t border-border">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
        {title}
      </h3>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`service-faq-${index}`}
            className="bg-card rounded-lg border border-border px-6 card-shadow"
          >
            <AccordionTrigger className="text-left font-display text-base hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
