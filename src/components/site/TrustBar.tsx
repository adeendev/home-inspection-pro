import { Lock, UserCheck, FilePen, Clock, FileDown, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: Lock, label: "Secure Checkout" },
  { icon: UserCheck, label: "Homeowner Verification" },
  { icon: FilePen, label: "Analyst Prepared" },
  { icon: Clock, label: "48hr–3 Day Delivery" },
  { icon: FileDown, label: "Digital PDF Delivery" },
  { icon: ShieldCheck, label: "Privacy Protected" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-x py-6">
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[0.78rem] uppercase tracking-[0.18em] text-muted-foreground">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-brass" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
