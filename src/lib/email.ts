import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestEmail(to: string) {
  await resend.emails.send({
    from: "support@accuratehomereport.com",
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
    from: "support@accuratehomereport.com",
    to,
    subject: `${code} is your Accurate Home Report verification code`,
    html: `
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(to: string, accessToken: string, orderId: string) {
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/status/${accessToken}`;

  await resend.emails.send({
    from: "support@accuratehomereport.com",
    to,
    subject: "Your Accurate Home Report order is confirmed",
    html: `
      <p>Thanks — your order (${orderId}) is confirmed and our analysts are getting started.</p>
      <p>You can check your order status or download your report here once it's ready:</p>
      <p><a href="${statusUrl}">${statusUrl}</a></p>
    `,
  });
}
