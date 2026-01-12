import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Clock, ArrowRight } from "lucide-react";

// TODO: When team photos are available, import them here and add to the respective sections
// import drJacksonPhoto from "@/assets/team/dr-jackson.jpg";
// import evelindaPhoto from "@/assets/team/evelinda.jpg";

export default function OurStory() {
  return (
    <Layout>
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

      {/* Medical Director */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 card-shadow">
              <div className="text-center mb-8 pb-8 border-b border-border">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Dr. Roy H. Jackson, M.D.
                </h2>
                <p className="text-secondary font-semibold text-lg mb-1">Medical Director</p>
                <p className="text-muted-foreground">
                  Board Certified Internal Medicine & Geriatric Care Specialist
                </p>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Dr. Roy H. Jackson has been the heart of HCI Medical Group since 1978, bringing
                  over four decades of dedicated medical expertise to the Pasadena community. As
                  Medical Director, Dr. Jackson has built a practice renowned for its compassionate
                  approach to internal medicine and specialized geriatric care, serving generations
                  of families throughout their healthcare journeys.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A graduate of the University of Southern California Medical Center, Dr. Jackson
                  completed his internal medicine residency at USC and has remained committed to
                  delivering exceptional, personalized care to diverse patient populations. His
                  particular focus on geriatric medicine reflects his deep understanding that
                  healthcare needs evolve throughout life, requiring both clinical excellence and
                  genuine human connection.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Beyond his clinical practice at HCI Medical Group, Dr. Jackson has served the
                  community through Mobile Docs since 1998, providing essential home-based care
                  to homebound patients, ensuring that quality healthcare reaches those who need
                  it most. His career has been marked by leadership roles including Medical Director
                  positions at Andrew Escajeda Clinic, St. Luke's Medical Center, and various
                  community healthcare facilities throughout Los Angeles County.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Dr. Jackson's commitment to healthcare excellence has earned recognition from
                  the California State Assembly, the City of Pasadena, and Consumer's Research
                  Council of America. He maintains active memberships in the American Medical
                  Association, American College of Physicians, California Medical Association,
                  and National Medical Association, staying current with the latest advances in
                  internal medicine and geriatric care.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  At HCI Medical Group, Dr. Jackson leads a team dedicated to providing comprehensive,
                  evidence-based care that addresses the whole person—from preventive medicine and
                  chronic disease management to the aesthetic wellness services that help patients
                  feel their best at every age. His philosophy is simple: healthcare should grow
                  with you, meeting your needs today while preparing for your tomorrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Care Team */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Our Care Team
          </h2>
          <div className="max-w-3xl mx-auto">
            {/* Apple Evangelista */}
            <div className="bg-card rounded-xl p-8 card-shadow">
              <div className="text-center mb-6 pb-6 border-b border-border">
                <h3 className="font-display text-2xl font-semibold mb-2">
                  Apple Evangelista, MSN, APRN, AGACNP-BC, CCRN
                </h3>
                <p className="text-secondary font-medium">
                  Nurse Practitioner & Medical Aesthetics Specialist
                </p>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Apple Evangelista brings a unique blend of critical care expertise and aesthetic
                  medicine to HCI Medical Group, combining over a decade of clinical nursing
                  excellence with specialized training in advanced medical aesthetics. As a
                  board-certified Adult-Gerontology Acute Care Nurse Practitioner, Apple delivers
                  comprehensive care that bridges traditional healthcare with modern wellness treatments.
                </p>
                <p>
                  With a Master of Science in Nursing from Chamberlain University and board
                  certification from the American Nurses Credentialing Center, Apple's clinical
                  foundation is built on extensive experience in critical care settings, including
                  years as a preceptor and relief charge nurse at Emanate Health hospitals.
                </p>
                <p>
                  Since 2022, Apple has distinguished herself as an aesthetic nurse injector and
                  specialist in skin treatments, medical devices, and laser therapies. Her approach
                  is rooted in understanding each patient's unique goals and creating personalized
                  treatment plans that enhance natural beauty while supporting overall wellness.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/careers">
                Join Our Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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