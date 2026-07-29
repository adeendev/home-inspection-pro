"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Suspense, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
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
import { Field, RadioCard } from "@/components/order/FormPrimitives";

const searchSchema = z.object({
  package: z.enum(["basic", "premium", "verified"]).optional(),
});

const STEPS = [
  { id: 1, label: "Customer", icon: User },
  { id: 2, label: "Property", icon: HomeIcon },
  { id: 3, label: "Schedule", icon: CalendarDays },
  { id: 4, label: "Package", icon: FileText },
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
};

const RUSH_FEE = 149;

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
  };
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = searchSchema.safeParse({
    package: searchParams.get("package") ?? undefined,
  });
  const sp = parsed.data ?? { package: undefined };

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => defaultForm(sp));
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const u = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pkg = useMemo(() => PACKAGES.find((p) => p.id === form.packageId)!, [form.packageId]);
  const subtotal = pkg.price;
  const rush = form.rush ? RUSH_FEE : 0;
  const total = subtotal + rush;

  const valid = (s: number) => {
    if (s === 1)
      return (
        form.firstName.trim().length >= 1 &&
        form.lastName.trim().length >= 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        /^\+?[\d\s\-().]{7,15}$/.test(form.phone)
      );
    if (s === 2)
      return (
        form.address.trim().length >= 3 &&
        form.city.trim().length >= 2 &&
        /^[A-Z]{2}$/.test(form.state) &&
        /^\d{5}(-\d{4})?$/.test(form.zip) &&
        !!form.ownershipType
      );
    if (s === 3) return !!form.preferredDate;
    if (s === 4) return !!form.packageId;
    return true;
  };

  const submitBasicInfo = async () => {
    if (!valid(4)) {
      toast.error("Please complete the required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageTier: form.packageId,
          rushRequested: form.rush,
          customerEmail: form.email,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          wizardData: {
            phone: form.phone,
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
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) {
        toast.error(data.error || "Failed to create order");
        setSubmitting(false);
        return;
      }
      // Your private order link is the token in the URL — nothing sensitive
      // is kept in this browser, so refreshing or returning later is safe.
      router.push(`/order/questionnaire/${data.accessToken}`);
    } catch {
      toast.error("Failed to create order");
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 4) {
      submitBasicInfo();
      return;
    }
    if (!valid(step)) {
      toast.error("Please complete the required fields.");
      return;
    }
    setDir(1);
    setStep((s) => Math.min(4, s + 1));
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
        <div className="mx-auto max-w-full lg:max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
                Order your report
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A few quick questions, then your property questionnaire. Sign and pay at the very
                end.
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-brass" />
                No account or password needed — your order lives at a private link only you have.
              </p>
            </div>
          </div>

          <div className="mt-12">
            {/* Step indicator */}
            <div className="mb-10 grid grid-cols-4 gap-1 sm:gap-2">
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
                            placeholder="John"
                            value={form.firstName}
                            onChange={(e) => u("firstName", e.target.value.slice(0, 50))}
                            maxLength={50}
                            className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                          />
                        </Field>
                        <Field label="Last name">
                          <Input
                            placeholder="Smith"
                            value={form.lastName}
                            onChange={(e) => u("lastName", e.target.value.slice(0, 50))}
                            maxLength={50}
                            className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                          />
                        </Field>
                        <Field label="Email" className="sm:col-span-2">
                          <Input
                            type="email"
                            placeholder="john@example.com"
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

                  {step === 4 && (
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
                                  <p className="mt-0.5 text-sm text-muted-foreground">{p.blurb}</p>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-baseline justify-end gap-2">
                                <span className="font-display text-2xl text-ink">
                                  {p.priceLabel}
                                </span>
                                <span className="text-xs text-muted-foreground">{p.delivery}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-6">
                        <Field label="Anything we should know? (optional)">
                          <Textarea
                            placeholder="Any special instructions for the inspector…"
                            value={form.notes}
                            onChange={(e) => u("notes", e.target.value)}
                            rows={3}
                            className="rounded-xl border-border bg-white focus-visible:ring-ink"
                          />
                        </Field>
                      </div>
                      <div className="mt-6 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          Estimated total{form.rush && " (incl. rush)"}
                        </span>
                        <span className="font-display text-lg text-ink">
                          ${total.toLocaleString()}
                        </span>
                      </div>
                    </section>
                  )}

                  {step === 2 && (
                    <section>
                      <h2 className="font-display text-2xl text-ink">Property information</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Which property is the report for?
                      </p>
                      <div className="mt-6 grid gap-4 sm:grid-cols-6">
                        <Field label="Street address" className="sm:col-span-6">
                          <Input
                            placeholder="742 Evergreen Terrace"
                            value={form.address}
                            onChange={(e) => u("address", e.target.value)}
                            className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                          />
                        </Field>
                        <Field label="Unit / Apt (optional)" className="sm:col-span-2">
                          <Input
                            placeholder="Apt 4B"
                            value={form.address2}
                            onChange={(e) => u("address2", e.target.value)}
                            className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
                          />
                        </Field>
                        <Field label="City" className="sm:col-span-2">
                          <Input
                            placeholder="Austin"
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
                        <Field label="Approx. square footage (optional)" className="sm:col-span-3">
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

                  {step === 3 && (
                    <section>
                      <h2 className="font-display text-2xl text-ink">Schedule your delivery</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pick a preferred delivery date. Production starts once your questionnaire
                        and payment are complete.
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
                            <p className="font-medium text-ink">Add Rush delivery (+${RUSH_FEE})</p>
                            <p className="text-sm text-muted-foreground">
                              Bump your report to the front of the queue—delivered within 24 hours.
                            </p>
                          </div>
                        </label>
                      </div>
                    </section>
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
                <Button
                  variant="primary"
                  size="lg"
                  onClick={next}
                  disabled={submitting}
                  className="rounded-xl h-11 px-6 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.25)]"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === 4 ? (
                    <>
                      Continue to questionnaire <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
