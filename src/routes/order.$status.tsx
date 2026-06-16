import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect } from "react";
import { CheckCircle2, XCircle, Clock3, ArrowRight, Mail, FileDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { toast } from "sonner";

const statusSearch = z.object({
  package: z.string().optional(),
  payment_intent: z.string().optional(),
});

export const Route = createFileRoute("/order/$status")({
  validateSearch: statusSearch,
  head: ({ params }) => {
    const t =
      params.status === "success"
        ? "Order Confirmed"
        : params.status === "pending"
          ? "Payment Pending"
          : "Payment Failed";
    return {
      meta: [
        { title: `${t} — Accurate Home Report` },
        { name: "description", content: `${t} for your homeowner-verified property report.` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: StatusPage,
});

function StatusPage() {
  const { status } = useParams({ from: "/order/$status" });
  const search = useSearch({ from: "/order/$status" });

  useEffect(() => {
    if (status === "success") {
      try { localStorage.removeItem("order-form-state"); } catch { /* ignore */ }
    }
  }, [status]);
  const cfg = {
    success: {
      icon: CheckCircle2,
      tone: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: "Payment received. Your report is in production.",
      sub: "We've sent a confirmation email with your order details and the link to your property questionnaire.",
      cta: { label: "Open property questionnaire", to: "/order" },
    },
    pending: {
      icon: Clock3,
      tone: "text-brass",
      bg: "bg-brass/10",
      title: "Payment processing.",
      sub: "Your bank is reviewing the charge. You'll receive a confirmation email as soon as it clears—usually within a few minutes.",
      cta: { label: "Return home", to: "/" },
    },
    failed: {
      icon: XCircle,
      tone: "text-destructive",
      bg: "bg-destructive/10",
      title: "Payment was not completed.",
      sub: "Your card was not charged. Please try a different card or payment method.",
      cta: { label: "Try payment again", to: "/order" },
    },
  }[status as "success" | "pending" | "failed"] ?? {
    icon: XCircle,
    tone: "text-destructive",
    bg: "bg-destructive/10",
    title: "Unknown status.",
    sub: "We couldn't find that order outcome.",
    cta: { label: "Return home", to: "/" },
  };

  const Icon = cfg.icon;

  return (
    <div className="bg-secondary/30">
      <SiteHeader />
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant md:p-14">
          <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${cfg.bg}`}>
            <Icon className={`h-10 w-10 ${cfg.tone}`} strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl text-balance">
            {cfg.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{cfg.sub}</p>

          {status === "success" && (
            <>
              <div className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm">
                <Step
                  icon={Mail}
                  t="Confirmation email sent"
                  d="Order details and questionnaire link."
                />
                <Step
                  icon={FileDown}
                  t="Analyst assignment within 2 hours"
                  d="You'll be notified by email."
                />
                <Step
                  icon={CheckCircle2}
                  t="Delivery in 48 hrs – 3 business days"
                  d="Digital PDF to your inbox."
                />
              </div>
              {search.payment_intent && (
                <p className="mt-6 text-xs text-muted-foreground">
                  Payment ID:{" "}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(search.payment_intent!);
                      toast.success("Payment ID copied");
                    }}
                    className="inline-flex items-center gap-1 font-mono text-ink underline-offset-2 hover:underline"
                  >
                    {search.payment_intent.slice(0, 20)}…
                    <Copy className="h-3 w-3" />
                  </button>
                </p>
              )}
            </>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link to={cfg.cta.to}>
                {cfg.cta.label} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Step({
  icon: Icon,
  t,
  d,
}: {
  icon: React.ComponentType<{ className?: string }>;
  t: string;
  d: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-cream">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-medium text-ink">{t}</p>
        <p className="text-xs text-muted-foreground">{d}</p>
      </div>
    </div>
  );
}
