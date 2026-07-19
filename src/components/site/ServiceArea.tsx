"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { SERVICE_AREAS } from "@/lib/site";
import neighborhood from "@/assets/neighborhood.jpg";

export function ServiceArea() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="container-x py-16 md:py-24 lg:py-32"
    >
      <div className="grid items-center gap-10 md:gap-14 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border shadow-elegant"
        >
          <img
            src={neighborhood.src}
            alt="Aerial view of an upscale neighborhood"
            width={1600}
            height={1000}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl glass p-5">
            <p className="font-display text-lg text-ink md:text-2xl">
              Verified visits in 14+ metro areas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Documentation reports available nationwide.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className="eyebrow">Service Area</span>
          <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
            Documentation nationwide. Verified visits in select metros.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Don't see your area? Our analyst-prepared Basic and Premium documentation reports are
            available anywhere in the United States.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
            {SERVICE_AREAS.map((a, i) => (
              <motion.li
                key={a}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-2 text-sm text-ink/85"
              >
                <MapPin className="h-3.5 w-3.5 text-brass" />
                {a}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.section>
  );
}
