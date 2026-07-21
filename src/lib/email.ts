import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(to: string, accessToken: string, orderId: string) {
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/status/${accessToken}`;

  await resend.emails.send({
    from: "orders@accuratehomereport.com",
    to,
    subject: "Your Accurate Home Report order is confirmed",
    html: `
      <p>Thanks — your order (${orderId}) is confirmed and our analysts are getting started.</p>
      <p>You can check your order status or download your report here once it's ready:</p>
      <p><a href="${statusUrl}">${statusUrl}</a></p>
    `,
  });
}
