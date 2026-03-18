import {
  Stethoscope, Zap, HeartPulse, UserRound, Microscope,
  Heart, Shield, Activity, Home, Smartphone,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

export const internalMedicineLinks: NavLink[] = [
  { title: "Physical Exams", href: "/internal-medicine/physical-exams", description: "Comprehensive annual wellness visits", icon: Stethoscope },
  { title: "Acute Care", href: "/internal-medicine/acute-care", description: "Illness, infections & minor injuries", icon: Zap },
  { title: "Women's Health", href: "/internal-medicine/womens-health", description: "Preventive screenings & hormonal health", icon: HeartPulse },
  { title: "Men's Health", href: "/internal-medicine/mens-health", description: "Prostate health & cardiovascular screening", icon: UserRound },
  { title: "Diagnostics", href: "/internal-medicine/diagnostics", description: "In-office testing & lab services", icon: Microscope },
];

export const seniorCareLinks: NavLink[] = [
  { title: "Senior Care+ Program", href: "/senior-care-plus", description: "Our comprehensive senior care management program", icon: Heart },
  { title: "Prevention & Wellness", href: "/senior-care/prevention-wellness", description: "Age-appropriate screenings & vaccinations", icon: Shield },
  { title: "Chronic Care Management", href: "/senior-care/chronic-care", description: "Diabetes, hypertension & heart disease", icon: Activity },
  { title: "Transition of Care", href: "/senior-care/transition-care", description: "Hospital discharge support", icon: Home },
  { title: "Remote Monitoring", href: "/senior-care/remote-monitoring", description: "Telehealth & remote patient monitoring", icon: Smartphone },
];
