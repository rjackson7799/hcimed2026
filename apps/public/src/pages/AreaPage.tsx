import { useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { NeighborhoodPage } from '@/components/neighborhoods/NeighborhoodPage';
import { LocalBusinessSchema } from '@/components/neighborhoods/LocalBusinessSchema';
import { getNeighborhoodBySlug } from '@/data/neighborhoods';
import { siteConfig } from '@/config/site';

export default function AreaPage() {
  const { slug } = useParams<{ slug: string }>();
  const neighborhood = slug ? getNeighborhoodBySlug(slug) : undefined;

  if (!neighborhood) {
    return <Navigate to="/" replace />;
  }

  const isPasadena = neighborhood.slug === 'pasadena';

  return (
    <Layout>
      <SEO
        title={`Internal Medicine & Senior Care in ${neighborhood.name}`}
        description={`HCI Medical Group serves ${neighborhood.name} patients with trusted internal medicine and senior care. ${isPasadena ? 'Located in the heart of Pasadena.' : `Only ${neighborhood.distanceFromOffice} from ${neighborhood.name}.`} Call ${siteConfig.contact.phone}.`}
        canonical={`${siteConfig.url}/areas/${neighborhood.slug}`}
      />
      <LocalBusinessSchema neighborhood={neighborhood} />
      <NeighborhoodPage neighborhood={neighborhood} />
    </Layout>
  );
}
