"use server";

import {
  createStripeCustomer,
  createSubscriptionSession,
} from "./stripe-actions";
import { syncStripeCustomerToClerk } from "./clerk-actions";

export async function initializeSubscription(
  userId: string,
  email: string,
  priceId: string
) {
  try {
    // Step 1: Create Stripe customer
    const customerResult = await createStripeCustomer(userId, email);

    if (!customerResult.success || !customerResult.customerId) {
      return {
        success: false,
        error: customerResult.error || "Failed to create customer",
      };
    }

    // Step 2: Sync customer ID to Clerk
    const syncResult = await syncStripeCustomerToClerk(
      userId,
      customerResult.customerId
    );

    if (!syncResult.success) {
      return {
        success: false,
        error: syncResult.error || "Failed to sync customer data",
      };
    }

    // Step 3: Create subscription session
    const sessionResult = await createSubscriptionSession(
      customerResult.customerId,
      priceId
    );

    if (!sessionResult.success) {
      return {
        success: false,
        error: sessionResult.error || "Failed to create subscription session",
      };
    }

    return {
      success: true,
      sessionId: sessionResult.sessionId,
      url: sessionResult.url,
    };
  } catch (error) {
    console.error("Error initializing subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initialize subscription",
    };
  }
}
