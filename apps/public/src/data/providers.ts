import drJacksonPhoto from "@/assets/providers/profile_jackson.jpg";
import appleEvangelistaPhoto from "@/assets/providers/profile_evangelista.jpg";
import marilethTanPhoto from "@/assets/providers/profile_tan.jpg";

export type ProviderSlug = "dr-jackson" | "apple-evangelista" | "marileth-tan";

export interface CredentialsData {
  education: string[];
  certifications: string[];
  languages: string[];
  yearsExperience: number;
}

export interface Provider {
  slug: ProviderSlug;
  href: string;
  name: string;
  shortName: string;
  title: string;
  roleBadge: string;
  credentialsLine: string;
  photo: string;
  shortBio: string;
  fullBio: string[];
  quote: string;
  specialties: string[];
  services: string[];
  credentials: CredentialsData;
  acceptsAppointments: boolean;
  schema: {
    name: string;
    jobTitle: string;
    medicalSpecialty: string;
  };
}

export const providers: Provider[] = [
  {
    slug: "dr-jackson",
    href: "/providers/dr-jackson",
    name: "Dr. Roy H. Jackson, M.D.",
    shortName: "Dr. Jackson",
    title: "Medical Director",
    roleBadge: "Medical Director",
    credentialsLine: "Board Certified Internal Medicine & Geriatric Care Specialist",
    photo: drJacksonPhoto,
    shortBio:
      "Leading HCI Medical Group since 1978, Dr. Jackson brings over four decades of dedicated expertise in internal medicine and geriatric care to the Pasadena community.",
    fullBio: [
      "Dr. Roy H. Jackson has been the heart of HCI Medical Group since 1978, bringing over four decades of dedicated medical expertise to the Pasadena community. As Medical Director, Dr. Jackson has built a practice renowned for its compassionate approach to internal medicine and specialized geriatric care, serving generations of families throughout their healthcare journeys.",
      "A graduate of the University of Southern California Medical Center, Dr. Jackson completed his internal medicine residency at USC and has remained committed to delivering exceptional, personalized care to diverse patient populations. His particular focus on geriatric medicine reflects his deep understanding that healthcare needs evolve throughout life, requiring both clinical excellence and genuine human connection.",
      "Beyond his clinical practice at HCI Medical Group, Dr. Jackson has served the community through Mobile Docs since 1998, providing essential home-based care to homebound patients and ensuring that quality healthcare reaches those who need it most. His career has been marked by leadership roles including Medical Director positions at Andrew Escajeda Clinic, St. Luke's Medical Center, and various community healthcare facilities throughout Los Angeles County.",
      "Dr. Jackson's commitment to healthcare excellence has earned recognition from the California State Assembly, the City of Pasadena, and Consumer's Research Council of America. He maintains active memberships in the American Medical Association, American College of Physicians, California Medical Association, and National Medical Association, staying current with the latest advances in internal medicine and geriatric care.",
      "At HCI Medical Group, Dr. Jackson leads a team dedicated to providing comprehensive, evidence-based care that addresses the whole person — from preventive medicine and chronic disease management to the aesthetic wellness services that help patients feel their best at every age.",
    ],
    quote:
      "Healthcare should grow with you, meeting your needs today while preparing for your tomorrow. I believe in building real relationships with my patients — when you know someone's story, you can provide truly personalized care.",
    specialties: ["Internal Medicine", "Geriatric Care", "Preventive Medicine", "Senior Care"],
    services: [
      "Internal Medicine",
      "Geriatric Care",
      "Annual Wellness Visits",
      "Chronic Disease Management",
      "Hypertension & Diabetes",
      "Preventive Medicine",
      "Mobile Docs / Home Visits",
      "Senior Care+",
    ],
    credentials: {
      education: [
        "University of Southern California Medical Center",
        "Internal Medicine Residency, USC",
      ],
      certifications: [
        "Board Certified, Internal Medicine",
        "Geriatric Care Specialist",
      ],
      languages: ["English", "Tagalog"],
      yearsExperience: 45,
    },
    acceptsAppointments: false,
    schema: {
      name: "Dr. Roy H. Jackson",
      jobTitle: "Medical Director",
      medicalSpecialty: "InternalMedicine",
    },
  },
  {
    slug: "apple-evangelista",
    href: "/providers/apple-evangelista",
    name: 'Evelinda "Apple" Evangelista, MSN, APRN, AGACNP-BC, CCRN',
    shortName: "Ms. Evangelista",
    title: "Nurse Practitioner & Medical Aesthetics Specialist",
    roleBadge: "Nurse Practitioner & Medical Aesthetics",
    credentialsLine: "Board Certified Adult-Gerontology Acute Care Nurse Practitioner",
    photo: appleEvangelistaPhoto,
    shortBio:
      "Combining over a decade of critical care expertise with specialized training in advanced medical aesthetics, Ms. Evangelista delivers comprehensive care that bridges traditional healthcare with modern wellness treatments.",
    fullBio: [
      "Ms. Evangelista brings a unique blend of critical care expertise and aesthetic medicine to HCI Medical Group, combining over a decade of clinical nursing excellence with specialized training in advanced medical aesthetics. As a board-certified Adult-Gerontology Acute Care Nurse Practitioner, Ms. Evangelista delivers comprehensive care that bridges traditional healthcare with modern wellness treatments.",
      "With a Master of Science in Nursing from Chamberlain University and board certification from the American Nurses Credentialing Center, Ms. Evangelista's clinical foundation is built on extensive experience in critical care settings, including years as a preceptor and relief charge nurse at Emanate Health hospitals.",
      "Since 2022, Ms. Evangelista has distinguished herself as an aesthetic nurse injector and specialist in skin treatments, medical devices, and laser therapies. Her approach is rooted in understanding each patient's unique goals and creating personalized treatment plans that enhance natural beauty while supporting overall wellness.",
    ],
    quote:
      "I believe in treating the whole person, not just symptoms. My goal is to help every patient feel empowered and informed about their health journey.",
    specialties: ["Adult-Gerontology", "Primary Care", "Acute Care", "Women's Health", "Medical Aesthetics"],
    services: [
      "Preventive & Primary Care",
      "Neuromodulators (Botox / Dysport)",
      "Dermal Fillers",
      "Laser Skin Treatments",
      "Medical-Grade Skincare",
      "Women's Health",
      "Chronic Disease Management",
      "Patient Education",
    ],
    credentials: {
      education: [
        "MSN, Chamberlain University",
        "BSN, West Coast University",
      ],
      certifications: [
        "AGACNP-BC (Adult-Gerontology Acute Care)",
        "CCRN (Critical Care Registered Nurse)",
        "Aesthetic Nurse Injector",
      ],
      languages: ["English", "Tagalog"],
      yearsExperience: 10,
    },
    acceptsAppointments: true,
    schema: {
      name: "Evelinda Evangelista",
      jobTitle: "Nurse Practitioner",
      medicalSpecialty: "InternalMedicine",
    },
  },
  {
    slug: "marileth-tan",
    href: "/providers/marileth-tan",
    name: 'Marileth "Bap" Tan, MSN, FNP-C, CCRN',
    shortName: "Ms. Tan",
    title: "Family Nurse Practitioner",
    roleBadge: "Family Nurse Practitioner",
    credentialsLine: "Board Certified Family Nurse Practitioner",
    photo: marilethTanPhoto,
    shortBio:
      "With over 17 years of clinical experience spanning critical care, primary care, and emergency medicine, Ms. Tan delivers comprehensive, evidence-based care across the lifespan.",
    fullBio: [
      "Ms. Tan brings over 17 years of clinical nursing excellence to HCI Medical Group, with deep expertise spanning critical care, primary care, and emergency medicine. As a board-certified Family Nurse Practitioner, she delivers comprehensive, evidence-based care across the lifespan — from preventive wellness and chronic disease management to acute medical concerns.",
      "With a Master of Science in Nursing from United States University and a Bachelor of Science in Nursing from California State University, Fullerton, Ms. Tan's clinical foundation was built through more than a decade of CCU/ICU nursing at Inter-Community Hospital in Covina, where she served as a relief charge nurse, mentored new nurses, and earned both the DAISY Award (2017) and Nurse of the Year for Displaying Integrity (2018).",
      "Since earning her FNP-C certification, Ms. Tan has expanded her practice to include primary care at Adventist Health and Omni Family Health, as well as emergency department fast-track care with Vituity — managing everything from minor trauma and infections to complex chronic conditions. She also serves as a Clinical Instructor for United States University's FNP program, guiding the next generation of nurse practitioners.",
      "As a Certified Clinical Functional Nutritionist, Ms. Tan brings an integrative lens to her practice — connecting nutrition, lifestyle, and metabolic health to support lasting wellness. She leads HCI's Medical Weight Loss and Functional Nutrition programs, helping patients achieve meaningful, sustainable results.",
    ],
    quote:
      "Every patient deserves a provider who truly listens. I bring the same level of care and attention to each visit, whether it's a routine check-up or a complex health concern.",
    specialties: ["Family Medicine", "Medical Weight Loss", "Functional Nutrition", "Critical Care"],
    services: [
      "Family Medicine",
      "Medical Weight Loss",
      "Functional Nutrition",
      "Acute & Critical Care",
      "Men's Health",
      "Women's Health",
      "Chronic Disease Management",
      "Preventive Care",
    ],
    credentials: {
      education: [
        "MSN, United States University",
        "BSN, California State University, Fullerton",
      ],
      certifications: [
        "FNP-C (Family Nurse Practitioner)",
        "CCRN (Critical Care Registered Nurse)",
        "Certified Clinical Functional Nutritionist",
      ],
      languages: ["English", "Tagalog"],
      yearsExperience: 17,
    },
    acceptsAppointments: true,
    schema: {
      name: "Marileth Tan",
      jobTitle: "Family Nurse Practitioner",
      medicalSpecialty: "InternalMedicine",
    },
  },
];

export function getProviderBySlug(slug: ProviderSlug): Provider {
  const provider = providers.find((p) => p.slug === slug);
  if (!provider) throw new Error(`Unknown provider slug: ${slug}`);
  return provider;
}

export function getOtherProviders(slug: ProviderSlug): Provider[] {
  return providers.filter((p) => p.slug !== slug);
}
