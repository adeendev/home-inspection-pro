"use client";

import Link from "next/link";
import { X, Menu, Home } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Packages", href: "/#packages" },
  { label: "Process", href: "/#process" },
  { label: "Sample Report", href: "/sample-report" },
  { label: "Contact", href: "/#contact" },
];

const NAV_DESKTOP = NAV.filter((i) => !["Home", "Sample Report"].includes(i.label));

const BP = 1024;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeOnResize = useCallback(() => {
    if (window.innerWidth >= BP) setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, [closeOnResize]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_30px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl"
          : "bg-white/80 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:h-16 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-ink text-cream shadow-[0_2px_8px_-2px_rgba(26,34,54,0.3)] transition-shadow duration-300 group-hover:shadow-[0_4px_14px_-2px_rgba(26,34,54,0.4)]">
            <span className="font-display text-lg leading-none">A</span>
          </span>
          <div className="hidden sm:block">
            <span className="font-display text-lg tracking-tight text-ink">
              Accurate <span className="text-muted-foreground">Home Report</span>
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_DESKTOP.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink/70 transition-all duration-200 hover:bg-black/5 hover:text-ink"
            >
              {i.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm" className="text-ink/80 hover:text-ink">
            <Link href="/sample-report">View Sample</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-ink text-cream shadow-[0_2px_10px_-3px_rgba(26,34,54,0.3)] transition-all duration-200 hover:bg-ink-soft hover:shadow-[0_4px_16px_-4px_rgba(26,34,54,0.35)] active:scale-[0.97]"
          >
            <Link href="/order">Order Report</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            asChild
            size="sm"
            className="h-9 bg-ink text-cream shadow-[0_2px_10px_-3px_rgba(26,34,54,0.3)] active:scale-[0.97]"
          >
            <Link href="/order">Order</Link>
          </Button>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((p) => !p)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-ink shadow-sm transition-all duration-200 hover:bg-secondary active:scale-[0.95]"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pt-6">
          {NAV.map((i) => (
            <a
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:bg-gray-100 hover:text-ink"
            >
              {i.label === "Home" && <Home className="h-4 w-4 text-brass" />}
              {i.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto border-t px-4 py-6">
          <Button asChild className="w-full bg-ink text-cream shadow-md active:scale-[0.97]">
            <Link href="/order" onClick={() => setOpen(false)}>
              Order Report
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2.5 w-full">
            <Link href="/sample-report" onClick={() => setOpen(false)}>
              View Sample Report
            </Link>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">(800) 555-0142</p>
        </div>
      </div>
    </header>
  );
}
