import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { PageHero } from "@/components/PageHero";
import { Button } from "@hci/shared/ui/button";
import { Heart, Users, Award, Clock, ArrowRight } from "lucide-react";

export default function OurStory() {
  return (
    <Layout>
      <SEO {...pageSEO.ourStory} />
      <PageHero
        title="Our Story"
        subtitle="Serving Pasadena families since 1978"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                A Legacy of Caring
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Since 1978, HCI Medical Group has been committed to providing healthcare that
                treats the whole person, not just symptoms. For over four decades, we've served
                Pasadena and the San Gabriel Valley from our office in the heart of the city.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                What sets us apart is simple: you see the same doctor every visit. We believe
                the best healthcare comes from knowing our patients as individuals — your history,
                your concerns, your goals. That relationship takes time to build, and we protect it.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Whether you're coming in for a routine check-up, managing a chronic condition,
                or seeking specialized senior care services, you'll find a welcoming environment
                and a team that knows you by name.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Providers CTA */}
      <section className="py-12 bg-muted">
        <div className="container text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/providers">
              Meet Our Providers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-xl p-6 text-center card-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Compassion</h3>
              <p className="text-muted-foreground">
                Every patient deserves to be treated with kindness, empathy, and respect.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 text-center card-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Partnership</h3>
              <p className="text-muted-foreground">
                We work alongside our patients as partners in their healthcare journey.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 text-center card-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for the highest standards in medical care and patient service.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 text-center card-shadow">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Accessibility</h3>
              <p className="text-muted-foreground">
                Quality healthcare should be available and convenient for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              To provide compassionate, comprehensive healthcare that empowers our patients 
              to live their healthiest lives. We are committed to treating every individual
              with dignity and respect while delivering personalized care that addresses
              their unique needs at every stage of life.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/careers">
                  Join Our Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}