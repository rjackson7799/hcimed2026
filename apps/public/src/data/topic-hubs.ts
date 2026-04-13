export interface TopicHub {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  introContent: string;
  relatedTags: string[];
  relatedServices: Array<{ title: string; href: string; description: string }>;
  faqKeywords: string[];
  ctaText: string;
  ctaLink: string;
}

export const topicHubs: TopicHub[] = [
  {
    slug: 'diabetes-care',
    title: 'Diabetes Care',
    metaTitle: 'Diabetes Care & Management in Pasadena',
    metaDescription: 'Comprehensive diabetes care at HCI Medical Group. Blood sugar management, A1C monitoring, chronic care coordination, and personalized treatment plans in Pasadena.',
    heroSubtitle: 'Personalized diabetes management from a team that knows you',
    introContent: `Living with diabetes requires ongoing attention, but you don't have to manage it alone. At HCI Medical Group, we take a whole-person approach to diabetes care — combining regular monitoring, medication management, lifestyle guidance, and care coordination to help you stay in control.

Our providers work with you to set realistic goals, understand your numbers, and make adjustments as your needs change. Whether you're newly diagnosed or have been managing diabetes for years, we're here to support you at every step.

Through our Chronic Care Management program, we stay connected with you between visits — monitoring your progress, coordinating with specialists, and answering questions when they come up. Because managing diabetes is about what happens every day, not just at your quarterly appointment.`,
    relatedTags: ['Diabetes', 'Chronic Care'],
    relatedServices: [
      { title: 'Chronic Care Management', href: '/senior-care/chronic-care', description: 'Ongoing coordination and support for chronic conditions' },
      { title: 'Physical Exams', href: '/internal-medicine/physical-exams', description: 'Comprehensive exams including A1C and blood sugar screening' },
      { title: 'Remote Monitoring', href: '/senior-care/remote-monitoring', description: 'Daily blood glucose tracking from home' },
    ],
    faqKeywords: ['chronic care', 'CCM', 'diabetes'],
    ctaText: 'Schedule a Diabetes Care Consultation',
    ctaLink: '/appointments',
  },
  {
    slug: 'heart-health',
    title: 'Heart Health',
    metaTitle: 'Heart Health & Blood Pressure Management in Pasadena',
    metaDescription: 'Heart health screenings, blood pressure management, and cardiovascular care at HCI Medical Group in Pasadena. Preventive care and ongoing monitoring.',
    heroSubtitle: 'Protecting your heart with proactive, personalized care',
    introContent: `Heart disease remains the leading cause of death in the United States, but many of its risk factors — high blood pressure, high cholesterol, and inactivity — are manageable with the right care and lifestyle changes.

At HCI Medical Group, we focus on early detection and consistent management. Regular blood pressure checks, cholesterol screenings, and cardiovascular risk assessments are part of every routine visit. When we catch problems early, we have more options and better outcomes.

If you're already managing hypertension or heart disease, our team provides ongoing monitoring, medication management, and care coordination to keep you on track. We believe that understanding your numbers and having a trusted partner in your care makes all the difference.`,
    relatedTags: ['Hypertension', 'Heart Health', 'Preventive Care'],
    relatedServices: [
      { title: 'Physical Exams', href: '/internal-medicine/physical-exams', description: 'Blood pressure screening and cardiovascular risk assessment' },
      { title: 'Diagnostics', href: '/internal-medicine/diagnostics', description: 'EKG, lab work, and diagnostic testing' },
      { title: 'Chronic Care Management', href: '/senior-care/chronic-care', description: 'Ongoing management for heart-related conditions' },
    ],
    faqKeywords: ['physical', 'blood pressure', 'heart'],
    ctaText: 'Schedule a Heart Health Screening',
    ctaLink: '/appointments',
  },
  {
    slug: 'medicare-senior-services',
    title: 'Medicare & Senior Services',
    metaTitle: 'Medicare Services & Senior Care in Pasadena',
    metaDescription: 'Medicare Annual Wellness Visits, Chronic Care Management, and Remote Patient Monitoring at HCI Medical Group. Comprehensive senior care in Pasadena.',
    heroSubtitle: 'Making the most of your Medicare benefits with trusted senior care',
    introContent: `Navigating Medicare can be confusing, but getting excellent care shouldn't be. At HCI Medical Group, we help our senior patients understand and maximize their Medicare benefits — from free Annual Wellness Visits to Chronic Care Management and Remote Patient Monitoring programs.

Dr. Jackson and our nurse practitioners have decades of experience caring for older adults. We understand the unique health challenges that come with aging, and we take the time to listen, explain, and collaborate with you on your care plan.

Our senior care programs go beyond the office visit. Through CCM, we stay in touch between appointments to manage chronic conditions. With RPM, we can monitor your vital signs daily from the comfort of your home. And every service is designed to help you live well, stay independent, and feel supported.`,
    relatedTags: ['Medicare', 'Senior Health', 'Remote Monitoring'],
    relatedServices: [
      { title: 'Senior Care+ Program', href: '/senior-care-plus', description: 'Our comprehensive senior care management program' },
      { title: 'Prevention & Wellness', href: '/senior-care/prevention-wellness', description: 'Annual Wellness Visits and preventive screenings' },
      { title: 'Chronic Care Management', href: '/senior-care/chronic-care', description: 'Monthly care coordination for chronic conditions' },
      { title: 'Remote Monitoring', href: '/senior-care/remote-monitoring', description: 'Daily health tracking from home' },
    ],
    faqKeywords: ['Medicare', 'AWV', 'senior', 'wellness visit'],
    ctaText: 'Schedule Your Medicare Wellness Visit',
    ctaLink: '/appointments',
  },
  {
    slug: 'preventive-care',
    title: 'Preventive Care',
    metaTitle: 'Preventive Care & Health Screenings in Pasadena',
    metaDescription: 'Stay ahead of health problems with preventive care at HCI Medical Group. Annual physicals, screenings, vaccinations, and wellness plans in Pasadena.',
    heroSubtitle: 'The best treatment is prevention — and it starts with your annual checkup',
    introContent: `Preventive care is the foundation of good health. Regular checkups, age-appropriate screenings, and timely vaccinations can catch problems early — when they're easiest and least expensive to treat.

At HCI Medical Group, prevention isn't an afterthought. It's central to how we practice medicine. Every visit is an opportunity to review your health, update your screenings, and make sure you're on track for the year ahead.

Whether you're in your 30s establishing baseline health markers or in your 70s staying on top of Medicare-covered screenings, we tailor our preventive approach to your age, risk factors, and personal health goals. Because an ounce of prevention really is worth a pound of cure.`,
    relatedTags: ['Preventive Care', 'Wellness', 'Screenings', 'Vaccinations'],
    relatedServices: [
      { title: 'Physical Exams', href: '/internal-medicine/physical-exams', description: 'Comprehensive annual physicals and health assessments' },
      { title: 'Prevention & Wellness', href: '/senior-care/prevention-wellness', description: 'Age-appropriate screenings and vaccinations' },
      { title: 'Diagnostics', href: '/internal-medicine/diagnostics', description: 'In-office lab work and diagnostic testing' },
    ],
    faqKeywords: ['physical', 'screening', 'preventive', 'vaccination'],
    ctaText: 'Schedule Your Annual Checkup',
    ctaLink: '/appointments',
  },
];

export function getTopicBySlug(slug: string): TopicHub | undefined {
  return topicHubs.find((h) => h.slug === slug);
}
