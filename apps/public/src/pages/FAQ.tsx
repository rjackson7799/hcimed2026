import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@hci/shared/ui/accordion";
import { Button } from "@hci/shared/ui/button";
import { Link } from "react-router-dom";
import { faqData, generateFaqSchema } from "@/data/faq-data";

export default function FAQ() {
  const faqSchema = generateFaqSchema(faqData);

  return (
    <Layout>
      <SEO {...pageSEO.faq} structuredData={faqSchema} />
      <PageHero
        title="Frequently Asked Questions" 
        subtitle="Find answers to common questions about our practice and services"
      />

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border px-6 card-shadow"
              >
                <AccordionTrigger className="text-left font-display text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-muted rounded-xl p-8">
            <h3 className="font-display text-2xl font-semibold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Please reach out to our team.
            </p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}