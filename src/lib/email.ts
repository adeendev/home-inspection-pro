import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const SUPPORT_EMAIL = "support@accuratehomereport.com";
const FROM_ADDRESS = "support@accuratehomereport.com";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFieldsTable(fields: Record<string, unknown>): string {
  const rows = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 12px 6px 0; color:#6b7280; font-size:13px; white-space:nowrap; vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:6px 0; color:#1a2236; font-size:13px;">${escapeHtml(
            typeof value === "boolean" ? (value ? "Yes" : "No") : value,
          )}</td>
        </tr>`,
    )
    .join("");

  return `<table style="border-collapse:collapse; width:100%;">${rows}</table>`;
}

export async function sendTestEmail(to: string) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Accurate Home Report — test email",
    html: `
      <p>This is a test email from Accurate Home Report.</p>
      <p>If you received this, Resend is configured correctly and emails are sending.</p>
    `,
  });
}

export async function sendOtpEmail(to: string, code: string) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${code} is your Accurate Home Report verification code`,
    html: `
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${escapeHtml(code)}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  accessToken: string,
  orderId: string,
  receiptPdf?: Uint8Array,
) {
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/status/${accessToken}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Accurate Home Report order is confirmed",
    html: `
      <p>Thanks — your order (${escapeHtml(orderId)}) is confirmed and our analysts are getting started.</p>
      <p>You can check your order status or download your report here once it's ready:</p>
      <p><a href="${statusUrl}">${statusUrl}</a></p>
      ${receiptPdf ? "<p>Your payment receipt is attached to this email.</p>" : ""}
    `,
    attachments: receiptPdf
      ? [
          {
            filename: `receipt-${orderId}.pdf`,
            content: Buffer.from(receiptPdf),
            contentType: "application/pdf",
          },
        ]
      : undefined,
  });
}

export async function sendSupportNewOrderEmail(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  packageTier: string;
  rushRequested: boolean;
  amountCents: number;
  wizardData: Record<string, unknown>;
}) {
  const fields: Record<string, unknown> = {
    "Order ID": order.id,
    Customer: order.customerName,
    Email: order.customerEmail,
    Phone: order.wizardData.phone,
    Package: order.packageTier,
    Rush: order.rushRequested,
    Amount: `$${(order.amountCents / 100).toFixed(2)}`,
    Address: order.wizardData.address,
    "Address 2": order.wizardData.address2,
    City: order.wizardData.city,
    State: order.wizardData.state,
    Zip: order.wizardData.zip,
    "Year Built": order.wizardData.yearBuilt,
    "Sq Ft": order.wizardData.sqft,
    Ownership: order.wizardData.ownershipType,
    "Preferred Date": order.wizardData.preferredDate,
    "Preferred Window": order.wizardData.preferredWindow,
    Notes: order.wizardData.notes,
  };

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: SUPPORT_EMAIL,
    subject: `New order placed — ${order.customerName} (${order.packageTier})`,
    html: `
      <h2 style="font-size:16px;">A new order has been placed</h2>
      ${renderFieldsTable(fields)}
    `,
  });
}

export async function sendSupportQuestionnaireCompletedEmail(
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    accessToken: string;
  },
  responses: Record<string, unknown>,
) {
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/status/${order.accessToken}`;

  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(responses)) {
    if (typeof value === "object" && value !== null) continue; // skip nested (e.g. uploadedFiles array)
    fields[key] = value;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: SUPPORT_EMAIL,
    subject: `Questionnaire completed — ${order.customerName} (Order ${order.id})`,
    html: `
      <h2 style="font-size:16px;">Customer has completed the full property questionnaire</h2>
      <p style="font-size:13px; color:#6b7280;">
        Order: ${escapeHtml(order.id)} · Customer: ${escapeHtml(order.customerName)} (${escapeHtml(order.customerEmail)})
      </p>
      <p style="font-size:13px;"><a href="${statusUrl}">View order</a></p>
      ${renderFieldsTable(fields)}
    `,
  });
}
