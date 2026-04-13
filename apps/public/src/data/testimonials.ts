// TODO: Replace with real patient testimonials
// Use first name + last initial only. No medical details. Source from public
// Google/Yelp reviews or written patient consent (HIPAA compliance).

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  serviceCategory: 'internal-medicine' | 'senior-care' | 'general';
  source?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria L.',
    rating: 5,
    text: 'Dr. Jackson has been my doctor for over 15 years. He truly listens and takes the time to explain everything.',
    serviceCategory: 'general',
    source: 'Google',
  },
  {
    id: '2',
    name: 'Robert C.',
    rating: 5,
    text: 'The staff is always friendly and professional. I never feel rushed during my appointments.',
    serviceCategory: 'general',
    source: 'Google',
  },
  {
    id: '3',
    name: 'Helen T.',
    rating: 5,
    text: 'After my hospital stay, the transition of care team made sure I had everything I needed at home. Truly compassionate.',
    serviceCategory: 'senior-care',
    source: 'Patient',
  },
  {
    id: '4',
    name: 'James W.',
    rating: 5,
    text: 'I appreciate the thorough physical exams here. They caught something early that another doctor missed.',
    serviceCategory: 'internal-medicine',
    source: 'Google',
  },
  {
    id: '5',
    name: 'Susan K.',
    rating: 5,
    text: 'The remote monitoring program has been wonderful for managing my blood pressure. I feel more in control of my health.',
    serviceCategory: 'senior-care',
    source: 'Patient',
  },
  {
    id: '6',
    name: 'David M.',
    rating: 4,
    text: 'Great practice with a real focus on preventive care. They take the time to educate you about your health.',
    serviceCategory: 'internal-medicine',
    source: 'Yelp',
  },
  {
    id: '7',
    name: 'Patricia R.',
    rating: 5,
    text: 'My mother has been a patient here for years. The way they care for seniors is exceptional — like family.',
    serviceCategory: 'senior-care',
    source: 'Google',
  },
  {
    id: '8',
    name: 'Michael S.',
    rating: 5,
    text: 'Finding a doctor who actually knows your history and follows up is rare. HCI Medical Group is that practice.',
    serviceCategory: 'general',
    source: 'Google',
  },
];
