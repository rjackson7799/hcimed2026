import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { ProviderDetail } from "@/components/providers/ProviderDetail";
import { siteConfig } from "@/config/site";
import { getProviderBySlug, getOtherProviders } from "@/data/providers";

const provider = getProviderBySlug("dr-jackson");
const otherProviders = getOtherProviders("dr-jackson");

const physicianSchema = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: provider.schema.name,
  medicalSpecialty: provider.schema.medicalSpecialty,
  jobTitle: provider.schema.jobTitle,
  memberOf: { "@type": "MedicalOrganization", name: siteConfig.name },
  address: {
    "@type": "PostalAddress",
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
      <ProviderDetail provider={provider} otherProviders={otherProviders} />
    </Layout>
  );
}
