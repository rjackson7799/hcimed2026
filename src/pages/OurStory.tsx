import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Heart, Users, Award, Clock } from "lucide-react";

export default function OurStory() {
  return (
    <Layout>
      <PageHero 
        title="Our Story" 
        subtitle="Building lasting relationships through compassionate care"
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                A Legacy of Caring
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                HCI Medical Group was founded with a simple but powerful vision: to provide 
                healthcare that treats the whole person, not just symptoms. Located in the 
                heart of Pasadena, California, we've built our practice on the foundation 
                of trust, compassion, and excellence in medical care.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our team believes that the best healthcare comes from understanding each 
                patient as an individual. We take the time to listen, to learn about your 
                life and health goals, and to develop personalized care plans that work for you.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Whether you're coming in for a routine check-up, managing a chronic condition, 
                or seeking specialized senior care services, you'll find a welcoming environment 
                and a dedicated team ready to support your health journey.
              </p>
            </div>
          </div>
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
          </div>
        </div>
      </section>
    </Layout>
  );
}