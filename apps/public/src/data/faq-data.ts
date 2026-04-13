export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'appointments' | 'services' | 'insurance';
}

// Main FAQ page entries (all 15 original entries preserved)
export const faqData: FAQItem[] = [
  {
    question: 'What insurance plans do you accept?',
    answer: "We accept Medicare, Regal HMO, and all PPO plans. Please contact our office at 626-792-4185 to verify your specific coverage before your first visit. We're happy to answer any questions about billing and payment options.",
    category: 'insurance',
  },
  {
    question: 'Will I see the same doctor each visit?',
    answer: "Yes. Continuity of care is central to how we practice medicine. You'll see the same provider at each visit, allowing us to build a real relationship and truly understand your health over time. No rotating doctors or starting over each appointment.",
    category: 'general',
  },
  {
    question: 'How quickly can I get an appointment?',
    answer: "We typically offer same-week appointments for established patients. For new patients, we work to schedule you as quickly as possible. If you have an urgent concern, call us at 626-792-4185 and we'll do our best to see you promptly.",
    category: 'appointments',
  },
  {
    question: 'How long has HCI Medical Group been in Pasadena?',
    answer: "Dr. Roy H. Jackson founded HCI Medical Group in 1990. We've been serving Pasadena and the San Gabriel Valley for over 35 years, caring for multiple generations of families in our community.",
    category: 'general',
  },
  {
    question: 'How do I schedule an appointment?',
    answer: "You can schedule an appointment by calling our office at 626-792-4185, emailing us at care@hcimed.com, or using the contact form on our website. We'll work to find a time that's convenient for you.",
    category: 'appointments',
  },
  {
    question: 'What should I bring to my first appointment?',
    answer: 'Please bring your insurance card, a valid photo ID, a list of current medications (including dosages), and any relevant medical records or test results. If you have specific health concerns, writing them down beforehand can help ensure we address everything during your visit.',
    category: 'appointments',
  },
  {
    question: 'Do you offer telehealth appointments?',
    answer: 'Yes, we offer telehealth appointments for appropriate consultations and follow-up visits. This can be especially convenient for our senior care patients. Contact us to see if telehealth is right for your needs.',
    category: 'services',
  },
  {
    question: 'What are your office hours?',
    answer: 'Our office is open Monday through Friday from 9:00 AM to 5:00 PM. We are closed on weekends and major holidays.',
    category: 'general',
  },
  {
    question: 'Do you accept Medicare?',
    answer: 'Yes, we accept Medicare and provide all covered services including Annual Wellness Visits at no cost to you. Our team is experienced in helping Medicare patients navigate their benefits and get the care they need.',
    category: 'insurance',
  },
  {
    question: 'How do I request my medical records?',
    answer: "You can request your medical records by contacting our office. We'll provide you with the necessary forms to complete. Please allow adequate time for processing your request.",
    category: 'general',
  },
  {
    question: 'Do you provide care for chronic conditions?',
    answer: 'Yes, managing chronic conditions is a significant part of our practice. We provide comprehensive care for conditions such as diabetes, hypertension, heart disease, and more. Our approach focuses on both treatment and prevention.',
    category: 'services',
  },
  {
    question: 'What senior care services do you offer?',
    answer: "Our senior care services include preventive wellness screenings, chronic disease management, transition of care support (after hospitalization), and remote patient monitoring. We're dedicated to helping older adults maintain their quality of life.",
    category: 'services',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We serve patients from Pasadena, Altadena, South Pasadena, San Marino, Arcadia, and throughout the San Gabriel Valley. Our office is conveniently located at 65 N. Madison Ave. in Pasadena.',
    category: 'general',
  },
  {
    question: 'Is parking available at your office?',
    answer: 'Yes, there is parking available near our office building. Please contact us for specific parking information and accessibility accommodations.',
    category: 'general',
  },
  {
    question: 'How can I prepare for my annual physical exam?',
    answer: 'For your annual physical, we recommend fasting for 8-12 hours if bloodwork is planned, bringing your medication list, and preparing any questions or health concerns you\'d like to discuss. Wear comfortable clothing, and allow adequate time for the appointment.',
    category: 'appointments',
  },
];

// Service-specific FAQs
export const physicalExamFaqs: FAQItem[] = [
  {
    question: 'How often should I get a physical exam?',
    answer: 'Most adults should get a physical exam annually. If you have chronic conditions or risk factors, your provider may recommend more frequent visits. Medicare covers an Annual Wellness Visit every 12 months at no cost to you.',
    category: 'services',
  },
  {
    question: 'What does a physical exam include?',
    answer: 'A comprehensive physical includes vital signs, heart and lung examination, blood pressure screening, blood work (cholesterol, glucose, CBC), cancer screenings appropriate for your age and gender, and a review of your medications and health goals.',
    category: 'services',
  },
  {
    question: 'Is a physical exam covered by insurance?',
    answer: 'Most insurance plans, including Medicare, cover an annual preventive physical or wellness visit at no cost to you. PPO plans typically cover annual physicals as part of preventive care benefits. Contact our office to verify your specific coverage.',
    category: 'insurance',
  },
];

export const seniorCareFaqs: FAQItem[] = [
  {
    question: 'What is an Annual Wellness Visit?',
    answer: 'An Annual Wellness Visit (AWV) is a yearly preventive visit covered by Medicare at no cost. It includes a health risk assessment, review of your medical history, personalized prevention plan, and screenings. It\'s different from a standard physical exam and focuses on prevention planning.',
    category: 'services',
  },
  {
    question: 'Is the Annual Wellness Visit covered by Medicare?',
    answer: 'Yes, Medicare Part B covers one Annual Wellness Visit per year with no copay, coinsurance, or deductible. It\'s one of the most valuable preventive benefits available to Medicare beneficiaries.',
    category: 'insurance',
  },
  {
    question: "What's the difference between a physical and an Annual Wellness Visit?",
    answer: 'A physical exam is a hands-on clinical examination of your body. An Annual Wellness Visit focuses on prevention planning — reviewing your health risks, updating your prevention schedule, and creating a personalized care plan. Many patients benefit from both.',
    category: 'services',
  },
];

export const chronicCareFaqs: FAQItem[] = [
  {
    question: 'What is Chronic Care Management?',
    answer: 'Chronic Care Management (CCM) is a Medicare program that provides ongoing, coordinated care for patients with two or more chronic conditions. It includes regular check-ins, medication management, care coordination between providers, and 24/7 access to your care team.',
    category: 'services',
  },
  {
    question: 'Who qualifies for Chronic Care Management?',
    answer: 'Medicare patients with two or more chronic conditions that are expected to last at least 12 months qualify for CCM. Common qualifying conditions include diabetes, hypertension, heart disease, COPD, arthritis, and depression.',
    category: 'services',
  },
  {
    question: 'Is Chronic Care Management covered by Medicare?',
    answer: 'Yes, CCM is covered by Medicare Part B. There may be a small copay (typically around 20%) depending on your plan. Many patients find the value of regular care coordination far outweighs the minimal cost.',
    category: 'insurance',
  },
];

/** Generate FAQPage JSON-LD schema from an array of FAQ items */
export function generateFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
