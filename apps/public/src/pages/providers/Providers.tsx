import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { ArrowRight } from "lucide-react";

const providers = [
  {
    name: "Dr. Roy H. Jackson, M.D.",
    title: "Medical Director",
    credentials: "Board Certified Internal Medicine & Geriatric Care Specialist",
    initials: "RJ",
    summary:
      "Leading HCI Medical Group since 1978, Dr. Jackson brings over four decades of dedicated expertise in internal medicine and geriatric care to the Pasadena community.",
    href: "/providers/dr-jackson",
  },
  {
    name: 'Evelinda "Apple" Evangelista, MSN, APRN, AGACNP-BC, CCRN',
    title: "Nurse Practitioner & Medical Aesthetics Specialist",
    credentials: "Board Certified Adult-Gerontology Acute Care Nurse Practitioner",
    initials: "AE",
    summary:
      "Combining over a decade of critical care expertise with specialized training in advanced medical aesthetics, Ms. Evangelista delivers comprehensive care that bridges traditional healthcare with modern wellness treatments.",
    href: "/providers/apple-evangelista",
  },
  {
    name: 'Marileth "Bap" Tan, MSN, FNP-C, CCRN',
    title: "Family Nurse Practitioner",
    credentials: "Board Certified Family Nurse Practitioner",
    initials: "MT",
    summary:
      "With over 17 years of clinical experience spanning critical care, primary care, and emergency medicine, Ms. Tan delivers comprehensive, evidence-based care across the lifespan.",
    href: "/providers/marileth-tan",
  },
];

export default function Providers() {
  return (
    <Layout>
      <SEO {...pageSEO.providers} />
      <PageHero
        title="Our Providers"
        subtitle="Meet the experienced team behind your care"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {providers.map((provider) => (
              <Link
                key={provider.href}
                to={provider.href}
                className="group bg-card rounded-xl p-8 card-shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[hsl(207,44%,24%)] to-[hsl(199,75%,42%)] flex items-center justify-center ring-4 ring-background shadow-md">
                    <span className="font-display text-2xl font-semibold text-white">
                      {provider.initials}
                    </span>
                  </div>
                </div>
                <div className="mb-6 pb-6 border-b border-border">
                  <h2 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {provider.name}
                  </h2>
                  <p className="text-secondary font-medium text-sm mb-1">
                    {provider.title}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {provider.credentials}
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {provider.summary}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                  View Profile
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
