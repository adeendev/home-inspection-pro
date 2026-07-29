import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import QuestionnaireClient from "./QuestionnaireClient";

export const dynamic = "force-dynamic";

export default async function OrderQuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
  if (!order) notFound();

  if (order.status === "paid") redirect(`/order/status/${token}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <SiteHeader />
      <div className="px-4 pt-24 pb-32 md:px-8 md:pt-36 md:pb-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">Property questionnaire</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer what you can — sign and pay once you&apos;re done.
            </p>
          </div>
          <QuestionnaireClient order={order} token={token} />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
