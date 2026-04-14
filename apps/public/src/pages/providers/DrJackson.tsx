import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { ArrowLeft } from "lucide-react";
import { FocusAreaTags } from "@/components/providers/FocusAreaTags";
import { ProviderCredentials } from "@/components/providers/ProviderCredentials";
import { siteConfig } from "@/config/site";
import drJacksonPhoto from "@/assets/providers/dr-jackson.jpg";

const focusAreas = ['Medicare Wellness', 'Diabetes Management', 'Hypertension', 'Preventive Care', 'Senior Health'];

const credentials = {
  education: ['University of Southern California Medical Center', 'Internal Medicine Residency, USC'],
  certifications: ['Board Certified, Internal Medicine', 'Geriatric Care Specialist'],
  languages: ['English', 'Tagalog'],
  yearsExperience: 45,
};

const physicianSchema = {
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: 'Dr. Roy H. Jackson',
  medicalSpecialty: 'InternalMedicine',
  jobTitle: 'Medical Director',
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

export default function DrJackson() {
  return (
    <Layout>
      <SEO {...pageSEO.drJackson} structuredData={physicianSchema} />
      <PageHero
        title="Dr. Roy H. Jackson, M.D."
        subtitle="Medical Director"
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
                  <img
                    src={drJacksonPhoto}
                    alt="Dr. Roy H. Jackson, M.D."
                    className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-background shadow-lg"
                  />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Dr. Roy H. Jackson, M.D.
                </h2>
                <p className="text-secondary font-semibold text-lg mb-1">Medical Director</p>
                <p className="text-muted-foreground">
                  Board Certified Internal Medicine & Geriatric Care Specialist
                </p>
                <div className="mt-4">
                  <FocusAreaTags areas={focusAreas} />
                </div>
              </div>

              {/* Philosophy */}
              <div className="bg-muted/50 border-l-4 border-secondary p-6 rounded-lg mb-8">
                <p className="text-foreground italic leading-relaxed">
                  "Healthcare should grow with you, meeting your needs today while preparing for your
                  tomorrow. I believe in building real relationships with my patients — when you know
                  someone's story, you can provide truly personalized care."
                </p>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Dr. Roy H. Jackson has been the heart of HCI Medical Group since 1978, bringing
                  over four decades of dedicated medical expertise to the Pasadena community. As
                  Medical Director, Dr. Jackson has built a practice renowned for its compassionate
                  approach to internal medicine and specialized geriatric care, serving generations
                  of families throughout their healthcare journeys.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A graduate of the University of Southern California Medical Center, Dr. Jackson
                  completed his internal medicine residency at USC and has remained committed to
                  delivering exceptional, personalized care to diverse patient populations. His
                  particular focus on geriatric medicine reflects his deep understanding that
                  healthcare needs evolve throughout life, requiring both clinical excellence and
                  genuine human connection.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Beyond his clinical practice at HCI Medical Group, Dr. Jackson has served the
                  community through Mobile Docs since 1998, providing essential home-based care
                  to homebound patients, ensuring that quality healthcare reaches those who need
                  it most. His career has been marked by leadership roles including Medical Director
                  positions at Andrew Escajeda Clinic, St. Luke's Medical Center, and various
                  community healthcare facilities throughout Los Angeles County.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Dr. Jackson's commitment to healthcare excellence has earned recognition from
                  the California State Assembly, the City of Pasadena, and Consumer's Research
                  Council of America. He maintains active memberships in the American Medical
                  Association, American College of Physicians, California Medical Association,
                  and National Medical Association, staying current with the latest advances in
                  internal medicine and geriatric care.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  At HCI Medical Group, Dr. Jackson leads a team dedicated to providing comprehensive,
                  evidence-based care that addresses the whole person—from preventive medicine and
                  chronic disease management to the aesthetic wellness services that help patients
                  feel their best at every age. His philosophy is simple: healthcare should grow
                  with you, meeting your needs today while preparing for your tomorrow.
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
