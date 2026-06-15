import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden gradient-ink text-cream">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_color-mix(in_oklab,_var(--brass)_22%,_transparent)_0%,_transparent_55%)]" />
      <div className="container-x py-24 text-center md:py-32">
        <span className="eyebrow">Order Now</span>
        <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl text-cream text-balance md:text-6xl">
          Ready to document your property?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-cream/75">
          Order your professional, homeowner-verified property report today. Delivery within 48 hours to 3
          business days.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" variant="brass">
            <Link to="/order">Order your report<ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link to="/sample-report">View sample report</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-cream/55">
          Reports are non-refundable once preparation begins · Production starts immediately after payment
        </p>
      </div>
    </section>
  );
}
