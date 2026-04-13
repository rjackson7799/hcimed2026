import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { pageSEO } from '@/config/seo';
import { PageHero } from '@/components/PageHero';
import { Button } from '@hci/shared/ui/button';
import { FormDownloadCard } from '@/components/resources/FormDownloadCard';
import { InsuranceDetailCard } from '@/components/resources/InsuranceDetailCard';
import { VisitPrepGuide } from '@/components/resources/VisitPrepGuide';
import { ResourceQuickLinks } from '@/components/resources/ResourceQuickLinks';
import { patientForms, insuranceInfo, visitGuides } from '@/data/resources-data';
import { Shield } from 'lucide-react';

export default function Resources() {
  return (
    <Layout>
      <SEO {...pageSEO.resources} />
      <PageHero
        title="Patient Resources"
        subtitle="Everything you need before and between visits — forms, insurance information, and visit preparation guides"
      />

      {/* Forms & Documents */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Forms & Documents
          </h2>
          <p className="text-muted-foreground mb-8">
            Download and complete these forms before your visit to save time at the office.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {patientForms.map((form) => (
              <FormDownloadCard key={form.id} form={form} />
            ))}
          </div>
        </div>
      </section>

      {/* Prepare for Your Visit */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Prepare for Your Visit
          </h2>
          <p className="text-muted-foreground mb-8">
            Knowing what to expect and what to bring helps us make the most of your appointment time together.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {visitGuides.map((guide) => (
              <VisitPrepGuide key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Information */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Insurance Information
          </h2>
          <p className="text-muted-foreground mb-8">
            We accept Medicare, most PPO plans, and Regal HMO. Click on your insurer below for coverage details.
          </p>
          <div className="space-y-3">
            {insuranceInfo.map((insurance) => (
              <InsuranceDetailCard key={insurance.id} insurance={insurance} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Don't see your plan listed? Call us at <a href="tel:+16267924185" className="text-secondary hover:underline">(626) 792-4185</a> to verify your coverage before your visit.
          </p>
        </div>
      </section>

      {/* Patient Rights & Privacy */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container max-w-4xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Patient Rights & Privacy
              </h2>
              <div className="prose prose-muted max-w-none">
                <p>
                  At HCI Medical Group, we are committed to protecting your privacy and ensuring you receive respectful, quality care. As our patient, you have the right to:
                </p>
                <ul>
                  <li>Receive care that is considerate, respectful, and free from discrimination</li>
                  <li>Be informed about your diagnosis, treatment options, and expected outcomes</li>
                  <li>Participate in decisions about your healthcare</li>
                  <li>Have your medical records and personal health information kept confidential</li>
                  <li>Request access to or copies of your medical records</li>
                  <li>File a complaint without fear of retaliation</li>
                </ul>
                <p>
                  Our full HIPAA Notice of Privacy Practices explains how we use and protect your health information. You can download it from the Forms section above or request a copy at our front desk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Quick Links
          </h2>
          <p className="text-muted-foreground mb-8">
            Find what you need quickly.
          </p>
          <ResourceQuickLinks />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            We're happy to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
          <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
