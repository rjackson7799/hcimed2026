import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Clock,
  GraduationCap,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import type { Provider } from "@/data/providers";

const insurers = [
  "Medicare",
  "Regal Medical Group",
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "United Healthcare",
];

const credentialBlocks = [
  { key: "certifications" as const, label: "Certifications", icon: Award },
  { key: "education" as const, label: "Education", icon: GraduationCap },
];

interface ProviderDetailProps {
  provider: Provider;
  otherProviders: Provider[];
}

export function ProviderDetail({ provider, otherProviders }: ProviderDetailProps) {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container relative">
          <div className="grid md:grid-cols-[1fr_340px] gap-8 md:gap-12 items-end pt-12 md:pt-16">
            <div className="pb-10 md:pb-12 order-2 md:order-1">
              <Link
                to="/providers"
                className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-foreground/60 hover:text-primary-foreground/90 transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                All Providers
              </Link>
              <span className="block w-fit bg-secondary text-secondary-foreground text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-sm mb-4">
                {provider.roleBadge}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-3">
                {provider.name}
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/75 mb-5">
                {provider.title}
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {provider.specialties.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/10 border border-white/20 text-primary-foreground/85 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {provider.acceptsAppointments && (
                  <Link
                    to="/appointments"
                    className="bg-secondary text-secondary-foreground font-semibold px-5 py-3 rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    Request Appointment
                  </Link>
                )}
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="border-2 border-white/35 text-primary-foreground/85 font-semibold px-5 py-3 rounded-md hover:border-white/70 hover:text-primary-foreground transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </div>
            </div>

            {/* Hero photo: stacks above on mobile (smaller), bottom-aligned hanging panel on desktop */}
            <div className="order-1 md:order-2 md:self-end md:h-[380px] -mb-px md:-mb-0">
              <div className="aspect-[4/5] md:aspect-auto md:h-full mx-auto max-w-xs md:max-w-none">
                <img
                  src={provider.photo}
                  alt={provider.name}
                  className="w-full h-full object-cover object-[center_top] rounded-t-lg shadow-[0_-8px_40px_rgba(0,0,0,0.25)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 md:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-14 max-w-6xl mx-auto items-start">
            {/* Sidebar — moved above main on small screens for fast access to CTA */}
            <aside className="lg:order-2 order-1 flex flex-col gap-5">
              {/* Appointment card */}
              <div
                className="rounded-lg p-6 text-primary-foreground text-center shadow-[0_4px_20px_rgba(12,35,64,0.15)]"
                style={{ background: "var(--hero-gradient)" }}
              >
                {provider.acceptsAppointments ? (
                  <>
                    <h3 className="font-display text-lg font-bold leading-snug mb-2">
                      Schedule with {provider.shortName}
                    </h3>
                    <p className="text-sm text-primary-foreground/65 mb-5 leading-relaxed">
                      New and existing patients welcome. Same-week appointments often available.
                    </p>
                    <Link
                      to="/appointments"
                      className="block w-full bg-secondary text-secondary-foreground font-bold text-sm tracking-wide px-4 py-3 rounded-md hover:bg-secondary/90 transition-colors mb-3"
                    >
                      Request Appointment
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-lg font-bold leading-snug mb-2">
                      {provider.shortName}'s Schedule
                    </h3>
                    <p className="text-sm text-primary-foreground/65 mb-5 leading-relaxed">
                      As Medical Director, {provider.shortName} maintains a private schedule. For inquiries, please contact our care team.
                    </p>
                  </>
                )}
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {siteConfig.contact.phone}
                </a>
              </div>

              {/* Contact & Location */}
              <SidebarCard title="Contact & Location">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                    <span className="leading-snug">
                      {siteConfig.address.street} {siteConfig.address.suite}
                      <br />
                      {siteConfig.address.city}, {siteConfig.address.state}{" "}
                      {siteConfig.address.zip}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-secondary font-semibold hover:underline"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                    <span>{siteConfig.hours.weekdays}</span>
                  </li>
                </ul>
              </SidebarCard>

              {/* Insurance Accepted */}
              <SidebarCard title="Insurance Accepted">
                <ul className="space-y-0">
                  {insurers.map((insurer, idx) => (
                    <li
                      key={insurer}
                      className={`flex items-center gap-2 text-sm text-muted-foreground py-1.5 ${
                        idx < insurers.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                      {insurer}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground/80 mt-3 leading-relaxed">
                  Please call to verify your specific plan is accepted before your visit.
                </p>
              </SidebarCard>

              {/* Other Providers */}
              <SidebarCard title="Our Other Providers">
                <div className="flex flex-col gap-1">
                  {otherProviders.map((other) => (
                    <Link
                      key={other.slug}
                      to={other.href}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <img
                        src={other.photo}
                        alt={other.name}
                        className="w-12 h-12 rounded-full object-cover object-[center_top] border-2 border-border shrink-0"
                      />
                      <div>
                        <div className="text-[13px] font-bold text-primary leading-tight">
                          {other.shortName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {other.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </SidebarCard>
            </aside>

            {/* Main column */}
            <main className="lg:order-1 order-2">
              {/* Quote */}
              <blockquote className="border-l-[3px] border-secondary bg-muted/60 px-5 py-4 rounded-r-md mb-8">
                <p className="font-display italic text-primary/85 leading-relaxed">
                  "{provider.quote}"
                </p>
              </blockquote>

              {/* Bio */}
              <SectionHeader label="About" heading="Background & Philosophy" />
              <div className="space-y-4 mb-10">
                {provider.fullBio.map((paragraph, i) => (
                  <p key={i} className="text-foreground/80 leading-[1.8]">
                    {paragraph}
                  </p>
                ))}
              </div>

              <hr className="border-t border-border my-9" />

              {/* Credentials */}
              <SectionHeader label="Credentials" heading="Background & Training" />
              <div className="grid sm:grid-cols-2 gap-6 mt-5">
                {credentialBlocks.map(({ key, label, icon: Icon }) => (
                  <CredentialBlock key={key} label={label} Icon={Icon}>
                    {provider.credentials[key].map((item) => (
                      <li
                        key={item}
                        className="text-sm text-muted-foreground py-1.5 border-b border-border last:border-b-0 leading-snug"
                      >
                        {item}
                      </li>
                    ))}
                  </CredentialBlock>
                ))}
                <CredentialBlock label="Languages" Icon={Globe}>
                  {provider.credentials.languages.map((lang) => (
                    <li
                      key={lang}
                      className="text-sm text-muted-foreground py-1.5 border-b border-border last:border-b-0"
                    >
                      {lang}
                    </li>
                  ))}
                </CredentialBlock>
                <CredentialBlock label="Experience" Icon={Clock}>
                  <li className="text-sm text-muted-foreground py-1.5 leading-snug">
                    {provider.credentials.yearsExperience}+ years of clinical practice
                  </li>
                </CredentialBlock>
              </div>

              <hr className="border-t border-border my-9" />

              {/* Services */}
              <SectionHeader label="Services Offered" heading="Areas of Practice" />
              <div className="grid sm:grid-cols-2 gap-2.5 mt-5">
                {provider.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-2.5 px-3.5 py-3 border border-border rounded-md bg-card text-sm font-semibold text-primary"
                  >
                    <span className="h-2 w-2 rounded-full bg-secondary shrink-0" />
                    {service}
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-muted/50 border-t border-border py-14">
        <div className="container max-w-xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
            {provider.acceptsAppointments
              ? `Ready to Book with ${provider.shortName}?`
              : "Looking to Book an Appointment?"}
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {provider.acceptsAppointments
              ? "New and returning patients are always welcome. Our team will help match you with the right provider and program for your needs."
              : `${provider.shortName} maintains a private schedule as Medical Director. Our nurse practitioners are accepting new and returning patients across the full range of HCI services.`}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {provider.acceptsAppointments && (
              <Link
                to="/appointments"
                className="bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors"
              >
                Request Appointment
              </Link>
            )}
            <Link
              to="/providers"
              className="inline-flex items-center gap-1.5 border-2 border-primary text-primary font-semibold px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              View All Providers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-[0_2px_10px_rgba(12,35,64,0.05)]">
      <div className="bg-primary text-primary-foreground px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SectionHeader({ label, heading }: { label: string; heading: string }) {
  return (
    <>
      <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-secondary mb-2">
        {label}
      </p>
      <h2 className="font-display text-xl md:text-2xl font-bold text-primary leading-tight">
        {heading}
      </h2>
    </>
  );
}

function CredentialBlock({
  label,
  Icon,
  children,
}: {
  label: string;
  Icon: typeof Award;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-7 h-7 rounded-md bg-secondary/10 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-secondary" />
        </span>
        <h4 className="text-xs font-bold tracking-[0.12em] uppercase text-primary">
          {label}
        </h4>
      </div>
      <ul>{children}</ul>
    </div>
  );
}
