"use server";

import {
  createStripeCustomer,
  createSubscriptionSession,
  cancelCustomerSubscriptions,
  deleteStripeCustomer,
} from "./stripe-actions";
import { syncStripeCustomerToClerk } from "./clerk-actions";
import { deleteUserAccount } from "./clerk-actions";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

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

export async function cancelUserSubscription(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string;

    if (!stripeCustomerId) {
      return { success: false, error: "No subscription found" };
    }

    const result = await cancelCustomerSubscriptions(stripeCustomerId);
    // Deactivate subscription

    return result;
  } catch (error) {
    console.error("Error canceling user subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
    };
  }
}

export async function deleteUserAccountComplete(userId: string) {
  try {
    // Get user's Stripe customer ID
    const user = await clerkClient.users.getUser(userId);
    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string;

    // Cancel subscriptions and delete Stripe customer if exists
    if (stripeCustomerId) {
      await cancelCustomerSubscriptions(stripeCustomerId);
      await deleteStripeCustomer(stripeCustomerId);
    }

    // Delete Clerk account
    const deleteResult = await deleteUserAccount(userId);
    return deleteResult;
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}
