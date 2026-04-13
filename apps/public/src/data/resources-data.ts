export interface PatientForm {
  id: string;
  title: string;
  description: string;
  filename: string;
  category: 'new-patient' | 'records' | 'privacy';
}

export interface InsuranceInfo {
  id: string;
  name: string;
  type: 'Medicare' | 'PPO' | 'HMO';
  coverageNotes: string;
  referralRequired: boolean;
  website?: string;
}

export interface VisitGuide {
  id: string;
  visitType: string;
  description: string;
  checklist: string[];
  estimatedDuration: string;
}

export const patientForms: PatientForm[] = [
  {
    id: 'new-patient-intake',
    title: 'New Patient Intake Form',
    description: 'Complete this form before your first visit to help us understand your health history and current needs.',
    filename: 'new-patient-intake.pdf',
    category: 'new-patient',
  },
  {
    id: 'medical-records-release',
    title: 'Medical Records Release',
    description: 'Authorize the transfer of your medical records to or from another healthcare provider.',
    filename: 'medical-records-release.pdf',
    category: 'records',
  },
  {
    id: 'hipaa-notice',
    title: 'HIPAA Notice of Privacy Practices',
    description: 'Our notice explaining how your medical information may be used and disclosed, and your rights regarding that information.',
    filename: 'hipaa-notice.pdf',
    category: 'privacy',
  },
  {
    id: 'patient-rights',
    title: 'Patient Rights & Responsibilities',
    description: 'A summary of your rights as a patient and your responsibilities in the care process.',
    filename: 'patient-rights.pdf',
    category: 'privacy',
  },
];

export const insuranceInfo: InsuranceInfo[] = [
  {
    id: 'medicare',
    name: 'Medicare',
    type: 'Medicare',
    coverageNotes: 'We accept Original Medicare (Parts A & B). Most preventive services, including the Annual Wellness Visit, are covered at no cost. Some services may require a 20% copay after your deductible is met. We also work with many Medicare Advantage plans.',
    referralRequired: false,
    website: 'https://www.medicare.gov',
  },
  {
    id: 'aetna',
    name: 'Aetna',
    type: 'PPO',
    coverageNotes: 'We accept Aetna PPO plans. Office visits, preventive care, and diagnostic services are typically covered. Your copay and deductible amounts depend on your specific plan. Contact Aetna or check your plan documents for details.',
    referralRequired: false,
    website: 'https://www.aetna.com',
  },
  {
    id: 'bcbs',
    name: 'Blue Cross Blue Shield',
    type: 'PPO',
    coverageNotes: 'We accept Blue Cross Blue Shield PPO plans. Most primary care services are covered, including annual physicals and preventive screenings. Copays vary by plan. Verify your coverage before your visit.',
    referralRequired: false,
    website: 'https://www.bcbs.com',
  },
  {
    id: 'cigna',
    name: 'Cigna',
    type: 'PPO',
    coverageNotes: 'We accept Cigna PPO plans. Office visits, lab work, and preventive services are generally covered. Check your plan for specific copay amounts and any applicable deductibles.',
    referralRequired: false,
    website: 'https://www.cigna.com',
  },
  {
    id: 'uhc',
    name: 'United Healthcare',
    type: 'PPO',
    coverageNotes: 'We accept United Healthcare PPO plans. Most primary care and preventive services are covered. Contact UHC or review your plan documents for your specific copay and deductible amounts.',
    referralRequired: false,
    website: 'https://www.uhc.com',
  },
  {
    id: 'regal',
    name: 'Regal Medical Group',
    type: 'HMO',
    coverageNotes: 'We are a participating provider with Regal Medical Group. As an HMO plan, you may need a referral from your primary care physician for specialist visits. Most office visits and preventive care are covered with a small copay.',
    referralRequired: true,
    website: 'https://www.regalmed.com',
  },
];

export const visitGuides: VisitGuide[] = [
  {
    id: 'first-visit',
    visitType: 'First Visit',
    description: 'Your first appointment is typically 45-60 minutes. We want to get to know you and your health history thoroughly.',
    checklist: [
      'Photo ID and insurance card',
      'List of current medications with dosages',
      'Previous medical records or recent test results',
      'List of health concerns or questions',
      'Completed new patient intake form (available above)',
      'Insurance referral, if required by your plan',
    ],
    estimatedDuration: '45-60 minutes',
  },
  {
    id: 'annual-physical',
    visitType: 'Annual Physical Exam',
    description: 'A comprehensive checkup to review your overall health, update screenings, and catch any early warning signs.',
    checklist: [
      'Insurance card',
      'Updated medication list',
      'List of any new symptoms or concerns since your last visit',
      'Results from any outside tests or specialist visits',
      'Wear comfortable, loose-fitting clothing',
      'Fast for 8-12 hours if blood work was requested',
    ],
    estimatedDuration: '30-45 minutes',
  },
  {
    id: 'medicare-awv',
    visitType: 'Medicare Annual Wellness Visit',
    description: 'A free yearly visit for Medicare beneficiaries focused on prevention and updating your personalized health plan.',
    checklist: [
      'Medicare card',
      'Updated medication list (including vitamins and supplements)',
      'List of current healthcare providers and specialists',
      'Any health screening results from the past year',
      'Questions about your prevention plan',
      'Family health history updates',
    ],
    estimatedDuration: '30-45 minutes',
  },
  {
    id: 'chronic-care',
    visitType: 'Chronic Care Follow-Up',
    description: 'Regular check-in for patients managing ongoing conditions like diabetes, hypertension, or heart disease.',
    checklist: [
      'Insurance card',
      'Updated medication list',
      'Home monitoring logs (blood pressure, blood sugar, weight)',
      'Questions about your treatment plan',
      'List of any new or worsening symptoms',
      'Bring your monitoring devices if applicable',
    ],
    estimatedDuration: '20-30 minutes',
  },
];
