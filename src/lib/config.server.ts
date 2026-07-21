export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    adminPassword: process.env.ADMIN_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
    blobBaseUrl: process.env.BLOB_BASE_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };
}
