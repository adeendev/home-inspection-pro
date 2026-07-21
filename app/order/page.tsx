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
  PenLine,
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
import { SignaturePad } from "@/components/ui/signature-pad";
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
  signature: string;
  signatureConsent: boolean;
  nameOnCard: string;
  saveCard: boolean;
};

const RUSH_FEE = 149;
const STORAGE_KEY = "order-form-state";

function defaultForm(sp: { package?: "basic" | "premium" | "verified" }): FormState {
  return {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "(512) 555-0198",
    address: "742 Evergreen Terrace",
    address2: "Apt 4B",
    city: "Austin",
    state: "TX",
    zip: "78701",
    yearBuilt: "2005",
    sqft: "2400",
    ownershipType: "owner",
    notes: "Test order — mock data for development.",
    packageId: sp.package ?? "premium",
    preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    preferredWindow: "morning",
    rush: false,
    signature: "",
    signatureConsent: false,
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
  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 16 : -16 }),
  center: { opacity: 1, y: 0 },
  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -16 : 16 }),
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const u = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    try {
      const { signature: _sig, ...rest } = form;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [form]);

  useEffect(() => {
    if (step === 5 && !orderId && !creatingOrder) {
      setCreatingOrder(true);
      fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageTier: form.packageId,
          rushRequested: form.rush,
          customerEmail: form.email,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          wizardData: {
            address: form.address,
            address2: form.address2,
            city: form.city,
            state: form.state,
            zip: form.zip,
            yearBuilt: form.yearBuilt,
            sqft: form.sqft,
            ownershipType: form.ownershipType,
            notes: form.notes,
            preferredDate: form.preferredDate,
            preferredWindow: form.preferredWindow,
          },
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.orderId) setOrderId(res.orderId);
          else toast.error(res.error || "Failed to create order");
        })
        .catch(() => toast.error("Failed to create order"));
    }
  }, [step, orderId, creatingOrder, form]);

  const pkg = useMemo(() => PACKAGES.find((p) => p.id === form.packageId)!, [form.packageId]);
  const subtotal = pkg.price;
  const rush = form.rush ? RUSH_FEE : 0;
  const tax = Math.round((subtotal + rush) * 0.0);
  const total = subtotal + rush + tax;

  const valid = (s: number) => {
    if (s === 1)
      return (
        form.firstName.trim().length >= 1 &&
        form.lastName.trim().length >= 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        /^\+?[\d\s\-().]{7,15}$/.test(form.phone)
      );
    if (s === 2) return !!form.packageId;
    if (s === 3)
      return (
        form.address.trim().length >= 3 &&
        form.city.trim().length >= 2 &&
        /^[A-Z]{2}$/.test(form.state) &&
        /^\d{5}(-\d{4})?$/.test(form.zip) &&
        form.ownershipType
      );
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

      <div className="px-4 pt-24 pb-32 md:px-8 md:pt-36 md:pb-40">
        <div className="mx-auto max-w-full lg:max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>

          <div className="mt-6">
            <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
              Order your report
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              5 simple steps. Encrypted checkout. Production begins immediately after payment.
            </p>
          </div>

          <div
            className={`mt-12 grid gap-6 sm:gap-10 ${step === 5 ? "lg:grid-cols-[1fr_380px]" : "max-w-3xl mx-auto"}`}
          >
            {/* Main form area */}
            <div className="min-w-0">
              {/* Step indicator */}
              <div
                className="mb-10 grid grid-cols-5 gap-1 sm:gap-2"
                style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
              >
                {STEPS.map((s) => {
                  const done = step > s.id;
                  const active = step === s.id;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-1 sm:gap-1.5">
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold transition-all sm:h-8 sm:w-8 sm:text-xs",
                          done && "bg-brass text-ink",
                          active && "border-2 border-ink bg-white text-ink",
                          !done && !active && "border border-border bg-white text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : s.id}
                      </div>
                      <span
                        className={cn(
                          "hidden text-[0.5rem] uppercase tracking-wider transition-colors sm:block sm:text-[0.6rem]",
                          active || done ? "text-ink/80" : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-3xl border border-border bg-white p-5 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.04)] sm:p-6 md:p-10">
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
                              onChange={(e) => u("firstName", e.target.value.slice(0, 50))}
                              maxLength={50}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Last name">
                            <Input
                              value={form.lastName}
                              onChange={(e) => u("lastName", e.target.value.slice(0, 50))}
                              maxLength={50}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                          </Field>
                          <Field label="Email" className="sm:col-span-2">
                            <Input
                              type="email"
                              value={form.email}
                              onChange={(e) => u("email", e.target.value.slice(0, 100))}
                              maxLength={100}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                            {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                              <p className="mt-1 text-xs text-destructive">Enter a valid email</p>
                            )}
                          </Field>
                          <Field label="Phone" className="sm:col-span-2">
                            <Input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^\d+\-() ]/g, "");
                                u("phone", v);
                              }}
                              placeholder="(555) 555-0123"
                              maxLength={16}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                            {form.phone && !/^\+?[\d\s\-().]{7,15}$/.test(form.phone) && (
                              <p className="mt-1 text-xs text-destructive">
                                Enter a valid phone number (7-15 digits)
                              </p>
                            )}
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
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
                                u("state", v);
                              }}
                              placeholder="TX"
                              maxLength={2}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                            {form.state && !/^[A-Z]{2}$/.test(form.state) && (
                              <p className="mt-1 text-xs text-destructive">2-letter code</p>
                            )}
                          </Field>
                          <Field label="ZIP" className="sm:col-span-1">
                            <Input
                              value={form.zip}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^\d-]/g, "");
                                u("zip", v);
                              }}
                              placeholder="78701"
                              maxLength={10}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                            {form.zip && !/^\d{5}(-\d{4})?$/.test(form.zip) && (
                              <p className="mt-1 text-xs text-destructive">5-digit ZIP</p>
                            )}
                          </Field>
                          <Field label="Year built (optional)" className="sm:col-span-3">
                            <Input
                              value={form.yearBuilt}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                                u("yearBuilt", v);
                              }}
                              placeholder="e.g. 1998"
                              maxLength={4}
                              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                            />
                            {form.yearBuilt &&
                              (Number(form.yearBuilt) < 1800 ||
                                Number(form.yearBuilt) > new Date().getFullYear()) && (
                                <p className="mt-1 text-xs text-destructive">
                                  Year 1800–{new Date().getFullYear()}
                                </p>
                              )}
                          </Field>
                          <Field
                            label="Approx. square footage (optional)"
                            className="sm:col-span-3"
                          >
                            <Input
                              value={form.sqft}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^\d,]/g, "");
                                u("sqft", v);
                              }}
                              placeholder="e.g. 2400"
                              maxLength={10}
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
                                <div className="flex min-w-0 items-start gap-4">
                                  <span
                                    className={cn(
                                      "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                      active ? "border-brass bg-brass text-ink" : "border-border",
                                    )}
                                  >
                                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                                  </span>
                                  <div className="min-w-0">
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
                                <div className="flex shrink-0 items-baseline justify-end gap-2">
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
                                <div
                                  key={w}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => u("preferredWindow", w)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      u("preferredWindow", w);
                                    }
                                  }}
                                  className={cn(
                                    "rounded-xl border px-3 py-2.5 text-sm capitalize transition-all cursor-pointer",
                                    form.preferredWindow === w
                                      ? "border-brass bg-brass/10 text-ink shadow-sm"
                                      : "border-border bg-white hover:border-ink/20 hover:shadow-sm",
                                  )}
                                >
                                  <RadioGroupItem value={w} className="sr-only" />
                                  {w}
                                </div>
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
                          {form.signature && (
                            <div className="mt-4 border-t pt-4">
                              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                Signature
                              </p>
                              <img
                                src={form.signature}
                                alt="Customer signature"
                                className="h-14 rounded-lg border border-border bg-white object-contain p-1"
                              />
                            </div>
                          )}
                        </details>

                        <div className="mt-6 rounded-2xl border border-border p-5 sm:p-6 max-w-full overflow-hidden">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brass/10 text-brass">
                              <PenLine className="h-4 w-4" />
                            </span>
                            <div>
                              <h3 className="font-display text-lg text-ink">Digital signature</h3>
                              <p className="text-xs text-muted-foreground">
                                Sign to authorize this order and confirm accuracy.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <SignaturePad
                              value={form.signature}
                              onChange={(v) => u("signature", v)}
                              height={140}
                            />
                          </div>

                          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-all hover:border-brass/40 hover:shadow-sm">
                            <input
                              type="checkbox"
                              checked={form.signatureConsent}
                              onChange={(e) => u("signatureConsent", e.target.checked)}
                              className="mt-0.5 h-4 w-4 accent-[oklch(0.76_0.12_80)]"
                            />
                            <div className="flex-1 text-sm text-muted-foreground">
                              I confirm that the information provided is accurate and I authorize
                              Accurate Home Report to prepare this order. I understand that reports
                              are non-refundable once preparation begins.
                            </div>
                          </label>

                          {!form.signature && (
                            <p className="mt-2 text-xs text-destructive">
                              A signature is required to proceed with payment.
                            </p>
                          )}
                        </div>

                        {form.signature && form.signatureConsent && orderId && (
                          <div className="mt-6 max-w-full overflow-hidden">
                            <StripePaymentSection
                              orderId={orderId}
                              amount={total}
                              packageId={form.packageId}
                            />
                          </div>
                        )}
                        {form.signature && form.signatureConsent && !orderId && (
                          <div className="mt-6 flex items-center gap-3 rounded-xl border border-border p-5 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-brass" />
                            Preparing your order...
                          </div>
                        )}
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
              <aside className="lg:sticky lg:top-28 lg:self-start min-w-0">
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
  orderId,
  amount,
  packageId,
}: {
  orderId: string;
  amount: number;
  packageId: string;
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
      body: JSON.stringify({ orderId }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) {
          if (res.error) setError(res.error);
          else setClientSecret(res.clientSecret);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

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
        <div className="min-w-0">
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
        </div>
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
