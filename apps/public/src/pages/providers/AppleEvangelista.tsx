import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { ArrowLeft } from "lucide-react";
import { FocusAreaTags } from "@/components/providers/FocusAreaTags";
import { ProviderCredentials } from "@/components/providers/ProviderCredentials";
import { siteConfig } from "@/config/site";

const focusAreas = ['Internal Medicine', "Women's Health", 'Chronic Care', 'Patient Education', 'Medical Aesthetics'];

const credentials = {
  education: ['MSN, Chamberlain University', 'BSN, West Coast University'],
  certifications: ['AGACNP-BC (Adult-Gerontology Acute Care)', 'CCRN (Critical Care Registered Nurse)'],
  languages: ['English', 'Tagalog'],
  yearsExperience: 10,
};

const physicianSchema = {
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: 'Evelinda Evangelista',
  medicalSpecialty: 'InternalMedicine',
  jobTitle: 'Nurse Practitioner',
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

export default function AppleEvangelista() {
  return (
    <Layout>
      <SEO {...pageSEO.appleEvangelista} structuredData={physicianSchema} />
      <PageHero
        title={'Evelinda "Apple" Evangelista, MSN, APRN, AGACNP-BC, CCRN'}
        subtitle="Nurse Practitioner & Medical Aesthetics Specialist"
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
                      AE
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Evelinda "Apple" Evangelista, MSN, APRN, AGACNP-BC, CCRN
                </h3>
                <p className="text-secondary font-semibold text-lg">
                  Nurse Practitioner & Medical Aesthetics Specialist
                </p>
                <div className="mt-4">
                  <FocusAreaTags areas={focusAreas} />
                </div>
              </div>

              {/* Philosophy */}
              <div className="bg-muted/50 border-l-4 border-secondary p-6 rounded-lg mb-8">
                <p className="text-foreground italic leading-relaxed">
                  "I believe in treating the whole person, not just symptoms. My goal is to help every
                  patient feel empowered and informed about their health journey."
                </p>
              </div>

              <div className="prose prose-lg max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Ms. Evangelista brings a unique blend of critical care expertise and aesthetic
                  medicine to HCI Medical Group, combining over a decade of clinical nursing
                  excellence with specialized training in advanced medical aesthetics. As a
                  board-certified Adult-Gerontology Acute Care Nurse Practitioner, Ms. Evangelista delivers
                  comprehensive care that bridges traditional healthcare with modern wellness treatments.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  With a Master of Science in Nursing from Chamberlain University and board
                  certification from the American Nurses Credentialing Center, Ms. Evangelista's clinical
                  foundation is built on extensive experience in critical care settings, including
                  years as a preceptor and relief charge nurse at Emanate Health hospitals.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Since 2022, Ms. Evangelista has distinguished herself as an aesthetic nurse injector and
                  specialist in skin treatments, medical devices, and laser therapies. Her approach
                  is rooted in understanding each patient's unique goals and creating personalized
                  treatment plans that enhance natural beauty while supporting overall wellness.
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
