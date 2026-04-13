import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/config/site';
import type { Neighborhood } from '@/data/neighborhoods';

interface LocalBusinessSchemaProps {
  neighborhood: Neighborhood;
}

export function LocalBusinessSchema({ neighborhood }: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    name: siteConfig.name,
    url: `${siteConfig.url}/areas/${neighborhood.slug}`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    description: `${siteConfig.name} provides trusted internal medicine and senior care to ${neighborhood.name} residents. ${neighborhood.distanceMiles > 0 ? `Only ${neighborhood.distanceFromOffice} from ${neighborhood.name}.` : 'Located in the heart of Pasadena.'}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${siteConfig.address.street} ${siteConfig.address.suite}`,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 34.1478,
      longitude: -118.1445,
    },
    areaServed: {
      '@type': 'City',
      name: neighborhood.name,
    },
    medicalSpecialty: ['InternalMedicine', 'Geriatric'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
