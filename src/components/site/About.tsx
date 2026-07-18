"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import desk from "@/assets/report-desk.jpg";

const CHECKS = [
  "Combines homeowner-provided data with public records",
  "Prepared by experienced property analysts",
  "Professional PDF report delivered digitally",
  "Every report is custom-created for the property",
];

const NOT_ITEMS = [
  { t: "Not a home inspection", d: "We don't physically inspect or evaluate." },
  { t: "Not an appraisal", d: "We don't estimate property value." },
  { t: "Not a brokerage", d: "We're not affiliated with buying or selling." },
  { t: "Not legal advice", d: "We don't substitute licensed counsel." },
];

export function About() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      id="about"
      className="container-x overflow-hidden py-16 md:py-24 lg:py-32"
    >
      <div className="grid items-center gap-10 md:gap-14 md:grid-cols-2">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">About Our Service</span>
          <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
            A new standard in property documentation.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            Accurate Home Report is a homeowner-reporting service that creates detailed property
            reports using information supplied by you, together with public records and trusted
            third-party property data—assembled by experienced analysts into one professional PDF.
          </p>

          {/* What we do — check list */}
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {CHECKS.map((t, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink/85 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-brass/40 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]"
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brass/15 text-brass">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right: image + stat badge */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-brass/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border shadow-elegant">
            <img
              src={desk.src}
              alt="Analyst reviewing a printed property report"
              width={1600}
              height={1200}
              loading="lazy"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute -bottom-6 -left-4 hidden rounded-xl border border-border bg-card p-4 shadow-elegant sm:block md:-left-8"
          >
            <p className="font-display text-3xl text-ink">14,200+</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Reports delivered
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* What we're NOT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16"
      >
        <h3 className="font-display text-2xl text-ink text-balance md:text-3xl">
          What Accurate Home Report is not
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NOT_ITEMS.map(({ t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-brass/30 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-brass/10 group-hover:text-brass">
                <X className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <p className="mt-4 font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass">
                {t}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section divider */}
      <div className="mt-20 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="h-1.5 w-1.5 rounded-full bg-brass/40" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </motion.section>
  );
}
