import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Packages", href: "/#packages" },
  { label: "Process", href: "/#process" },
  { label: "Sample Report", href: "/sample-report" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md gradient-ink text-cream">
            <span className="font-display text-lg leading-none">A</span>
          </span>
          <span className="font-display text-lg tracking-tight text-ink">
            Accurate <span className="text-muted-foreground">Home Report</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((i) => (
            <a key={i.href} href={i.href} className="text-sm text-ink/75 transition hover:text-ink">
              {i.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/sample-report">View Sample</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to="/order">Order Report</Link>
          </Button>
        </div>
        <button
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-md border md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {NAV.map((i) => (
              <a
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm hover:bg-secondary"
              >
                {i.label}
              </a>
            ))}
            <Button asChild variant="primary" className="mt-2">
              <Link to="/order" onClick={() => setOpen(false)}>Order Report</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
