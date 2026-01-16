import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Phone, Mail, ArrowLeft } from "lucide-react";

export default function InsuranceUpdate() {
  return (
    <Layout>
      <PageHero
        title="Insurance Update"
        subtitle="Important information about your coverage"
      />

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          {/* Back navigation */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Letter content */}
          <div className="bg-card rounded-xl p-8 md:p-12 card-shadow">
            {/* Letter header */}
            <div className="border-b border-border pb-6 mb-8">
              <p className="text-muted-foreground text-sm mb-2">
                January 2026
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                HCI Medical Group Partners with Regal Medical Group
              </h2>
            </div>

            {/* Letter body */}
            <div className="prose prose-lg max-w-none space-y-6">
              <p className="text-foreground">Dear Valued Patients,</p>

              <p className="text-muted-foreground leading-relaxed">
                We are delighted to announce that HCI Medical Group has partnered
                with Regal Medical Group. This exciting partnership represents our
                continued commitment to providing you with the highest quality
                healthcare in the Pasadena community and beyond.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                At HCI Medical Group, our mission has always been to deliver
                compassionate, personalized care that treats the whole person. By
                joining forces with Regal Medical Group, we are expanding our
                ability to serve you while maintaining the same trusted provider
                relationships and exceptional care you have come to expect from us.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  What this means for you:
                </strong>
              </p>

              <ul className="text-muted-foreground space-y-2 list-disc pl-6">
                <li>
                  <strong className="text-foreground">Same trusted provider</strong>{" "}
                  — Dr. Roy H. Jackson will continue to see you and provide the
                  personalized care you know and trust
                </li>
                <li>
                  <strong className="text-foreground">Same convenient location</strong>{" "}
                  — Our office remains at 65 N. Madison Ave., Pasadena
                </li>
                <li>
                  <strong className="text-foreground">Expanded resources</strong>{" "}
                  — Access to a broader network of specialists and enhanced services
                </li>
                <li>
                  <strong className="text-foreground">Updated insurance information</strong>{" "}
                  — You may receive new insurance cards reflecting our affiliation
                  with Regal Medical Group
                </li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                We are truly happy to partner with Regal Medical Group to continue
                bringing you the highest quality care. This partnership strengthens
                our ability to support your health journey with comprehensive
                services, advanced resources, and the same personal attention that
                has been the hallmark of HCI Medical Group for over four decades.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about how this partnership may affect your
                insurance coverage or care, please do not hesitate to reach out. Our
                team is here to ensure a seamless transition and to address any
                concerns you may have.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Thank you for your continued trust in HCI Medical Group. We look
                forward to serving you and your family for many years to come.
              </p>

              <p className="text-foreground mt-8">
                Warm regards,
                <br />
                <br />
                <span className="font-semibold">Dr. Roy H. Jackson, M.D.</span>
                <br />
                <span className="text-muted-foreground">
                  Medical Director, HCI Medical Group
                </span>
              </p>
            </div>

            {/* Contact card */}
            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Questions? Contact Us
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Eldy Santos</p>
                    <a
                      href="tel:818-480-2555"
                      className="text-secondary hover:underline"
                    >
                      818-480-2555
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">General Inquiries</p>
                    <a
                      href="mailto:care@hcimed.com"
                      className="text-secondary hover:underline"
                    >
                      care@hcimed.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need to schedule an appointment?
            </p>
            <Button
              asChild
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Link to="/contact">Contact Our Office</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
