import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What insurance plans do you accept?",
    answer: "We accept Medicare, Regal HMO, and all PPO plans. Please contact our office at 626-792-4185 to verify your specific coverage before your first visit. We're happy to answer any questions about billing and payment options."
  },
  {
    question: "Will I see the same doctor each visit?",
    answer: "Yes. Continuity of care is central to how we practice medicine. You'll see the same provider at each visit, allowing us to build a real relationship and truly understand your health over time. No rotating doctors or starting over each appointment."
  },
  {
    question: "How quickly can I get an appointment?",
    answer: "We typically offer same-week appointments for established patients. For new patients, we work to schedule you as quickly as possible. If you have an urgent concern, call us at 626-792-4185 and we'll do our best to see you promptly."
  },
  {
    question: "How long has HCI Medical Group been in Pasadena?",
    answer: "Dr. Roy H. Jackson founded HCI Medical Group in 1990. We've been serving Pasadena and the San Gabriel Valley for over 35 years, caring for multiple generations of families in our community."
  },
  {
    question: "How do I schedule an appointment?",
    answer: "You can schedule an appointment by calling our office at 626-792-4185, emailing us at care@hcimed.com, or using the contact form on our website. We'll work to find a time that's convenient for you."
  },
  {
    question: "What should I bring to my first appointment?",
    answer: "Please bring your insurance card, a valid photo ID, a list of current medications (including dosages), and any relevant medical records or test results. If you have specific health concerns, writing them down beforehand can help ensure we address everything during your visit."
  },
  {
    question: "Do you offer telehealth appointments?",
    answer: "Yes, we offer telehealth appointments for appropriate consultations and follow-up visits. This can be especially convenient for our senior care patients. Contact us to see if telehealth is right for your needs."
  },
  {
    question: "What are your office hours?",
    answer: "Our office is open Monday through Friday from 9:00 AM to 5:00 PM. We are closed on weekends and major holidays."
  },
  {
    question: "Do you accept Medicare?",
    answer: "Yes, we accept Medicare and provide all covered services including Annual Wellness Visits at no cost to you. Our team is experienced in helping Medicare patients navigate their benefits and get the care they need."
  },
  {
    question: "How do I request my medical records?",
    answer: "You can request your medical records by contacting our office. We'll provide you with the necessary forms to complete. Please allow adequate time for processing your request."
  },
  {
    question: "Do you provide care for chronic conditions?",
    answer: "Yes, managing chronic conditions is a significant part of our practice. We provide comprehensive care for conditions such as diabetes, hypertension, heart disease, and more. Our approach focuses on both treatment and prevention."
  },
  {
    question: "What senior care services do you offer?",
    answer: "Our senior care services include preventive wellness screenings, chronic disease management, transition of care support (after hospitalization), and remote patient monitoring. We're dedicated to helping older adults maintain their quality of life."
  },
  {
    question: "What areas do you serve?",
    answer: "We serve patients from Pasadena, Altadena, South Pasadena, San Marino, Arcadia, and throughout the San Gabriel Valley. Our office is conveniently located at 65 N. Madison Ave. in Pasadena."
  },
  {
    question: "Is parking available at your office?",
    answer: "Yes, there is parking available near our office building. Please contact us for specific parking information and accessibility accommodations."
  },
  {
    question: "How can I prepare for my annual physical exam?",
    answer: "For your annual physical, we recommend fasting for 8-12 hours if bloodwork is planned, bringing your medication list, and preparing any questions or health concerns you'd like to discuss. Wear comfortable clothing, and allow adequate time for the appointment."
  }
];

export default function FAQ() {
  return (
    <Layout>
      <SEO {...pageSEO.faq} />
      <PageHero
        title="Frequently Asked Questions" 
        subtitle="Find answers to common questions about our practice and services"
      />

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
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