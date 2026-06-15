import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/site";

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  const go = (d: number) => setI((p) => (p + d + TESTIMONIALS.length) % TESTIMONIALS.length);
  return (
    <section className="container-x py-24 md:py-32">
      <div className="grid items-center gap-14 md:grid-cols-[1fr_1.4fr]">
        <div>
          <span className="eyebrow">Homeowner Stories</span>
          <h2 className="mt-3 font-display text-4xl text-ink text-balance md:text-5xl">
            Trusted by thoughtful homeowners across the country.
          </h2>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-brass text-brass" />
              ))}
            </div>
            4.9 average from 1,800+ verified orders
          </div>
        </div>
        <div className="relative rounded-3xl border border-border bg-card p-8 shadow-elegant md:p-12">
          <Quote className="absolute -top-5 left-8 h-10 w-10 rounded-full bg-brass p-2 text-ink" />
          <p className="font-display text-2xl leading-snug text-ink text-balance md:text-3xl">
            "{t.quote}"
          </p>
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <div>
              <p className="font-medium text-ink">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Previous" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-brass hover:text-brass">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button aria-label="Next" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-brass hover:text-brass">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-1 rounded-full transition-all ${idx === i ? "w-8 bg-brass" : "w-4 bg-border"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
