"use client";

import { useRouter } from "next/navigation";
import QuestionnaireWizard from "@/components/ui/QuestionnaireWizard";

interface OrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  accessToken: string;
  orderData: string;
  questionnaireResponses: string | null;
  questionnaireProgress: number;
  questionnaireCompleted: boolean;
}

export default function QuestionnaireClient({ order, token }: { order: OrderRow; token: string }) {
  const router = useRouter();

  return (
    <QuestionnaireWizard
      order={{
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        accessToken: order.accessToken,
        orderData: order.orderData,
        questionnaireResponses: order.questionnaireResponses,
        questionnaireProgress: order.questionnaireProgress,
        questionnaireCompleted: order.questionnaireCompleted,
      }}
      onCompleted={() => router.push(`/order/checkout/${token}`)}
    />
  );
}
