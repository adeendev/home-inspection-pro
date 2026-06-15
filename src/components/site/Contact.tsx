import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { SITE } from "@/lib/site";

export function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <section id="contact" className="container-x py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="eyebrow">Contact</span>
          <h2 className="mt-3 font-display text-4xl text-ink text-balance md:text-5xl">
            Speak with a property analyst.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have a question before ordering? Our team replies within one business day. For Verified package
            scheduling, please mention your metro area.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-cream"><Phone className="h-4 w-4" /></span>
              <div><p className="text-muted-foreground">Phone</p><p className="text-ink">{SITE.phone}</p></div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-cream"><Mail className="h-4 w-4" /></span>
              <div><p className="text-muted-foreground">Email</p><p className="text-ink">{SITE.email}</p></div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-cream"><MapPin className="h-4 w-4" /></span>
              <div><p className="text-muted-foreground">Coverage</p><p className="text-ink">{SITE.address}</p></div>
            </li>
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSending(true);
            setTimeout(() => {
              setSending(false);
              (e.target as HTMLFormElement).reset();
              toast.success("Message received. We'll reply within one business day.");
            }, 700);
          }}
          className="rounded-3xl border border-border bg-card p-8 shadow-elegant md:p-10"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">First name</label>
              <Input required name="first" className="mt-2" />
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Last name</label>
              <Input required name="last" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
              <Input required type="email" name="email" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Property address (optional)</label>
              <Input name="address" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">How can we help?</label>
              <Textarea required name="message" rows={4} className="mt-2" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">By submitting, you agree to our privacy practices.</p>
            <div className="flex gap-2">
              <Button asChild variant="ghost">
                <Link to="/order">Skip — Order now <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button type="submit" variant="primary" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
