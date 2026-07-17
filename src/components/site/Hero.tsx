"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, FileCheck2, Lock, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-home.jpg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Background image + overlays */}
      <div className="absolute inset-0 -z-10">
        <img
          src={hero.src}
          alt="Modern luxury home at golden hour"
          width={1920}
          height={1280}
          loading="eager"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,_var(--brass)_18%,_transparent)_0%,_transparent_55%)]" />
      </div>

      {/* Decorative floating elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-[10%] top-[15%] h-2 w-2 rounded-full bg-brass/30 blur-[1px] animate-float-slow" />
        <div
          className="absolute right-[15%] top-[25%] h-3 w-3 rounded-full bg-brass/20 blur-[2px] animate-float-med"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute left-[20%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-brass/25 blur-[1px] animate-float-fast"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute right-[30%] top-[10%] h-4 w-4 rounded-full bg-brass/10 blur-[3px] animate-float-slow"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="absolute left-[55%] top-[50%] h-2 w-2 rounded-full bg-brass/20 blur-[1px] animate-float-med"
          style={{ animationDelay: "-1s" }}
        />
        <div
          className="absolute right-[8%] bottom-[35%] h-1 w-1 rounded-full bg-brass/35 blur-[1px] animate-float-fast"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      <div className="container-x relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-cream/85 backdrop-blur mx-auto"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brass animate-pulse-soft" />
            Homeowner-Verified Reports
          </motion.span>

          <motion.h1
            {...fadeUp(0.12)}
            className="mt-2 font-display text-[2.2rem] leading-[1.05] text-cream text-balance md:text-5xl lg:text-6xl"
          >
            Know your home&apos;s
            <br />
            <span className="gradient-text animate-gradient-x bg-[length:200%_200%] text-glow">
              story before
            </span>
            <br />
            anyone else does.
          </motion.h1>

          <motion.p
            {...fadeUp(0.24)}
            className="mt-6 mx-auto max-w-xl text-sm text-cream/75 md:text-base"
          >
            Comprehensive, homeowner-verified property reports—public records, trusted data sources,
            and your disclosures, prepared by experienced analysts into one professional PDF.
          </motion.p>

          <motion.div
            {...fadeUp(0.36)}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" variant="brass">
              <Link href="/order">
                Order Your Report
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link href="/sample-report">View Sample Report</Link>
            </Button>
          </motion.div>

          <motion.ul
            {...fadeUp(0.48)}
            className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 mx-auto"
          >
            {[
              { icon: Clock, label: "48hr – 3 day delivery" },
              { icon: ShieldCheck, label: "Homeowner verified" },
              { icon: FileCheck2, label: "Analyst prepared" },
              { icon: Lock, label: "Encrypted checkout" },
            ].map(({ icon: Icon, label }) => (
              <motion.li
                key={label}
                whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.25)" }}
                className="flex items-center gap-2 rounded-lg border border-cream/10 bg-cream/5 px-3 py-2.5 text-[11px] text-cream/85 backdrop-blur transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
              >
                <Icon className="h-4 w-4 shrink-0 text-brass" />
                {label}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.section>
  );
}
