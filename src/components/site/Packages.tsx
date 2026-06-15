import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PACKAGES } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Packages() {
  return (
    <section id="packages" className="container-x py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Pricing</span>
        <h2 className="mt-3 font-display text-4xl text-ink text-balance md:text-5xl">Report packages.</h2>
        <p className="mt-4 text-muted-foreground">
          Choose the level of detail that fits your needs. Every report is custom-prepared by our analysts.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((p) => (
          <article
            key={p.id}
            className={cn(
              "relative flex flex-col rounded-3xl border bg-card p-8 transition",
              p.popular
                ? "border-brass/60 shadow-elegant lg:-translate-y-3"
                : "border-border hover:border-brass/30 hover:shadow-elegant",
            )}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-brass px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink">
                Most Popular
              </span>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accurate Home Report</p>
            <h3 className="mt-2 font-display text-3xl text-ink">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-5xl text-ink">{p.priceLabel}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>

            <ul className="mt-6 space-y-2.5 border-t pt-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t pt-5 text-xs text-muted-foreground">
              Delivery: <span className="text-ink">{p.delivery}</span>
              {p.id === "verified" && <p className="mt-1">Availability may vary by location.</p>}
            </div>

            <Button asChild className="mt-6" variant={p.popular ? "brass" : "primary"} size="lg">
              <Link to="/order" search={{ package: p.id }}>
                Order {p.name}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Reports are custom-prepared. Production begins immediately after payment and is non-refundable once started.
      </p>
    </section>
  );
}
