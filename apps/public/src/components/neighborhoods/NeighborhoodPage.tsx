import { Link } from 'react-router-dom';
import { MapPin, Clock, Navigation, ArrowRight, Stethoscope, Heart } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import { Card, CardContent } from '@hci/shared/ui/card';
import { PageHero } from '@/components/PageHero';
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection';
import { siteConfig } from '@/config/site';
import { internalMedicineLinks, seniorCareLinks } from '@/components/layout/nav-data';
import type { Neighborhood } from '@/data/neighborhoods';

interface NeighborhoodPageProps {
  neighborhood: Neighborhood;
}

export function NeighborhoodPage({ neighborhood }: NeighborhoodPageProps) {
  const { name, description, distanceFromOffice, distanceMiles, directionsNote, highlights, populationNote, serviceEmphasis } = neighborhood;

  const isPasadena = neighborhood.slug === 'pasadena';

  // Filter services based on emphasis
  const showInternalMedicine = serviceEmphasis.some((s) =>
    ['internal-medicine', 'wellness'].includes(s)
  );
  const showSeniorCare = serviceEmphasis.some((s) =>
    ['senior-care', 'chronic-care', 'remote-monitoring'].includes(s)
  );

  const relevantServices = [
    ...(showInternalMedicine ? internalMedicineLinks : []),
    ...(showSeniorCare ? seniorCareLinks : []),
  ];

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(neighborhood.googleMapsQuery)}`;

  return (
    <>
      <PageHero
        title={isPasadena ? `Internal Medicine & Senior Care in ${name}` : `Internal Medicine & Senior Care Near ${name}`}
        subtitle={isPasadena
          ? `Serving the Pasadena community since 1990 with trusted, personalized primary care.`
          : `Trusted primary care just ${distanceFromOffice} from ${name}. Serving the San Gabriel Valley since 1990.`
        }
      />

      {/* Area Introduction */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
              >
                <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{highlight}</p>
              </div>
            ))}
          </div>

          {populationNote && (
            <p className="mt-4 text-sm text-muted-foreground">{populationNote}</p>
          )}
        </div>
      </section>

      {/* Distance & Directions */}
      {!isPasadena && (
        <section className="py-12 bg-card border-y border-border">
          <div className="container max-w-4xl">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Navigation className="h-5 w-5 text-secondary" />
                        <span>{distanceMiles} miles</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-5 w-5 text-secondary" />
                        <span>{distanceFromOffice} drive</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{directionsNote}</p>
                    <p className="text-sm text-muted-foreground">
                      {siteConfig.address.street} {siteConfig.address.suite}, {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
                    </p>
                  </div>
                  <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      Get Directions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Services Available to {name} Residents
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive healthcare tailored to your needs, close to home.
            </p>
          </div>

          {/* Service category cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            {showInternalMedicine && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">Internal Medicine</h3>
                  </div>
                  <ul className="space-y-2">
                    {internalMedicineLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors text-sm"
                        >
                          <ArrowRight className="h-3 w-3 text-secondary" />
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {showSeniorCare && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">Senior Care</h3>
                  </div>
                  <ul className="space-y-2">
                    {seniorCareLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors text-sm"
                        >
                          <ArrowRight className="h-3 w-3 text-secondary" />
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Providers */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Providers
            </h2>
            <p className="text-muted-foreground text-lg">
              At HCI Medical Group, you see the same provider at every visit — building a real relationship with your doctor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Dr. Roy H. Jackson', role: 'Founding Physician', href: '/providers/dr-jackson', initials: 'RJ' },
              { name: 'Apple Evangelista, NP', role: 'Nurse Practitioner', href: '/providers/apple-evangelista', initials: 'AE' },
              { name: 'Marileth Tan, NP', role: 'Nurse Practitioner', href: '/providers/marileth-tan', initials: 'MT' },
            ].map((provider) => (
              <Link
                key={provider.href}
                to={provider.href}
                className="group text-center p-6 rounded-xl border border-border hover:border-secondary/50 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-semibold group-hover:scale-105 transition-transform">
                  {provider.initials}
                </div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-secondary transition-colors">
                  {provider.name}
                </h3>
                <p className="text-sm text-muted-foreground">{provider.role}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Schedule Your Visit
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            {isPasadena
              ? "We've been proud to serve Pasadena for over 30 years. Schedule your appointment today."
              : `We're just ${distanceFromOffice} from ${name}. Schedule your appointment today and experience healthcare the way it should be.`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Link to="/appointments">Request an Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${siteConfig.contact.phoneRaw}`}>Call {siteConfig.contact.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
