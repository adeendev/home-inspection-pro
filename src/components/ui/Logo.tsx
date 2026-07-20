"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  transparent?: boolean;
}

export function LogoIcon({ className = "h-9 w-9", transparent = false }: LogoProps) {
  return (
    <div
      className={`relative transition-transform duration-500 group-hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_2px_8px_rgba(26,34,54,0.15)]"
      >
        <defs>
          {/* Rich golden-brass gradient */}
          <linearGradient id="logo-brass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2d2bd" />
            <stop offset="35%" stopColor="#c5a880" />
            <stop offset="100%" stopColor="#a38253" />
          </linearGradient>
          {/* Accent checkmark gold gradient */}
          <linearGradient id="logo-accent-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5e6" />
            <stop offset="40%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#aa7c11" />
          </linearGradient>
        </defs>

        {/* Shield Outer Shape */}
        <path
          d="M50 10C67 10 81 13.5 83.5 24C83.5 51 50 79 50 85C50 79 16.5 51 16.5 24C19 13.5 33 10 50 10Z"
          stroke="url(#logo-brass)"
          strokeWidth="3.5"
          fill={transparent ? "rgba(255, 255, 255, 0.08)" : "rgba(26, 34, 54, 0.4)"}
          className="transition-colors duration-500"
          strokeLinejoin="round"
        />

        {/* House Silhouette (Subtle & Elegant) */}
        <path
          d="M32 60V46L50 32L68 46V60H32Z"
          fill="currentColor"
          className={transparent ? "text-white/10" : "text-ink/5"}
          stroke="url(#logo-brass)"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          strokeLinejoin="round"
        />

        {/* Thick, Sleek Checkmark representing Accuracy */}
        <path
          d="M40 50L48 58L64 36"
          stroke="url(#logo-accent-gold)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* House floor/foundation anchor */}
        <path d="M30 60H70" stroke="url(#logo-brass)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function LogoFull({ transparent = false }: { transparent?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoIcon transparent={transparent} className="h-9 w-9" />
      <div className="flex flex-col">
        <span
          className={`font-display text-lg font-semibold tracking-tight leading-tight transition-colors duration-500 ${
            transparent ? "text-white" : "text-ink"
          }`}
        >
          Accurate
        </span>
        <span
          className={`font-sans text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-500 ${
            transparent ? "text-brass-soft/80" : "text-brass"
          }`}
        >
          Home Report
        </span>
      </div>
    </div>
  );
}
