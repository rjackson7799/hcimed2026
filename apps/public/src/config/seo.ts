import { siteConfig } from './site';

export interface PageSEO {
  title: string;
  description: string;
  canonical?: string;
}

export const pageSEO: Record<string, PageSEO> = {
  home: {
    title: 'Internal Medicine & Senior Care in Pasadena Since 1990',
    description:
      'HCI Medical Group provides trusted internal medicine and senior care in Pasadena. Dr. Roy H. Jackson, MD and team. Medicare accepted. Call (626) 792-4185.',
    canonical: siteConfig.url,
  },

  ourStory: {
    title: 'Our Story',
    description:
      'Meet Dr. Roy H. Jackson, MD and the HCI Medical Group team. Serving Pasadena families with compassionate internal medicine and senior care since 1990.',
    canonical: `${siteConfig.url}/our-story`,
  },

  contact: {
    title: 'Contact Us',
    description:
      'Contact HCI Medical Group in Pasadena. Call (626) 792-4185 or visit us at 65 N. Madison Ave #709, Pasadena, CA 91101. We accept Medicare and most PPO insurance.',
    canonical: `${siteConfig.url}/contact`,
  },

  faq: {
    title: 'Frequently Asked Questions',
    description:
      'Find answers to common questions about HCI Medical Group services, insurance, appointments, and patient care in Pasadena.',
    canonical: `${siteConfig.url}/faq`,
  },

  appointments: {
    title: 'Request an Appointment',
    description:
      'Request an appointment at HCI Medical Group in Pasadena. New and existing patients welcome. Same-day appointments may be available. Call (626) 792-4185.',
    canonical: `${siteConfig.url}/appointments`,
  },

  careers: {
    title: 'Careers',
    description:
      'Join the HCI Medical Group team in Pasadena. View current job openings in healthcare and medical administration. Apply online today.',
    canonical: `${siteConfig.url}/careers`,
  },

  insuranceUpdate: {
    title: 'Insurance Update',
    description:
      'Important insurance updates for HCI Medical Group patients. Learn about accepted insurance plans and coverage changes.',
    canonical: `${siteConfig.url}/insurance-update`,
  },

  seniorCarePlus: {
    title: 'Senior Care Plus Program',
    description:
      'Comprehensive senior care program in Pasadena. Personalized care for Medicare patients including wellness visits, chronic care management, and preventive services.',
    canonical: `${siteConfig.url}/senior-care-plus`,
  },

  // Internal Medicine pages
  physicalExams: {
    title: 'Physical Exams & Wellness Visits',
    description:
      'Comprehensive physical exams and annual wellness visits in Pasadena. Preventive care, health screenings, and personalized health assessments at HCI Medical Group.',
    canonical: `${siteConfig.url}/internal-medicine/physical-exams`,
  },

  acuteCare: {
    title: 'Acute Care & Sick Visits',
    description:
      'Same-day sick visits and acute care in Pasadena. Treatment for infections, injuries, and urgent health concerns. Call HCI Medical Group at (626) 792-4185.',
    canonical: `${siteConfig.url}/internal-medicine/acute-care`,
  },

  womensHealth: {
    title: "Women's Health Services",
    description:
      "Comprehensive women's health services in Pasadena. Annual exams, preventive screenings, hormone management, and personalized care at HCI Medical Group.",
    canonical: `${siteConfig.url}/internal-medicine/womens-health`,
  },

  mensHealth: {
    title: "Men's Health Services",
    description:
      "Men's health services in Pasadena including prostate health, cardiovascular screening, testosterone evaluation, and preventive care at HCI Medical Group.",
    canonical: `${siteConfig.url}/internal-medicine/mens-health`,
  },

  diagnostics: {
    title: 'Diagnostic Services',
    description:
      'On-site diagnostic services in Pasadena including EKG, lab work, and health screenings. Fast results and personalized care at HCI Medical Group.',
    canonical: `${siteConfig.url}/internal-medicine/diagnostics`,
  },

  // Senior Care pages
  preventionWellness: {
    title: 'Prevention & Wellness for Seniors',
    description:
      'Preventive care and wellness services for seniors in Pasadena. Medicare Annual Wellness Visits, vaccinations, and health screenings at HCI Medical Group.',
    canonical: `${siteConfig.url}/senior-care/prevention-wellness`,
  },

  chronicCare: {
    title: 'Chronic Care Management',
    description:
      'Chronic care management for seniors in Pasadena. Expert management of diabetes, hypertension, heart disease, and other chronic conditions at HCI Medical Group.',
    canonical: `${siteConfig.url}/senior-care/chronic-care`,
  },

  transitionCare: {
    title: 'Transition Care Services',
    description:
      'Post-hospital transition care in Pasadena. Coordinated follow-up care after hospitalization to ensure safe recovery at HCI Medical Group.',
    canonical: `${siteConfig.url}/senior-care/transition-care`,
  },

  remoteMonitoring: {
    title: 'Remote Patient Monitoring',
    description:
      'Remote patient monitoring services for seniors in Pasadena. Track vital signs from home with connected devices and care team support at HCI Medical Group.',
    canonical: `${siteConfig.url}/senior-care/remote-monitoring`,
  },

  // Blog pages
  blog: {
    title: 'Health Resources & Blog',
    description:
      'Health tips, medical insights, and wellness resources from HCI Medical Group in Pasadena. Expert advice on internal medicine and senior care.',
    canonical: `${siteConfig.url}/blog`,
  },
};
