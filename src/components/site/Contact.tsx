"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

type ContactErrors = Partial<Record<"first" | "last" | "email" | "message", string>>;

function validate(values: Record<string, string>): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.first?.trim()) errors.first = "First name is required";
  if (!values.last?.trim()) errors.last = "Last name is required";
  if (!values.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!values.message?.trim()) errors.message = "Message is required";
  return errors;
}

export function Contact() {
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleBlur = (name: string, values: Record<string, string>) => {
    setTouched((prev) => new Set(prev).add(name));
    setErrors((prev) => ({ ...prev, ...validate(values) }));
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      id="contact"
      className="container-x py-16 md:py-24 lg:py-32"
    >
      <div className="grid gap-10 md:gap-14 lg:grid-cols-[1fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Contact</span>
          <h2 className="mt-3 font-display text-3xl text-ink text-balance md:text-4xl lg:text-5xl">
            Speak with a property analyst.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have a question before ordering? Our team replies within one business day. For Verified
            package scheduling, please mention your metro area.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-cream">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="text-ink">{SITE.phone}</p>
              </div>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="flex items-start gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-cream">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="text-ink">{SITE.email}</p>
              </div>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.26 }}
              className="flex items-start gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-cream">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-muted-foreground">Coverage</p>
                <p className="text-ink">{SITE.address}</p>
              </div>
            </motion.li>
          </ul>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const data = new FormData(form);
            const values = Object.fromEntries(data) as Record<string, string>;
            const errs = validate(values);
            setErrors(errs);
            setTouched(new Set(["first", "last", "email", "message"]));
            if (Object.keys(errs).length > 0) return;

            setSending(true);
            fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            })
              .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to send");
                toast.success("Message received. We'll reply within one business day.");
                form.reset();
                setErrors({});
                setTouched(new Set());
              })
              .catch(() => {
                toast.error("Failed to send message. Please try again.");
              })
              .finally(() => setSending(false));
          }}
          className="rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8 lg:p-10"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldError
              label="First name"
              name="first"
              error={touched.has("first") ? errors.first : undefined}
              onBlur={handleBlur}
            />
            <FieldError
              label="Last name"
              name="last"
              error={touched.has("last") ? errors.last : undefined}
              onBlur={handleBlur}
            />
            <FieldError
              label="Email"
              name="email"
              type="email"
              className="sm:col-span-2"
              error={touched.has("email") ? errors.email : undefined}
              onBlur={handleBlur}
            />
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Property address (optional)
              </label>
              <Input name="address" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                How can we help?
              </label>
              <Textarea
                required
                name="message"
                rows={4}
                className={cn(
                  "mt-2",
                  touched.has("message") && errors.message && "border-destructive",
                )}
                onBlur={(e) => handleBlur("message", { message: e.target.value })}
              />
              {touched.has("message") && errors.message && (
                <p className="mt-1 text-xs text-destructive">{errors.message}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              By submitting, you agree to our privacy practices.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="ghost">
                <Link href="/order">
                  Skip — Order now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button type="submit" variant="primary" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </Button>
            </div>
          </div>
        </motion.form>
      </div>
    </motion.section>
  );
}

function FieldError({
  label,
  name,
  error,
  type,
  className,
  onBlur,
}: {
  label: string;
  name: string;
  error?: string;
  type?: string;
  className?: string;
  onBlur: (name: string, values: Record<string, string>) => void;
}) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input
        required
        type={type ?? "text"}
        name={name}
        className={cn("mt-2", error && "border-destructive")}
        onBlur={(e) => onBlur(name, { [name]: e.target.value })}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
