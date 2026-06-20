export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}
