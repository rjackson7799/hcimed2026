import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { AppointmentRequestForm } from "@/components/AppointmentRequestForm";
import { Phone, Clock, MapPin, CalendarCheck, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Appointments() {
  return (
    <Layout>
      <PageHero
        title="Request an Appointment"
        subtitle="Schedule your visit with HCI Medical Group. We'll contact you within 1 business day to confirm."
      />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl p-6 md:p-8 card-shadow">
                <AppointmentRequestForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Emergency Alert */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-800">
                    For emergencies, please call 911 immediately.
                  </p>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-card rounded-xl p-6 card-shadow">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Need Immediate Assistance?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For urgent matters or to speak with our team directly, please
                  call us.
                </p>

                <ul className="space-y-4">
                  <li>
                    <a
                      href="tel:626-792-4185"
                      className="flex items-center gap-3 text-foreground hover:text-secondary transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                        <Phone className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">(626) 792-4185</p>
                        <p className="text-sm text-muted-foreground">
                          Call to schedule
                        </p>
                      </div>
                    </a>
                  </li>

                  <li className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Mon - Fri: 9AM - 5PM
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Office hours
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        65 N. Madison Ave. #709
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pasadena, CA 91101
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Response Time Card */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CalendarCheck className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      What to Expect
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      After submitting your request, our team will contact you
                      within <strong>1 business day</strong> to confirm your
                      appointment time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Patients */}
              <div className="bg-muted rounded-xl p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Existing Patients
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Access your patient portal to view appointments, request
                  prescription refills, and message your care team.
                </p>
                <a
                  href="https://www.healow.com/apps/practice/hci-medical-group-inc-24741?v=2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-secondary hover:underline"
                >
                  Go to Patient Portal →
                </a>
              </div>

              {/* Questions */}
              <div className="text-center text-sm text-muted-foreground">
                Have questions?{" "}
                <Link
                  to="/faq"
                  className="text-secondary hover:underline font-medium"
                >
                  View our FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
