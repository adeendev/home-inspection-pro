import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Accurate Home Report",
  description: "How Accurate Home Report collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="container-x py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-ink">
          &larr; Back to home
        </Link>

        <h1 className="mt-6 font-display text-3xl text-ink text-balance sm:text-4xl md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 18, 2026</p>

        <div className="prose-ink mt-10 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-ink">1. Introduction</h2>
            <p className="mt-3">
              Accurate Home Report (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed
              to protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website and use our
              services, including the ordering of homeowner-verified property reports.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">2. Information We Collect</h2>
            <p className="mt-3">
              <strong className="text-ink">Personal Information:</strong> When you place an order or
              contact us, we may collect your name, email address, phone number, mailing address,
              property address, and payment information.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Property Information:</strong> We collect property
              details you provide through our questionnaire, including ownership history,
              improvements, disclosures, and other property-specific data.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Usage Data:</strong> We automatically collect certain
              information about your device and how you interact with our website, including IP
              address, browser type, pages visited, and time spent on pages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">3. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>To prepare and deliver your property report</li>
              <li>To communicate with you about your order</li>
              <li>To process payments securely through Stripe</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">4. How We Share Your Information</h2>
            <p className="mt-3">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Service Providers:</strong> Third-party vendors who
                assist in operating our website, processing payments, or delivering services (e.g.,
                Stripe, hosting providers).
              </li>
              <li>
                <strong className="text-ink">Public Records Sources:</strong> We access publicly
                available property records to compile your report.
              </li>
              <li>
                <strong className="text-ink">Legal Requirements:</strong> When required by law,
                regulation, or legal process.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">5. Data Security</h2>
            <p className="mt-3">
              We implement industry-standard security measures including encrypted checkout
              (TLS/SSL), access-restricted data storage, and regular security audits. However, no
              method of electronic transmission or storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">6. Data Retention</h2>
            <p className="mt-3">
              We retain your personal and property information for as long as necessary to provide
              our services and fulfill the purposes described in this policy. You may request
              deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">7. Your Rights</h2>
            <p className="mt-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of non-essential data collection</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">8. Cookies</h2>
            <p className="mt-3">
              Our website uses essential cookies to maintain functionality and analytics cookies to
              understand how visitors interact with our site. You can control cookie preferences
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">9. Children&apos;s Privacy</h2>
            <p className="mt-3">
              Our services are not directed to individuals under the age of 18. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">10. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the updated policy on this page with a revised &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">11. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy or wish to exercise your data rights,
              please contact us at{" "}
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
