"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { Suspense, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  User,
  Home as HomeIcon,
  FileText,
  CalendarDays,
  Loader2,
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
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";

const searchSchema = z.object({
  package: z.enum(["basic", "premium", "verified"]).optional(),
});

const STEPS = [
  { id: 1, label: "Customer", icon: User },
  { id: 2, label: "Package", icon: FileText },
  { id: 3, label: "Property", icon: HomeIcon },
  { id: 4, label: "Schedule", icon: CalendarDays },
  { id: 5, label: "Payment", icon: CreditCard },
];

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  yearBuilt: string;
  sqft: string;
  ownershipType: "owner" | "authorized" | "";
  notes: string;
  packageId: Package["id"];
  preferredDate: string;
  preferredWindow: "morning" | "afternoon" | "either";
  rush: boolean;
  nameOnCard: string;
  saveCard: boolean;
};

const RUSH_FEE = 149;
const STORAGE_KEY = "order-form-state";

function defaultForm(sp: { package?: "basic" | "premium" | "verified" }): FormState {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    yearBuilt: "",
    sqft: "",
    ownershipType: "",
    notes: "",
    packageId: sp.package ?? "premium",
    preferredDate: "",
    preferredWindow: "either",
    rush: false,
    nameOnCard: "",
    saveCard: false,
  };
}

function loadPersistedForm(sp: { package?: "basic" | "premium" | "verified" }): FormState {
  if (typeof window === "undefined") return defaultForm(sp);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const pkgs = ["basic", "premium", "verified"] as const;
      const pkgId: Package["id"] = pkgs.includes(sp.package as never)
        ? (sp.package as Package["id"])
        : pkgs.includes(parsed.packageId as never)
          ? (parsed.packageId as Package["id"])
          : "premium";
      return { ...defaultForm(sp), ...parsed, packageId: pkgId };
    }
  } catch {
    /* ignore */
  }
  return defaultForm(sp);
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <OrderPageInner />
    </Suspense>
  );
}

const slideVariants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
};

function OrderPageInner() {
  const searchParams = useSearchParams();
  const parsed = searchSchema.safeParse({
    package: searchParams.get("package") ?? undefined,
  });
  const sp = parsed.data ?? { package: undefined };

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => loadPersistedForm(sp));
  const [dir, setDir] = useState(1);
  const u = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const pkg = useMemo(() => PACKAGES.find((p) => p.id === form.packageId)!, [form.packageId]);
  const subtotal = pkg.price;
  const rush = form.rush ? RUSH_FEE : 0;
  const tax = Math.round((subtotal + rush) * 0.0);
  const total = subtotal + rush + tax;

  const valid = (s: number) => {
    if (s === 1)
      return (
        form.firstName && form.lastName && /.+@.+\..+/.test(form.email) && form.phone.length >= 7
      );
    if (s === 2) return !!form.packageId;
    if (s === 3)
      return form.address && form.city && form.state && form.zip.length >= 5 && form.ownershipType;
    if (s === 4) return !!form.preferredDate;
    if (s === 5) return true;
    return true;
  };

  const next = () => {
    if (!valid(step)) {
      toast.error("Please complete the required fields.");
      return;
    }
    setDir(1);
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <SiteHeader />

      <div className="container-x pt-24 pb-32 md:pt-36 md:pb-40">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl text-ink md:text-5xl">Order your report</h1>
              <p className="mt-2 text-muted-foreground">
                5 simple steps. Encrypted checkout. Production begins immediately after payment.
              </p>
            </div>
          </div>

          <div
            className={`mt-12 grid gap-10 ${step === 5 ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-1 max-w-3xl mx-auto"}`}
          >
            {/* Main form area */}
            <div>
              {/* Step indicator */}
              <div className="mb-10 flex items-center justify-between gap-3">
                {STEPS.map((s) => {
                  const done = step > s.id;
                  const active = step === s.id;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold transition-all",
                          done && "bg-brass text-ink",
                          active && "border-2 border-ink bg-white text-ink",
                          !done && !active && "border border-border bg-white text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
                      </div>
                      <span
                        className={cn(
                          "text-[0.6rem] uppercase tracking-widest transition-colors",
                          active || done ? "text-ink/80" : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.04)] md:p-10">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {step === 1 && (
                      <section>
                        <h2 className="font-display text-2xl text-ink">Customer information</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Where should we send your report?
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <Field label="First name">
                            <Input
                              value={form.firstName}
                              onChange={(e) => u("firstName", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Last name">
                            <Input
                              value={form.lastName}
                              onChange={(e) => u("lastName", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Email" className="sm:col-span-2">
                            <Input
                              type="email"
                              value={form.email}
                              onChange={(e) => u("email", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Phone" className="sm:col-span-2">
                            <Input
                              value={form.phone}
                              onChange={(e) => u("phone", e.target.value)}
                              placeholder="(555) 555-0123"
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                        </div>
                      </section>
                    )}

                    {step === 3 && (
                      <section>
                        <h2 className="font-display text-2xl text-ink">Property information</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Which property is the report for?
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-6">
                          <Field label="Street address" className="sm:col-span-6">
                            <Input
                              value={form.address}
                              onChange={(e) => u("address", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Unit / Apt (optional)" className="sm:col-span-2">
                            <Input
                              value={form.address2}
                              onChange={(e) => u("address2", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="City" className="sm:col-span-2">
                            <Input
                              value={form.city}
                              onChange={(e) => u("city", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="State" className="sm:col-span-1">
                            <Input
                              value={form.state}
                              onChange={(e) => u("state", e.target.value.toUpperCase())}
                              maxLength={2}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="ZIP" className="sm:col-span-1">
                            <Input
                              value={form.zip}
                              onChange={(e) => u("zip", e.target.value)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Year built (optional)" className="sm:col-span-3">
                            <Input
                              value={form.yearBuilt}
                              onChange={(e) => u("yearBuilt", e.target.value)}
                              placeholder="e.g. 1998"
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field
                            label="Approx. square footage (optional)"
                            className="sm:col-span-3"
                          >
                            <Input
                              value={form.sqft}
                              onChange={(e) => u("sqft", e.target.value)}
                              placeholder="e.g. 2,400"
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <div className="sm:col-span-6">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                              Your relationship to the property
                            </Label>
                            <RadioGroup
                              value={form.ownershipType}
                              onValueChange={(v) =>
                                u("ownershipType", v as FormState["ownershipType"])
                              }
                              className="mt-2 grid gap-3 sm:grid-cols-2"
                            >
                              <RadioCard
                                value="owner"
                                current={form.ownershipType}
                                title="Homeowner"
                                desc="I own this property."
                              />
                              <RadioCard
                                value="authorized"
                                current={form.ownershipType}
                                title="Authorized representative"
                                desc="I have written authorization from the owner."
                              />
                            </RadioGroup>
                          </div>
                        </div>
                      </section>
                    )}

                    {step === 2 && (
                      <section>
                        <h2 className="font-display text-2xl text-ink">Choose your package</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          You can change this at any time before payment.
                        </p>
                        <div className="mt-6 grid gap-3">
                          {PACKAGES.map((p) => {
                            const active = form.packageId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => u("packageId", p.id)}
                                className={cn(
                                  "flex w-full flex-col gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200 md:flex-row md:items-center md:justify-between",
                                  active
                                    ? "border-brass shadow-[0_4px_16px_-8px_oklch(0.76_0.12_80/0.35)]"
                                    : "border-border hover:border-ink/20 hover:shadow-sm",
                                )}
                              >
                                <div className="flex items-start gap-4">
                                  <span
                                    className={cn(
                                      "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                      active ? "border-brass bg-brass text-ink" : "border-border",
                                    )}
                                  >
                                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                                  </span>
                                  <div>
                                    <p className="font-display text-xl text-ink">
                                      {p.name}{" "}
                                      {p.popular && (
                                        <span className="ml-2 rounded-full bg-brass/15 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest text-ink">
                                          Popular
                                        </span>
                                      )}
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                      {p.blurb}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-baseline justify-end gap-2">
                                  <span className="font-display text-2xl text-ink">
                                    {p.priceLabel}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {p.delivery}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-6">
                          <Field label="Anything we should know? (optional)">
                            <Textarea
                              value={form.notes}
                              onChange={(e) => u("notes", e.target.value)}
                              rows={3}
                              className="rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                        </div>
                      </section>
                    )}

                    {step === 4 && (
                      <section>
                        <h2 className="font-display text-2xl text-ink">Schedule your delivery</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Pick a preferred delivery date. Production starts as soon as payment
                          clears.
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <Field label="Preferred delivery date">
                            <Input
                              type="date"
                              value={form.preferredDate}
                              onChange={(e) => u("preferredDate", e.target.value)}
                              min={new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <div>
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                              Preferred time window
                            </Label>
                            <RadioGroup
                              value={form.preferredWindow}
                              onValueChange={(v) =>
                                u("preferredWindow", v as FormState["preferredWindow"])
                              }
                              className="mt-2 grid grid-cols-3 gap-2"
                            >
                              {(["morning", "afternoon", "either"] as const).map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => u("preferredWindow", w)}
                                  className={cn(
                                    "rounded-xl border px-3 py-2.5 text-sm capitalize transition-all",
                                    form.preferredWindow === w
                                      ? "border-brass bg-brass/10 text-ink shadow-sm"
                                      : "border-border bg-white hover:border-ink/20 hover:shadow-sm",
                                  )}
                                >
                                  <RadioGroupItem value={w} className="sr-only" />
                                  {w}
                                </button>
                              ))}
                            </RadioGroup>
                          </div>
                          <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-all hover:border-brass/40 hover:shadow-sm">
                            <input
                              type="checkbox"
                              checked={form.rush}
                              onChange={(e) => u("rush", e.target.checked)}
                              className="mt-1 h-4 w-4 accent-[oklch(0.76_0.12_80)]"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-ink">
                                Add Rush delivery (+${RUSH_FEE})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Bump your report to the front of the queue—delivered within 24
                                hours.
                              </p>
                            </div>
                          </label>
                        </div>
                      </section>
                    )}

                    {step === 5 && (
                      <>
                        <details className="group rounded-2xl border border-border bg-secondary/40 p-5 transition-all open:shadow-sm">
                          <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink list-none">
                            Review your order before payment
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
                          </summary>
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                Customer
                              </p>
                              <p className="mt-1 text-ink font-medium">
                                {form.firstName} {form.lastName}
                              </p>
                              <p className="text-muted-foreground">{form.email}</p>
                              <p className="text-muted-foreground">{form.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                Property
                              </p>
                              <p className="mt-1 text-ink font-medium">
                                {form.address}
                                {form.address2 ? `, ${form.address2}` : ""}
                              </p>
                              <p className="text-muted-foreground">
                                {form.city}, {form.state} {form.zip}
                              </p>
                              {form.yearBuilt && (
                                <p className="text-muted-foreground">Built {form.yearBuilt}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                Package
                              </p>
                              <p className="mt-1 text-ink font-medium">{pkg.name}</p>
                              <p className="text-muted-foreground">
                                {form.preferredDate
                                  ? `Delivery by ${new Date(form.preferredDate).toLocaleDateString()}`
                                  : ""}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                Total
                              </p>
                              <p className="mt-1 font-display text-xl text-ink">
                                ${total.toLocaleString()}
                              </p>
                              {form.rush && (
                                <p className="text-muted-foreground">
                                  Includes Rush delivery (+${RUSH_FEE})
                                </p>
                              )}
                            </div>
                          </div>
                        </details>

                        <div className="mt-6">
                          <StripePaymentSection
                            amount={total}
                            currency="usd"
                            packageId={form.packageId}
                            packageName={pkg.name}
                            email={form.email}
                            name={`${form.firstName} ${form.lastName}`.trim()}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-between border-t pt-8">
                  <Button
                    variant="ghost"
                    onClick={back}
                    disabled={step === 1}
                    className="rounded-xl hover:bg-secondary h-11 px-5"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                  {step < 5 && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={next}
                      className="rounded-xl h-11 px-6 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.25)]"
                    >
                      Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Summary sidebar — only on payment step */}
            {step === 5 && (
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Order summary
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{pkg.name} Report</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Delivery: {pkg.delivery}</p>

                  <ul className="mt-5 space-y-2.5 border-t pt-5 text-sm text-ink/85">
                    {pkg.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brass/15 text-brass">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                    {pkg.features.length > 5 && (
                      <li className="text-xs text-muted-foreground">
                        + {pkg.features.length - 5} more included
                      </li>
                    )}
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

                  <div className="mt-6 flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-3 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 text-brass" /> Encrypted · PCI-compliant
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RadioCard({
  value,
  current,
  title,
  desc,
}: {
  value: string;
  current: string;
  title: string;
  desc: string;
}) {
  const active = value === current;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition-all",
        active
          ? "border-brass shadow-[0_4px_12px_-8px_oklch(0.76_0.12_80/0.35)]"
          : "border-border hover:border-ink/20 hover:shadow-sm",
      )}
    >
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

function StripePaymentSection({
  amount,
  currency,
  packageId,
  packageName,
  email,
  name,
}: {
  amount: number;
  currency: string;
  packageId: string;
  packageName: string;
  email: string;
  name: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stripePromise = useMemo(() => getStripe(), []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setClientSecret(null);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        packageId,
        packageName,
        customerEmail: email,
        customerName: name,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) {
          if (res.error) {
            setError(res.error);
          } else {
            setClientSecret(res.clientSecret);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [amount, currency, packageId, packageName, email, name]);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Secure payment</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Encrypted via Stripe
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">All major cards · Apple Pay · Google Pay</p>

      {error && (
        <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!clientSecret && !error && (
        <div className="mt-8 flex flex-col items-center gap-3 py-10 text-muted-foreground">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary/60">
            <Loader2 className="h-6 w-6 animate-spin text-brass" />
          </div>
          <p className="text-sm">Preparing secure checkout…</p>
        </div>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#1a2236",
                colorBackground: "#ffffff",
                colorText: "#1a2236",
                colorDanger: "#dc2626",
                fontFamily: "Inter, system-ui, sans-serif",
                borderRadius: "12px",
                spacingUnit: "4px",
              },
              rules: {
                ".Input": {
                  border: "1px solid #e2e8f0",
                  padding: "12px",
                  fontSize: "14px",
                  borderRadius: "12px",
                },
                ".Input:focus": {
                  borderColor: "#1a2236",
                  boxShadow: "0 0 0 1px #1a2236",
                },
                ".Label": {
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  fontWeight: "500",
                },
                ".Tab": {
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                },
                ".Tab--selected": {
                  borderColor: "#1a2236",
                  boxShadow: "0 0 0 1px #1a2236",
                },
              },
            },
          }}
        >
          <PaymentForm amount={amount} packageId={packageId} />
        </Elements>
      )}
    </section>
  );
}

function PaymentForm({ amount, packageId }: { amount: number; packageId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success?package=${packageId}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed");
        setProcessing(false);
      } else if (result.paymentIntent?.status === "succeeded") {
        try {
          localStorage.removeItem("order-form-state");
        } catch {
          /* ignore */
        }
        window.location.href = `/order/success?package=${packageId}&payment_intent=${result.paymentIntent.id}`;
      } else if (result.paymentIntent?.status === "processing") {
        window.location.href = `/order/pending?package=${packageId}`;
      } else {
        setProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed unexpectedly");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-6">
        <PaymentElement />
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="brass"
        size="lg"
        className="mt-6 w-full rounded-xl shadow-[0_4px_14px_-6px_oklch(0.76_0.12_80/0.4)]"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          <>
            Pay ${amount.toLocaleString()} <Lock className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
