// Server-side only - do not import in client components

// Required environment variables
const REQUIRED_ENV_VARS = [
  "APP_ENV",
  "STRIPE_DEV_MONTHLY_PRICE_ID",
  "STRIPE_DEV_YEARLY_PRICE_ID",
  "STRIPE_PROD_MONTHLY_PRICE_ID",
  "STRIPE_PROD_YEARLY_PRICE_ID",
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
