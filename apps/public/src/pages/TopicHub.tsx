import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { TopicHubPage } from '@/components/topics/TopicHubPage';
import { getTopicBySlug } from '@/data/topic-hubs';
import { siteConfig } from '@/config/site';

export default function TopicHub() {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? getTopicBySlug(slug) : undefined;

  if (!topic) {
    return <Navigate to="/" replace />;
  }

  const canonicalUrl = `${siteConfig.url}/topics/${topic.slug}`;

  const medicalWebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: topic.metaTitle,
    description: topic.metaDescription,
    url: canonicalUrl,
    about: {
      '@type': 'MedicalCondition',
      name: topic.title,
    },
    mainEntity: {
      '@type': 'MedicalOrganization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <Layout>
      <SEO
        title={topic.metaTitle}
        description={topic.metaDescription}
        canonical={canonicalUrl}
        structuredData={medicalWebPageSchema}
      />
      <TopicHubPage topic={topic} />
    </Layout>
  );
}
