// Server-side only - do not import in client components

// Required environment variables
const REQUIRED_ENV_VARS = [
  "APP_ENV",
  "STRIPE_DEV_MONTHLY_PRICE_ID",
  "STRIPE_DEV_YEARLY_PRICE_ID",
  "STRIPE_PROD_MONTHLY_PRICE_ID",
  "STRIPE_PROD_YEARLY_PRICE_ID",
  "STRIPE_SECRET_KEY_DEV",
  "STRIPE_SECRET_KEY_PROD",
  "STRIPE_WEBHOOK_SECRET_DEV",
  "STRIPE_WEBHOOK_SECRET_PROD",
  "WQH_DEV_API_URL",
  "WQH_PROD_API_URL",
] as const;

// Validate all required env vars are set (runs once on module load)
function validateEnvVars(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate APP_ENV is a valid value
  const appEnv = process.env.APP_ENV;
  if (appEnv !== "dev" && appEnv !== "prod") {
    throw new Error(`APP_ENV must be "dev" or "prod", received: "${appEnv}"`);
  }
}

// Run validation on module initialization
validateEnvVars();

export function getAppEnv(): "dev" | "prod" {
  return process.env.APP_ENV as "dev" | "prod";
}

export function getWqhApiUrl(): string {
  return getAppEnv() === "prod"
    ? process.env.WQH_PROD_API_URL!
    : process.env.WQH_DEV_API_URL!;
}

export function getStripePriceId(plan: "monthly" | "yearly"): string {
  const isProd = getAppEnv() === "prod";
  if (plan === "monthly") {
    return isProd
      ? process.env.STRIPE_PROD_MONTHLY_PRICE_ID!
      : process.env.STRIPE_DEV_MONTHLY_PRICE_ID!;
  }
  return isProd
    ? process.env.STRIPE_PROD_YEARLY_PRICE_ID!
    : process.env.STRIPE_DEV_YEARLY_PRICE_ID!;
}

/** Stripe Promotion Code id (`promo_...`), not the customer-facing code string. Optional: if unset, Checkout uses manual promo entry only. Must exist in the same Stripe account/mode as `STRIPE_SECRET_KEY_*` and price IDs for the current `APP_ENV`. */
export function getStripePromotionCodeId(discountCode: string): string | undefined {
  if (discountCode !== "WELCOME30") {
    throw new Error(`Unsupported Stripe discount code: ${discountCode}`);
  }

  const isProd = getAppEnv() === "prod";
  const envKey = isProd
    ? "STRIPE_PROD_WELCOME30_PROMOTION_CODE_ID"
    : "STRIPE_DEV_WELCOME30_PROMOTION_CODE_ID";
  const promotionCodeId = process.env[envKey];

  if (!promotionCodeId) {
    console.warn(
      `Missing optional environment variable: ${envKey}. Checkout will allow manual promotion code entry.`
    );
    return undefined;
  }

  return promotionCodeId;
}

export function getStripeSecretKey(): string {
  return getAppEnv() === "prod"
    ? process.env.STRIPE_SECRET_KEY_PROD!
    : process.env.STRIPE_SECRET_KEY_DEV!;
}

export function getStripeWebhookSecret(): string {
  return getAppEnv() === "prod"
    ? process.env.STRIPE_WEBHOOK_SECRET_PROD!
    : process.env.STRIPE_WEBHOOK_SECRET_DEV!;
}
