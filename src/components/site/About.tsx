"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import desk from "@/assets/report-desk.jpg";

export function About() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      id="about"
      className="container-x py-24 md:py-32"
    >
      <div className="grid items-center gap-14 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">About Our Service</span>
          <h2 className="mt-3 font-display text-4xl text-ink text-balance md:text-5xl">
            A new standard in property documentation.
          </h2>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Accurate Home Report is a homeowner-reporting service that creates detailed property
            reports using information supplied by you, together with public records and trusted
            third-party property data—assembled by experienced analysts into one professional PDF.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              "Combines homeowner-provided data with public records",
              "Prepared by experienced property analysts",
              "Professional PDF report delivered digitally",
              "Every report is custom-created for the property",
            ].map((t, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3 text-ink/85"
              >
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-brass/15 text-brass">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="font-display text-lg text-ink">What Accurate Home Report is not</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["Not a home inspection", "We don't physically inspect or evaluate."],
                ["Not an appraisal", "We don't estimate property value."],
                ["Not a brokerage", "We're not affiliated with buying or selling."],
                ["Not legal advice", "We don't substitute licensed counsel."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-ink">{t}</p>
                    <p className="text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-brass/15 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border shadow-elegant">
            <img
              src={desk.src}
              alt="Analyst reviewing a printed property report"
              width={1600}
              height={1200}
              loading="lazy"
              className="h-full w-full object-cover"
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
    </motion.section>
  );
}
