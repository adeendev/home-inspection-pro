import { Award, Clock4, ShieldCheck, FileSearch, Users, MapPin } from "lucide-react";

const ITEMS = [
  { icon: Award, t: "Analyst-prepared", d: "Every report is hand-assembled by experienced property analysts—not automated templates." },
  { icon: FileSearch, t: "Verified data sources", d: "We combine county records, third-party property data, and your own disclosures." },
  { icon: Clock4, t: "Fast turnaround", d: "Standard delivery in 48 hours to 3 business days, digitally to your inbox." },
  { icon: ShieldCheck, t: "Privacy first", d: "Encrypted checkout, restricted-access storage, and never sold to third parties." },
  { icon: Users, t: "Built for homeowners", d: "Reports are written for homeowners and their authorized representatives—not lenders." },
  { icon: MapPin, t: "Nationwide coverage", d: "Documentation reports available nationwide; verified visits in select metros." },
];

export function WhyUs() {
  return (
    <section className="bg-secondary/40">
      <div className="container-x py-24 md:py-32">
        <div className="max-w-2xl">
          <span className="eyebrow">Why Choose Us</span>
          <h2 className="mt-3 font-display text-4xl text-ink text-balance md:text-5xl">
            The quality you'd expect from a private bank—delivered for your home.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="group rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-elegant">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-cream">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
