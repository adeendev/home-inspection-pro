"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    t: "Enter Property Address",
    d: "Provide your property's full address to begin the report process.",
  },
  {
    n: "02",
    t: "Verify Ownership",
    d: "Confirm you are the homeowner or an authorized representative.",
  },
  {
    n: "03",
    t: "Choose Package",
    d: "Select the report package that fits your needs—Basic, Premium, or Verified.",
  },
  {
    n: "04",
    t: "Property Questionnaire",
    d: "Complete our guided online questionnaire after checkout.",
  },
  { n: "05", t: "Secure Payment", d: "Complete your purchase through encrypted Stripe checkout." },
  {
    n: "06",
    t: "Report Preparation",
    d: "Our analysts combine your data with public records and third-party sources.",
  },
  {
    n: "07",
    t: "Digital Delivery",
    d: "Receive your professional property report within 48 hours to 3 business days.",
  },
];

export function Process() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      id="process"
      className="gradient-ink text-cream"
    >
      <div className="container-x py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="eyebrow">The Process</span>
          <h2 className="mt-3 font-display text-4xl text-cream text-balance md:text-5xl">
            A straightforward, secure path from order to delivery.
          </h2>
          <p className="mt-4 text-cream/70">
            Seven steps. Most homeowners finish the questionnaire in under 25 minutes.
          </p>
        </motion.div>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}
              className={`group relative rounded-2xl border border-cream/10 bg-cream/[0.04] p-6 transition ${
                i === STEPS.length - 1 ? "md:col-span-2 lg:col-span-3 text-center" : ""
              }`}
            >
              <div
                className={`flex items-baseline ${
                  i === STEPS.length - 1 ? "justify-center gap-4" : "justify-between"
                }`}
              >
                <span className="font-display text-3xl italic text-brass">{s.n}</span>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-cream/45">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl text-cream">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </motion.section>
  );
}
