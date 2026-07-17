"use client";

import { Lock, UserCheck, FilePen, Clock, FileDown } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  { icon: Lock, label: "Secure Checkout" },
  { icon: UserCheck, label: "Homeowner Verification" },
  { icon: FilePen, label: "Analyst Prepared" },
  { icon: Clock, label: "48hr–3 Day Delivery" },
  { icon: FileDown, label: "Digital PDF Delivery" },
];

export function TrustBar() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="border-y border-border bg-secondary/40"
    >
      <div className="container-x py-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[0.78rem] uppercase tracking-[0.18em] text-muted-foreground md:gap-x-10">
          {ITEMS.map(({ icon: Icon, label }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2 transition-all duration-300 hover:text-ink"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-brass transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_6px_var(--brass)]" />
              {label}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
