import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, FileCheck2, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-home.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={hero}
          alt="Modern luxury home at golden hour"
          width={1920}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--brass)_18%,_transparent)_0%,_transparent_55%)]" />
      </div>

      <div className="container-x relative pt-24 pb-28 md:pt-36 md:pb-40">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-cream/85 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" />
            Homeowner-Verified Reports
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] text-cream text-balance md:text-6xl lg:text-7xl">
            Know your home's
            <span className="block italic text-brass">story before</span>
            anyone else does.
          </h1>
          <p className="mt-6 max-w-xl text-base text-cream/75 md:text-lg">
            Comprehensive, homeowner-verified property reports—public records, trusted data sources, and your
            disclosures, prepared by experienced analysts into one professional PDF.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="brass">
              <Link to="/order">
                Order Your Report
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link to="/sample-report">View Sample Report</Link>
            </Button>
          </div>

          <ul className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Clock, label: "48hr – 3 day delivery" },
              { icon: ShieldCheck, label: "Homeowner verified" },
              { icon: FileCheck2, label: "Analyst prepared" },
              { icon: Lock, label: "Encrypted checkout" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 rounded-lg border border-cream/10 bg-cream/5 px-3 py-2.5 text-xs text-cream/85 backdrop-blur">
                <Icon className="h-4 w-4 text-brass" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
