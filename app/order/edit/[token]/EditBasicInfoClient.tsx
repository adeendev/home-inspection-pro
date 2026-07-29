"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, RadioCard } from "@/components/order/FormPrimitives";
import { PACKAGES } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const RUSH_FEE = 149;

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
  packageId: "basic" | "premium" | "verified";
  preferredDate: string;
  preferredWindow: "morning" | "afternoon" | "either";
  rush: boolean;
};

export default function EditBasicInfoClient({
  token,
  initial,
}: {
  token: string;
  initial: FormState;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const u = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pkg = PACKAGES.find((p) => p.id === form.packageId)!;
  const total = pkg.price + (form.rush ? RUSH_FEE : 0);

  const valid =
    form.firstName.trim().length >= 1 &&
    form.lastName.trim().length >= 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    /^\+?[\d\s\-().]{7,15}$/.test(form.phone) &&
    form.address.trim().length >= 3 &&
    form.city.trim().length >= 2 &&
    /^[A-Z]{2}$/.test(form.state) &&
    /^\d{5}(-\d{4})?$/.test(form.zip) &&
    !!form.ownershipType &&
    !!form.preferredDate;

  const save = async () => {
    if (!valid) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          customerEmail: form.email,
          packageTier: form.packageId,
          rushRequested: form.rush,
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
      if (!res.ok) {
        toast.error(data.error || "Failed to save changes");
        setSaving(false);
        return;
      }
      toast.success("Changes saved");
      router.push(`/order/checkout/${token}`);
    } catch {
      toast.error("Failed to save changes");
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white p-5 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.04)] sm:p-6 md:p-10">
      <section>
        <h2 className="font-display text-xl text-ink">Customer</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          </Field>
          <Field label="Phone" className="sm:col-span-2">
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => u("phone", e.target.value.replace(/[^\d+\-() ]/g, ""))}
              maxLength={16}
              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
            />
          </Field>
        </div>
      </section>

      <section className="mt-10 border-t pt-8">
        <h2 className="font-display text-xl text-ink">Property</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-6">
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
              onChange={(e) => u("state", e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())}
              maxLength={2}
              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
            />
          </Field>
          <Field label="ZIP" className="sm:col-span-1">
            <Input
              value={form.zip}
              onChange={(e) => u("zip", e.target.value.replace(/[^\d-]/g, ""))}
              maxLength={10}
              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
            />
          </Field>
          <Field label="Year built (optional)" className="sm:col-span-3">
            <Input
              value={form.yearBuilt}
              onChange={(e) => u("yearBuilt", e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              className="h-11 rounded-xl border-border bg-white focus-visible:ring-ink"
            />
          </Field>
          <Field label="Approx. square footage (optional)" className="sm:col-span-3">
            <Input
              value={form.sqft}
              onChange={(e) => u("sqft", e.target.value.replace(/[^\d,]/g, ""))}
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
              onValueChange={(v) => u("ownershipType", v as FormState["ownershipType"])}
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

      <section className="mt-10 border-t pt-8">
        <h2 className="font-display text-xl text-ink">Schedule</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              onValueChange={(v) => u("preferredWindow", v as FormState["preferredWindow"])}
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

      <section className="mt-10 border-t pt-8">
        <h2 className="font-display text-xl text-ink">Package</h2>
        <div className="mt-4 grid gap-3">
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
                    <p className="font-display text-xl text-ink">{p.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.blurb}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-baseline justify-end gap-2">
                  <span className="font-display text-2xl text-ink">{p.priceLabel}</span>
                  <span className="text-xs text-muted-foreground">{p.delivery}</span>
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
        <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Estimated total</span>
          <span className="font-display text-lg text-ink">${total.toLocaleString()}</span>
        </div>
      </section>

      <div className="mt-12 flex items-center justify-between border-t pt-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/order/checkout/${token}`)}
          className="rounded-xl hover:bg-secondary h-11 px-5"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={save}
          disabled={saving}
          className="rounded-xl h-11 px-6 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.25)]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
