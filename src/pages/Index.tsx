import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { ContactForm } from "@/components/ContactForm";
import { HeroImagePlaceholder, ServiceCardImagePlaceholder } from "@/components/ImagePlaceholder";
import {
  Stethoscope,
  Heart,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  CalendarCheck,
  UserCheck,
  Building2
} from "lucide-react";

// Hero image
import heroImage from "@/assets/hero/home-hero-4images.png";

// Service images
import seniorCareImage from "@/assets/services/senior-care.jpg";
import internalMedicineImage from "@/assets/services/internal-medicine.jpg";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden texture-noise">
        {/* Medical cross pattern background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" aria-hidden="true"></div>
        {/* Organic gradient blob */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="container relative py-8 md:py-12 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div className="max-w-xl">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in stagger-1">
                Quality Primary Care for Over 30 Years
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in stagger-2">
                HCI Medical Group has provided personalized internal medicine and
                senior care to Pasadena families since 1990. See the same provider
                every visit. Get appointments when you need them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-3">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 min-h-[48px] transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Link to="/contact">Schedule an Appointment</Link>
                </Button>
                <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 min-h-[48px] transition-all duration-300 hover:scale-105">
                  <Link to="/our-story">Learn About Us</Link>
                </Button>
              </div>
            </div>

            {/* Hero image placeholder - shows on larger screens */}
            <div className="hidden lg:block animate-fade-in stagger-4">
              <HeroImagePlaceholder
                src={heroImage}
                alt="HCI Medical Group doctor consulting with patient"
                className="shadow-2xl"
              />
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
            <div className="bg-card rounded-xl card-shadow card-hover-lift group overflow-hidden">
              {/* Service Image */}
              <div className="relative">
                <ServiceCardImagePlaceholder
                  src={internalMedicineImage}
                  alt="Doctor consulting with patient - Internal Medicine services"
                  type="internal-medicine"
                  className="object-top"
                />
                {/* Floating icon badge */}
                <div className="absolute -bottom-5 right-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Stethoscope className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                </div>
              </div>

              <div className="p-8 pt-8">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Internal Medicine</h3>
                <p className="text-secondary font-medium text-sm mb-4">Comprehensive Primary Care</p>
                <p className="text-muted-foreground mb-6">
                  From preventive care and health screenings to chronic disease management, we provide
                  comprehensive internal medicine services for adults of all ages.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <Link to="/internal-medicine/physical-exams" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Physical Exams
                  </Link>
                  <Link to="/internal-medicine/womens-health" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Women's Health
                  </Link>
                  <Link to="/internal-medicine/mens-health" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Men's Health
                  </Link>
                  <Link to="/internal-medicine/diagnostics" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Diagnostics
                  </Link>
                </div>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link to="/internal-medicine/physical-exams">Explore Internal Medicine</Link>
                </Button>
              </div>
            </div>

            {/* Senior Care Card */}
            <div className="bg-card rounded-xl card-shadow card-hover-lift group overflow-hidden">
              {/* Service Image */}
              <div className="relative">
                <ServiceCardImagePlaceholder
                  src={seniorCareImage}
                  alt="Healthcare provider with senior patient - Senior Care services"
                  type="senior-care"
                />
                {/* Floating icon badge */}
                <div className="absolute -bottom-5 right-6 w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Heart className="h-6 w-6 text-secondary-foreground" aria-hidden="true" />
                </div>
              </div>

              <div className="p-8 pt-8">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Senior Care</h3>
                <p className="text-secondary font-medium text-sm mb-4">Specialized Geriatric Care</p>
                <p className="text-muted-foreground mb-6">
                  Dedicated care for our seniors with comprehensive wellness visits, chronic care
                  management, and seamless coordination with specialists.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <Link to="/senior-care/prevention-wellness" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Prevention & Wellness
                  </Link>
                  <Link to="/senior-care/chronic-care" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Chronic Care
                  </Link>
                  <Link to="/senior-care/transition-care" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Transition of Care
                  </Link>
                  <Link to="/senior-care/remote-monitoring" className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors">
                    <ArrowRight className="h-4 w-4 text-secondary" aria-hidden="true" /> Remote Monitoring
                  </Link>
                </div>
                <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Link to="/senior-care-plus">Explore Senior Care+</Link>
                </Button>
              </div>
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
              Experience healthcare the way it should be — personal, consistent, and focused on you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <Building2 className="h-8 w-8 text-accent-foreground" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">35 Years in Pasadena</h3>
              <p className="text-muted-foreground">
                Serving our community since 1990. We know Pasadena families because we've cared for generations.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <UserCheck className="h-8 w-8 text-accent-foreground" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">See Your Doctor Every Visit</h3>
              <p className="text-muted-foreground">
                True continuity of care. No rotating providers — you'll build a real relationship with your physician.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <CalendarCheck className="h-8 w-8 text-accent-foreground" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Same-Week Appointments</h3>
              <p className="text-muted-foreground">
                We make time when you need care. No waiting weeks to see your doctor.
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