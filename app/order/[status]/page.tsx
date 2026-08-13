"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  Mail,
  FileDown,
  Copy,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { toast } from "sonner";

export default function StatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const status = params.status as string;
  const paymentIntent = searchParams.get("payment_intent");

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [fetchingToken, setFetchingToken] = useState(false);

  useEffect(() => {
    if (status === "success") {
      try {
        localStorage.removeItem("order-form-state");
        localStorage.removeItem("hip-order-draft");
      } catch {
        /* ignore */
      }
    }

    // On success, fetch the access token so we can link directly to questionnaire
    if (status === "success" && paymentIntent) {
      setFetchingToken(true);
      fetch(`/api/get-order-token?payment_intent=${encodeURIComponent(paymentIntent)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.accessToken) setAccessToken(data.accessToken);
        })
        .catch(() => {
          /* fail silently */
        })
        .finally(() => setFetchingToken(false));
    }
  }, [status, paymentIntent]);

  const questionnaireUrl = accessToken ? `/order/status/${accessToken}` : null;

  const isSuccess = status === "success";
  const isPending = status === "pending";
  const isFailed = status === "failed";

  const cfg = isSuccess
    ? {
        icon: CheckCircle2,
        tone: "text-emerald-500",
        bg: "bg-emerald-500/10",
        title: "Payment received. Your report is in production.",
        sub: "We've sent a confirmation email with your order details and a link to your property questionnaire.",
      }
    : isPending
      ? {
          icon: Clock3,
          tone: "text-brass",
          bg: "bg-brass/10",
          title: "Payment processing.",
          sub: "Your bank is reviewing the charge. You'll receive a confirmation email as soon as it clears—usually within a few minutes.",
        }
      : isFailed
        ? {
            icon: XCircle,
            tone: "text-destructive",
            bg: "bg-destructive/10",
            title: "Payment was not completed.",
            sub: "Your card was not charged. Please try a different card or payment method.",
          }
        : {
            icon: XCircle,
            tone: "text-destructive",
            bg: "bg-destructive/10",
            title: "Unknown status.",
            sub: "We couldn't find that order outcome.",
          };

  const Icon = cfg.icon;

  return (
    <div className="bg-secondary/30 min-h-screen">
      <SiteHeader />
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 text-center shadow-elegant sm:p-8 md:p-14">
          <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${cfg.bg}`}>
            <Icon className={`h-10 w-10 ${cfg.tone}`} strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl text-balance">
            {cfg.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{cfg.sub}</p>

          {isSuccess && (
            <>
              <div className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm">
                <Step
                  icon={Mail}
                  t="Confirmation email sent"
                  d="Order details and questionnaire link."
                />
                <Step
                  icon={ClipboardList}
                  t="Complete your property questionnaire"
                  d="Provide property details, disclosures, and documents."
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

              {paymentIntent && (
                <p
                  className="mt-6 text-xs text-muted-foreground select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  Payment ID:{" "}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentIntent!);
                      toast.success("Payment ID copied");
                    }}
                    className="inline-flex items-center gap-1 font-mono text-ink underline-offset-2 hover:underline break-all"
                  >
                    {paymentIntent.slice(0, 20)}…
                    <Copy className="h-3 w-3" />
                  </button>
                </p>
              )}

              {accessToken && (
                <div className="mt-4">
                  <Button asChild variant="ghost" size="sm">
                    <a href={`/api/receipt?token=${encodeURIComponent(accessToken)}`}>
                      <FileDown className="mr-2 h-4 w-4" /> Download Receipt (PDF)
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {isSuccess ? (
              fetchingToken ? (
                <Button variant="primary" size="lg" disabled className="min-w-[220px]">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing your link…
                </Button>
              ) : questionnaireUrl ? (
                <Button asChild variant="primary" size="lg">
                  <Link href={questionnaireUrl}>
                    <ClipboardList className="mr-2 h-4 w-4" /> Open Property Questionnaire{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="primary" size="lg">
                  <Link href="/">
                    Return to home <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )
            ) : isFailed ? (
              <Button asChild variant="primary" size="lg">
                <Link href="/order">
                  Try payment again <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="primary" size="lg">
                <Link href="/">
                  Return home <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/">Back to home</Link>
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
