import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { ArrowLeft } from "lucide-react";
import { FocusAreaTags } from "@/components/providers/FocusAreaTags";
import { ProviderCredentials } from "@/components/providers/ProviderCredentials";
import { siteConfig } from "@/config/site";

const focusAreas = ['Internal Medicine', "Men's Health", 'Acute Care', 'Geriatric Care', 'Chronic Disease'];

const credentials = {
  education: ['MSN, United States University', 'BSN, California State University, Fullerton'],
  certifications: ['FNP-C (Family Nurse Practitioner)', 'CCRN (Critical Care Registered Nurse)'],
  languages: ['English', 'Tagalog'],
  yearsExperience: 17,
};

const physicianSchema = {
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: 'Marileth Tan',
  medicalSpecialty: 'InternalMedicine',
  jobTitle: 'Family Nurse Practitioner',
  memberOf: { '@type': 'MedicalOrganization', name: siteConfig.name },
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${siteConfig.address.street} ${siteConfig.address.suite}`,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.zip,
  },
  telephone: siteConfig.contact.phone,
};

export default function MarilethTan() {
  return (
    <Layout>
      <SEO {...pageSEO.marilethTan} structuredData={physicianSchema} />
      <PageHero
        title="Marileth Tan, MSN, FNP-C, CCRN"
        subtitle="Family Nurse Practitioner"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/providers"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              All Providers
            </Link>

            <div className="bg-card rounded-2xl p-8 md:p-12 card-shadow">
              <div className="text-center mb-8 pb-8 border-b border-border">
                <div className="flex justify-center mb-6">
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[hsl(207,44%,24%)] to-[hsl(199,75%,42%)] flex items-center justify-center ring-4 ring-background shadow-lg">
                    <span className="font-display text-4xl md:text-5xl font-semibold text-white">
                      MT
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Marileth "Bap" Tan, MSN, FNP-C, CCRN
                </h3>
                <p className="text-secondary font-semibold text-lg">
                  Family Nurse Practitioner
                </p>
                <div className="mt-4">
                  <FocusAreaTags areas={focusAreas} />
                </div>
              </div>

              {/* Philosophy */}
              <div className="bg-muted/50 border-l-4 border-secondary p-6 rounded-lg mb-8">
                <p className="text-foreground italic leading-relaxed">
                  "Every patient deserves a provider who truly listens. I bring the same level of care
                  and attention to each visit, whether it's a routine check-up or a complex health concern."
                </p>
              </div>

              <div className="prose prose-lg max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Bap Tan brings over 17 years of clinical nursing excellence to HCI Medical
                  Group, with deep expertise spanning critical care, primary care, and emergency
                  medicine. As a board-certified Family Nurse Practitioner, she delivers
                  comprehensive, evidence-based care across the lifespan — from preventive
                  wellness and chronic disease management to acute medical concerns.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  With a Master of Science in Nursing from United States University and a
                  Bachelor of Science in Nursing from California State University, Fullerton,
                  Bap's clinical foundation was built through more than a decade of CCU/ICU
                  nursing at Inter-Community Hospital in Covina, where she served as a relief
                  charge nurse, mentored new nurses, and earned both the DAISY Award (2017) and
                  Nurse of the Year for Displaying Integrity (2018).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Since earning her FNP-C certification, Bap has expanded her practice to
                  include primary care at Adventist Health and Omni Family Health, as well as
                  emergency department fast-track care with Vituity — managing everything from
                  minor trauma and infections to complex chronic conditions. She also serves as
                  a Clinical Instructor for United States University's FNP program, guiding
                  the next generation of nurse practitioners.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Bap is fluent in English and Tagalog, reflecting HCI Medical Group's
                  commitment to serving the diverse communities of the San Gabriel Valley.
                </p>
              </div>

              <ProviderCredentials credentials={credentials} />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
