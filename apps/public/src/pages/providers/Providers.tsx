import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { ArrowRight } from "lucide-react";
import { providers } from "@/data/providers";

export default function Providers() {
  return (
    <Layout>
      <SEO {...pageSEO.providers} />
      <PageHero
        title="Our Providers"
        subtitle="Meet the experienced, compassionate team dedicated to your health at every stage of life."
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-10">
            {providers.map((provider) => (
              <article
                key={provider.href}
                className="grid md:grid-cols-[340px_1fr] bg-card rounded-xl overflow-hidden border border-border card-shadow hover:shadow-[var(--card-shadow-hover)] transition-shadow"
              >
                <div className="relative bg-muted aspect-[4/5] md:aspect-auto md:min-h-[440px]">
                  <img
                    src={provider.photo}
                    alt={provider.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-[center_top]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 to-transparent pt-10 pb-4 px-5">
                    <span className="inline-block bg-secondary text-secondary-foreground text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-sm">
                      {provider.roleBadge}
                    </span>
                  </div>
                </div>

                <div className="p-8 md:p-10 flex flex-col">
                  <h2 className="font-display text-xl md:text-2xl font-bold text-primary leading-tight mb-1">
                    {provider.name}
                  </h2>
                  <p className="text-secondary text-sm font-bold mb-1">
                    {provider.title}
                  </p>
                  <p className="text-muted-foreground text-sm mb-5">
                    {provider.credentialsLine}
                  </p>
                  <hr className="border-t border-border mb-5" />
                  <p className="text-foreground/80 leading-relaxed mb-6 flex-1">
                    {provider.shortBio}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {provider.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="bg-muted border border-border text-primary text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={provider.href}
                    className="group inline-flex items-center gap-1.5 text-secondary font-semibold text-sm hover:gap-2 transition-all w-fit"
                  >
                    View Full Profile
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 border-t border-border py-14">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
            Ready to Meet Your Care Team?
          </h2>
          <p className="text-muted-foreground mb-6">
            Whether you're a new patient or returning for ongoing care, we're here to help you take the next step toward better health.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/appointments"
              className="bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Request an Appointment
            </Link>
            <a
              href="tel:6267924185"
              className="border-2 border-primary text-primary font-semibold px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              (626) 792-4185
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
