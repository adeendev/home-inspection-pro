"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PACKAGES } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Packages() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      id="packages"
      className="container-x py-16 md:py-24 lg:py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="eyebrow">Pricing</span>
        <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
          Report packages.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Choose the level of detail that fits your needs. Every report is custom-prepared by our
          analysts.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: p.popular ? -12 : 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            whileHover={{
              y: p.popular ? -18 : -6,
              boxShadow: "0 24px 64px -12px rgba(0,0,0,0.18)",
            }}
            className={cn(
              "relative flex flex-col rounded-3xl border bg-card p-6 transition md:p-8",
              p.popular ? "border-brass/60 shadow-elegant" : "border-border",
            )}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-brass px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink">
                Most Popular
              </span>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Accurate Home Report
            </p>
            <h3 className="mt-2 font-display text-3xl text-ink">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-4xl text-ink md:text-5xl">{p.priceLabel}</span>
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
              <Link href={`/order?package=${p.id}`}>
                Order {p.name}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.article>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 text-center text-xs text-muted-foreground"
      >
        Reports are custom-prepared. Production begins immediately after payment and is
        non-refundable once started.
      </motion.p>
    </motion.section>
  );
}
