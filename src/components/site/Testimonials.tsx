"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/site";

const INTERVAL = 5000;

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const t = TESTIMONIALS[i];
  const go = useCallback(
    (d: number) => setI((p) => (p + d + TESTIMONIALS.length) % TESTIMONIALS.length),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(id);
  }, [go, paused]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="container-x py-16 md:py-24 lg:py-32"
    >
      <div className="grid items-center gap-10 md:gap-14 md:grid-cols-[1fr_1.4fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">Homeowner Stories</span>
          <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
            Trusted by thoughtful homeowners across the country.
          </h2>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className="h-4 w-4 fill-brass text-brass transition-all duration-300"
                  style={{ animationDelay: `${s * 0.1}s` }}
                />
              ))}
            </div>
            4.9 average from 1,800+ verified orders
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8 lg:p-12"
        >
          {/* Quote icon */}
          <div className="absolute -top-5 left-6 grid h-10 w-10 place-items-center rounded-full bg-brass text-ink shadow-[0_4px_14px_-2px_color-mix(in_oklab,_var(--brass)_40%,_transparent)] md:left-8">
            <Quote className="h-5 w-5" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="font-display text-xl leading-snug text-ink text-balance md:text-2xl lg:text-3xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <div>
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Previous testimonial"
                    onClick={() => go(-1)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border transition-all duration-200 hover:border-brass hover:text-brass hover:shadow-[0_4px_12px_-2px_color-mix(in_oklab,_var(--brass)_30%,_transparent)] active:scale-90"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Next testimonial"
                    onClick={() => go(1)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border transition-all duration-200 hover:border-brass hover:text-brass hover:shadow-[0_4px_12px_-2px_color-mix(in_oklab,_var(--brass)_30%,_transparent)] active:scale-90"
                  >
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
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === i
                        ? "w-8 bg-brass shadow-[0_0_8px_-2px_var(--brass)]"
                        : "w-4 bg-border hover:bg-brass/40"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}
