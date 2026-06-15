import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useMemo } from "react";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Lock, Apple, ShieldCheck,
  User, Home as HomeIcon, FileText, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { PACKAGES, type Package } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const search = z.object({
  package: z.enum(["basic", "premium", "verified"]).optional(),
});

export const Route = createFileRoute("/order")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Order Your Report — Accurate Home Report" },
      { name: "description", content: "Order your homeowner-verified property report. Secure 5-step checkout with encrypted payment." },
      { property: "og:title", content: "Order Your Report — Accurate Home Report" },
      { property: "og:url", content: "/order" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
  component: OrderPage,
});

const STEPS = [
  { id: 1, label: "Customer", icon: User },
  { id: 2, label: "Property", icon: HomeIcon },
  { id: 3, label: "Package", icon: FileText },
  { id: 4, label: "Schedule", icon: CalendarDays },
  { id: 5, label: "Payment", icon: CreditCard },
];

type FormState = {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; address2: string; city: string; state: string; zip: string;
  yearBuilt: string; sqft: string; ownershipType: "owner" | "authorized" | "";
  notes: string;
  packageId: Package["id"];
  preferredDate: string; preferredWindow: "morning" | "afternoon" | "either";
  rush: boolean;
  card: string; exp: string; cvc: string; postal: string; nameOnCard: string;
  saveCard: boolean;
};

const RUSH_FEE = 149;

function OrderPage() {
  const sp = Route.useSearch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", address2: "", city: "", state: "", zip: "",
    yearBuilt: "", sqft: "", ownershipType: "", notes: "",
    packageId: sp.package ?? "premium",
    preferredDate: "", preferredWindow: "either", rush: false,
    card: "", exp: "", cvc: "", postal: "", nameOnCard: "", saveCard: false,
  });
  const u = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const pkg = useMemo(() => PACKAGES.find((p) => p.id === form.packageId)!, [form.packageId]);
  const subtotal = pkg.price;
  const rush = form.rush ? RUSH_FEE : 0;
  const tax = Math.round((subtotal + rush) * 0.0);
  const total = subtotal + rush + tax;

  const valid = (s: number) => {
    if (s === 1) return form.firstName && form.lastName && /.+@.+\..+/.test(form.email) && form.phone.length >= 7;
    if (s === 2) return form.address && form.city && form.state && form.zip.length >= 5 && form.ownershipType;
    if (s === 3) return !!form.packageId;
    if (s === 4) return !!form.preferredDate;
    if (s === 5) return form.card.replace(/\s/g, "").length >= 12 && form.exp.length >= 4 && form.cvc.length >= 3 && form.nameOnCard;
    return true;
  };

  const next = () => {
    if (!valid(step)) { toast.error("Please complete the required fields."); return; }
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => {
    if (!valid(5)) { toast.error("Please enter valid payment details."); return; }
    // Mock: random outcome heavily weighted to success
    const r = Math.random();
    const outcome = r < 0.92 ? "success" : r < 0.97 ? "pending" : "failed";
    window.location.href = `/order/${outcome}?package=${form.packageId}`;
  };

  return (
    <div className="bg-secondary/30">
      <SiteHeader />

      <div className="container-x py-12 md:py-16">
        <div className="mb-8">
          <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-ink">← Back to home</Link>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">Order your report</h1>
          <p className="mt-2 text-muted-foreground">5 simple steps. Encrypted checkout. Production begins immediately after payment.</p>
        </div>

        {/* Stepper */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <ol className="flex items-center justify-between gap-2 overflow-x-auto">
            {STEPS.map((s, idx) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <li key={s.id} className="flex flex-1 items-center gap-2">
                  <div className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-semibold transition",
                    done && "border-brass bg-brass text-ink",
                    active && "border-ink bg-ink text-cream",
                    !done && !active && "border-border bg-secondary text-muted-foreground",
                  )}>
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : s.id}
                  </div>
                  <div className="hidden flex-col sm:flex">
                    <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">Step {s.id}</span>
                    <span className={cn("text-sm font-medium", active ? "text-ink" : "text-muted-foreground")}>{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className={cn("mx-2 hidden h-px flex-1 sm:block", done ? "bg-brass" : "bg-border")} />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-10">
            {step === 1 && (
              <section>
                <h2 className="font-display text-2xl text-ink">Customer information</h2>
                <p className="mt-1 text-sm text-muted-foreground">Where should we send your report?</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="First name"><Input value={form.firstName} onChange={(e) => u("firstName", e.target.value)} /></Field>
                  <Field label="Last name"><Input value={form.lastName} onChange={(e) => u("lastName", e.target.value)} /></Field>
                  <Field label="Email" className="sm:col-span-2"><Input type="email" value={form.email} onChange={(e) => u("email", e.target.value)} /></Field>
                  <Field label="Phone" className="sm:col-span-2"><Input value={form.phone} onChange={(e) => u("phone", e.target.value)} placeholder="(555) 555-0123" /></Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="font-display text-2xl text-ink">Property information</h2>
                <p className="mt-1 text-sm text-muted-foreground">Which property is the report for?</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-6">
                  <Field label="Street address" className="sm:col-span-6"><Input value={form.address} onChange={(e) => u("address", e.target.value)} /></Field>
                  <Field label="Unit / Apt (optional)" className="sm:col-span-2"><Input value={form.address2} onChange={(e) => u("address2", e.target.value)} /></Field>
                  <Field label="City" className="sm:col-span-2"><Input value={form.city} onChange={(e) => u("city", e.target.value)} /></Field>
                  <Field label="State" className="sm:col-span-1"><Input value={form.state} onChange={(e) => u("state", e.target.value.toUpperCase())} maxLength={2} /></Field>
                  <Field label="ZIP" className="sm:col-span-1"><Input value={form.zip} onChange={(e) => u("zip", e.target.value)} /></Field>
                  <Field label="Year built (optional)" className="sm:col-span-3"><Input value={form.yearBuilt} onChange={(e) => u("yearBuilt", e.target.value)} placeholder="e.g. 1998" /></Field>
                  <Field label="Approx. square footage (optional)" className="sm:col-span-3"><Input value={form.sqft} onChange={(e) => u("sqft", e.target.value)} placeholder="e.g. 2,400" /></Field>
                  <div className="sm:col-span-6">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Your relationship to the property</Label>
                    <RadioGroup value={form.ownershipType} onValueChange={(v) => u("ownershipType", v as FormState["ownershipType"])} className="mt-2 grid gap-3 sm:grid-cols-2">
                      <RadioCard value="owner" current={form.ownershipType} title="Homeowner" desc="I own this property." />
                      <RadioCard value="authorized" current={form.ownershipType} title="Authorized representative" desc="I have written authorization from the owner." />
                    </RadioGroup>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <h2 className="font-display text-2xl text-ink">Choose your package</h2>
                <p className="mt-1 text-sm text-muted-foreground">You can change this at any time before payment.</p>
                <div className="mt-6 grid gap-4">
                  {PACKAGES.map((p) => {
                    const active = form.packageId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => u("packageId", p.id)}
                        className={cn(
                          "flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 text-left transition md:flex-row md:items-center md:justify-between",
                          active ? "border-brass shadow-elegant" : "border-border hover:border-ink/30",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <span className={cn("mt-1 grid h-5 w-5 place-items-center rounded-full border", active ? "border-brass bg-brass text-ink" : "border-border")}>
                            {active && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <div>
                            <p className="font-display text-xl text-ink">{p.name} {p.popular && <span className="ml-2 rounded-full bg-brass/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-ink">Popular</span>}</p>
                            <p className="text-sm text-muted-foreground">{p.blurb}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl text-ink">{p.priceLabel}</p>
                          <p className="text-xs text-muted-foreground">{p.delivery}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <Field label="Anything we should know? (optional)"><Textarea value={form.notes} onChange={(e) => u("notes", e.target.value)} rows={3} /></Field>
                </div>
              </section>
            )}

            {step === 4 && (
              <section>
                <h2 className="font-display text-2xl text-ink">Schedule your delivery</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick a preferred delivery date. Production starts as soon as payment clears.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Preferred delivery date">
                    <Input type="date" value={form.preferredDate} onChange={(e) => u("preferredDate", e.target.value)} min={new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)} />
                  </Field>
                  <div>
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Preferred time window</Label>
                    <RadioGroup value={form.preferredWindow} onValueChange={(v) => u("preferredWindow", v as FormState["preferredWindow"])} className="mt-2 grid grid-cols-3 gap-2">
                      {(["morning", "afternoon", "either"] as const).map((w) => (
                        <button key={w} type="button" onClick={() => u("preferredWindow", w)}
                          className={cn("rounded-lg border px-3 py-2.5 text-sm capitalize transition", form.preferredWindow === w ? "border-brass bg-brass/10 text-ink" : "border-border hover:border-ink/30")}>
                          <RadioGroupItem value={w} className="sr-only" />
                          {w}
                        </button>
                      ))}
                    </RadioGroup>
                  </div>
                  <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4 transition hover:border-brass/40">
                    <input type="checkbox" checked={form.rush} onChange={(e) => u("rush", e.target.checked)} className="mt-1 h-4 w-4 accent-[oklch(0.76_0.12_80)]" />
                    <div className="flex-1">
                      <p className="font-medium text-ink">Add Rush delivery (+${RUSH_FEE})</p>
                      <p className="text-sm text-muted-foreground">Bump your report to the front of the queue—delivered within 24 hours.</p>
                    </div>
                  </label>
                </div>
              </section>
            )}

            {step === 5 && (
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-ink">Secure payment</h2>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Encrypted via Stripe</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">All major cards · Apple Pay · Google Pay</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-border bg-ink py-3 text-sm text-cream transition hover:bg-ink-soft" onClick={() => toast.info("Apple Pay coming once Stripe keys are connected.")}>
                    <Apple className="h-4 w-4" /> Pay
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm text-ink transition hover:bg-secondary" onClick={() => toast.info("Google Pay coming once Stripe keys are connected.")}>
                    <span className="font-medium">G Pay</span>
                  </button>
                </div>

                <div className="my-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                  <div className="h-px flex-1 bg-border" /> or pay with card <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-4 sm:grid-cols-6">
                  <Field label="Name on card" className="sm:col-span-6"><Input value={form.nameOnCard} onChange={(e) => u("nameOnCard", e.target.value)} /></Field>
                  <Field label="Card number" className="sm:col-span-6">
                    <Input value={form.card} placeholder="1234 1234 1234 1234" onChange={(e) => u("card", e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))} />
                  </Field>
                  <Field label="Expiry (MM/YY)" className="sm:col-span-2"><Input value={form.exp} placeholder="MM/YY" onChange={(e) => u("exp", e.target.value.slice(0, 5))} /></Field>
                  <Field label="CVC" className="sm:col-span-2"><Input value={form.cvc} placeholder="123" onChange={(e) => u("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))} /></Field>
                  <Field label="ZIP" className="sm:col-span-2"><Input value={form.postal} onChange={(e) => u("postal", e.target.value)} /></Field>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={form.saveCard} onChange={(e) => u("saveCard", e.target.checked)} className="h-4 w-4 accent-[oklch(0.76_0.12_80)]" /> Save card for future orders
                </label>

                <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground">
                  <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-brass" />
                  Demo checkout — no real charge is made. Connect your Stripe keys (<code>STRIPE_PUBLIC_KEY</code>, <code>STRIPE_SECRET_KEY</code>) to enable live payments.
                </div>
              </section>
            )}

            <div className="mt-10 flex items-center justify-between border-t pt-6">
              <Button variant="ghost" onClick={back} disabled={step === 1}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < 5 ? (
                <Button variant="primary" size="lg" onClick={next}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="brass" size="lg" onClick={submit}>
                  Pay ${total.toLocaleString()} <Lock className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Order summary</p>
              <h3 className="mt-2 font-display text-2xl text-ink">{pkg.name} Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">Delivery: {pkg.delivery}</p>

              <ul className="mt-5 space-y-2 border-t pt-5 text-sm text-ink/85">
                {pkg.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-brass" strokeWidth={3} />{f}</li>
                ))}
                {pkg.features.length > 5 && <li className="text-xs text-muted-foreground">+ {pkg.features.length - 5} more included</li>}
              </ul>

              <dl className="mt-6 space-y-2 border-t pt-5 text-sm">
                <Row k="Subtotal" v={`$${subtotal.toLocaleString()}`} />
                {form.rush && <Row k="Rush delivery" v={`$${rush.toLocaleString()}`} />}
                <Row k="Tax" v="—" muted />
                <div className="mt-3 flex items-baseline justify-between border-t pt-3">
                  <dt className="font-display text-lg text-ink">Total</dt>
                  <dd className="font-display text-2xl text-ink">${total.toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-center gap-2 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                <Lock className="h-3 w-3 text-brass" /> Encrypted · PCI-compliant
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RadioCard({ value, current, title, desc }: { value: string; current: string; title: string; desc: string }) {
  const active = value === current;
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition", active ? "border-brass shadow-elegant" : "border-border hover:border-ink/30")}>
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </label>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={muted ? "text-muted-foreground" : "text-ink"}>{v}</dd>
    </div>
  );
}
