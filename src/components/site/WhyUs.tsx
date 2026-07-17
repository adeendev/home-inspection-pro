"use client";

import { Award, Clock4, ShieldCheck, FileSearch, Users, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  {
    icon: Award,
    t: "Analyst-prepared",
    d: "Every report is hand-assembled by experienced property analysts—not automated templates.",
  },
  {
    icon: FileSearch,
    t: "Verified data sources",
    d: "We combine county records, third-party property data, and your own disclosures.",
  },
  {
    icon: Clock4,
    t: "Fast turnaround",
    d: "Standard delivery in 48 hours to 3 business days, digitally to your inbox.",
  },
  {
    icon: ShieldCheck,
    t: "Privacy first",
    d: "Encrypted checkout, restricted-access storage, and never sold to third parties.",
  },
  {
    icon: Users,
    t: "Built for homeowners",
    d: "Reports are written for homeowners and their authorized representatives—not lenders.",
  },
  {
    icon: MapPin,
    t: "Nationwide coverage",
    d: "Documentation reports available nationwide; verified visits in select metros.",
  },
];

export function WhyUs() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="bg-secondary/40"
    >
      <div className="container-x py-16 md:py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="eyebrow">Why Choose Us</span>
          <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
            The quality you&apos;d expect from a private bank—delivered for your home.
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{
                y: -6,
                boxShadow: "0 24px 56px -16px color-mix(in oklab, var(--brass) 30%, transparent)",
              }}
              className="group relative rounded-2xl border border-border bg-card p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              {/* Brass gradient accent line */}
              <div className="absolute left-0 right-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-brass/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-cream transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-brass group-hover:to-brass-soft group-hover:text-ink group-hover:shadow-[0_0_20px_-4px_var(--brass)]">
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
              <h3 className="mt-5 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass">
                {t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
