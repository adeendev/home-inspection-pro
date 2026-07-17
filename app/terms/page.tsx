import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Accurate Home Report",
  description:
    "Terms and conditions governing the use of Accurate Home Report services and website.",
};

export default function TermsPage() {
  return (
    <main className="container-x py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-ink">
          &larr; Back to home
        </Link>

        <h1 className="mt-6 font-display text-4xl text-ink text-balance md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 18, 2026</p>

        <div className="prose-ink mt-10 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-ink">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using the Accurate Home Report website and services, you agree to be
              bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">2. Description of Service</h2>
            <p className="mt-3">
              Accurate Home Report provides homeowner-verified property documentation reports. We
              compile public records, third-party property data, and information you supply into a
              professional PDF report. Our services are not a home inspection, appraisal, real
              estate brokerage, or legal advice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">3. Eligibility</h2>
            <p className="mt-3">
              You must be a homeowner or an authorized representative of the property owner to order
              a report. By placing an order, you represent that you have the authority to provide
              property information and disclosures.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">4. Ordering and Payment</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Pricing:</strong> Prices are listed on our website and
                may change without notice. The price at the time of your order is the price you pay.
              </li>
              <li>
                <strong className="text-ink">Payment:</strong> Payments are processed securely
                through Stripe. We do not store your credit card information.
              </li>
              <li>
                <strong className="text-ink">Taxes:</strong> Applicable taxes will be calculated and
                displayed at checkout based on your location.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">5. Refund Policy</h2>
            <p className="mt-3">
              Reports are custom-prepared immediately after payment clears. Because production
              begins promptly, orders are non-refundable once preparation has started. If you
              believe there is an error in your report, please contact us within 14 days of
              delivery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">6. Report Delivery</h2>
            <p className="mt-3">
              Basic and Premium reports are delivered digitally within 48 hours to 3 business days.
              Verified reports require scheduling a property visit and timelines vary by region.
              Reports are delivered to the email address provided at checkout.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">7. Intellectual Property</h2>
            <p className="mt-3">
              The report you order is licensed to you for personal use. Accurate Home Report retains
              ownership of its proprietary formats, templates, and methodologies. You may not
              reproduce, resell, or distribute our reports without written permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">8. User Responsibilities</h2>
            <p className="mt-3">You agree to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provide accurate and truthful property information</li>
              <li>Not use our services for any unlawful purpose</li>
              <li>Not attempt to circumvent security or payment systems</li>
              <li>Maintain the confidentiality of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">9. Limitation of Liability</h2>
            <p className="mt-3">
              Accurate Home Report provides reports based on available data and the information you
              supply. We do not guarantee the completeness or accuracy of third-party data sources.
              Our liability is limited to the amount you paid for the report. We are not liable for
              any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">10. Disclaimers</h2>
            <p className="mt-3">
              Our reports are not a substitute for a licensed home inspection, appraisal, or legal
              counsel. We do not physically inspect, evaluate, or value properties. The information
              in our reports should be independently verified.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">11. Modifications</h2>
            <p className="mt-3">
              We reserve the right to modify these terms at any time. Changes take effect when
              posted on this page. Your continued use of our services after changes are posted
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">12. Contact</h2>
            <p className="mt-3">
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:hello@accuratehomereport.com"
                className="text-ink underline underline-offset-4"
              >
                hello@accuratehomereport.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
