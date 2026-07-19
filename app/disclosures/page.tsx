import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclosures — Accurate Home Report",
  description: "Important disclosures about what Accurate Home Report is and is not.",
};

export default function DisclosuresPage() {
  return (
    <main className="container-x py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-ink">
          &larr; Back to home
        </Link>

        <h1 className="mt-6 font-display text-3xl text-ink text-balance sm:text-4xl md:text-5xl">
          Disclosures
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 18, 2026</p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="font-display text-2xl text-ink">What Accurate Home Report Is</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Accurate Home Report is a homeowner-verified property documentation service. We
              compile publicly available records, third-party property data, and information you
              supply into a professional PDF report prepared by experienced analysts.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-display text-2xl text-ink">What Accurate Home Report Is Not</h2>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-display text-lg text-ink">Not a Home Inspection</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  We do not physically visit, inspect, or evaluate your property. We do not assess
                  structural integrity, mechanical systems, or code compliance. Our reports are
                  documentation-based, not inspection-based.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg text-ink">Not an Appraisal</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  We do not estimate property value, determine market price, or provide a valuation
                  opinion. Our reports are informational documentation, not appraisals.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg text-ink">Not a Real Estate Brokerage</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  We are not affiliated with, and do not act as, a real estate brokerage, agent, or
                  MLS service. We do not list, market, buy, or sell properties.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg text-ink">Not Legal Advice</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Our reports do not constitute legal advice and should not be relied upon as a
                  substitute for consultation with a licensed attorney. Property-related legal
                  questions should be directed to qualified legal counsel.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Data Sources</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Our reports incorporate data from publicly available sources including county recorder
              offices, tax assessor records, building permit databases, and licensed third-party
              property data providers. While we strive for accuracy, we do not independently verify
              all third-party data and cannot guarantee its completeness or timeliness.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Professional Preparation</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Reports are prepared by trained property analysts using a combination of automated
              data retrieval and manual review. Analyst preparation does not constitute a
              professional license or certification in any field.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Contact</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              For questions about these disclosures, contact us at{" "}
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
