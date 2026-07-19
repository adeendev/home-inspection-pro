"use client";

import Link from "next/link";
import { ArrowRight, FileDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { toast } from "sonner";

const SECTIONS = [
  {
    t: "Cover & Executive Summary",
    d: "Polished title page with property identifiers, report date, and a 1-page executive summary.",
  },
  {
    t: "Property Profile",
    d: "Address, parcel, lot details, building characteristics, and verified ownership type.",
  },
  {
    t: "Public Records Summary",
    d: "County records, tax assessments, recorded transfers, and a chronological deed history.",
  },
  {
    t: "Ownership Information",
    d: "Current and prior ownership, recording dates, and authorized representative declarations.",
  },
  {
    t: "Property History & Timeline",
    d: "A clean narrative timeline of recorded events, with homeowner-provided context.",
  },
  {
    t: "Homeowner Disclosures",
    d: "Your verified disclosures—presented in a structured, professional format.",
  },
  {
    t: "Improvement Summary",
    d: "Material improvements, approximate dates, and verified scope notes.",
  },
  {
    t: "Permit Review (Premium)",
    d: "Pulled permits, status, and a plain-English summary of each.",
  },
  {
    t: "Risk Indicators (Premium)",
    d: "Flood, wildfire, and notable hazard data sourced from third-party providers.",
  },
  {
    t: "Neighborhood Overview (Premium)",
    d: "Market context, neighborhood characteristics, and proximity highlights.",
  },
  {
    t: "Photo Documentation (Verified)",
    d: "Time-stamped, organized exterior and interior photo set from the on-site visit.",
  },
  {
    t: "Condition Summary (Verified)",
    d: "Analyst-prepared narrative covering observed exterior and interior condition.",
  },
];

export default function SamplePage() {
  return (
    <div>
      <SiteHeader />

      <section className="relative gradient-ink text-cream">
        <div className="container-x py-16 md:py-24">
          <span className="eyebrow">Sample Report</span>
          <h1 className="mt-4 max-w-3xl font-display text-3xl text-cream text-balance sm:text-4xl md:text-6xl">
            See exactly what arrives in your inbox.
          </h1>
          <p className="mt-5 max-w-2xl text-cream/75">
            Every report is custom-prepared and delivered as a professional PDF. Below is the
            section-by-section structure used in our Basic, Premium, and Verified packages.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="brass"
              size="lg"
              onClick={() => toast("Sample PDF coming soon — we'll notify you.")}
            >
              <FileDown className="mr-1 h-4 w-4" /> Download sample PDF
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/order">
                Order your report <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:py-28">
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <article
              key={s.t}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-brass/40 hover:shadow-elegant"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl italic text-brass md:text-2xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                  Section
                </span>
              </div>
              <h2 className="mt-3 font-display text-xl text-ink">{s.t}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-border bg-secondary/40 p-8 text-center md:p-12">
          <ShieldCheck className="mx-auto h-8 w-8 text-brass" />
          <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Order in minutes—delivery within 48 hours to 3 business days.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-7">
            <Link href="/order">
              Order your report <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
