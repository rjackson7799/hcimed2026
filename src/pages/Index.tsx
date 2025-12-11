import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { ContactForm } from "@/components/ContactForm";
import { 
  Stethoscope, 
  Heart, 
  Activity, 
  ShieldCheck, 
  Users, 
  Clock,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              Compassionate Care for Every Stage of Life
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              At HCI Medical Group, we believe in building lasting relationships with our patients. 
              Our dedicated team provides personalized internal medicine and senior care services 
              in Pasadena, California.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8">
                <Link to="/contact">Schedule an Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8">
                <Link to="/our-story">Learn About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="bg-card border-b border-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <a href="tel:626-792-4185" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                <Phone className="h-5 w-5 text-secondary" />
                <span className="font-medium">626-792-4185</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5 text-secondary" />
                <span>Mon - Fri: 9AM - 5PM</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 text-secondary" />
                <span>Pasadena, CA</span>
              </div>
            </div>
            <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
              <a href="tel:626-792-4185">Call Now</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-gradient py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive healthcare services tailored to meet your unique needs at every stage of life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Internal Medicine Card */}
            <div className="bg-card rounded-xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">Internal Medicine</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Comprehensive primary care for adults including preventive services, diagnosis, 
                and treatment of acute and chronic conditions.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <Link to="/internal-medicine/physical-exams" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Physical Exams
                </Link>
                <Link to="/internal-medicine/womens-health" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Women's Health
                </Link>
                <Link to="/internal-medicine/mens-health" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Men's Health
                </Link>
                <Link to="/internal-medicine/diagnostics" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Diagnostics
                </Link>
              </div>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to="/internal-medicine/physical-exams">Explore Internal Medicine</Link>
              </Button>
            </div>

            {/* Senior Care Card */}
            <div className="bg-card rounded-xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Heart className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">Senior Care</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Specialized care for older adults focusing on wellness, chronic disease management, 
                and maintaining quality of life.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <Link to="/senior-care/prevention-wellness" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Prevention & Wellness
                </Link>
                <Link to="/senior-care/chronic-care" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Chronic Care
                </Link>
                <Link to="/senior-care/transition-care" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Transition of Care
                </Link>
                <Link to="/senior-care/remote-monitoring" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                  <ArrowRight className="h-4 w-4 text-secondary" /> Remote Monitoring
                </Link>
              </div>
              <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link to="/senior-care/prevention-wellness">Explore Senior Care</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose HCI Medical Group?
            </h2>
            <p className="text-muted-foreground text-lg">
              Experience healthcare the way it should be — personal, attentive, and centered around you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Patient-Centered Care</h3>
              <p className="text-muted-foreground">
                We take the time to listen and understand your unique health concerns and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Comprehensive Services</h3>
              <p className="text-muted-foreground">
                From preventive care to chronic disease management, we offer a full spectrum of services.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Experienced Team</h3>
              <p className="text-muted-foreground">
                Our dedicated medical professionals bring years of expertise to your care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 section-gradient">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We're here to help you achieve your best health. Contact us today to schedule 
                an appointment or learn more about our services.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Visit Us</h4>
                    <p className="text-muted-foreground">65 N. Madison Ave. #709<br />Pasadena, CA 91101</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Call Us</h4>
                    <a href="tel:626-792-4185" className="text-secondary hover:underline">626-792-4185</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Office Hours</h4>
                    <p className="text-muted-foreground">Monday - Friday: 9AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-8 card-shadow">
              <h3 className="font-display text-2xl font-semibold mb-6">Send Us a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}