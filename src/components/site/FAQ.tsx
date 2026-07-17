"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/site";

export function FAQ() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      id="faq"
      className="bg-secondary/40"
    >
      <div className="container-x py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 md:gap-12 md:grid-cols-[1fr_1.5fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
              Questions, answered.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Can't find what you're looking for? Reach our team at{" "}
              <a
                href="mailto:hello@accuratehomereport.com"
                className="text-ink underline underline-offset-4"
              >
                hello@accuratehomereport.com
              </a>
              .
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Accordion
              type="single"
              collapsible
              className="divide-y rounded-2xl border border-border bg-card px-4 md:px-6"
            >
              {FAQS.map((f, idx) => (
                <AccordionItem key={idx} value={`f-${idx}`} className="border-none py-1">
                  <AccordionTrigger className="text-left font-display text-lg text-ink hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
